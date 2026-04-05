"""
Test the leaderboard endpoint directly to see the error
"""
import asyncio
import sys
sys.path.insert(0, '/Users/anoopsunny/Documents/GuestWorker/app/backend')

async def test_endpoint():
    # Import after path is set
    from motor.motor_asyncio import AsyncIOMotorClient
    from datetime import datetime, timezone
    from attendance_analytics import convert_dd_mm_yyyy_to_iso, calculate_worker_leaderboard
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    contractor_id = "81c2e1c9-898d-454c-a5f7-07c9e773047c"
    
    print("Simulating leaderboard endpoint with period='monthly'...")
    
    try:
        # Fetch from both collections
        query = {"contractor_id": contractor_id}
        new_attendance = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
        
        old_query = {"contractor_id": contractor_id}
        old_attendance = await db.attendance.find(old_query, {"_id": 0}).to_list(10000)
        
        print(f"New attendance: {len(new_attendance)}")
        print(f"Old attendance: {len(old_attendance)}")
        
        # Transform and combine
        attendance_records = list(new_attendance)
        for old_rec in old_attendance:
            if old_rec.get('selected_workers'):
                for worker_id in old_rec.get('selected_workers', []):
                    attendance_records.append({
                        'worker_id': worker_id,
                        'date': old_rec.get('date', ''),
                        'status': 'Present'
                    })
            elif old_rec.get('worker_id'):
                attendance_records.append({
                    'worker_id': old_rec.get('worker_id'),
                    'date': old_rec.get('date', ''),
                    'status': old_rec.get('status', 'Present')
                })
        
        print(f"Total attendance records: {len(attendance_records)}")
        
        # Filter by period BEFORE calculating leaderboard
        period = "monthly"
        now = datetime.now(timezone.utc)
        
        print(f"\nFiltering for period: {period}")
        print(f"Current date: {now.year}-{now.month:02d}-{now.day:02d}")
        
        if period == "monthly" or period == "yearly":
            filtered_records = []
            for record in attendance_records:
                try:
                    iso_date = convert_dd_mm_yyyy_to_iso(record.get('date', ''))
                    record_date = datetime.fromisoformat(iso_date)
                    
                    if period == "monthly":
                        if record_date.year == now.year and record_date.month == now.month:
                            filtered_records.append(record)
                    elif period == "yearly":
                        if record_date.year == now.year:
                            filtered_records.append(record)
                except Exception as e:
                    print(f"Error filtering record: {e}")
                    continue
            attendance_records = filtered_records
        
        print(f"Filtered records: {len(attendance_records)}")
        
        workers = await db.workers.find(
            {"contractor_id": contractor_id, "status": "Active"},
            {"_id": 0}
        ).to_list(1000)
        
        print(f"Active workers: {len(workers)}")
        
        if not attendance_records or not workers:
            print("\n✅ Endpoint would return empty leaderboard (expected)")
            result = {
                "leaderboard": [],
                "period": period,
                "message": "No data available for leaderboard"
            }
            print(f"Result: {result}")
        else:
            print("\nCalculating leaderboard...")
            leaderboard = calculate_worker_leaderboard(attendance_records, workers, period)
            leaderboard = leaderboard[:50]
            
            period_label = ""
            if period == "monthly":
                period_label = now.strftime("%B %Y")
            elif period == "yearly":
                period_label = str(now.year)
            else:
                period_label = "All Time"
            
            result = {
                "leaderboard": leaderboard,
                "period": period,
                "period_label": period_label,
                "total_workers": len(leaderboard)
            }
            
            print(f"\n✅ Leaderboard calculated successfully!")
            print(f"Result: {result}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_endpoint())
