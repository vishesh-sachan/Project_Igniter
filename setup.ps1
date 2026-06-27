$SETUP_SCRIPT = Join-Path (Split-Path $PSScriptRoot -Parent) ".project-igniter/setup.ps1"

if (-not (Test-Path $SETUP_SCRIPT)) {
  Write-Error "Setup scripts not found."
  Write-Error "Run the Project Igniter desktop app to generate them, then run this again."
  exit 1
}

& $SETUP_SCRIPT @args
