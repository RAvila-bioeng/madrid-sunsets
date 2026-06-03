"""Smoke test — verifies the package is importable."""


def test_main_importable() -> None:
    import sunset_pi  # noqa: F401

    assert True
