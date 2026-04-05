import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_attendance():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    # Check worker_attendance collection
    count = await db.worker_attendance.count_documents({})
    print(f'Total worker_attendance records: {count}')
    
    if count > 0:
        sample = await db.worker_attendance.find_one()
        print(f'\nSample record:')
        for key, value in sample.items():
            print(f'  {key}: {value}')
    
    # Check if there's an old attendance collection
    old_count = await db.attendance.count_documents({})
    print(f'\nOld attendance collection records: {old_count}')
    
    if old_count > 0:
        old_sample = await db.attendance.find_one()
        print(f'\nOld attendance sample:')
        for key, value in old_sample.items():
            print(f'  {key}: {value}')
    
    client.close()

asyncio.run(check_attendance())
