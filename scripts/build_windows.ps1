Param(
  [switch]$Clean = $true,
  [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

function Assert-Command($cmd) {
  $found = Get-Command $cmd -ErrorAction SilentlyContinue
  if (-not $found) { throw "Missing required command: $cmd" }
}

Assert-Command python

Write-Host "== JPE Studio / CLI Windows build (PyInstaller) =="
Write-Host ("Python: " + (python --version))
Write-Host ("Pip:    " + (python -m pip --version))

python -c "import PyInstaller" 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "PyInstaller is not installed. Install it in your build venv (e.g., `python -m pip install pyinstaller`) and re-run."
}

if (-not $SkipTests) {
  Write-Host "== Running tests =="
  python -m pytest -q
}

if ($Clean) {
  Write-Host "== Cleaning old build outputs =="
  if (Test-Path -LiteralPath "build") { Remove-Item -Recurse -Force "build" }
  if (Test-Path -LiteralPath "dist") { Remove-Item -Recurse -Force "dist" }
}

Write-Host "== Building CLI (jpe-sims4) =="
python -m PyInstaller packaging/pyinstaller/jpe_sims4_cli.spec --noconfirm

Write-Host "== Building Studio (JPE-Studio) =="
python -m PyInstaller packaging/pyinstaller/jpe_studio.spec --noconfirm

Write-Host "== Writing build metadata =="
if (-not (Test-Path -LiteralPath "dist")) { New-Item -ItemType Directory -Path "dist" | Out-Null }
$git = Get-Command git -ErrorAction SilentlyContinue
$rev = ""
if ($git) { $rev = (git rev-parse --short HEAD 2>$null) }
$info = @()
$info += "timestamp_utc=" + (Get-Date).ToUniversalTime().ToString("o")
$info += "python=" + (python --version)
$info += "pip=" + (python -m pip --version)
if ($rev) { $info += "git_rev=" + $rev }
$info += ""
$info += "pip_freeze="
$info += (python -m pip freeze)
$info | Out-File -Encoding utf8 -FilePath "dist/build_info.txt"

Write-Host ""
Write-Host "Build complete."
Write-Host "- CLI:    dist/jpe-sims4/jpe-sims4.exe"
Write-Host "- Studio: dist/JPE-Studio/JPE-Studio.exe"
