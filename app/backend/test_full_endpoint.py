"""
Test the full attendance analytics endpoint with real data
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

async def test_full_flow():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    # Use the contractor with data
    contractor_id = "81c2e1c9-898d-454c-a5f7-07c9e773047c"
    print(f"Testing with contractor: {contractor_id}")
    
    # Simulate the endpoint logic
    query = {"contractor_id": contractor_id}
    
    # Get from new worker_attendance collection
    new_attendance = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
    print(f"New attendance records: {len(new_attendance)}")
    
    # Get from old attendance collection (mode: worker)
    old_query = {"contractor_id": contractor_id, "mode": "worker"}
    old_attendance = await db.attendance.find(old_query, {"_id": 0}).to_list(10000)
    print(f"Old attendance records (mode=worker): {len(old_attendance)}")
    
    # Also try without mode filter
    all_old_query = {"contractor_id": contractor_id}
    all_old_attendance = await db.attendance.find(all_old_query, {"_id": 0}).to_list(10000)
    print(f"All old attendance records: {len(all_old_attendance)}")
    
    if all_old_attendance:
        print("\nSample old attendance record:")
        sample = all_old_attendance[0]
        for key, value in sample.items():
            if key != '_id':
                print(f"  {key}: {value}")
    
    # Transform old attendance to match new schema
    attendance_records = []
    attendance_records.extend(new_attendance)
    
    # Transform and add old attendance records
    for old_rec in all_old_attendance:
        if old_rec.get('selected_workers'):
            # This is an employer attendance with selected workers
            for worker_id in old_rec.get('selected_workers', []):
                attendance_records.append({
                    'worker_id': worker_id,
                    'employer_id': old_rec.get('employer_id', ''),
                    'date': old_rec.get('date', ''),
                    'status': 'Present',
                    'wage_earned': old_rec.get('wage_amount', 0) / max(len(old_rec.get('selected_workers', [])), 1)
                })
        elif old_rec.get('worker_id'):
            # Direct worker attendance record
            attendance_records.append({
                'worker_id': old_rec.get('worker_id'),
                'employer_id': old_rec.get('employer_id', ''),
                'date': old_rec.get('date', ''),
                'status': old_rec.get('status', 'Present'),
                'wage_earned': old_rec.get('wage_amount', 0)
            })
    
    print(f"\nTotal transformed attendance records: {len(attendance_records)}")
    
    if attendance_records:
        print("\nSample transformed record:")
        print(attendance_records[0])
        
        # Test analytics
        try:
            print("\n=== Testing Overall Stats ===")
            overall_stats = get_overall_attendance_stats(attendance_records, None, None)
            print(f"Total records: {overall_stats['total_records']}")
            print(f"Present count: {overall_stats['present_count']}")
            print(f"Attendance %: {overall_stats['attendance_percentage']}")
            
            print("\n=== Testing Day Trends ===")
            day_trends = analyze_day_of_week_trends(attendance_records)
            print(f"Days analyzed: {list(day_trends.keys())}")
            
            print("\n=== Testing Leaderboard ===")
            workers = await db.workers.find(
                {"contractor_id": contractor_id, "status": "Active"},
                {"_id": 0}
            ).to_list(1000)
            print(f"Active workers: {len(workers)}")
            
            if workers:
                leaderboard = calculate_worker_leaderboard(attendance_records, workers, "monthly")
                print(f"Leaderboard entries: {len(leaderboard)}")
                if leaderboard:
                    print(f"Top 3:")
                    for entry in leaderboard[:3]:
                        print(f"  {entry['rank']}. {entry['worker_name']}: {entry['present_days']} days ({entry['attendance_percentage']}%)")
            
            print("\n✅ ALL TESTS PASSED!")
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("\n❌ No attendance records found!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_full_flow())
