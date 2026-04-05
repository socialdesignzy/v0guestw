"""
Check if server has the latest changes and test endpoint
"""
import subprocess
import time

# Check if attendance_analytics module exists
try:
    import attendance_analytics
    print("✅ attendance_analytics module found")
    print(f"   Functions: {dir(attendance_analytics)}")
except ImportError as e:
    print(f"❌ attendance_analytics module NOT found: {e}")

# Check server process
result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'uvicorn' in line and 'server:app' in line:
        print(f"\n✅ Server running: {line.split()[1]}")
        break

# Try to import server module
try:
    import sys
    sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')
    import server
    print("\n✅ Server module imports successfully")
    
    # Check if the attendance endpoints exist
    routes = [r.path for r in server.app.routes]
    attendance_routes = [r for r in routes if 'attendance' in r]
    print(f"\n📍 Attendance routes found:")
    for route in attendance_routes:
        if 'analytics' in route or 'leaderboard' in route:
            print(f"   {route}")
    
except Exception as e:
    print(f"\n❌ Error importing server: {e}")
    import traceback
    traceback.print_exc()
