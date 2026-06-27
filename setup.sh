#! /usr/bin/env bash
set -o pipefail

SETUP_SCRIPT="$(cd "$(dirname "$0")" && pwd)/.project-igniter/setup.sh"

if [ ! -f "$SETUP_SCRIPT" ]; then
  echo "Error: setup scripts not found." >&2
  echo "Run the Project Igniter desktop app to generate them, then run this again." >&2
  exit 1
fi

exec "$SETUP_SCRIPT" "$@"
