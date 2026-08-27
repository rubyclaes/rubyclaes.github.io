# Local content studio for Windows when Python is not installed.
$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$MaxBody = 2 * 1024 * 1024
$StartPort = 4173

if (-not (Test-Path (Join-Path $Root "editor.html")) -or -not (Test-Path (Join-Path $Root "content.js"))) {
    Write-Error "Run this from the website folder (the one that contains editor.html)."
}

function Find-Port {
    param([int]$Start)
    for ($port = $Start; $port -lt $Start + 20; $port++) {
        $listener = $null
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
            $listener.Start()
            return $port
        } catch {
            continue
        } finally {
            if ($listener) { $listener.Stop() }
        }
    }
    throw "Could not find a free port. Close other content studio windows and try again."
}

function Get-MimeType {
    param([string]$Path)
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { "text/html; charset=utf-8" }
        ".js" { "text/javascript; charset=utf-8" }
        ".css" { "text/css; charset=utf-8" }
        ".json" { "application/json; charset=utf-8" }
        ".svg" { "image/svg+xml" }
        ".png" { "image/png" }
        ".jpg" { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".webp" { "image/webp" }
        ".gif" { "image/gif" }
        ".ico" { "image/x-icon" }
        ".woff" { "font/woff" }
        ".woff2" { "font/woff2" }
        ".pdf" { "application/pdf" }
        ".txt" { "text/plain; charset=utf-8" }
        ".md" { "text/markdown; charset=utf-8" }
        default { "application/octet-stream" }
    }
}

function Update-ContentCache {
    $stamp = Get-Date -Format "yyyyMMdd-HHmm"
    $pattern = 'content\.js\?v=[^"''&\s]+'
    $replacement = "content.js?v=$stamp"
    foreach ($name in @("index.html", "cv.html", "editor.html")) {
        $path = Join-Path $Root $name
        $original = [System.IO.File]::ReadAllText($path)
        $updated = [System.Text.RegularExpressions.Regex]::Replace($original, $pattern, $replacement)
        if ($updated -ne $original) {
            [System.IO.File]::WriteAllText($path, $updated)
        }
    }
    return $stamp
}

function Send-Json {
    param($Response, [int]$Status, $Payload)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes(($Payload | ConvertTo-Json -Compress))
    $Response.StatusCode = $Status
    $Response.ContentType = "application/json; charset=utf-8"
    $Response.ContentLength64 = $bytes.Length
    $Response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate")
    $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Send-File {
    param($Response, [string]$FullPath)
    $bytes = [System.IO.File]::ReadAllBytes($FullPath)
    $Response.StatusCode = 200
    $Response.ContentType = Get-MimeType $FullPath
    $Response.ContentLength64 = $bytes.Length
    $Response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate")
    $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

$port = Find-Port -Start $StartPort
$url = "http://127.0.0.1:$port/editor.html"
$listener = [System.Net.HttpListener]::new()
$prefix = "http://127.0.0.1:$port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Windows blocked the local studio on this port."
    Write-Host "Install Python from https://www.python.org/downloads/ (tick 'Add python.exe to PATH'), then run start-editor.bat again."
    throw
}

Write-Host ""
Write-Host "Content studio is running."
Write-Host "Keep this window open while you edit."
Write-Host ""
Write-Host "  Edit:    $url"
Write-Host "  Preview: http://127.0.0.1:$port/index.html"
Write-Host ""
Write-Host "Press Ctrl+C to stop."
Write-Host ""
Start-Process $url

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        try {
            $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
            if ($request.HttpMethod -eq "POST" -and $path -eq "/save-content") {
                if ($request.ContentLength64 -le 0 -or $request.ContentLength64 -gt $MaxBody) {
                    Send-Json $response 400 @{ ok = $false; error = "The file was empty or too large to save." }
                } else {
                    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                    $text = $reader.ReadToEnd()
                    $reader.Close()
                    if ($text -notmatch "const SITE" -or $text -notmatch "const CONTENT") {
                        Send-Json $response 400 @{ ok = $false; error = "That did not look like content.js." }
                    } else {
                        if (-not $text.EndsWith("`n")) { $text += "`n" }
                        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                        [System.IO.File]::WriteAllText((Join-Path $Root "content.js"), $text, $utf8NoBom)
                        $stamp = Update-ContentCache
                        Write-Host "Saved content.js (cache $stamp)"
                        Send-Json $response 200 @{ ok = $true; version = $stamp }
                    }
                }
            } elseif ($request.HttpMethod -notin @("GET", "HEAD")) {
                $response.StatusCode = 405
            } elseif ($path -eq "/") {
                $response.StatusCode = 302
                $response.RedirectLocation = "/editor.html"
            } elseif ($path.Contains("/.")) {
                $response.StatusCode = 404
            } else {
                $relative = $path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
                $full = [System.IO.Path]::GetFullPath((Join-Path $Root $relative))
                $rootPrefix = $Root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
                if (-not $full.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
                    $response.StatusCode = 404
                } elseif ($request.HttpMethod -eq "HEAD") {
                    $response.StatusCode = 200
                    $response.ContentType = Get-MimeType $full
                    $response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate")
                } else {
                    Send-File $response $full
                }
            }
        } catch {
            try {
                $response.StatusCode = 500
            } catch { }
        } finally {
            try { $response.OutputStream.Close() } catch { }
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
