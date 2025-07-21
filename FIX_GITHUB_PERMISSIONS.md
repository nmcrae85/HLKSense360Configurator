# Fix for GitHub Container Registry Permissions

## Issue:
The Docker images aren't being pushed to GitHub Container Registry, resulting in 404 errors when trying to install the add-on.

## Solution:

### 1. Create a Personal Access Token (if not already done)
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Container Registry"
4. Select these permissions:
   - `write:packages` (to upload container images)
   - `read:packages` (to download container images)
   - `delete:packages` (optional, for cleanup)
5. Click "Generate token" and copy it

### 2. Add the Token to Repository Secrets
1. Go to your repository: https://github.com/nmcrae85/HLKSense360Configurator
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `CR_PAT`
5. Value: Paste your personal access token
6. Click "Add secret"

### 3. Trigger the Workflow
After pushing the changes, you can manually trigger the workflow:
1. Go to Actions tab in your repository
2. Click on "Build and Publish Add-on"
3. Click "Run workflow" → "Run workflow"

This will build and push all Docker images with the correct version (1.0.1).
