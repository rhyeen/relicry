#!/usr/bin/env bash
set -euo pipefail
source .env

# Remove existing symlink or directory with elevated permissions if necessary
if [ -L public/800dpi ] || [ -d public/800dpi ]; then
  sudo rm -rf public/800dpi
fi

# Create new symlink
ln -s "$SYMLINK_TO_800DPI_ASSETS" public/800dpi
echo "Created symlink: public/800dpi -> $SYMLINK_TO_800DPI_ASSETS"
