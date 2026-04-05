"""
Test period filtering for monthly and yearly
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

from attendance_analytics import convert_dd_mm_yyyy_to_iso

async def test_filtering():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    contractor_id = "81c2e1c9-898d-454c-a5f7-07c9e773047c"
    
    # Get all attendance
    old_attendance = await db.attendance.find({"contractor_id": contractor_id}, {"_id": 0}).to_list(100)
    
    print(f"Total old attendance records: {len(old_attendance)}")
    
    # Transform
    attendance_records = []
    for old_rec in old_attendance:
        if old_rec.get('selected_workers'):
            for worker_id in old_rec.get('selected_workers', []):
                attendance_records.append({
                    'worker_id': worker_id,
                    'date': old_rec.get('date', ''),
                    'status': 'Present'
                })
    
    print(f"Transformed records: {len(attendance_records)}")
    
    # Test date conversion and filtering
    now = datetime.now(timezone.utc)
    print(f"\nCurrent date: {now.year}-{now.month:02d}-{now.day:02d}")
    
    for record in attendance_records:
        date_str = record['date']
        print(f"\nOriginal date: {date_str}")
        
        iso_date = convert_dd_mm_yyyy_to_iso(date_str)
        print(f"ISO date: {iso_date}")
        
        record_date = datetime.fromisoformat(iso_date)
        print(f"Parsed date: {record_date.year}-{record_date.month:02d}-{record_date.day:02d}")
        
        # Test monthly filter
        matches_monthly = record_date.year == now.year and record_date.month == now.month
        print(f"Matches current month? {matches_monthly}")
        
        # Test yearly filter
        matches_yearly = record_date.year == now.year
        print(f"Matches current year? {matches_yearly}")
    
    # Test filtering logic
    print("\n" + "="*50)
    print("TESTING MONTHLY FILTER")
    print("="*50)
    
    filtered_monthly = []
    for record in attendance_records:
        try:
            iso_date = convert_dd_mm_yyyy_to_iso(record.get('date', ''))
            record_date = datetime.fromisoformat(iso_date)
            
            if record_date.year == now.year and record_date.month == now.month:
                filtered_monthly.append(record)
        except Exception as e:
            print(f"Error filtering: {e}")
    
    print(f"Records matching current month: {len(filtered_monthly)}")
    
    print("\n" + "="*50)
    print("TESTING YEARLY FILTER")
    print("="*50)
    
    filtered_yearly = []
    for record in attendance_records:
        try:
            iso_date = convert_dd_mm_yyyy_to_iso(record.get('date', ''))
            record_date = datetime.fromisoformat(iso_date)
            
            if record_date.year == now.year:
                filtered_yearly.append(record)
        except Exception as e:
            print(f"Error filtering: {e}")
    
    print(f"Records matching current year: {len(filtered_yearly)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_filtering())
