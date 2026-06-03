"""Deterministic tests for sunset image scoring."""

from pathlib import Path

from PIL import Image, ImageDraw

from sunset_pi.scoring import score_image


def _write_test_image(path: Path) -> None:
    image = Image.new("RGB", (64, 64), (210, 95, 45))
    draw = ImageDraw.Draw(image)
    for index in range(0, 64, 4):
        color = (255, 180, 70) if index % 8 == 0 else (70, 40, 120)
        draw.line((index, 0, index, 63), fill=color, width=2)
    image.save(path, format="JPEG", quality=95)


def test_score_image_returns_all_components(tmp_path: Path) -> None:
    path = tmp_path / "sunset.jpg"
    _write_test_image(path)

    score = score_image(path)

    assert set(score) == {"total", "warmth", "saturation", "contrast", "sharpness"}
    assert all(0.0 <= value <= 1.0 for value in score.values())


def test_warm_saturated_image_scores_above_zero(tmp_path: Path) -> None:
    path = tmp_path / "warm-sunset.jpg"
    _write_test_image(path)

    score = score_image(path)

    assert score["warmth"] > 0.6
    assert score["saturation"] > 0.3
    assert score["total"] > 0.3
