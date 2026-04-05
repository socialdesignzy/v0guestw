"""
Test script to check attendance analytics endpoints directly
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

from attendance_analytics import (
    analyze_day_of_week_trends,
    predict_worker_absences,
    detect_absence_patterns,
    calculate_worker_leaderboard,
    get_overall_attendance_stats,
    convert_dd_mm_yyyy_to_iso
)

async def test_endpoints():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    # Get a contractor ID
    user = await db.users.find_one({"role": "contractor"})
    if not user:
        print("No contractor found")
        return
    
    contractor_id = user['id']
    print(f"Testing with contractor: {contractor_id}")
    
    # Fetch old attendance
    old_query = {"contractor_id": contractor_id, "mode": "worker"}
    old_attendance = await db.attendance.find(old_query, {"_id": 0}).to_list(100)
    
    print(f"\nFound {len(old_attendance)} old attendance records")
    
    # Transform old attendance
    attendance_records = []
    for old_rec in old_attendance:
        if old_rec.get('selected_workers'):
            for worker_id in old_rec.get('selected_workers', []):
                attendance_records.append({
                    'worker_id': worker_id,
                    'employer_id': old_rec.get('employer_id', ''),
                    'date': old_rec.get('date', ''),
                    'status': 'Present',
                    'wage_earned': old_rec.get('wage_amount', 0) / max(len(old_rec.get('selected_workers', [])), 1)
                })
        elif old_rec.get('worker_id'):
            attendance_records.append({
                'worker_id': old_rec.get('worker_id'),
                'employer_id': old_rec.get('employer_id', ''),
                'date': old_rec.get('date', ''),
                'status': old_rec.get('status', 'Present'),
                'wage_earned': old_rec.get('wage_amount', 0)
            })
    
    print(f"Transformed to {len(attendance_records)} attendance records")
    
    if attendance_records:
        print("\nSample record:")
        print(attendance_records[0])
        
        # Test date conversion
        sample_date = attendance_records[0].get('date')
        print(f"\nOriginal date: {sample_date}")
        iso_date = convert_dd_mm_yyyy_to_iso(sample_date)
        print(f"Converted date: {iso_date}")
        
        # Test analytics functions
        try:
            print("\n=== Testing overall stats ===")
            stats = get_overall_attendance_stats(attendance_records)
            print(f"Total records: {stats['total_records']}")
            print(f"Present: {stats['present_count']}")
            print(f"Attendance %: {stats['attendance_percentage']}")
            
            print("\n=== Testing day trends ===")
            day_trends = analyze_day_of_week_trends(attendance_records)
            for day, trend in list(day_trends.items())[:3]:
                print(f"{day}: {trend}")
            
            print("\n=== Testing leaderboard ===")
            workers = await db.workers.find({"contractor_id": contractor_id, "status": "Active"}, {"_id": 0}).to_list(100)
            print(f"Found {len(workers)} active workers")
            
            leaderboard = calculate_worker_leaderboard(attendance_records, workers, "monthly")
            print(f"Leaderboard entries: {len(leaderboard)}")
            if leaderboard:
                print(f"Top worker: {leaderboard[0]}")
            
            print("\n✅ All analytics functions working!")
            
        except Exception as e:
            print(f"\n❌ Error in analytics: {e}")
            import traceback
            traceback.print_exc()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_endpoints())
