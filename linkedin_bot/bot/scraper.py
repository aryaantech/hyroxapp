import asyncio
import json
import random
from pathlib import Path
from playwright.async_api import Page
from .utils import log, human_delay, scroll_down, timestamp


class ViralPostScraper:
    def __init__(self, page: Page, config: dict):
        self.page = page
        self.scraper_cfg = config["scraper"]
        self.targeting = config["targeting"]
        self.posts: list[dict] = []
        self.output_path = Path(__file__).parent.parent / self.scraper_cfg["output_file"]
        self.seen_ids: set[str] = set()

    async def scrape_feed(self):
        log.info("Scraping viral posts from your feed...")
        await self._collect_posts(scroll_depth=self.targeting["feed_scroll_depth"])
        self._save()
        self._print_summary()

    async def scrape_hashtag(self, hashtag: str):
        tag = hashtag.lstrip("#")
        url = f"https://www.linkedin.com/feed/hashtag/{tag}/"
        log.info(f"Scraping viral posts from #{tag}...")
        await self.page.goto(url, wait_until="domcontentloaded")
        await human_delay(2, 4)
        await self._collect_posts(scroll_depth=20)
        self._save()
        self._print_summary()

    async def scrape_all_hashtags(self):
        for tag in self.targeting["hashtags"]:
            await self.scrape_hashtag(tag)
            await human_delay(3, 7)
        log.info(f"Scraped {len(self.posts)} viral posts across all hashtags.")

    async def _collect_posts(self, scroll_depth: int):
        min_reactions = self.scraper_cfg["min_reactions_for_viral"]
        min_comments = self.scraper_cfg["min_comments_for_viral"]
        max_posts = self.scraper_cfg["max_posts_to_scrape"]

        for _ in range(scroll_depth):
            if len(self.posts) >= max_posts:
                break

            post_elements = await self.page.query_selector_all("div.feed-shared-update-v2")

            for post in post_elements:
                if len(self.posts) >= max_posts:
                    break
                try:
                    post_data = await self._extract_post_data(post)
                    if not post_data or post_data["id"] in self.seen_ids:
                        continue

                    reactions = post_data["reactions"]
                    comments = post_data["comments"]

                    if reactions >= min_reactions or comments >= min_comments:
                        self.seen_ids.add(post_data["id"])
                        self.posts.append(post_data)
                        log.info(
                            f"Found viral post | reactions: {reactions} | "
                            f"comments: {comments} | author: {post_data['author']}"
                        )
                except Exception as e:
                    log.warning(f"Error extracting post: {e}")

            await scroll_down(self.page, times=2, delay_range=(2, 4))

    async def _extract_post_data(self, post) -> dict | None:
        try:
            # Post URN (unique ID)
            urn = await post.get_attribute("data-urn") or ""
            if not urn:
                # Try fallback: unique enough combo of author+text
                urn = None

            # Author name
            author_el = await post.query_selector(
                "span.update-components-actor__name span[aria-hidden='true']"
            )
            author = await author_el.inner_text() if author_el else "Unknown"

            # Author headline
            headline_el = await post.query_selector(
                "span.update-components-actor__description span[aria-hidden='true']"
            )
            headline = await headline_el.inner_text() if headline_el else ""

            # Post text
            text_el = await post.query_selector(
                "div.update-components-text span[dir='ltr']"
            )
            text = await text_el.inner_text() if text_el else ""
            if not text:
                return None

            # Post URL
            permalink_el = await post.query_selector(
                "a.app-aware-link[href*='/posts/'], a.app-aware-link[href*='/feed/update/']"
            )
            url = await permalink_el.get_attribute("href") if permalink_el else ""

            # Reactions count
            reactions = await self._parse_count(post, "reactions")
            comments = await self._parse_count(post, "comments")

            post_id = urn or f"{author}_{hash(text[:50])}"

            return {
                "id": post_id,
                "author": author.strip(),
                "headline": headline.strip(),
                "text": text.strip()[:500],
                "url": url,
                "reactions": reactions,
                "comments": comments,
                "scraped_at": timestamp(),
            }
        except Exception:
            return None

    async def _parse_count(self, post, kind: str) -> int:
        try:
            if kind == "reactions":
                el = await post.query_selector(
                    "span.social-details-social-counts__reactions-count"
                )
            else:
                el = await post.query_selector(
                    "li.social-details-social-counts__comments button span"
                )
            if not el:
                return 0
            text = await el.inner_text()
            text = text.strip().replace(",", "")
            if "K" in text or "k" in text:
                return int(float(text.lower().replace("k", "")) * 1000)
            return int("".join(filter(str.isdigit, text)) or "0")
        except Exception:
            return 0

    def _save(self):
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        # Merge with existing saved posts
        existing = []
        if self.output_path.exists():
            with open(self.output_path) as f:
                existing = json.load(f)
        existing_ids = {p["id"] for p in existing}
        new_posts = [p for p in self.posts if p["id"] not in existing_ids]
        all_posts = existing + new_posts
        # Sort by reactions descending
        all_posts.sort(key=lambda p: p["reactions"], reverse=True)
        with open(self.output_path, "w") as f:
            json.dump(all_posts, f, indent=2, ensure_ascii=False)
        log.info(f"Saved {len(new_posts)} new viral posts → {self.output_path}")

    def _print_summary(self):
        if not self.posts:
            log.info("No viral posts found in this session.")
            return
        log.info(f"\n{'='*60}")
        log.info(f"TOP VIRAL POSTS THIS SESSION ({len(self.posts)} found):")
        top = sorted(self.posts, key=lambda p: p["reactions"], reverse=True)[:5]
        for i, p in enumerate(top, 1):
            log.info(
                f"\n#{i} | {p['author']} ({p['reactions']} reactions, {p['comments']} comments)\n"
                f"   {p['text'][:120]}..."
            )
        log.info(f"{'='*60}\n")
