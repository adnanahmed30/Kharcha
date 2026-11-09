from datetime import date

import requests


FRANKFURTER_URL = "https://api.frankfurter.dev/v2/rate"
TIMEOUT_SECONDS = 5

class RateNotFoundError(Exception):
    pass



class RateServiceError(Exception):
    pass

def get_rate_to_inr(currency: str, on:date) -> float:
    if currency == "INR":
        return 1.0
    try:
        response = requests.get(
            f"{FRANKFURTER_URL}/{currency}/INR",
            params = {"date": on.isoformat()},
            timeout = TIMEOUT_SECONDS,
        )
    except requests.RequestException as error:
        raise RateServiceError("Could not reach the exchange-rate service") from error

    if response.status_code == 404:
        raise RateNotFoundError(f"No {currency} rate for {on}")

    if not response.ok:
        raise RateServiceError(f"Exchange-rate service returned {response.status_code}")


    return float(response.json()["rate"])


def to_inr_paise(amount_minor: int, rate: float) -> int:
    return round(amount_minor * rate)