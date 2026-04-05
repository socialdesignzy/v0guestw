"""
Attendance Analytics Module
Provides comprehensive attendance analysis, predictions, and insights
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from collections import defaultdict, Counter
import statistics

def convert_dd_mm_yyyy_to_iso(date_str: str) -> str:
    """Convert DD-MM-YYYY format to YYYY-MM-DD ISO format"""
    try:
        if '-' in date_str and len(date_str.split('-')) == 3:
            parts = date_str.split('-')
            if len(parts[0]) == 4:  # Already in YYYY-MM-DD format
                return date_str
            # DD-MM-YYYY format
            day, month, year = parts
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return date_str
    except:
        return date_str

def calculate_attendance_percentage(present_days: int, total_days: int) -> float:
    """Calculate attendance percentage"""
    if total_days == 0:
        return 0.0
    return round((present_days / total_days) * 100, 2)

def get_day_of_week_name(date_str: str) -> str:
    """Get day of week name from date string (supports both YYYY-MM-DD and DD-MM-YYYY)"""
    try:
        # Convert to ISO format first
        iso_date = convert_dd_mm_yyyy_to_iso(date_str)
        date_obj = datetime.fromisoformat(iso_date)
        return date_obj.strftime('%A')  # Monday, Tuesday, etc.
    except:
        return "Unknown"

def analyze_day_of_week_trends(attendance_records: List[Dict]) -> Dict:
    """
    Analyze attendance patterns by day of week
    Returns trends showing which days have highest/lowest attendance
    """
    day_stats = defaultdict(lambda: {"present": 0, "absent": 0, "total": 0})
    
    for record in attendance_records:
        day_name = get_day_of_week_name(record.get('date', ''))
        if day_name == "Unknown":
            continue
            
        status = record.get('status', '')
        day_stats[day_name]["total"] += 1
        
        if status in ["Present", "Late"]:
            day_stats[day_name]["present"] += 1
        elif status == "Absent":
            day_stats[day_name]["absent"] += 1
    
    # Calculate percentages and format results
    results = {}
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for day in day_order:
        if day in day_stats:
            stats = day_stats[day]
            total = stats["total"]
            present = stats["present"]
            absent = stats["absent"]
            
            results[day] = {
                "total_records": total,
                "present_count": present,
                "absent_count": absent,
                "attendance_percentage": calculate_attendance_percentage(present, total),
                "absence_percentage": calculate_attendance_percentage(absent, total)
            }
    
    return results

def predict_worker_absences(worker_attendance: List[Dict], worker_name: str) -> List[Dict]:
    """
    Predict likely absence days for a worker based on historical patterns
    Returns predictions with confidence levels
    """
    predictions = []
    
    # Analyze day-of-week patterns for this worker
    day_absences = defaultdict(int)
    day_totals = defaultdict(int)
    
    for record in worker_attendance:
        day_name = get_day_of_week_name(record.get('date', ''))
        if day_name == "Unknown":
            continue
            
        day_totals[day_name] += 1
        if record.get('status') == "Absent":
            day_absences[day_name] += 1
    
    # Generate predictions for days with high absence rate
    for day, total in day_totals.items():
        if total < 3:  # Need at least 3 records to predict
            continue
            
        absent_count = day_absences[day]
        absence_rate = (absent_count / total) * 100
        
        # Predict if absence rate is above 40%
        if absence_rate >= 40:
            confidence = "High" if absence_rate >= 60 else "Medium"
            predictions.append({
                "worker_name": worker_name,
                "day_of_week": day,
                "absence_rate": round(absence_rate, 1),
                "confidence": confidence,
                "message": f"{worker_name} is likely to be absent on {day}s",
                "based_on": f"{absent_count} absences out of {total} {day}s"
            })
    
    return predictions

def detect_absence_patterns(worker_attendance: List[Dict]) -> Dict:
    """
    Detect repeated patterns in worker absences
    Returns patterns like consecutive absences, monthly trends, etc.
    """
    patterns = {
        "consecutive_absences": [],
        "monthly_trend": {},
        "frequent_absence_days": []
    }
    
    # Sort by date
    sorted_attendance = sorted(worker_attendance, key=lambda x: x.get('date', ''))
    
    # Detect consecutive absences
    consecutive_count = 0
    consecutive_dates = []
    
    for record in sorted_attendance:
        if record.get('status') == "Absent":
            consecutive_count += 1
            consecutive_dates.append(record.get('date'))
        else:
            if consecutive_count >= 2:  # Pattern of 2+ consecutive absences
                patterns["consecutive_absences"].append({
                    "count": consecutive_count,
                    "dates": consecutive_dates.copy(),
                    "start_date": consecutive_dates[0],
                    "end_date": consecutive_dates[-1]
                })
            consecutive_count = 0
            consecutive_dates = []
    
    # Check last sequence
    if consecutive_count >= 2:
        patterns["consecutive_absences"].append({
            "count": consecutive_count,
            "dates": consecutive_dates.copy(),
            "start_date": consecutive_dates[0],
            "end_date": consecutive_dates[-1]
        })
    
    # Monthly trend analysis
    monthly_absences = defaultdict(int)
    monthly_totals = defaultdict(int)
    
    for record in worker_attendance:
        try:
            iso_date = convert_dd_mm_yyyy_to_iso(record.get('date', ''))
            date_obj = datetime.fromisoformat(iso_date)
            month_key = date_obj.strftime('%Y-%m')
            monthly_totals[month_key] += 1
            if record.get('status') == "Absent":
                monthly_absences[month_key] += 1
        except:
            continue
    
    for month, total in monthly_totals.items():
        absences = monthly_absences[month]
        patterns["monthly_trend"][month] = {
            "total_days": total,
            "absent_days": absences,
            "absence_rate": round((absences / total) * 100, 1) if total > 0 else 0
        }
    
    return patterns

def calculate_worker_leaderboard(all_attendance: List[Dict], workers: List[Dict], 
                                 period: str = "monthly") -> List[Dict]:
    """
    Calculate worker attendance leaderboard
    period: 'monthly' or 'yearly' or 'all'
    Note: Period filtering should be done at the endpoint level before calling this function
    This function processes all records passed to it
    """
    worker_stats = defaultdict(lambda: {"present": 0, "total": 0, "worker_info": None})
    
    for record in all_attendance:
        try:
            worker_id = record.get('worker_id')
            status = record.get('status')
            
            worker_stats[worker_id]["total"] += 1
            if status in ["Present", "Late"]:
                worker_stats[worker_id]["present"] += 1
                
        except:
            continue
    
    # Enrich with worker info and calculate percentages
    leaderboard = []
    worker_map = {w['id']: w for w in workers}
    
    for worker_id, stats in worker_stats.items():
        if worker_id in worker_map:
            worker = worker_map[worker_id]
            attendance_pct = calculate_attendance_percentage(stats["present"], stats["total"])
            
            leaderboard.append({
                "worker_id": worker_id,
                "worker_name": worker.get('name', 'Unknown'),
                "present_days": stats["present"],
                "total_days": stats["total"],
                "absent_days": stats["total"] - stats["present"],
                "attendance_percentage": attendance_pct,
                "rank": 0  # Will be set after sorting
            })
    
    # Sort by present days (descending) and then by percentage
    leaderboard.sort(key=lambda x: (x["present_days"], x["attendance_percentage"]), reverse=True)
    
    # Assign ranks
    for idx, entry in enumerate(leaderboard, 1):
        entry["rank"] = idx
    
    return leaderboard

def get_overall_attendance_stats(attendance_records: List[Dict], 
                                start_date: Optional[str] = None,
                                end_date: Optional[str] = None) -> Dict:
    """
    Calculate overall attendance statistics for a period
    Note: Filtering should be done at the endpoint level before calling this function.
    start_date and end_date are kept for metadata purposes only.
    """
    # Records are already filtered at endpoint level
    filtered_records = attendance_records
    
    total_records = len(filtered_records)
    present_count = sum(1 for r in filtered_records if r.get('status') in ["Present", "Late"])
    absent_count = sum(1 for r in filtered_records if r.get('status') == "Absent")
    
    # Get unique dates and workers
    unique_dates = set(r.get('date') for r in filtered_records if r.get('date'))
    unique_workers = set(r.get('worker_id') for r in filtered_records if r.get('worker_id'))
    
    # Calculate daily averages
    date_stats = defaultdict(lambda: {"present": 0, "absent": 0})
    for record in filtered_records:
        date = record.get('date')
        status = record.get('status')
        if status in ["Present", "Late"]:
            date_stats[date]["present"] += 1
        elif status == "Absent":
            date_stats[date]["absent"] += 1
    
    daily_present_counts = [stats["present"] for stats in date_stats.values()]
    daily_absent_counts = [stats["absent"] for stats in date_stats.values()]
    
    avg_daily_present = round(statistics.mean(daily_present_counts), 1) if daily_present_counts else 0
    avg_daily_absent = round(statistics.mean(daily_absent_counts), 1) if daily_absent_counts else 0
    
    return {
        "total_records": total_records,
        "present_count": present_count,
        "absent_count": absent_count,
        "attendance_percentage": calculate_attendance_percentage(present_count, total_records),
        "unique_dates": len(unique_dates),
        "unique_workers": len(unique_workers),
        "avg_daily_present": avg_daily_present,
        "avg_daily_absent": avg_daily_absent,
        "date_range": {
            "start": start_date,
            "end": end_date
        }
    }
