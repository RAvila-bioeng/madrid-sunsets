"""Daily scheduling and orchestration for sunset capture."""

from collections.abc import Sequence
from datetime import date, datetime, timedelta
import logging
import time
from pathlib import Path
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from astral import LocationInfo
from astral.sun import sun

from sunset_pi.capture import capture_session
from sunset_pi.config import settings
from sunset_pi.scoring import score_image
from sunset_pi.uploader import (
    call_notify,
    find_photo_id_by_storage_path,
    mark_best_photo,
    upload_photo,
)


MADRID_TIMEZONE = ZoneInfo("Europe/Madrid")

logger = logging.getLogger(__name__)


def madrid_today() -> date:
    return datetime.now(tz=MADRID_TIMEZONE).date()


def sunset_at(day_date: date) -> datetime:
    location = LocationInfo(
        name="Madrid",
        region="Spain",
        timezone="Europe/Madrid",
        latitude=settings.latitude,
        longitude=settings.longitude,
    )
    return sun(location.observer, date=day_date, tzinfo=MADRID_TIMEZONE)["sunset"]


def capture_starts_at(day_date: date) -> datetime:
    return sunset_at(day_date) - timedelta(minutes=settings.capture_before_sunset_minutes)


def _sleep_until(start_at: datetime) -> None:
    now = datetime.now(tz=MADRID_TIMEZONE)
    seconds_until_start = (start_at - now).total_seconds()
    if seconds_until_start <= 0:
        return

    logger.info(
        "Waiting %.0f seconds until capture window starts at %s",
        seconds_until_start,
        start_at,
    )
    time.sleep(seconds_until_start)


def _best_photo(paths: Sequence[Path], scores: dict[Path, dict[str, float]]) -> Path:
    return max(paths, key=lambda path: scores[path]["total"])


def run_daily_capture() -> None:
    """Capture, score, upload, and mark the best sunset photo for today."""

    day_date = madrid_today()
    sunset = sunset_at(day_date)
    start_at = capture_starts_at(day_date)
    logger.info("Preparing daily capture for %s; sunset is at %s", day_date, sunset)

    _sleep_until(start_at)

    captured_paths = capture_session(day_date)
    if not captured_paths:
        logger.warning("No photos captured for %s", day_date)
        return

    scores = {path: score_image(path) for path in captured_paths}
    best_path = _best_photo(captured_paths, scores)
    logger.info(
        "Best photo for %s is %s with score %.3f",
        day_date,
        best_path,
        scores[best_path]["total"],
    )

    best_storage_path = ""
    for path in captured_paths:
        is_best = path == best_path
        storage_path = upload_photo(path, day_date, scores[path], is_best=is_best)
        logger.info("Uploaded %s to %s", path, storage_path)
        if is_best:
            best_storage_path = storage_path

    best_photo_id = find_photo_id_by_storage_path(best_storage_path)
    mark_best_photo(best_photo_id, day_date)
    logger.info("Marked %s as best photo for %s", best_photo_id, day_date)
    call_notify(best_photo_id, day_date)
    logger.info("Sent notification for %s", best_photo_id)


def create_scheduler() -> BackgroundScheduler:
    """Create a scheduler that recalculates the sunset window every day at solar noon."""

    scheduler = BackgroundScheduler(timezone=MADRID_TIMEZONE)
    scheduler.add_job(
        run_daily_capture,
        trigger="cron",
        hour=12,
        minute=0,
        id="daily-sunset-capture",
        replace_existing=True,
    )
    return scheduler


def next_scheduled_run(scheduler: BackgroundScheduler) -> datetime | None:
    job = scheduler.get_job("daily-sunset-capture")
    if job is None:
        return None
    return job.next_run_time
