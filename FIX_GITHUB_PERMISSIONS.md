# Fix GitHub Actions Package Permission Error

## The Error
```
ERROR: failed to push ghcr.io/nmcrae85/hlk2450-configurator-amd64:main: denied: permission_denied: write_package
```

## Solution Steps

### 1. Enable GitHub Actions in Your Repository
1. Go to your repository: `https://github.com/nmcrae85/HLKSense360Configurator`
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Actions** → **General**
4. Under "Actions permissions", select **Allow all actions and reusable workflows**
5. Scroll down and click **Save**

### 2. Configure Workflow Permissions
Still in **Settings** → **Actions** → **General**:
1. Scroll to "Workflow permissions"
2. Select **Read and write permissions**
3. Check ✅ **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### 3. Enable GitHub Container Registry
1. In Settings, go to **Pages** (left sidebar)
2. Make sure GitHub Pages is NOT using the `gh-pages` branch (if it exists)
3. Go back to main repository page

### 4. Create a Personal Access Token (Alternative if above doesn't work)
If the above steps don't work, you might need a Personal Access Token:

1. Go to GitHub Settings (your profile, not repo): https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Give it a name like "HLK2450 Container Registry"
4. Select these scopes:
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
   - ✅ `read:packages` (Download packages from GitHub Package Registry)
   - ✅ `delete:packages` (Delete packages from GitHub Package Registry)
   - ✅ `repo` (Full control of private repositories)
5. Click **Generate token**
6. Copy the token

Then add it as a repository secret:
1. Go to your repo Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `CR_PAT`
4. Value: Paste your token
5. Click **Add secret**

### 5. Update workflow to use PAT (only if needed)
If you created a PAT, update `.github/workflows/build.yml`:

```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ env.REGISTRY }}
    username: ${{ github.actor }}
    password: ${{ secrets.CR_PAT }}  # Change from GITHUB_TOKEN to CR_PAT
```

## Quick Fix - Try This First!

The easiest fix is usually just updating the repository settings:
1. Go to Settings → Actions → General
2. Set "Workflow permissions" to **Read and write permissions**
3. Save and re-run the workflow

## After Fixing

Once you've made these changes:
1. Go to the Actions tab in your repository
2. Find the failed workflow run
3. Click **Re-run all jobs**

The build should now successfully push images to GitHub Container Registry!