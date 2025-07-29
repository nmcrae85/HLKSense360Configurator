# Force GitHub to Use Updated Dockerfile

## Problem
GitHub Actions is using an OLD cached Dockerfile that still has:
```dockerfile
COPY --from=builder /app/client/public /app/public  # Line 50
```

## Solution - Force Update

### 1. Verify Local Changes
```bash
cd hlk2450-configurator
cat -n Dockerfile | grep -A2 -B2 "public"
# Should NOT show any client/public line
```

### 2. Force Push All Changes
```bash
# Stage ALL changes
git add -A

# Commit with clear message
git commit -m "fix: force update Dockerfile v1.0.11 - remove client/public"

# Push to main branch
git push origin main --force-with-lease
```

### 3. Clear GitHub Actions Cache (if needed)
If the build still fails:
1. Go to GitHub repo settings
2. Actions → Caches
3. Delete all caches for the workflow

### 4. Trigger Fresh Build
- Make a small change (like adding a comment)
- Or manually trigger the workflow from GitHub Actions tab

## What's Different in v1.0.11
- Added comment marking the fix
- Version bump forces new build
- Confirmed no client/public references exist

## Expected Result
Build will succeed without the "client/public not found" error.