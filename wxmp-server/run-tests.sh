#!/usr/bin/env bash
# Run the wxmp-server test suite. Uses $WXMP_SERVER_PYTHON if provided
# (CI passes its dependency-installed venv python); otherwise creates/reuses
# a local venv in .venv/ so `npm run test:server` works anywhere.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -n "${WXMP_SERVER_PYTHON:-}" ]]; then
  exec "$WXMP_SERVER_PYTHON" -m unittest discover -s "$DIR/tests" -v
fi

if [[ ! -x "$DIR/.venv/bin/python" ]]; then
  python3 -m venv "$DIR/.venv"
  "$DIR/.venv/bin/pip" install -q flask requests gunicorn
fi
exec "$DIR/.venv/bin/python" -m unittest discover -s "$DIR/tests" -v
