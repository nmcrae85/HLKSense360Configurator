# Deployment Instructions - Fix Blank Screen Issue

## The Issue
You're seeing a blank screen because Home Assistant is showing its own interface instead of the add-on. This means the ingress proxy isn't reaching the add-on.

## Solution Steps

### 1. Push Latest Changes to GitHub
```bash
git add .
git commit -m "Fix: Add health endpoint and improve ingress handling"
git push origin main
```

### 2. Wait for GitHub Actions
- Check your GitHub repository's Actions tab
- Wait for the build to complete (about 5-10 minutes)
- Ensure all architectures build successfully

### 3. Reinstall in Home Assistant

1. **Remove Current Add-on**:
   - Settings → Add-ons → HLK2450 Configurator
   - Click "Uninstall"

2. **Refresh Repository**:
   - Settings → Add-ons → Add-on Store
   - Three dots menu → Repositories → Reload

3. **Reinstall Add-on**:
   - Search for "HLK2450"
   - Click Install
   - Wait for installation

4. **Start Add-on**:
   - Click "Start"
   - Watch the logs for any errors

### 4. Test the Fix

Test these URLs in order:

1. **Health Check**:
   ```
   http://[YOUR_HA_IP]:8123/hassio/ingress/f5b8b369_hlk2450-configurator/health
   ```
   Should return JSON with status

2. **Main App**:
   ```
   http://[YOUR_HA_IP]:8123/hassio/ingress/f5b8b369_hlk2450-configurator/
   ```
   Should show the configurator

3. **Deep Link**:
   ```
   http://[YOUR_HA_IP]:8123/hassio/ingress/f5b8b369_hlk2450-configurator/settings
   ```
   Should show settings page

## What Changed

1. Added `/health` endpoint for diagnostics
2. Improved ingress path handling in the server
3. Added startup script with better logging
4. Fixed router to properly handle ingress base paths

## Still Not Working?

Check the add-on logs in Home Assistant for specific errors. The new startup script will show:
- Environment variables
- Whether files are found
- Any startup errors