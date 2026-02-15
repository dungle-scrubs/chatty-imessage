#!/bin/bash
set -e

INSTALL_DIR="$HOME/.local/bin"
BINARY="dist/chat"

if [ ! -f "$BINARY" ]; then
  echo "Error: Binary not found at $BINARY"
  echo "Run 'bun run build' first"
  exit 1
fi

mkdir -p "$INSTALL_DIR"
cp "$BINARY" "$INSTALL_DIR/chat"
chmod +x "$INSTALL_DIR/chat"

echo "Installed chat to $INSTALL_DIR/chat"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo ""
  echo "Warning: $INSTALL_DIR is not in your PATH"
  echo "Add this to your ~/.zshrc:"
  echo ""
  echo '  export PATH="$HOME/.local/bin:$PATH"'
  echo ""
  echo "Then run: source ~/.zshrc"
fi
