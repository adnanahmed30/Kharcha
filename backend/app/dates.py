from datetime import date, datetime

MIN_YEAR = 2000

class InvalidYearMonthError(ValueError):
    pass


def month_range(month : str) -> tuple[date, date]:
    year, mon = int(month[:4]), int(month[5:])
    
    current_year = datetime.today().year
    if not 1 <= mon <= 12:
        raise InvalidYearMonthError("Month must be between 01 and 12")
    if not MIN_YEAR <= year <= current_year:
        raise InvalidYearMonthError(f"Year is not valid. Valid year range is between {MIN_YEAR} and {current_year}.")
    start = date(year, mon, 1)
    if mon == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, mon + 1, 1)
    return start, end
