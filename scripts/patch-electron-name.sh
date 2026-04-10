#!/bin/sh
# Patches the Electron dev binary so the window title shows "ArchDiagram"
# NOTE: we do NOT rename Electron.app — the electron CLI hardcodes that path
PLIST="node_modules/electron/dist/Electron.app/Contents/Info.plist"
if [ -f "$PLIST" ]; then
  plutil -replace CFBundleName -string ArchDiagram "$PLIST"
  plutil -replace CFBundleDisplayName -string ArchDiagram "$PLIST"
  echo "Patched Info.plist bundle name → ArchDiagram"
fi
