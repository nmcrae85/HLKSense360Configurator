# Force Docker Image Rebuild - Step by Step

## The Problem:
Home Assistant is using OLD Docker images that still have the Vite error. The new fixed images haven't been built yet.

## Solution - Force a Complete Rebuild:

### 1. First, check if GitHub Actions ran:
Go to: https://github.com/nmcrae85/HLKSense360Configurator/actions
- Look for recent workflow runs
- If none exist, you need to trigger one manually

### 2. Manually trigger the build:
1. Go to Actions tab
2. Click "Build and Publish Add-on"
3. Click "Run workflow" button
4. Select "main" branch
5. Click green "Run workflow" button

### 3. Wait for completion (5-10 minutes)
- All three architectures must show green checkmarks

### 4. Verify images exist:
1. Go to your repository main page
2. Look on the right side for "Packages"
3. Click on it
4. You should see 3 packages with tag "1.0.1"

### 5. In Home Assistant:
1. Uninstall the add-on completely
2. Go to Settings → System → Hardware → Three dots → Reboot Host
3. After reboot, go to Add-ons
4. Click three dots → Check for updates
5. Search for and install your add-on fresh

## If workflow fails with permission error:
You need to set up the CR_PAT secret:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with: write:packages, read:packages
3. Copy the token
4. Go to your repo → Settings → Secrets and variables → Actions
5. Add new secret named "CR_PAT" with the token value

## Alternative - Use latest tag:
If version 1.0.1 continues to fail, temporarily change config.yaml back to:
```yaml
version: "1.0.0"
```
This will use the "latest" tag which might have the correct build.