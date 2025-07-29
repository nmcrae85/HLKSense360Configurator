# Fix Installation Error - Version 1.0.12

## The Problem
Home Assistant is trying to pull:
- `ghcr.io/nmcrae85/hlk2450-configurator-amd64:1.0.9` ❌

But should pull:
- `ghcr.io/nmcrae85/hlk2450-configurator:1.0.12` ✅

## Solution Applied
1. Removed `-{arch}` suffix from image name in config.yaml
2. Bumped version to 1.0.12
3. GitHub Actions creates a multi-arch manifest that works for all platforms

## Installation Steps After Push

1. **Remove old repository** (if added):
   - Settings → Add-ons → Repositories
   - Remove: `https://github.com/nmcrae85/HLKSense360Configurator`

2. **Add repository again**:
   - Click "Add repository"
   - Enter: `https://github.com/nmcrae85/HLKSense360Configurator`
   - Click "Add"

3. **Refresh add-on store**:
   - Pull down to refresh
   - Or restart Home Assistant

4. **Install add-on**:
   - Find "HLK2450 mmWave Sensor Configurator"
   - Should show version 1.0.12
   - Click "Install"

## What Changed
- Image reference: `ghcr.io/nmcrae85/hlk2450-configurator-{arch}` → `ghcr.io/nmcrae85/hlk2450-configurator`
- The GitHub Actions workflow creates a multi-arch manifest that automatically serves the correct architecture