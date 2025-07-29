# CRITICAL: Fix Blank Screen Issue

## The Problem
Home Assistant is showing its own interface instead of your add-on. This means the ingress proxy cannot reach your add-on on port 5000.

## Root Causes
1. Add-on container is not running
2. Port 5000 is not accessible from Home Assistant supervisor
3. Ingress configuration is incorrect

## Immediate Fix Steps

### Step 1: Test with Simple Server
Replace the Dockerfile CMD temporarily to use the test server:

```dockerfile
CMD ["node", "test-server.js"]
```

This will help verify if the issue is with the app or the ingress setup.

### Step 2: Push Changes
```bash
git add .
git commit -m "Critical fix: Add test server and ingress diagnostics"
git push origin main
```

### Step 3: Full Reinstall
1. In Home Assistant:
   - Settings → Add-ons → HLK2450 Configurator → STOP
   - Click "Uninstall"
   - Wait for complete removal

2. Clear Repository Cache:
   - Settings → Add-ons → Add-on Store
   - Three dots → Repositories
   - Remove your repository URL
   - Re-add: https://github.com/nmcrae85/HLKSense360Configurator
   - Click reload

3. Reinstall:
   - Search "HLK2450"
   - Install
   - Start
   - Check logs immediately

### Step 4: Verify Connectivity
Once running, test these in order:

1. **Direct Port Test** (SSH to HA):
   ```bash
   curl http://localhost:5000/health
   ```

2. **Container Test**:
   ```bash
   docker ps | grep hlk2450
   docker exec [container_id] curl http://localhost:5000/health
   ```

3. **Ingress Test**:
   ```
   http://[YOUR_HA_IP]:8123/hassio/ingress/f5b8b369_hlk2450-configurator/health
   ```

## Expected Results

With the test server, you should see:
- A simple HTML page saying "HLK2450 Test Server Running!"
- Request headers including x-ingress-path
- Confirmation that ingress is working

## If Still Not Working

1. **Check Add-on Logs**:
   - Look for "Test server listening on 0.0.0.0:5000"
   - Check for any startup errors

2. **Check Supervisor Logs**:
   ```bash
   ha supervisor logs | grep hlk2450
   ```

3. **Network Issues**:
   - Ensure no firewall blocking port 5000
   - Check if another add-on uses port 5000

## Once Test Server Works

When the test server shows through ingress, revert to the real app:
1. Change Dockerfile CMD back to: `CMD ["/app/run.sh"]`
2. Push, rebuild, reinstall
3. The React app should now work through ingress