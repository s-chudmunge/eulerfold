from datetime import date, timedelta

def sm2_algorithm(easiness_factor: float, repetitions: int, interval: int, quality_response: int):
    """
    SM-2 algorithm for Spaced Repetition.
    quality_response: 0-5 (0-wrong, 5-perfect)
    """
    if quality_response >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * easiness_factor)
        repetitions += 1
    else:
        repetitions = 0
        interval = 1

    easiness_factor = easiness_factor + (0.1 - (5 - quality_response) * (0.08 + (5 - quality_response) * 0.02))
    if easiness_factor < 1.3:
        easiness_factor = 1.3

    return easiness_factor, repetitions, interval

def calculate_next_review_date(last_review_date: date, interval: int) -> date:
    """
    Calculates the next review date based on the last review date and interval.
    """
    return last_review_date + timedelta(days=interval)
