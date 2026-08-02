<p align="center">
  <img src="assets/logo.svg" alt="PROJECT_IGNITER" width="480">
</p>

<p align="center"><em>Analyze your project · compose visual workflows · forge zero-dependency setup scripts</em></p>

<!--
![Screenshot](assets/screenshot.png)
-->

## Why does this exist?

Every open-source project has a setup process — install dependencies, configure environment variables, create config files, run migrations. Contributors waste hours navigating docs, hitting missing tools, and debugging half-run setup steps.

Project Igniter lets maintainers model that setup as a **visual workflow** and generate zero-dependency shell scripts from it. Contributors run a single command — `bash setup.sh` — and the script walks them through everything, skipping what's already done.

## Features

| Area | What it does |
|---|---|
| **Workflow Composer** | Visual tree editor — 9 step types, drag-to-reorder, recursive branching, 3-panel layout with context variables and property inspector |
| **Script Forge** | Converts workflows into zero-dependency Bash and PowerShell scripts. No Node.js, no Tauri, no runtime — just native shell |
| **Project Analyzer** | *(coming next)* Scans your project and suggests a starter workflow from detected patterns |
| **One-Command Setup** | `bash setup.sh` — nothing else required |
| **Cross-Platform** | Generates both `setup.sh` (Bash) and `setup.ps1` (PowerShell) for every environment |
| **Variables & Context** | Prompt for input once, reference it across all steps via `{{variable}}` interpolation |
| **Recursive Branching** | Steps can nest sub-workflows — OS branches inside conditions inside checks, arbitrarily deep |
| **State Persistence** | Tracks what's been installed across runs; skips completed steps automatically |
| **Monorepo Support** | Manage workflows for multiple projects in a single repo with per-project standalone scripts |

## Quick Demo

```bash
git clone <your-project>
cd <your-project>
bash setup.sh
```

The script detects your platform, prompts for any required inputs, and runs the setup steps in order. If interrupted, re-running picks up where it left off.

## Installation

> Early development — preview builds coming soon. [Star the repository](https://github.com/vishesh-sachan/Project_Igniter) to stay updated.

**For maintainers** — Project Igniter bootstraps its own setup. Clone the repo and run its generated installer:

```bash
git clone https://github.com/vishesh-sachan/Project_Igniter
bash setup.sh
```

This runs the setup workflow for Project Igniter itself, launching the desktop app so you can model workflows and generate scripts for your project.

## Roadmap

See the full [roadmap on the landing page](https://project-igniter.nytkode.com/#roadmap)

- **Workflow Composer** *(completed)* — visual tree editor for modeling setup with 9 step types, drag-to-reorder, and recursive branching
- **Script Forge Optimisation** *(in progress)* — cleaner generated scripts, better error handling, faster generation
- **Project Analyzer** *(coming next)* — scan a directory and auto-produce a starter workflow from package managers, config files, and build scripts

## Contributing

This repo is the Project Igniter desktop application (Tauri v2, React 19, TypeScript, Tailwind CSS 4).

**macOS / Linux** — clone and run the setup script:

```bash
git clone https://github.com/vishesh-sachan/Project_Igniter
cd project-installer
bash setup.sh
```

**Windows** — clone and run the setup script:

```powershell
git clone https://github.com/vishesh-sachan/Project_Igniter
cd project-installer
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.