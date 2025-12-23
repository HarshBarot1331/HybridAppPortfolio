#!/bin/bash
echo "🧪 Testing Backend Endpoints..."
echo ""

echo "1. Health Check:"
curl -s http://localhost:3000/api/health | jq '.status' 2>/dev/null || echo "❌ Backend not running!"
echo ""

echo "2. Canada Summary (city count):"
curl -s http://localhost:3000/api/canada-summary | jq '.cities | length' 2>/dev/null || echo "❌ Error"
echo ""

echo "3. Details Data (Toronto):"
curl -s http://localhost:3000/api/details-data/Toronto | jq '.city' 2>/dev/null || echo "❌ Error"
echo ""

echo "4. Ontario Records:"
curl -s http://localhost:3000/api/ontario-records | jq '.province' 2>/dev/null || echo "❌ Error"
echo ""

echo "5. Messages:"
curl -s http://localhost:3000/api/messages | jq '.messages | length' 2>/dev/null || echo "❌ Error"
echo ""

echo "✅ All tests complete!"
