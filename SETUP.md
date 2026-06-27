# Setup Guide

> This project uses **Project Igniter** to generate zero-dependency setup scripts. No Node.js, no package managers, no runtime required — just Bash (Linux/macOS) or PowerShell (Windows).

## Quick Start

```bash
# Linux / macOS — three ways:
bash setup.sh
./setup.sh
npm run setup

# Windows PowerShell:
powershell -ExecutionPolicy Bypass ./setup.ps1
# or:
npm run setup:ps
```

The script will:
1. Detect which project you're in (for monorepo support)
2. Prompt you for any required configuration values
3. Run the setup steps (install dependencies, configure tools, etc.)

Your answers are saved locally at `~/.local/share/project-igniter/` so you won't be re-prompted next time.

## Flags

| Flag | Description |
|------|-------------|
| `--env <name>` | Target a specific environment (default: `dev`) |
| `--sync` | Re-run setup but only prompt for values you haven't filled in yet |
| `--reset` | Clear all saved configuration for this project and environment |
| `--status` | Show current configuration and last run date |
| `--help` | Show usage information |

### Examples

```bash
# Setup for staging environment
bash setup.sh --env staging

# Check what's configured
bash setup.sh --status

# Start fresh
bash setup.sh --reset

# Add new values without re-entering existing ones
bash setup.sh --sync
```

## Environments

Workflows can have multiple environments (e.g., `dev`, `staging`, `prod`). Each environment maintains its own set of configuration values.

```bash
bash setup.sh --env production
```

## Monorepo Support

In a monorepo, run the script from within the sub-project directory. The script automatically detects which project it belongs to:

```bash
cd packages/frontend
bash ../../setup.sh
```

## State Storage

Configuration values are stored at:

```
~/.local/share/project-igniter/<project>/<env>/
```

- `meta` — tracks schema version and last run date
- One file per configuration variable

The schema version is compared against `.project-igniter/workflows.json` on each run. If the workflow has been updated, the script prints a warning and exits. Run `./setup.sh --sync` to refresh state with the new schema.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `setup.sh: not found` | The maintainer hasn't generated scripts yet. Run the Project Igniter desktop app. |
| `Workflow schema changed` | Run `./setup.sh --sync` to refresh state with the updated workflow. |
| Stale configuration after reset | Run `--reset` to clear all saved values, then run normally |

## For Maintainers

If you're a maintainer looking to edit workflows, use the Project Igniter desktop application. After making changes, regenerate scripts and commit the updated `.project-igniter/` directory so contributors stay in sync.
