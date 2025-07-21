# Release Process for HLK2450 Configurator

## Automated Release Workflow

### Version Update Checklist

When making any changes, follow this process:

1. **Make Your Code Changes**
   - Fix bugs, add features, update dependencies

2. **Update Version Number**
   - Edit `hlk2450-configurator/config.yaml`
   - Increment version following semantic versioning:
     - MAJOR.MINOR.PATCH (e.g., 1.0.1 → 1.0.2)
     - Patch: Bug fixes
     - Minor: New features (backwards compatible)
     - Major: Breaking changes

3. **Update CHANGELOG.md**
   - Add new version section with date
   - Document all changes under appropriate headings:
     - ### Fixed
     - ### Added
     - ### Changed
     - ### Removed

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Release v1.0.X: Brief description"
   git push
   ```

5. **GitHub Actions Automatically**
   - Reads version from config.yaml
   - Builds Docker images with that version tag
   - Pushes to GitHub Container Registry

## Version Synchronization

The following files are automatically synchronized:
- `hlk2450-configurator/config.yaml` - Source of truth for version
- `.github/workflows/build.yml` - Automatically reads version from config.yaml
- Docker images - Tagged with version from config.yaml

## Testing Before Release

1. **Local Testing**
   ```bash
   cd hlk2450-configurator
   npm run build
   NODE_ENV=production node dist/index.production.js
   ```

2. **Docker Testing**
   ```bash
   docker build -t hlk2450-test hlk2450-configurator/
   docker run -p 5000:5000 hlk2450-test
   ```

## Home Assistant Installation

After GitHub Actions completes:
1. Uninstall old version
2. Reload repositories
3. Install new version

## Troubleshooting

If builds fail:
1. Check GitHub Actions logs
2. Verify CR_PAT secret is set
3. Ensure version format is correct (X.Y.Z)