#!/usr/bin/env bash
set -euo pipefail
# Helper for local development
VENV_DIR="$(dirname "$0")/.venv"
if [ ! -d "$VENV_DIR" ]; then
  echo "No .venv found. Create one with: python -m venv .venv"
  exit 1
fi
source "$VENV_DIR/bin/activate"
case "${1:-}" in
  install)
    pip install -r requirements.txt
    ;;
  run)
    python manage.py runserver
    ;;
  createsuperuser)
    python manage.py createsuperuser
    ;;
  check)
    python manage.py check
    ;;
  *)
    echo "Usage: $0 {install|run|createsuperuser|check}"
    ;;
esac