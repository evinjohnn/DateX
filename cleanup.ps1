# PowerShell Cleanup Script for Tinder Clone Migration

# Define paths relative to the script's location
$PSScriptRoot = Get-Location

# --- List of files and directories to delete ---
$filesToDelete = @(
    "api/config/db.js",
    "api/config/cloudinary.js",
    "api/middleware/auth.js",
    "api/models/User.js",
    "api/models/Message.js",
    "api/seeds/user.js",
    "client/src/lib/axios.js",
    "client/src/socket/socket.client.js"
)

$directoriesToDelete = @(
    "api/socket"
)

# --- Deleting Files ---
Write-Host "--- Deleting specified files... ---" -ForegroundColor Yellow
foreach ($file in $filesToDelete) {
    $filePath = Join-Path $PSScriptRoot $file
    if (Test-Path $filePath) {
        Remove-Item -Path $filePath -Force
        Write-Host "Deleted file: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found (already deleted?): $file" -ForegroundColor Gray
    }
}

# --- Deleting Directories ---
Write-Host "`n--- Deleting specified directories... ---" -ForegroundColor Yellow
foreach ($dir in $directoriesToDelete) {
    $dirPath = Join-Path $PSScriptRoot $dir
    if (Test-Path $dirPath) {
        Remove-Item -Path $dirPath -Recurse -Force
        Write-Host "Deleted directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "Directory not found (already deleted?): $dir" -ForegroundColor Gray
    }
}

Write-Host "`nCleanup complete! Remember to update your package.json and server.js files." -ForegroundColor Cyan