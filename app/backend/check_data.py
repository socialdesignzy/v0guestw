import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.guestworker
    
    # Find all contractors
    users = await db.users.find({'role': 'contractor'}).to_list(10)
    print(f'Total contractors: {len(users)}')
    
    if users:
        for user in users:
            uid = user['id']
            email = user.get('email', 'N/A')
            
            # Check attendance for this contractor
            count = await db.attendance.count_documents({'contractor_id': uid})
            print(f'\nContractor: {email} ({uid})')
            print(f'  Attendance records: {count}')
            
            if count > 0:
                sample = await db.attendance.find_one({'contractor_id': uid})
                print(f'  Sample record:')
                print(f'    Date: {sample.get("date")}')
                print(f'    Mode: {sample.get("mode")}')
                print(f'    Selected workers: {sample.get("selected_workers")}')
                print(f'    Worker ID: {sample.get("worker_id")}')
                break
    
    client.close()

asyncio.run(check())
