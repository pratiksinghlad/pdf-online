param(
    [string]$PackageName = [Environment]::GetEnvironmentVariable("MSIX_PACKAGE_NAME"),
    [string]$PublisherName = [Environment]::GetEnvironmentVariable("MSIX_PUBLISHER_NAME"),
    [string]$PackageDisplayName = [Environment]::GetEnvironmentVariable("MSIX_PACKAGE_DISPLAY_NAME"),
    [string]$PublisherDisplayName = [Environment]::GetEnvironmentVariable("MSIX_PUBLISHER_DISPLAY_NAME"),
    [string]$PackageVersion = [Environment]::GetEnvironmentVariable("MSIX_PACKAGE_VERSION"),
    [string]$InstallerArguments = [Environment]::GetEnvironmentVariable("MSIX_INSTALLER_ARGS"),
    [string]$OutputDirectory = [Environment]::GetEnvironmentVariable("MSIX_OUTPUT_DIR"),
    [switch]$SkipInstallerBuild,
    [switch]$OnlyWriteTemplate
)

$ErrorActionPreference = "Stop"

function Require-Value {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [string]$Value,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        throw "$Name is required. $Message"
    }

    return $Value
}

function Normalize-Version {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Version
    )

    $parts = $Version.Split(".")
    if ($parts.Count -eq 3) {
        return "$Version.0"
    }

    if ($parts.Count -eq 4) {
        return $Version
    }

    throw "MSIX package version '$Version' is invalid. Use a three-part or four-part numeric version such as 1.0.0 or 1.0.0.0."
}

function Escape-Xml {
    param(
        [AllowEmptyString()]
        [string]$Value
    )

    return [System.Security.SecurityElement]::Escape($Value)
}

function Get-RepoFileJson {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$packageJson = Get-RepoFileJson -Path (Join-Path $repoRoot "package.json")
$tauriConfig = Get-RepoFileJson -Path (Join-Path $repoRoot "src-tauri\tauri.conf.json")

if (-not $SkipInstallerBuild) {
    Write-Host "Building NSIS installer..."
    & npm run tauri:build:store
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

$installer = Get-ChildItem -LiteralPath (Join-Path $repoRoot "src-tauri\target\release\bundle\nsis") -Filter "*-setup.exe" -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $installer) {
    throw "No NSIS installer was found under 'src-tauri/target/release/bundle/nsis'. Run 'npm run tauri:build:store' first."
}

$PackageName = Require-Value -Name "MSIX_PACKAGE_NAME" -Value $PackageName -Message "Use the exact package identity name reserved in Partner Center."
$PublisherName = Require-Value -Name "MSIX_PUBLISHER_NAME" -Value $PublisherName -Message "Use the exact publisher subject that matches your Store identity, for example 'CN=YourPartnerCenterPublisher'."

if ($PackageName -notmatch "^[A-Za-z0-9.-]{3,50}$") {
    throw "MSIX_PACKAGE_NAME '$PackageName' is invalid. Use 3-50 characters containing only letters, numbers, periods, or dashes."
}

if ([string]::IsNullOrWhiteSpace($PackageDisplayName)) {
    $PackageDisplayName = $tauriConfig.productName
}

if ([string]::IsNullOrWhiteSpace($PublisherDisplayName)) {
    if (-not [string]::IsNullOrWhiteSpace($tauriConfig.bundle.publisher)) {
        $PublisherDisplayName = $tauriConfig.bundle.publisher
    } else {
        $PublisherDisplayName = $packageJson.author
    }
}

if ([string]::IsNullOrWhiteSpace($PackageVersion)) {
    $PackageVersion = $tauriConfig.version
}

$PackageVersion = Normalize-Version -Version $PackageVersion

if ([string]::IsNullOrWhiteSpace($InstallerArguments)) {
    $InstallerArguments = "/S"
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $repoRoot "src-tauri\target\release\bundle\msix"
}

$resolvedOutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $resolvedOutputDirectory | Out-Null

$safeDisplayName = ($PackageDisplayName -replace '[<>:"/\\|?*]', "_")
$msixPath = Join-Path $resolvedOutputDirectory "$safeDisplayName`_$PackageVersion.msix"
$templatePath = Join-Path $resolvedOutputDirectory "ConversionTemplate.xml"

$templateXml = @"
<MsixPackagingToolTemplate xmlns="http://schemas.microsoft.com/appx/msixpackagingtool/template/2018">
  <Settings
    AllowTelemetry="false"
    ApplyAllPrepareComputerFixes="true"
    GenerateCommandLineFile="true"
    AllowPromptForPassword="false"
    EnforceMicrosoftStoreVersioningRequirements="true" />
  <SaveLocation
    PackagePath="$(Escape-Xml $msixPath)"
    TemplatePath="$(Escape-Xml $templatePath)" />
  <Installer
    Path="$(Escape-Xml $installer.FullName)"
    Arguments="$(Escape-Xml $InstallerArguments)" />
  <PackageInformation
    PackageName="$(Escape-Xml $PackageName)"
    PackageDisplayName="$(Escape-Xml $PackageDisplayName)"
    PublisherName="$(Escape-Xml $PublisherName)"
    PublisherDisplayName="$(Escape-Xml $PublisherDisplayName)"
    Version="$(Escape-Xml $PackageVersion)" />
</MsixPackagingToolTemplate>
"@

Set-Content -LiteralPath $templatePath -Value $templateXml -Encoding UTF8
Write-Host "Wrote MSIX conversion template: $templatePath"

if ($OnlyWriteTemplate) {
    Write-Host "Skipping MSIX conversion because -OnlyWriteTemplate was set."
    exit 0
}

$msixPackagingTool = Get-Command "MSIXPackagingTool.exe" -ErrorAction SilentlyContinue
if (-not $msixPackagingTool) {
    throw "MSIXPackagingTool.exe was not found. Install 'MSIX Packaging Tool' from Microsoft Store, then rerun 'npm run msix:build'."
}

Write-Host "Converting installer to MSIX..."
& $msixPackagingTool.Source create-package --template $templatePath -v
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "MSIX package created at: $msixPath"
