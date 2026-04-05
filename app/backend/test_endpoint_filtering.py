"""
Test that endpoint-level filtering works correctly
"""
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

from attendance_analytics import (
    get_overall_attendance_stats,
    analyze_day_of_week_trends,
    convert_dd_mm_yyyy_to_iso
)

# Simulate endpoint filtering logic
def filter_records(attendance_records, start_date, end_date):
    """Simulate the endpoint-level filtering"""
    if not start_date or not end_date:
        return attendance_records
    
    filtered_records = []
    for r in attendance_records:
        record_date = r.get('date', '')
        if record_date:
            iso_date = convert_dd_mm_yyyy_to_iso(record_date)
            if start_date <= iso_date <= end_date:
                filtered_records.append(r)
    return filtered_records

# Test data with mixed dates
attendance_records = [
    {'worker_id': 'w1', 'date': '23-12-2025', 'status': 'Present'},  # Dec 2025
    {'worker_id': 'w1', 'date': '24-12-2025', 'status': 'Present'},  # Dec 2025
    {'worker_id': 'w2', 'date': '05-03-2026', 'status': 'Present'},  # March 2026
    {'worker_id': 'w2', 'date': '06-03-2026', 'status': 'Absent'},   # March 2026
]

print("="*60)
print("TEST 1: All Time (no filtering)")
print("="*60)
filtered = filter_records(attendance_records, None, None)
print(f"Filtered records: {len(filtered)}")

stats = get_overall_attendance_stats(filtered, None, None)
print(f"Overall Stats - Total: {stats['total_records']}, Present: {stats['present_count']}, Absent: {stats['absent_count']}")

trends = analyze_day_of_week_trends(filtered)
print(f"Day Trends - Days with data: {list(trends.keys())}")
for day, data in trends.items():
    print(f"  {day}: {data['present_count']} present, {data['absent_count']} absent")

print("\n" + "="*60)
print("TEST 2: This Month (March 2026)")
print("="*60)
filtered = filter_records(attendance_records, "2026-03-01", "2026-03-31")
print(f"Filtered records: {len(filtered)}")

stats = get_overall_attendance_stats(filtered, "2026-03-01", "2026-03-31")
print(f"Overall Stats - Total: {stats['total_records']}, Present: {stats['present_count']}, Absent: {stats['absent_count']}")

trends = analyze_day_of_week_trends(filtered)
print(f"Day Trends - Days with data: {list(trends.keys())}")
for day, data in trends.items():
    print(f"  {day}: {data['present_count']} present, {data['absent_count']} absent")

print("\n" + "="*60)
print("TEST 3: December 2025")
print("="*60)
filtered = filter_records(attendance_records, "2025-12-01", "2025-12-31")
print(f"Filtered records: {len(filtered)}")

stats = get_overall_attendance_stats(filtered, "2025-12-01", "2025-12-31")
print(f"Overall Stats - Total: {stats['total_records']}, Present: {stats['present_count']}, Absent: {stats['absent_count']}")

trends = analyze_day_of_week_trends(filtered)
print(f"Day Trends - Days with data: {list(trends.keys())}")
for day, data in trends.items():
    print(f"  {day}: {data['present_count']} present, {data['absent_count']} absent")

print("\n✅ All tests completed!")
print("\nExpected behavior:")
print("- All Time: 4 records total")
print("- March 2026: 2 records (1 present, 1 absent)")
print("- December 2025: 2 records (2 present)")
print("- Both stats and trends should show SAME filtered data")
