# setup-ui-mcps.ps1
# Docker-free UI MCP stack for Windows 11 Home:
# - Penpot MCP (official) via Node
# - Inkscape MCP (free Illustrator replacement) via Python
# - Iconify MCP (massive icon library) via npx
# - Qwen Code wiring via `qwen mcp add`

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Need($cmd, $hint) { if (-not (Have $cmd)) { throw "Missing: $cmd. $hint" } }

Write-Host "== 0) Prereqs via winget (Git, Node 22, Python 3.11, Inkscape) =="

if (-not (Have winget)) { throw "winget not found. Install 'App Installer' from Microsoft Store." }

if (-not (Have git))    { winget install -e --id Git.Git | Out-Host }
if (-not (Have node))   { winget install -e --id OpenJS.NodeJS.22 | Out-Host }
if (-not (Have python)) { winget install -e --id Python.Python.3.11 | Out-Host }

# Inkscape (free vector editor)
# winget id is Inkscape.Inkscape
$inkscapeExeGuess1 = "C:\Program Files\Inkscape\bin\inkscape.exe"
$inkscapeExeGuess2 = "C:\Program Files\Inkscape\inkscape.exe"

if (-not (Test-Path $inkscapeExeGuess1) -and -not (Test-Path $inkscapeExeGuess2)) {
  winget install -e --id Inkscape.Inkscape | Out-Host
}

# Refresh PATH in this session (best-effort)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Need git    "Re-open PowerShell if it's still not found."
Need node   "Re-open PowerShell if it's still not found."
Need npm    "npm ships with Node."
Need python "Re-open PowerShell if it's still not found."

Write-Host "== 1) Install/Update Qwen Code CLI =="
npm install -g @qwen-code/qwen-code@latest | Out-Host
Need qwen "If 'qwen' isn't found, re-open PowerShell."

Write-Host "== 2) Clone MCP repos into ./mcp-servers =="
$root = Get-Location
$mcpDir = Join-Path $root "mcp-servers"
New-Item -ItemType Directory -Force -Path $mcpDir | Out-Null

# Penpot official MCP
$penpotDir = Join-Path $mcpDir "penpot-mcp"
if (-not (Test-Path $penpotDir)) {
  git clone https://github.com/penpot/penpot-mcp.git $penpotDir | Out-Host
} else {
  Push-Location $penpotDir; git pull | Out-Host; Pop-Location
}

# Inkscape MCP (free Illustrator replacement)
$inkMcpDir = Join-Path $mcpDir "inkscape-mcps"
if (-not (Test-Path $inkMcpDir)) {
  git clone https://github.com/grumpydevorg/inkscape-mcps.git $inkMcpDir | Out-Host
} else {
  Push-Location $inkMcpDir; git pull | Out-Host; Pop-Location
}

Write-Host "== 3) Install dependencies =="
# Penpot MCP deps
Push-Location $penpotDir
npm install | Out-Host
Pop-Location

# Inkscape MCP venv + editable install
Push-Location $inkMcpDir
if (-not (Test-Path (Join-Path $inkMcpDir ".venv"))) {
  python -m venv .venv
}
$pyExe = Join-Path $inkMcpDir ".venv\Scripts\python.exe"
& $pyExe -m pip install --upgrade pip | Out-Host
& $pyExe -m pip install -e . | Out-Host
Pop-Location

Write-Host "== 4) Wire MCP servers into Qwen Code (project scope) =="

# Penpot MCP: local HTTP endpoint (server provided by `npm run bootstrap`)
qwen mcp add --transport http penpot http://localhost:4401/mcp | Out-Host

# Iconify MCP: stdio via npx
qwen mcp add --transport stdio iconify npx -y iconify-mcp-server@latest | Out-Host

# Inkscape MCP: stdio via python module
$workspace = Join-Path $root "inkscape-workspace"
New-Item -ItemType Directory -Force -Path $workspace | Out-Null

# Try to locate inkscape.exe; fall back to common install paths
$inkBin = $null
try {
  $where = (where.exe inkscape 2>$null)
  if ($where) { $inkBin = $where.Split("`n")[0].Trim() }
} catch {}

if (-not $inkBin) {
  if (Test-Path $inkscapeExeGuess1) { $inkBin = $inkscapeExeGuess1 }
  elseif (Test-Path $inkscapeExeGuess2) { $inkBin = $inkscapeExeGuess2 }
}

# Register Inkscape MCP with env vars (workspace + optional inkscape binary path)
if ($inkBin) {
  qwen mcp add inkscape --transport stdio `
    -e INKS_WORKSPACE=$workspace `
    -e INKS_INKSCAPE_BIN="$inkBin" `
    $pyExe -m inkscape_mcp.combined | Out-Host
} else {
  qwen mcp add inkscape --transport stdio `
    -e INKS_WORKSPACE=$workspace `
    $pyExe -m inkscape_mcp.combined | Out-Host
  Write-Warning "Could not auto-detect inkscape.exe. If Inkscape MCP says 'Inkscape not found', set INKS_INKSCAPE_BIN in .qwen/settings.json."
}

Write-Host "== 5) Create runner script for Penpot MCP =="
$runPenpot = Join-Path $root "run-penpot-mcp.ps1"
@"
Set-StrictMode -Version Latest
`$ErrorActionPreference = "Stop"

`$penpotDir = Join-Path (Get-Location) "mcp-servers\penpot-mcp"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"`$penpotDir`"; npm run bootstrap"
) | Out-Null

Write-Host ""
Write-Host "Penpot MCP starting..."
Write-Host "Plugin manifest: http://localhost:4400/manifest.json"
Write-Host "MCP endpoint:    http://localhost:4401/mcp"
"@ | Set-Content -Encoding UTF8 $runPenpot

Write-Host ""
Write-Host "✅ Setup complete."
Write-Host "Next: run .\run-penpot-mcp.ps1 (non-admin is fine)."
Write-Host "Then: qwen mcp list"
