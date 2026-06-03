"""Entry point: python -m sunset_pi."""

import argparse
import logging
import time

from sunset_pi.scheduler import (
    create_scheduler,
    madrid_today,
    next_scheduled_run,
    run_daily_capture,
    sunset_at,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the sunset-pi capture scheduler.")
    parser.add_argument("--now", action="store_true", help="Run today's capture pipeline immediately.")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )
    logger = logging.getLogger(__name__)

    today = madrid_today()
    scheduler = create_scheduler()
    scheduler.start()

    logger.info("sunset-pi started")
    logger.info("Today's sunset is %s", sunset_at(today))
    logger.info("Next scheduled run is %s", next_scheduled_run(scheduler))

    if args.now:
        run_daily_capture()

    try:
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Stopping sunset-pi")
        scheduler.shutdown()


if __name__ == "__main__":
    main()
