"""
Test attendance analytics endpoint with actual user authentication
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

from attendance_analytics import (
    analyze_day_of_week_trends,
    predict_worker_absences,
    calculate_worker_leaderboard,
    get_overall_attendance_stats,
    convert_dd_mm_yyyy_to_iso
)

async def test_analytics():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    # Use contractor with data
    contractor_id = "81c2e1c9-898d-454c-a5f7-07c9e773047c"
    print(f"Testing analytics for contractor: {contractor_id}\n")
    
    # Simulate the endpoint logic exactly
    query = {"contractor_id": contractor_id}
    
    # Get from new worker_attendance collection
    new_attendance = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
    print(f"New attendance records: {len(new_attendance)}")
    
    # Get from old attendance collection (all modes)
    old_query = {"contractor_id": contractor_id}
    old_attendance = await db.attendance.find(old_query, {"_id": 0}).to_list(10000)
    print(f"Old attendance records: {len(old_attendance)}")
    
    # Transform old attendance to match new schema
    attendance_records = []
    attendance_records.extend(new_attendance)
    
    # Transform and add old attendance records
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
    
    print(f"Total transformed records: {len(attendance_records)}\n")
    
    if not attendance_records:
        print("❌ NO ATTENDANCE RECORDS FOUND!")
        return
    
    # Test overall stats
    print("=" * 50)
    print("TESTING OVERALL STATS")
    print("=" * 50)
    try:
        overall_stats = get_overall_attendance_stats(attendance_records, None, None)
        print(f"✅ Overall Stats:")
        print(f"   Total records: {overall_stats['total_records']}")
        print(f"   Present count: {overall_stats['present_count']}")
        print(f"   Absent count: {overall_stats['absent_count']}")
        print(f"   Attendance %: {overall_stats['attendance_percentage']}")
        print(f"   Unique dates: {overall_stats['unique_dates']}")
        print(f"   Unique workers: {overall_stats['unique_workers']}")
    except Exception as e:
        print(f"❌ Error in overall stats: {e}")
        import traceback
        traceback.print_exc()
    
    # Test day trends
    print("\n" + "=" * 50)
    print("TESTING DAY OF WEEK TRENDS")
    print("=" * 50)
    try:
        day_trends = analyze_day_of_week_trends(attendance_records)
        print(f"✅ Day Trends:")
        for day, stats in day_trends.items():
            print(f"   {day}: {stats['present_count']} present, {stats['absent_count']} absent, {stats['attendance_percentage']}%")
    except Exception as e:
        print(f"❌ Error in day trends: {e}")
        import traceback
        traceback.print_exc()
    
    # Test leaderboard
    print("\n" + "=" * 50)
    print("TESTING LEADERBOARD")
    print("=" * 50)
    try:
        workers = await db.workers.find(
            {"contractor_id": contractor_id, "status": "Active"},
            {"_id": 0}
        ).to_list(1000)
        print(f"Active workers found: {len(workers)}")
        
        if workers:
            for w in workers[:3]:
                print(f"   Worker: {w.get('name')} (ID: {w.get('id')})")
        
        leaderboard = calculate_worker_leaderboard(attendance_records, workers, "monthly")
        print(f"\n✅ Leaderboard entries: {len(leaderboard)}")
        
        if leaderboard:
            print("\nTop 5:")
            for entry in leaderboard[:5]:
                print(f"   {entry['rank']}. {entry['worker_name']}: {entry['present_days']} days ({entry['attendance_percentage']}%)")
        else:
            print("⚠️  No leaderboard entries generated!")
            print(f"   Attendance records count: {len(attendance_records)}")
            print(f"   Workers count: {len(workers)}")
            
            # Debug: check if worker IDs match
            worker_ids_in_attendance = set(r['worker_id'] for r in attendance_records)
            worker_ids_in_db = set(w['id'] for w in workers)
            print(f"\n   Worker IDs in attendance: {worker_ids_in_attendance}")
            print(f"   Worker IDs in database: {worker_ids_in_db}")
            print(f"   Matching IDs: {worker_ids_in_attendance & worker_ids_in_db}")
            
    except Exception as e:
        print(f"❌ Error in leaderboard: {e}")
        import traceback
        traceback.print_exc()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_analytics())
