Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$penpotDir = Join-Path (Get-Location) "mcp-servers\penpot-mcp"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd "$penpotDir"; npm run bootstrap"
) | Out-Null

Write-Host ""
Write-Host "Penpot MCP starting..."
Write-Host "Plugin manifest: http://localhost:4400/manifest.json"
Write-Host "MCP endpoint:    http://localhost:4401/mcp"
