@echo off
setlocal
cd /d "%~dp0"

echo Starting the content studio...
echo Keep this window open while you edit. Close it when you are done.
echo.

where py >nul 2>&1
if %errorlevel%==0 (
  py -3 -c "import sys" >nul 2>&1
  if %errorlevel%==0 (
    py -3 -u tools\editor-studio.py
    goto :finish
  )
)

where python3 >nul 2>&1
if %errorlevel%==0 (
  python3 -c "import sys" >nul 2>&1
  if %errorlevel%==0 (
    python3 -u tools\editor-studio.py
    goto :finish
  )
)

where python >nul 2>&1
if %errorlevel%==0 (
  python -c "import sys; raise SystemExit(0 if sys.version_info[0] >= 3 else 1)" >nul 2>&1
  if %errorlevel%==0 (
    python -u tools\editor-studio.py
    goto :finish
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\editor-studio.ps1"

:finish
if errorlevel 1 (
  echo.
  echo The content studio stopped with an error.
  pause
)
