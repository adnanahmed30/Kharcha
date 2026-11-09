from datetime import date
from fastapi import HTTPException



def month_range(month : str) -> tuple[date, date]:
    year, mon = int(month[:4]), int(month[5:])
    if not 1 <= mon <= 12:
        raise HTTPException(status_code = 422, detail = "Month must be between 01 and 12")
    start = date(year, mon, 1)
    if mon == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, mon + 1, 1)
    return start, end
