"""Camera integration boundary for Raspberry Pi-only dependencies."""

try:
    from picamera2 import Picamera2 as Picamera2
    CAMERA_AVAILABLE = True
except ImportError:
    Picamera2 = None  # type: ignore[assignment,misc]
    CAMERA_AVAILABLE = False

__all__ = ["CAMERA_AVAILABLE", "Picamera2"]
