# Guide: Handling Hidden Files for GitHub Repository

## Hidden Files/Folders Overview

Currently in your project:
```
.cache/      # Replit cache - DO NOT commit to GitHub
.git/        # Git repository - automatically handled
.github/     # GitHub Actions - MUST stay at root
.gitignore   # Git ignore rules - MUST stay at root  
.local/      # Replit local files - DO NOT commit
.replit      # Replit config - can move to subdirectory
.upm/        # Replit package manager - DO NOT commit
```

## What to Do with Each Hidden File/Folder

### 1. **KEEP AT ROOT** (Don't move these):
- `.github/` - Contains your build workflows, must stay at repository root
- `.gitignore` - Defines what Git ignores, must stay at root
- `.git/` - This is your Git repository itself, never touch this

### 2. **MOVE TO SUBDIRECTORY**:
- `.replit` - Move this to `hlk2450-configurator/` if you want Replit config in GitHub

### 3. **DO NOT COMMIT** (These are local Replit files):
- `.cache/`
- `.local/`
- `.upm/`

## Complete Reorganization Commands

```bash
# 1. Create the add-on subdirectory
mkdir hlk2450-configurator

# 2. Move all app files (including .replit)
git mv config.yaml hlk2450-configurator/
git mv Dockerfile hlk2450-configurator/
git mv build.yaml hlk2450-configurator/
git mv CHANGELOG.md hlk2450-configurator/
git mv package*.json hlk2450-configurator/
git mv tsconfig.json hlk2450-configurator/
git mv vite.config.ts hlk2450-configurator/
git mv tailwind.config.ts hlk2450-configurator/
git mv drizzle.config.ts hlk2450-configurator/
git mv postcss.config.js hlk2450-configurator/
git mv components.json hlk2450-configurator/
git mv client/ hlk2450-configurator/
git mv server/ hlk2450-configurator/
git mv shared/ hlk2450-configurator/
git mv scripts/ hlk2450-configurator/
git mv .replit hlk2450-configurator/  # Optional: include Replit config

# 3. Files that stay at root:
# - README.md
# - LICENSE
# - repository.yaml
# - .github/ (workflows)
# - .gitignore
# - SETUP_INSTRUCTIONS.md (can keep or move, your choice)
# - GITHUB_HIDDEN_FILES_GUIDE.md (this file, can delete after reading)

# 4. Commit the reorganization
git add .
git commit -m "Reorganize repository structure for Home Assistant add-on compliance"
git push
```

## Verify .gitignore is Set Up Correctly

Make sure your `.gitignore` includes these Replit-specific entries:
```
# Replit specific
.cache/
.local/
.upm/
.config/
.replit_history
.nix_shell_dump

# Node modules
node_modules/

# Build outputs
dist/
*.log
```

## Final Repository Structure

After reorganization:
```
HLKSense360Configurator/
├── .github/                     # GitHub Actions (stays at root)
│   └── workflows/
│       └── build.yml
├── .gitignore                   # Git ignore rules (stays at root)
├── README.md                    # Repository docs
├── repository.yaml              # HA add-on repository config
├── LICENSE                      # MIT license
└── hlk2450-configurator/        # Add-on directory
    ├── .replit                  # Replit config (optional)
    ├── config.yaml              # HA add-on config
    ├── Dockerfile
    ├── build.yaml
    ├── README.md
    ├── package.json
    └── ... (all other app files)
```

## Important Notes

1. **GitHub Actions Path**: Your workflow already looks for changes in `hlk2450-configurator/**` so it will work correctly after moving files.

2. **Docker Build Context**: Your workflow builds from `./hlk2450-configurator` which is correct for the new structure.

3. **Local vs GitHub**: Files like `.cache/`, `.local/`, `.upm/` only exist in your Replit environment and won't be pushed to GitHub (they're ignored by Git).

4. **Testing**: After reorganizing, test that:
   - GitHub Actions still builds successfully
   - The add-on can be installed from your repository URL
   - The Docker image builds correctly