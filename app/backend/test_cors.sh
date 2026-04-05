#!/bin/bash

echo "Testing CORS for attendance endpoints..."
echo ""

echo "1. Testing OPTIONS preflight request:"
curl -v -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     "http://localhost:8000/api/reports/attendance-leaderboard" 2>&1 | grep -E "HTTP|Access-Control"

echo ""
echo "2. Testing GET request with Origin header:"
curl -v -H "Origin: http://localhost:3000" \
     "http://localhost:8000/api/reports/attendance-leaderboard?period=monthly" 2>&1 | grep -E "HTTP|Access-Control|401"

echo ""
echo "3. Testing public endpoint (plans):"
curl -v -H "Origin: http://localhost:3000" \
     "http://localhost:8000/api/plans" 2>&1 | grep -E "HTTP|Access-Control"
