"""Camera integration boundary for Raspberry Pi-only dependencies."""

from typing import Any

Picamera2: type[Any] | None

try:
    from picamera2 import Picamera2 as _Picamera2

    Picamera2 = _Picamera2
    CAMERA_AVAILABLE = True
except ImportError:
    Picamera2 = None
    CAMERA_AVAILABLE = False

__all__ = ["CAMERA_AVAILABLE", "Picamera2"]
