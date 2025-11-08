# Installing Node.js and npm on Windows

## Quick Installation

### Option 1: Download from Official Website (Recommended)

1. **Visit**: https://nodejs.org/
2. **Download**: Click the "LTS" (Long Term Support) version button
   - This will download an installer (e.g., `node-v20.x.x-x64.msi`)
3. **Run the installer**:
   - Click through the installation wizard
   - Accept the license agreement
   - Keep default installation path (usually `C:\Program Files\nodejs\`)
   - ✅ **Important**: Make sure "Add to PATH" option is checked
   - Click "Install"
4. **Restart your terminal/PowerShell** after installation
5. **Verify installation**:
   ```powershell
   node --version
   npm --version
   ```

### Option 2: Using Chocolatey (If you have it)

```powershell
choco install nodejs
```

### Option 3: Using Winget (Windows Package Manager)

```powershell
winget install OpenJS.NodeJS.LTS
```

## After Installation

1. **Close and reopen PowerShell** (or restart your computer)
2. **Verify it works**:
   ```powershell
   node --version
   npm --version
   ```

You should see version numbers like:
```
v20.10.0
10.2.3
```

## If npm Still Doesn't Work After Installation

1. **Check if Node.js is installed**:
   ```powershell
   where.exe node
   ```

2. **If node is found but npm isn't**, try:
   ```powershell
   # Refresh environment variables
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   ```

3. **Restart PowerShell as Administrator** and try again

## Next Steps

Once Node.js and npm are installed:

```powershell
cd frontend
npm install
```

This will install all the frontend dependencies for the Prema's Shop project.

