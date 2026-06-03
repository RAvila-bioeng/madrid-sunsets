"""Supabase Storage and database writes for captured photos."""

from datetime import date, datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import httpx
from astral import LocationInfo
from astral.sun import sun
from PIL import Image
from supabase import create_client

from sunset_pi.config import settings

MADRID_TIMEZONE = ZoneInfo("Europe/Madrid")


def _client() -> Any:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _sunset_at(day_date: date) -> datetime:
    location = LocationInfo(
        name="Madrid",
        region="Spain",
        timezone="Europe/Madrid",
        latitude=settings.latitude,
        longitude=settings.longitude,
    )
    return sun(location.observer, date=day_date, tzinfo=MADRID_TIMEZONE)["sunset"]


def _captured_at(path: Path) -> datetime:
    try:
        return datetime.strptime(path.stem, "%Y%m%dT%H%M%S%z")
    except ValueError:
        return datetime.fromtimestamp(path.stat().st_mtime, tz=MADRID_TIMEZONE)


def _dimensions(path: Path) -> tuple[int, int]:
    with Image.open(path) as image:
        return image.width, image.height


def _ensure_day(client: Any, day_date: date) -> None:
    client.table("days").upsert(
        {
            "date": day_date.isoformat(),
            "sunset_at": _sunset_at(day_date).isoformat(),
        },
        on_conflict="date",
    ).execute()


def _score_components(score: dict[str, float]) -> dict[str, float]:
    return {
        "warmth": score["warmth"],
        "saturation": score["saturation"],
        "contrast": score["contrast"],
        "sharpness": score["sharpness"],
    }


def upload_photo(path: Path, day_date: date, score: dict[str, float], is_best: bool) -> str:
    """Upload one JPEG and insert its database row, returning the storage path."""

    client = _client()
    bucket = settings.best_bucket if is_best else settings.raw_bucket
    storage_path = (
        f"{day_date.isoformat()}/best.jpg" if is_best else f"{day_date.isoformat()}/{path.name}"
    )
    width, height = _dimensions(path)

    _ensure_day(client, day_date)

    client.storage.from_(bucket).upload(
        storage_path,
        path.read_bytes(),
        file_options={
            "content-type": "image/jpeg",
            "upsert": "true",
        },
    )

    client.table("photos").insert(
        {
            "day_date": day_date.isoformat(),
            "captured_at": _captured_at(path).isoformat(),
            "storage_path": storage_path,
            "score": score["total"],
            "score_components": _score_components(score),
            "width": width,
            "height": height,
            "is_best_of_day": False,
        }
    ).execute()

    return storage_path


def find_photo_id_by_storage_path(storage_path: str) -> str:
    """Look up a photo row after upload so the best-of-day relation can be set."""

    result = (
        _client()
        .table("photos")
        .select("id")
        .eq("storage_path", storage_path)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = result.data
    if not rows:
        raise LookupError(f"No photo row found for storage path: {storage_path}")
    return str(rows[0]["id"])


def mark_best_photo(photo_id: str, day_date: date) -> None:
    """Mark a photo as the day's winner and upsert the day relation."""

    client = _client()
    _ensure_day(client, day_date)
    client.table("photos").update({"is_best_of_day": False}).eq(
        "day_date", day_date.isoformat()
    ).execute()
    client.table("photos").update({"is_best_of_day": True}).eq("id", photo_id).execute()
    client.table("days").upsert(
        {
            "date": day_date.isoformat(),
            "sunset_at": _sunset_at(day_date).isoformat(),
            "best_photo_id": photo_id,
        },
        on_conflict="date",
    ).execute()


def call_notify(photo_id: str, day_date: date) -> None:
    """Fire the notify Edge Function after marking best photo."""

    url = f"{settings.supabase_url}/functions/v1/notify"
    headers = {"Authorization": f"Bearer {settings.supabase_service_role_key}"}
    payload = {"date": day_date.isoformat(), "photo_id": photo_id}
    response = httpx.post(url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
