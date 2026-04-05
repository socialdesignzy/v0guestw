"""
Test the actual endpoint with real data to see what's being returned
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

from attendance_analytics import (
    get_overall_attendance_stats,
    analyze_day_of_week_trends,
    convert_dd_mm_yyyy_to_iso
)

async def test_real_endpoint():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    # Use a contractor that has recent attendance data
    contractor_id = "81c2e1c9-898d-454c-a5f7-07c9e773047c"
    
    print("="*70)
    print("SIMULATING ENDPOINT: /api/reports/attendance-analytics")
    print("="*70)
    
    # Fetch from both collections (simulating endpoint logic)
    query = {"contractor_id": contractor_id}
    new_attendance = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
    old_query = {"contractor_id": contractor_id}
    old_attendance = await db.attendance.find(old_query, {"_id": 0}).to_list(10000)
    
    print(f"\nNew attendance records: {len(new_attendance)}")
    print(f"Old attendance records: {len(old_attendance)}")
    
    # Transform old attendance
    attendance_records = []
    attendance_records.extend(new_attendance)
    
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
    
    print(f"Total transformed records: {len(attendance_records)}")
    
    # Show sample dates
    if attendance_records:
        print(f"\nSample dates in data:")
        for r in attendance_records[:5]:
            print(f"  - {r.get('date')} (worker: {r.get('worker_id')[:8]}...)")
    
    # TEST 1: All time (no date filter)
    print("\n" + "="*70)
    print("TEST 1: ALL TIME (no date filter)")
    print("="*70)
    
    filtered_records = attendance_records
    overall_stats = get_overall_attendance_stats(filtered_records, None, None)
    day_trends = analyze_day_of_week_trends(filtered_records)
    
    print(f"\nOverall Stats:")
    print(f"  Total records: {overall_stats['total_records']}")
    print(f"  Present: {overall_stats['present_count']}")
    print(f"  Absent: {overall_stats['absent_count']}")
    print(f"  Attendance %: {overall_stats['attendance_percentage']}")
    
    print(f"\nDay Trends:")
    for day, stats in day_trends.items():
        print(f"  {day}: {stats['present_count']} present, {stats['absent_count']} absent")
    
    # TEST 2: This month (March 2026)
    print("\n" + "="*70)
    print("TEST 2: THIS MONTH (March 2026)")
    print("="*70)
    
    start_date = "2026-03-01"
    end_date = "2026-03-15"
    
    # Filter at endpoint level
    filtered_records = []
    for r in attendance_records:
        record_date = r.get('date', '')
        if record_date:
            iso_date = convert_dd_mm_yyyy_to_iso(record_date)
            if start_date <= iso_date <= end_date:
                filtered_records.append(r)
    
    print(f"Filtered records for March 2026: {len(filtered_records)}")
    
    if filtered_records:
        print(f"\nFiltered dates:")
        for r in filtered_records[:10]:
            print(f"  - {r.get('date')} → {convert_dd_mm_yyyy_to_iso(r.get('date'))}")
    
    overall_stats = get_overall_attendance_stats(filtered_records, start_date, end_date)
    day_trends = analyze_day_of_week_trends(filtered_records)
    
    print(f"\nOverall Stats:")
    print(f"  Total records: {overall_stats['total_records']}")
    print(f"  Present: {overall_stats['present_count']}")
    print(f"  Absent: {overall_stats['absent_count']}")
    print(f"  Attendance %: {overall_stats['attendance_percentage']}")
    
    print(f"\nDay Trends:")
    if day_trends:
        for day, stats in day_trends.items():
            print(f"  {day}: {stats['present_count']} present, {stats['absent_count']} absent")
    else:
        print("  No day trends (empty)")
    
    # TEST 3: Check if there's ANY data in March 2026
    print("\n" + "="*70)
    print("CHECKING: Do we have ANY attendance in March 2026?")
    print("="*70)
    
    march_2026_count = 0
    for r in attendance_records:
        iso_date = convert_dd_mm_yyyy_to_iso(r.get('date', ''))
        if "2026-03" in iso_date:
            march_2026_count += 1
            if march_2026_count <= 5:
                print(f"  Found: {r.get('date')} → {iso_date}")
    
    print(f"\nTotal March 2026 records: {march_2026_count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_real_endpoint())
