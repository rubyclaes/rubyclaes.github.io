# Local content studio for Windows when Python is not installed.
$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$MaxBody = 2 * 1024 * 1024
$MaxImage = 15 * 1024 * 1024
$ImageExts = @(".jpg", ".jpeg", ".png", ".webp")
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

function Get-SafeImageName {
    param([string]$Name)
    $base = [System.IO.Path]::GetFileName($Name)
    $ext = [System.IO.Path]::GetExtension($base).ToLowerInvariant()
    if ($ImageExts -notcontains $ext) { return $null }
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($base)
    $stem = [regex]::Replace($stem, "[^\w.\-]+", "-").Trim(".-")
    if (-not $stem) { $stem = "image" }
    return $stem + $ext
}

function Get-UniqueImagePath {
    param([string]$Folder, [string]$FileName)
    $dest = Join-Path $Folder $FileName
    if (-not (Test-Path -LiteralPath $dest)) { return $dest }
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $ext = [System.IO.Path]::GetExtension($FileName)
    $i = 2
    while ($true) {
        $candidate = Join-Path $Folder ($stem + "-" + $i + $ext)
        if (-not (Test-Path -LiteralPath $candidate)) { return $candidate }
        $i++
    }
}

function Get-PortfolioImages {
    $map = [ordered]@{}
    $root = Join-Path $Root "images\portfolio"
    if (-not (Test-Path -LiteralPath $root)) { return $map }
    Get-ChildItem -LiteralPath $root -Directory | Where-Object { $_.Name -match "^\d+$" } | ForEach-Object {
        $n = $_.Name
        $files = @(Get-ChildItem -LiteralPath $_.FullName -File | Where-Object {
            $ImageExts -contains $_.Extension.ToLowerInvariant()
        } | Sort-Object Name | ForEach-Object { "images/portfolio/$n/$($_.Name)" })
        $map[$n] = @($files)
    }
    return $map
}

function Read-RequestBytes {
    param($Request)
    $len = [int]$Request.ContentLength64
    if ($len -le 0) { return [byte[]]@() }
    $buffer = New-Object byte[] $len
    $read = 0
    while ($read -lt $len) {
        $n = $Request.InputStream.Read($buffer, $read, $len - $read)
        if ($n -le 0) { break }
        $read += $n
    }
    return $buffer
}

function Send-Json {
    param($Response, [int]$Status, $Payload)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes(($Payload | ConvertTo-Json -Compress -Depth 8))
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
            } elseif ($request.HttpMethod -eq "GET" -and $path -eq "/studio/images") {
                Send-Json $response 200 @{ ok = $true; projects = Get-PortfolioImages }
            } elseif ($request.HttpMethod -eq "POST" -and $path -eq "/studio/image") {
                $n = 0
                [int]::TryParse($request.QueryString["project"], [ref]$n) | Out-Null
                $fileName = Get-SafeImageName $request.QueryString["name"]
                if ($n -lt 1 -or $n -gt 99 -or -not $fileName) {
                    Send-Json $response 400 @{ ok = $false; error = "Use a JPG, PNG or WebP photo." }
                } elseif ($request.ContentLength64 -le 0 -or $request.ContentLength64 -gt $MaxImage) {
                    Send-Json $response 400 @{ ok = $false; error = "That photo was empty or too large (15 MB max)." }
                } else {
                    $folder = Join-Path $Root "images\portfolio\$n"
                    New-Item -ItemType Directory -Force -Path $folder | Out-Null
                    $dest = Get-UniqueImagePath $folder $fileName
                    [System.IO.File]::WriteAllBytes($dest, (Read-RequestBytes $request))
                    $rel = "images/portfolio/$n/" + [System.IO.Path]::GetFileName($dest)
                    Write-Host "Added $rel"
                    Send-Json $response 200 @{ ok = $true; path = $rel }
                }
            } elseif ($request.HttpMethod -eq "DELETE" -and $path -eq "/studio/image") {
                $n = 0
                [int]::TryParse($request.QueryString["project"], [ref]$n) | Out-Null
                $name = [System.IO.Path]::GetFileName($request.QueryString["name"])
                $ext = [System.IO.Path]::GetExtension($name).ToLowerInvariant()
                $folder = Join-Path $Root "images\portfolio\$n"
                $dest = Join-Path $folder $name
                $full = [System.IO.Path]::GetFullPath($dest)
                $rootPrefix = ([System.IO.Path]::GetFullPath($folder)).TrimEnd("\") + "\"
                if ($n -lt 1 -or $ImageExts -notcontains $ext -or -not $full.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                    Send-Json $response 400 @{ ok = $false; error = "That photo could not be found." }
                } else {
                    if (Test-Path -LiteralPath $full -PathType Leaf) { Remove-Item -LiteralPath $full }
                    Write-Host "Removed images/portfolio/$n/$name"
                    Send-Json $response 200 @{ ok = $true }
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
