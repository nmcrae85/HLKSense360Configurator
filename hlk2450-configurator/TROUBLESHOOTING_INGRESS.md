# Troubleshooting Home Assistant Ingress

## Blank Screen Issue

When you see a blank screen or Home Assistant's interface instead of the add-on, follow these steps:

### 1. Check if Add-on is Running
In Home Assistant:
- Go to Settings → Add-ons → HLK2450 Configurator
- Check if status shows "Running"
- Look at the logs for any errors

### 2. Test Direct Access
Try accessing the add-on directly (not through ingress):
```
http://[YOUR_HA_IP]:5000
```

### 3. Check Ingress Health
Access the health endpoint through ingress:
```
http://[YOUR_HA_IP]:8123/hassio/ingress/f5b8b369_hlk2450-configurator/health
```

### 4. Rebuild and Reinstall
Since we've made changes to fix routing:

1. Push changes to GitHub:
```bash
git add .
git commit -m "Fix ingress routing and add diagnostics"
git push
```

2. In Home Assistant:
   - Uninstall the add-on
   - Go to Add-on Store → Repositories
   - Click reload/refresh
   - Reinstall HLK2450 Configurator
   - Start the add-on

### 5. Check Container Logs
SSH into Home Assistant and check Docker logs:
```bash
docker ps | grep hlk2450
docker logs [container_id]
```

### Common Issues:

1. **Port Binding**: Ensure no other service is using port 5000
2. **Network Mode**: Add-on must not use host network mode
3. **Ingress Path**: The `x-ingress-path` header must be handled correctly

### Testing the Fix

After reinstalling, test these URLs in order:
1. `/health` - Should return JSON with status
2. `/` - Should load the app
3. `/settings` - Should show settings page (not 404)