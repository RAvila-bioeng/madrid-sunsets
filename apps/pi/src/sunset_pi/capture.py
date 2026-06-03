"""Capture sunset-window JPEGs from the Raspberry Pi Camera Module 3."""

from datetime import date, datetime
import logging
from pathlib import Path
import time
from typing import Any
from zoneinfo import ZoneInfo

from sunset_pi.camera import CAMERA_AVAILABLE, Picamera2
from sunset_pi.config import settings


CAPTURE_ROOT = Path("/tmp/sunset-pi")
CAMERA_SIZE = (4608, 2592)
JPEG_QUALITY = 85
MADRID_TIMEZONE = ZoneInfo("Europe/Madrid")

logger = logging.getLogger(__name__)


def _capture_count() -> int:
    return max(1, settings.capture_window_minutes * 60 // settings.capture_interval_seconds)


def _capture_path(output_dir: Path) -> Path:
    timestamp = datetime.now(tz=MADRID_TIMEZONE).strftime("%Y%m%dT%H%M%S%z")
    return output_dir / f"{timestamp}.jpg"


def _configure_camera(camera: Any) -> None:
    configuration = camera.create_still_configuration(
        main={"size": CAMERA_SIZE},
        controls={
            "AfMode": 2,
            "AfTrigger": 0,
        },
    )
    camera.configure(configuration)
    camera.options["quality"] = JPEG_QUALITY
    camera.start()
    time.sleep(2)


def capture_session(day_date: date) -> list[Path]:
    """Capture one JPEG per configured interval during the sunset window."""

    if not CAMERA_AVAILABLE or Picamera2 is None:
        logger.warning("Pi camera is not available; skipping capture session for %s", day_date)
        return []

    output_dir = CAPTURE_ROOT / day_date.isoformat()
    output_dir.mkdir(parents=True, exist_ok=True)
    captured_paths: list[Path] = []

    camera = Picamera2()
    try:
        _configure_camera(camera)
        total_captures = _capture_count()
        for index in range(total_captures):
            output_path = _capture_path(output_dir)
            logger.info("Capturing sunset photo %s/%s to %s", index + 1, total_captures, output_path)
            camera.capture_file(
                str(output_path),
                format="jpeg",
            )
            captured_paths.append(output_path)
            if index < total_captures - 1:
                time.sleep(settings.capture_interval_seconds)
    finally:
        camera.stop()
        camera.close()

    return captured_paths
