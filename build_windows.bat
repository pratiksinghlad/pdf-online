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

echo ========================================
echo Environment Check:
echo.
echo PATH: %PATH%
echo LIB: %LIB%
echo INCLUDE: %INCLUDE%
echo WindowsSdkDir: "%WindowsSdkDir%"
echo WindowsSDKVersion: "%WindowsSDKVersion%"
echo UCRTVersion: "%UCRTVersion%"
echo ========================================

:: Check if WindowsSdkDir is empty
if "%WindowsSdkDir%"=="" (
    echo.
    echo ERROR: Windows SDK not detected^!
    echo kernel32.lib will not be found, causing the build to fail.
    echo.
    echo FIX:
    echo 1. Open "Visual Studio Installer"
    echo 2. Click "Modify" on your installation (D:\software\vs2026)
    echo 3. In "Individual components", search for and check:
    echo    - "Windows 11 SDK (10.0.22621.0)" or latest
    echo    - "MSVC v143 - VS 2022 C++ x64/x86 build tools"
    echo 4. Click "Modify" to install.
    echo.
    exit /b 1
)

echo Running Tauri build...
set WEBVIEW2_STATIC=1
npx tauri build

if %ERRORLEVEL% equ 0 (
    echo Build successful!
) else (
    echo.
    echo Build failed. If you saw "kernel32.lib" missing, ensure the Windows SDK is installed.
    exit /b %ERRORLEVEL%
)
