"""
Date utility functions for standardizing date formats across the application.

This module provides utilities to convert between different date formats:
- ISO format (YYYY-MM-DD) - Used for database storage and API responses
- DD-MM-YYYY format - Legacy format used in some parts of the application
"""

from datetime import datetime, timezone
from typing import Optional


def parse_date_string(date_str: str) -> Optional[datetime]:
    """
    Parse a date string in various formats and return a datetime object.
    
    Supports:
    - ISO format: YYYY-MM-DD
    - DD-MM-YYYY format
    - ISO datetime format with timezone
    
    Args:
        date_str: Date string to parse
        
    Returns:
        datetime object or None if parsing fails
    """
    if not date_str:
        return None
    
    # Try ISO format first (YYYY-MM-DD)
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        pass
    
    # Try DD-MM-YYYY format
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").replace(tzinfo=timezone.utc)
    except ValueError:
        pass
    
    # Try ISO datetime format
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        pass
    
    return None


def to_iso_date(date_str: str) -> Optional[str]:
    """
    Convert any date string to ISO format (YYYY-MM-DD).
    
    Args:
        date_str: Date string in any supported format
        
    Returns:
        Date string in YYYY-MM-DD format or None if parsing fails
    """
    dt = parse_date_string(date_str)
    if dt:
        return dt.strftime("%Y-%m-%d")
    return None


def to_dd_mm_yyyy(date_str: str) -> Optional[str]:
    """
    Convert any date string to DD-MM-YYYY format.
    
    Args:
        date_str: Date string in any supported format
        
    Returns:
        Date string in DD-MM-YYYY format or None if parsing fails
    """
    dt = parse_date_string(date_str)
    if dt:
        return dt.strftime("%d-%m-%Y")
    return None


def date_to_comparable(date_str: str) -> int:
    """
    Convert a date string to a comparable integer for sorting/filtering.
    
    Args:
        date_str: Date string in any supported format
        
    Returns:
        Integer in format YYYYMMDD for comparison, or 0 if parsing fails
    """
    dt = parse_date_string(date_str)
    if dt:
        return dt.year * 10000 + dt.month * 100 + dt.day
    return 0


def is_date_in_range(date_str: str, start_date: str, end_date: str) -> bool:
    """
    Check if a date falls within a given range (inclusive).
    
    Args:
        date_str: Date to check
        start_date: Start of range
        end_date: End of range
        
    Returns:
        True if date is within range, False otherwise
    """
    date_comp = date_to_comparable(date_str)
    start_comp = date_to_comparable(start_date)
    end_comp = date_to_comparable(end_date)
    
    if date_comp == 0 or start_comp == 0 or end_comp == 0:
        return False
    
    return start_comp <= date_comp <= end_comp
