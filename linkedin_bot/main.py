#!/usr/bin/env python3
"""
LinkedIn Automation Bot
Usage:
  python main.py                  # Run full session (like + comment + scrape)
  python main.py --like           # Auto-like only
  python main.py --comment        # Auto-comment only
  python main.py --scrape         # Scrape viral posts only
  python main.py --scrape-tags    # Scrape by hashtags from config
  python main.py --like-tags      # Like posts under hashtags from config
"""

import asyncio
import argparse
import json
from pathlib import Path
from bot import LinkedInBrowser, AutoLiker, AutoCommenter, ViralPostScraper
from bot.utils import log


def load_config() -> dict:
    config_path = Path(__file__).parent / "config.json"
    with open(config_path) as f:
        return json.load(f)


async def run(args):
    config = load_config()

    if config["credentials"]["email"] == "YOUR_LINKEDIN_EMAIL":
        log.error("Please update your credentials in config.json before running!")
        return

    browser = LinkedInBrowser(config)
    await browser.start()
    await browser.login()

    page = browser.page
    run_all = not any([args.like, args.comment, args.scrape, args.scrape_tags, args.like_tags])

    try:
        if args.scrape or args.scrape_tags or run_all:
            scraper = ViralPostScraper(page, config)
            if args.scrape_tags:
                await scraper.scrape_all_hashtags()
            else:
                await scraper.scrape_feed()

        if args.like or args.like_tags or run_all:
            liker = AutoLiker(page, config)
            if args.like_tags:
                for tag in config["targeting"]["hashtags"]:
                    await liker.like_hashtag_posts(tag)
            else:
                await liker.like_feed_posts()

        if args.comment or run_all:
            commenter = AutoCommenter(page, config)
            await commenter.comment_on_feed()

    except KeyboardInterrupt:
        log.info("Interrupted by user.")
    except Exception as e:
        log.error(f"Session error: {e}", exc_info=True)
    finally:
        await browser.close()


def main():
    parser = argparse.ArgumentParser(description="LinkedIn Automation Bot")
    parser.add_argument("--like", action="store_true", help="Auto-like feed posts")
    parser.add_argument("--comment", action="store_true", help="Auto-comment on posts")
    parser.add_argument("--scrape", action="store_true", help="Scrape viral posts from feed")
    parser.add_argument("--scrape-tags", action="store_true", help="Scrape viral posts by hashtag")
    parser.add_argument("--like-tags", action="store_true", help="Like posts under target hashtags")
    args = parser.parse_args()

    asyncio.run(run(args))


if __name__ == "__main__":
    main()
