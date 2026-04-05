"""
Attendance Report API Endpoints
Comprehensive attendance analytics, predictions, and insights
"""

# This file contains the new attendance report endpoints
# Add these to server.py after the existing reports section

ATTENDANCE_REPORT_ENDPOINTS = '''

# ============ ATTENDANCE ANALYTICS REPORTS ============

@api_router.get("/reports/attendance-analytics")
async def get_attendance_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_active_subscription_user)
):
    """
    Get comprehensive attendance analytics including:
    - Overall stats (percentage, present/absent counts)
    - Day-of-week trends
    - Smart predictions for worker absences
    """
    # Fetch all attendance records for the user
    query = {"contractor_id": current_user.id}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    attendance_records = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
    
    if not attendance_records:
        return {
            "overall_stats": {},
            "day_of_week_trends": {},
            "predictions": [],
            "message": "No attendance data found for the selected period"
        }
    
    # Calculate overall statistics
    overall_stats = get_overall_attendance_stats(attendance_records, start_date, end_date)
    
    # Analyze day-of-week trends
    day_trends = analyze_day_of_week_trends(attendance_records)
    
    # Get worker predictions
    workers = await db.workers.find({"contractor_id": current_user.id}, {"_id": 0}).to_list(1000)
    worker_map = {w['id']: w['name'] for w in workers}
    
    all_predictions = []
    for worker_id, worker_name in worker_map.items():
        worker_attendance = [r for r in attendance_records if r.get('worker_id') == worker_id]
        if len(worker_attendance) >= 5:  # Need minimum data for predictions
            predictions = predict_worker_absences(worker_attendance, worker_name)
            all_predictions.extend(predictions)
    
    # Sort predictions by confidence and absence rate
    all_predictions.sort(key=lambda x: (x['confidence'] == 'High', x['absence_rate']), reverse=True)
    
    return {
        "overall_stats": overall_stats,
        "day_of_week_trends": day_trends,
        "predictions": all_predictions[:10],  # Top 10 predictions
        "total_predictions": len(all_predictions)
    }

@api_router.get("/reports/worker-attendance-analysis/{worker_id}")
async def get_worker_attendance_analysis(
    worker_id: str,
    period: str = "all",  # all, monthly, yearly
    current_user: User = Depends(get_active_subscription_user)
):
    """
    Get detailed attendance analysis for a specific worker including:
    - Overall attendance performance
    - Absent days breakdown (overall, monthly, yearly)
    - Repeated absence patterns
    - Day-of-week trends for this worker
    """
    # Verify worker belongs to contractor
    worker = await db.workers.find_one(
        {"id": worker_id, "contractor_id": current_user.id},
        {"_id": 0}
    )
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Fetch worker's attendance records
    query = {"contractor_id": current_user.id, "worker_id": worker_id}
    
    # Apply period filter
    now = datetime.now(timezone.utc)
    if period == "monthly":
        start_of_month = now.replace(day=1).date().isoformat()
        query["date"] = {"$gte": start_of_month}
    elif period == "yearly":
        start_of_year = now.replace(month=1, day=1).date().isoformat()
        query["date"] = {"$gte": start_of_year}
    
    attendance_records = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
    
    if not attendance_records:
        return {
            "worker_info": worker,
            "message": "No attendance data found for this worker"
        }
    
    # Calculate statistics
    total_days = len(attendance_records)
    present_days = sum(1 for r in attendance_records if r.get('status') in ["Present", "Late"])
    absent_days = sum(1 for r in attendance_records if r.get('status') == "Absent")
    
    attendance_percentage = round((present_days / total_days) * 100, 2) if total_days > 0 else 0
    
    # Get absent dates
    absent_dates = [r.get('date') for r in attendance_records if r.get('status') == "Absent"]
    
    # Detect patterns
    patterns = detect_absence_patterns(attendance_records)
    
    # Day-of-week analysis for this worker
    worker_day_trends = analyze_day_of_week_trends(attendance_records)
    
    # Get predictions for this worker
    predictions = predict_worker_absences(attendance_records, worker.get('name', 'Unknown'))
    
    # Monthly breakdown
    monthly_stats = {}
    for record in attendance_records:
        try:
            date_obj = datetime.fromisoformat(record.get('date', ''))
            month_key = date_obj.strftime('%Y-%m')
            if month_key not in monthly_stats:
                monthly_stats[month_key] = {"present": 0, "absent": 0, "total": 0}
            
            monthly_stats[month_key]["total"] += 1
            if record.get('status') in ["Present", "Late"]:
                monthly_stats[month_key]["present"] += 1
            elif record.get('status') == "Absent":
                monthly_stats[month_key]["absent"] += 1
        except:
            continue
    
    # Calculate percentages for monthly stats
    for month, stats in monthly_stats.items():
        stats["attendance_percentage"] = round((stats["present"] / stats["total"]) * 100, 2) if stats["total"] > 0 else 0
    
    return {
        "worker_info": {
            "id": worker.get('id'),
            "name": worker.get('name'),
            "phone": worker.get('phone'),
            "status": worker.get('status')
        },
        "overall_stats": {
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": absent_days,
            "attendance_percentage": attendance_percentage,
            "period": period
        },
        "absent_dates": absent_dates,
        "monthly_breakdown": monthly_stats,
        "patterns": patterns,
        "day_of_week_trends": worker_day_trends,
        "predictions": predictions
    }

@api_router.get("/reports/attendance-leaderboard")
async def get_attendance_leaderboard(
    period: str = "monthly",  # monthly or yearly
    limit: int = 50,
    current_user: User = Depends(get_active_subscription_user)
):
    """
    Get attendance leaderboard showing top-performing workers
    Sorted by number of days present
    """
    # Fetch all attendance records
    query = {"contractor_id": current_user.id}
    
    # Apply period filter
    now = datetime.now(timezone.utc)
    if period == "monthly":
        start_of_month = now.replace(day=1).date().isoformat()
        query["date"] = {"$gte": start_of_month}
    elif period == "yearly":
        start_of_year = now.replace(month=1, day=1).date().isoformat()
        query["date"] = {"$gte": start_of_year}
    
    attendance_records = await db.worker_attendance.find(query, {"_id": 0}).to_list(10000)
    
    # Get all workers
    workers = await db.workers.find(
        {"contractor_id": current_user.id, "status": "Active"},
        {"_id": 0}
    ).to_list(1000)
    
    if not attendance_records or not workers:
        return {
            "leaderboard": [],
            "period": period,
            "message": "No data available for leaderboard"
        }
    
    # Calculate leaderboard
    leaderboard = calculate_worker_leaderboard(attendance_records, workers, period)
    
    # Limit results
    leaderboard = leaderboard[:limit]
    
    # Add period info
    period_label = ""
    if period == "monthly":
        period_label = now.strftime("%B %Y")
    elif period == "yearly":
        period_label = str(now.year)
    
    return {
        "leaderboard": leaderboard,
        "period": period,
        "period_label": period_label,
        "total_workers": len(leaderboard)
    }

@api_router.get("/reports/attendance-summary")
async def get_attendance_summary(
    current_user: User = Depends(get_active_subscription_user)
):
    """
    Get quick attendance summary for dashboard
    Includes today's stats, this week, and this month
    """
    now = datetime.now(timezone.utc)
    today = now.date().isoformat()
    
    # Start of week (Monday)
    start_of_week = (now - timedelta(days=now.weekday())).date().isoformat()
    
    # Start of month
    start_of_month = now.replace(day=1).date().isoformat()
    
    # Today's stats
    today_records = await db.worker_attendance.find({
        "contractor_id": current_user.id,
        "date": today
    }, {"_id": 0}).to_list(1000)
    
    today_present = sum(1 for r in today_records if r.get('status') in ["Present", "Late"])
    today_absent = sum(1 for r in today_records if r.get('status') == "Absent")
    
    # This week's stats
    week_records = await db.worker_attendance.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_of_week}
    }, {"_id": 0}).to_list(10000)
    
    week_present = sum(1 for r in week_records if r.get('status') in ["Present", "Late"])
    week_absent = sum(1 for r in week_records if r.get('status') == "Absent")
    week_total = len(week_records)
    week_percentage = round((week_present / week_total) * 100, 2) if week_total > 0 else 0
    
    # This month's stats
    month_records = await db.worker_attendance.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_of_month}
    }, {"_id": 0}).to_list(10000)
    
    month_present = sum(1 for r in month_records if r.get('status') in ["Present", "Late"])
    month_absent = sum(1 for r in month_records if r.get('status') == "Absent")
    month_total = len(month_records)
    month_percentage = round((month_present / month_total) * 100, 2) if month_total > 0 else 0
    
    return {
        "today": {
            "present": today_present,
            "absent": today_absent,
            "total": len(today_records)
        },
        "this_week": {
            "present": week_present,
            "absent": week_absent,
            "total": week_total,
            "attendance_percentage": week_percentage
        },
        "this_month": {
            "present": month_present,
            "absent": month_absent,
            "total": month_total,
            "attendance_percentage": month_percentage
        }
    }
'''
