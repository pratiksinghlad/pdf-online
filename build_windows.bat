@echo off
setlocal enabledelayedexpansion

echo Checking for Visual Studio installation...

set VSWHERE="%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist !VSWHERE! (
    set VSWHERE="%ProgramFiles%\Microsoft Visual Studio\Installer\vswhere.exe"
)

if not exist !VSWHERE! (
    echo Error: vswhere.exe not found. Is Visual Studio installed?
    exit /b 1
)

for /f "usebackq tokens=*" %%i in (`!VSWHERE! -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do (
    set VS_PATH=%%i
)

if "!VS_PATH!"=="" (
    echo Error: Could not find Visual Studio 2022/2019 installation with C++ Build Tools.
    echo Please ensure "Desktop development with C++" is installed.
    exit /b 1
)

echo Found Visual Studio at: !VS_PATH!

set VCVARS="!VS_PATH!\VC\Auxiliary\Build\vcvarsall.bat"
if not exist !VCVARS! (
    echo Error: vcvarsall.bat not found at !VCVARS!
    exit /b 1
)

echo Loading MSVC environment...
call !VCVARS! x64

echo Running Tauri build...
set WEBVIEW2_STATIC=1
npm run tauri:buildwin

if %ERRORLEVEL% equ 0 (
    echo Build successful!
) else (
    echo Build failed.
    exit /b %ERRORLEVEL%
)
