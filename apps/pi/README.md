# sunset-pi

Raspberry Pi sunset capture service for the `madrid-sunsets` project.

## Development setup

Requires Python 3.11+ and [uv](https://docs.astral.sh/uv/).

```bash
# Install dev dependencies (no Pi-specific extras)
uv sync --group dev

# Run the service stub
uv run python -m sunset_pi

# Run tests
uv run pytest

# Lint and type-check
uv run ruff check src/
uv run mypy src/
```

## On the Raspberry Pi

Install the system packages that are provided by Raspberry Pi OS:

```bash
sudo apt install -y python3-picamera2 libcap-dev
```

Then install the Python dependencies managed by uv:

```bash
uv sync --extra pi --group dev
```

`picamera2` is installed through apt, not uv, because it depends on system
packages that are only available from Raspberry Pi OS repositories.

## Configuration

In production the service reads from `/etc/sunset-pi/config.toml`.
In development, copy `.env.example` from the repo root to `.env` in this directory.
