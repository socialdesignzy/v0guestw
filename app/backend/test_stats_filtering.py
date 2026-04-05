"""
Test overall stats filtering with date ranges
"""
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

from attendance_analytics import get_overall_attendance_stats
from datetime import datetime

# Test data with DD-MM-YYYY format (old format)
attendance_records = [
    {'worker_id': 'w1', 'date': '23-12-2025', 'status': 'Present'},
    {'worker_id': 'w1', 'date': '24-12-2025', 'status': 'Present'},
]

print("Test 1: All time (no date filter)")
stats = get_overall_attendance_stats(attendance_records, None, None)
print(f"Total records: {stats['total_records']}")
print(f"Present count: {stats['present_count']}")
print(f"Attendance %: {stats['attendance_percentage']}")

print("\nTest 2: This month (March 2026) - should be 0")
stats = get_overall_attendance_stats(attendance_records, "2026-03-01", "2026-03-15")
print(f"Total records: {stats['total_records']}")
print(f"Present count: {stats['present_count']}")
print(f"Attendance %: {stats['attendance_percentage']}")

print("\nTest 3: This year (2026) - should be 0")
stats = get_overall_attendance_stats(attendance_records, "2026-01-01", "2026-12-31")
print(f"Total records: {stats['total_records']}")
print(f"Present count: {stats['present_count']}")
print(f"Attendance %: {stats['attendance_percentage']}")

print("\nTest 4: December 2025 - should be 2")
stats = get_overall_attendance_stats(attendance_records, "2025-12-01", "2025-12-31")
print(f"Total records: {stats['total_records']}")
print(f"Present count: {stats['present_count']}")
print(f"Attendance %: {stats['attendance_percentage']}")

print("\n✅ All tests completed!")
