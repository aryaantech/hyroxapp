import asyncio
import random
from playwright.async_api import Page
from .utils import log, human_delay, scroll_down


class AutoLiker:
    def __init__(self, page: Page, config: dict):
        self.page = page
        self.limits = config["limits"]
        self.liked_count = 0

    async def like_feed_posts(self):
        log.info("Starting auto-like on feed...")
        max_likes = self.limits["max_likes_per_session"]
        scroll_depth = 15

        for scroll in range(scroll_depth):
            if self.liked_count >= max_likes:
                log.info(f"Reached like limit ({max_likes}). Stopping liker.")
                break

            await self._like_visible_posts()
            await scroll_down(self.page, times=2, delay_range=(2, 5))
            log.info(f"Scroll {scroll + 1}/{scroll_depth} — liked so far: {self.liked_count}")

        log.info(f"Auto-like done. Total liked: {self.liked_count}")

    async def like_hashtag_posts(self, hashtag: str):
        tag = hashtag.lstrip("#")
        url = f"https://www.linkedin.com/feed/hashtag/{tag}/"
        log.info(f"Navigating to hashtag: #{tag}")
        await self.page.goto(url, wait_until="domcontentloaded")
        await human_delay(2, 4)
        await self.like_feed_posts()

    async def _like_visible_posts(self):
        # Find all unlike (not yet liked) like buttons visible on the page
        buttons = await self.page.query_selector_all(
            'button[aria-label*="Like"][aria-pressed="false"]'
        )

        if not buttons:
            # Fallback: broader selector
            buttons = await self.page.query_selector_all(
                'button.reactions-react-button:not([aria-pressed="true"])'
            )

        random.shuffle(buttons)

        for btn in buttons:
            if self.liked_count >= self.limits["max_likes_per_session"]:
                break
            try:
                is_visible = await btn.is_visible()
                if not is_visible:
                    continue

                await btn.scroll_into_view_if_needed()
                await human_delay(1, 3)
                await btn.click()
                self.liked_count += 1
                log.info(f"Liked post #{self.liked_count}")

                await human_delay(
                    self.limits["min_delay_between_actions_sec"],
                    self.limits["max_delay_between_actions_sec"],
                )
            except Exception as e:
                log.warning(f"Could not like a post: {e}")
                continue
