#!/bin/sh
# Open the content studio in a browser. Keep this window open while you edit.

# ". start-editor.sh" loads this into the current terminal and can close it.
# That is not the same as "./start-editor.sh".
if [ -n "${ZSH_VERSION-}" ]; then
  case ${ZSH_EVAL_CONTEXT-} in *:file*)
    echo "Run it as:  ./start-editor.sh"
    echo "Not:        . start-editor.sh"
    return 1
  ;; esac
elif [ -n "${BASH_VERSION-}" ] && [ "${BASH_SOURCE[0]}" != "$0" ]; then
  echo "Run it as:  ./start-editor.sh"
  echo "Not:        . start-editor.sh"
  return 1
fi

set -e
cd "$(dirname "$0")"

if [ ! -f tools/editor-studio.py ]; then
  echo "Could not find tools/editor-studio.py."
  echo "Open the rubyclaes.github.io folder first, then run:  ./start-editor.sh"
  exit 1
fi

echo "Starting the content studio..."
echo "Keep this window open while you edit. Press Ctrl+C when you are done."
echo

if command -v python3 >/dev/null 2>&1; then
  exec python3 -u tools/editor-studio.py "$@"
fi

if command -v python >/dev/null 2>&1; then
  if python -c "import sys; raise SystemExit(0 if sys.version_info[0] >= 3 else 1)"; then
    exec python -u tools/editor-studio.py "$@"
  fi
fi

echo "Python 3 is required to run the content studio."
echo "Mac: xcode-select --install   (or install Python from python.org)"
echo "Linux: sudo pacman -S python   or   sudo apt install python3"
exit 1
