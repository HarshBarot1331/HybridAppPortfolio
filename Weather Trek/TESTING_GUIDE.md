# Testing Guide - Backend Refactor

This guide will help you verify that the backend refactoring is working correctly.

## Prerequisites

Make sure you have Node.js installed and all dependencies are installed:

```bash
# Install frontend dependencies (if not already done)
npm install

# Install backend dependencies (if not already done)
cd weather-aqhi-backend
npm install
cd ..
```

## Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd weather-aqhi-backend
npm start
```

You should see:
```
🚀 Express server running on http://localhost:3000
📡 API endpoints available at http://localhost:3000/api
```

**Keep this terminal open** - the backend needs to keep running.

## Step 2: Test Backend Endpoints

Open a **new terminal** (keep the backend running) and test the endpoints:

### Test Health Check
```bash
curl http://localhost:3000/api/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Test Canada Summary
```bash
curl http://localhost:3000/api/canada-summary
```
Expected: JSON with 8 cities of weather data

### Test Details Data (Toronto)
```bash
curl http://localhost:3000/api/details-data/Toronto
```
Expected: Toronto weather data

### Test Ontario Records
```bash
curl http://localhost:3000/api/ontario-records
```
Expected: Ontario dataset with records

### Test Messages
```bash
# Get messages
curl http://localhost:3000/api/messages

# Post a message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message"}'
```

### Test Ontario AQHI
```bash
curl http://localhost:3000/api/ontario-aqhi
```
Note: This may return an error if the external API is down, which is expected.

## Step 3: Start the Frontend

Open a **new terminal** (keep backend running) and run:

```bash
npm start
```

The Angular dev server will start (usually on `http://localhost:4200`).

## Step 4: Test in Browser

1. Open your browser and go to: `http://localhost:4200`

2. **Test Canada Summary Page:**
   - Navigate to the Canada Summary tab/page
   - You should see weather data for 8 Canadian cities
   - Data should load from the backend (check browser console for logs)

3. **Test Details Page:**
   - Click on any city (e.g., Toronto)
   - Details page should show city-specific weather data
   - Data comes from `/api/details-data/:city` endpoint

4. **Test Ontario Page:**
   - Navigate to Ontario page
   - Should show Ontario cities (Toronto, Ottawa)
   - Data comes from backend

## Step 5: Verify Backend is Being Used

### Check Browser Console
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for logs like:
   - `✅ Weather data loaded from backend:`
   - `✅ Weather data loaded from backend:`

### Check Network Tab
1. Open browser DevTools
2. Go to **Network** tab
3. Refresh the page
4. You should see requests to:
   - `http://localhost:3000/api/canada-summary`
   - `http://localhost:3000/api/details-data/...`
   - NOT requests to `/assets/data/weather-data.json`
   - NOT requests to `airqualityontario.com` (directly)

## Step 6: Verify No Direct API/JSON Access

### Check Frontend Code
The frontend should NOT have:
- ❌ Direct calls to `https://www.airqualityontario.com/...`
- ❌ Direct access to `/assets/data/weather-data.json`
- ✅ All calls should go through `environment.apiUrl`

### Quick Verification
```bash
# Check if any service still uses direct API calls
grep -r "airqualityontario.com" src/app/services/
# Should return nothing (or only in comments)

# Check if any service still uses assets/data
grep -r "assets/data" src/app/services/
# Should return nothing
```

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use: `lsof -ti:3000`
- Kill the process: `kill -9 $(lsof -ti:3000)`
- Make sure you're in the `weather-aqhi-backend` directory

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check `src/environments/environment.ts` has: `apiUrl: 'http://localhost:3000/api'`
- Check browser console for CORS errors (shouldn't happen, CORS is enabled)

### Data not loading
- Check backend terminal for errors
- Check browser console for errors
- Verify backend endpoints work with curl (Step 2)

### CORS Errors
- Backend has CORS enabled, but if you see errors:
  - Check `server.js` has `app.use(cors());`
  - Restart the backend server

## Quick Test Script

You can also run this quick test script:

```bash
#!/bin/bash
echo "Testing Backend Endpoints..."
echo ""

echo "1. Health Check:"
curl -s http://localhost:3000/api/health | jq '.status' || echo "Backend not running!"
echo ""

echo "2. Canada Summary (city count):"
curl -s http://localhost:3000/api/canada-summary | jq '.cities | length' || echo "Error"
echo ""

echo "3. Details Data (Toronto):"
curl -s http://localhost:3000/api/details-data/Toronto | jq '.city' || echo "Error"
echo ""

echo "4. Ontario Records:"
curl -s http://localhost:3000/api/ontario-records | jq '.province' || echo "Error"
echo ""

echo "5. Messages:"
curl -s http://localhost:3000/api/messages | jq '.messages | length' || echo "Error"
echo ""

echo "✅ All tests complete!"
```

Save this as `test-backend.sh`, make it executable (`chmod +x test-backend.sh`), and run it.

## Success Indicators

✅ **Backend is working if:**
- Server starts without errors
- All curl commands return JSON data
- No errors in backend terminal

✅ **Frontend is working if:**
- Pages load without errors
- Weather data appears on pages
- Browser console shows "loaded from backend" messages
- Network tab shows requests to `localhost:3000/api`

✅ **Refactoring is complete if:**
- No direct API calls from frontend
- No direct JSON file access from frontend
- All data flows through backend endpoints

