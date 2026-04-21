# Windows Store Packaging

This document reflects the current Microsoft Store submission split:

- `MSI/EXE app` submissions use a mandatory versioned `Package URL`
- packaged app submissions use uploaded app packages such as `.msix`

For this repo, those two paths are not interchangeable.

## Your Requirements

Current requirements from this project setup:

- prefer a free submission path
- prefer no code-signing certificate
- current desktop build output is NSIS `.exe`
- you also created an `.msix` with MSIX Packaging Tool

## What Microsoft Currently Requires

If Partner Center shows the `Package URL` page for an `MSI/EXE app` submission:

- the package must be a standalone offline installer
- the URL must be HTTPS and versioned
- the package type must be `.msi` or `.exe`
- `.msix` is not valid in that field

For this repo's current Tauri output:

- supported installer output today: `.exe`
- not produced by this repo today: `.msi`

## Correct Answer For Your Current Listing

If your current Partner Center listing only shows the mandatory `Package URL` field, then:

- you cannot use the `.msix` there
- you cannot solve it by changing the Azure Blob URL
- you must submit a supported installer package for that listing type

That means the only working package choices for the current listing are:

1. a hosted standalone `.exe`
2. a hosted standalone `.msi`

Since this repo currently builds an NSIS installer, the practical package is the `.exe`.

## Important Requirement Conflict

Your requested combination:

- free
- no certificate
- current `MSI/EXE app` listing
- no `.exe`
- use `.msix`

does not have a working solution.

Why:

- `MSI/EXE app` listing does not accept `.msix`
- this repo does not currently produce `.msi`
- the current listing type is asking for installer-hosted submission, not packaged-app upload

## Working Options

### Option 1: Keep the current `MSI/EXE app` listing

Use this if you want to continue with the current Partner Center listing.

Steps:

1. Build the installer:

```powershell
npm run tauri:build:store
```

2. Use the generated file:

- `src-tauri/target/release/bundle/nsis/PDF Online_1.0.0_setup.exe`

3. Upload that installer to your CDN or Azure Blob Storage using a versioned URL, for example:

```text
https://yourdomain/releases/pdf-online/1.0.0/pdf-online-setup.exe
```

4. In Partner Center package details:

- `Package URL`: direct HTTPS URL to the `.exe`
- `Architecture`: `x64` unless you build additional architectures
- `App type`: `EXE`
- `Installer parameters`: `/S`

5. Submit that installer through the `MSI/EXE app` flow

Use this option only if you are willing to follow the installer submission requirements for that listing type.

### Option 2: Use the `.msix` you already built

Use this if you want the packaged-app route instead of installer-hosted submission.

Steps:

1. Build the installer:

```powershell
npm run tauri:build:store
```

2. Convert it to `.msix` with `MSIX Packaging Tool`

Recommended settings:

- `Application package`
- `Create package on this computer`
- choose the generated `*-setup.exe`
- silent install enabled with `/S`
- `Installation location`: `%LocalAppData%\\Programs\\PDF Online`
- `Add support for MSIX Core to this package`: unchecked
- signing choice: `Do not sign package`

3. Save the generated `.msix`

4. Submit it through a packaged-app submission flow that supports uploaded app packages

Important:

- this is not the same as the current mandatory `Package URL` page
- if your current listing only exposes `MSI/EXE app` package URL submission, you need a different listing or submission type for this route

## Best Match To Your Requirements

If your requirements stay exactly as:

- free
- no certificate
- do not want `.exe`
- want to use `.msix`

then the best match is:

- do not use the current `MSI/EXE app` listing
- use a packaged-app listing that accepts uploaded `.msix`

If you must keep the current listing, then your realistic working path is:

- use the hosted NSIS `.exe`
- set `App type` to `EXE`
- use installer parameter `/S`

## What Not To Do

- do not paste an `.msix` URL into the `Package URL` field
- do not paste a folder URL like `/releases/pdf-online/1.0`
- do not expect the current `MSI/EXE app` page to behave like packaged-app upload
- do not document `.msi` as available from this repo unless you add real `.msi` packaging support

## Repo Commands

Build the Store input installer:

```powershell
npm run tauri:build:store
```

Optional MSIX wrapper command:

```powershell
npm run msix:build
```

## Short Rule

- current Partner Center `Package URL` page -> use hosted `.exe` or `.msi`
- current repo output -> `.exe`
- `.msix` -> only for a packaged-app upload flow, not the current `Package URL` page
