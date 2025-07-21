# Home Assistant Add-on Repository Setup Instructions

## Current Status
The application is working but the repository structure needs to be reorganized for Home Assistant compatibility.

## Required Changes for GitHub Repository

### 1. Create Proper Add-on Structure
Your repository should be organized as:

```
nmcrae85/HLKSense360Configurator/
├── README.md                    # Repository overview (keep at root)
├── repository.yaml              # HA repository config (keep at root)
├── LICENSE                      # MIT license (keep at root)
└── hlk2450-configurator/        # Create this folder and move everything else here
    ├── config.yaml
    ├── Dockerfile
    ├── build.yaml
    ├── README.md
    ├── CHANGELOG.md
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── drizzle.config.ts
    ├── postcss.config.js
    ├── components.json
    ├── client/
    ├── server/
    ├── shared/
    └── scripts/
```

### 2. Steps to Reorganize on GitHub

1. **Create the add-on subdirectory:**
   ```bash
   mkdir hlk2450-configurator
   ```

2. **Move all app files into it:**
   ```bash
   git mv config.yaml hlk2450-configurator/
   git mv Dockerfile hlk2450-configurator/
   git mv build.yaml hlk2450-configurator/
   git mv CHANGELOG.md hlk2450-configurator/
   git mv package*.json hlk2450-configurator/
   git mv tsconfig.json hlk2450-configurator/
   git mv *.config.* hlk2450-configurator/
   git mv *.js hlk2450-configurator/
   git mv components.json hlk2450-configurator/
   git mv client/ hlk2450-configurator/
   git mv server/ hlk2450-configurator/
   git mv shared/ hlk2450-configurator/
   git mv scripts/ hlk2450-configurator/
   ```

3. **Keep only these at root:**
   - README.md (repository overview)
   - repository.yaml (already updated)
   - LICENSE
   - .github/ (workflows)

4. **Update GitHub Actions workflow:**
   Edit `.github/workflows/build.yml` to build from the subdirectory:
   ```yaml
   - name: Build add-on
     run: cd hlk2450-configurator && docker build ...
   ```

### 3. Why This Structure is Required

Home Assistant expects:
- The repository root to contain `repository.yaml` with add-on metadata
- Each add-on to be in its own subdirectory
- The subdirectory name must match what users will see in the add-on store

### 4. Testing the Repository

After reorganizing, users can add your repository to Home Assistant:
1. Settings → Add-ons → Add-on Store
2. Menu → Repositories
3. Add: `https://github.com/nmcrae85/HLKSense360Configurator`
4. Find "HLK2450 mmWave Sensor Configurator" in the store

## Current Working Features
✓ WebSocket connection is stable (fixed connection spam)
✓ Application runs on port 5000
✓ All dependencies installed
✓ TypeScript configuration working
✓ Repository URL updated to nmcrae85

## Next Steps
1. Push current changes to GitHub
2. Reorganize repository structure as described above
3. Test installation in Home Assistant