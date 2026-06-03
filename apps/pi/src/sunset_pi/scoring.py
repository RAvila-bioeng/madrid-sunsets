"""Image scoring heuristics for sunset candidate photos."""

from pathlib import Path

import cv2
from PIL import Image, ImageStat


ScoreComponents = dict[str, float]


def _clamp(value: float) -> float:
    return max(0.0, min(value, 1.0))


def _warmth(image: Image.Image) -> float:
    rgb_image = image.convert("RGB")
    pixels = rgb_image.getdata()
    total_pixels = rgb_image.width * rgb_image.height
    if total_pixels == 0:
        return 0.0

    warm_pixels = sum(1 for red, _, blue in pixels if red > blue)
    return warm_pixels / total_pixels


def _saturation(image: Image.Image) -> float:
    hsv_image = image.convert("HSV")
    saturation = ImageStat.Stat(hsv_image).mean[1]
    return _clamp(float(saturation) / 255.0)


def _contrast(path: Path) -> float:
    grayscale = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if grayscale is None:
        raise ValueError(f"Could not read image for contrast scoring: {path}")

    _, standard_deviation = cv2.meanStdDev(grayscale)
    return _clamp(float(standard_deviation[0][0]) / 128.0)


def _sharpness(path: Path) -> float:
    grayscale = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if grayscale is None:
        raise ValueError(f"Could not read image for sharpness scoring: {path}")

    laplacian = cv2.Laplacian(grayscale, cv2.CV_64F)
    return _clamp(float(laplacian.var()) / 1000.0)


def score_image(path: Path) -> ScoreComponents:
    """Score a JPEG candidate using deterministic image-processing heuristics."""

    with Image.open(path) as image:
        warmth = _warmth(image)
        saturation = _saturation(image)

    contrast = _contrast(path)
    sharpness = _sharpness(path)
    total = warmth * 0.35 + saturation * 0.30 + contrast * 0.20 + sharpness * 0.15

    return {
        "total": _clamp(total),
        "warmth": warmth,
        "saturation": saturation,
        "contrast": contrast,
        "sharpness": sharpness,
    }
