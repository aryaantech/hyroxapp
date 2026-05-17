import asyncio
import random
from playwright.async_api import Page
from .utils import log, human_delay, human_type, scroll_down


class AutoCommenter:
    def __init__(self, page: Page, config: dict):
        self.page = page
        self.limits = config["limits"]
        self.comment_cfg = config["commenting"]
        self.commented_count = 0

    async def comment_on_feed(self):
        if not self.comment_cfg["enabled"]:
            log.info("Commenting is disabled in config.")
            return

        log.info("Starting auto-comment on feed...")
        max_comments = self.limits["max_comments_per_session"]
        min_reactions = self.comment_cfg["min_post_reactions_to_comment"]

        for scroll in range(20):
            if self.commented_count >= max_comments:
                log.info(f"Reached comment limit ({max_comments}). Stopping commenter.")
                break

            await self._comment_on_eligible_posts(min_reactions)
            await scroll_down(self.page, times=2, delay_range=(3, 6))

        log.info(f"Auto-comment done. Total commented: {self.commented_count}")

    async def _comment_on_eligible_posts(self, min_reactions: int):
        # Find posts and check their reaction counts
        posts = await self.page.query_selector_all("div.feed-shared-update-v2")

        for post in posts:
            if self.commented_count >= self.limits["max_comments_per_session"]:
                break

            try:
                reaction_count = await self._get_reaction_count(post)
                if reaction_count < min_reactions:
                    continue

                # Check we haven't already commented (button text changes)
                comment_btn = await post.query_selector(
                    'button[aria-label*="comment"], button[aria-label*="Comment"]'
                )
                if not comment_btn:
                    continue

                is_visible = await comment_btn.is_visible()
                if not is_visible:
                    continue

                await comment_btn.scroll_into_view_if_needed()
                await human_delay(1, 2)
                await comment_btn.click()
                await human_delay(1.5, 3)

                # Type in the comment box
                comment_box = await post.query_selector(
                    'div.ql-editor[contenteditable="true"]'
                )
                if not comment_box:
                    continue

                comment_text = random.choice(self.comment_cfg["templates"])
                await comment_box.click()
                await human_delay(0.5, 1)

                for char in comment_text:
                    await self.page.keyboard.type(char)
                    await asyncio.sleep(random.uniform(0.04, 0.12))

                await human_delay(1, 2)

                # Submit comment
                submit_btn = await post.query_selector(
                    'button[class*="comments-comment-box__submit-button"]'
                )
                if submit_btn:
                    await submit_btn.click()
                else:
                    await self.page.keyboard.press("Enter")

                self.commented_count += 1
                log.info(
                    f"Commented on post #{self.commented_count} "
                    f"(reactions: {reaction_count}): \"{comment_text[:40]}...\""
                )

                await human_delay(
                    self.limits["min_delay_between_actions_sec"] * 2,
                    self.limits["max_delay_between_actions_sec"] * 2,
                )

            except Exception as e:
                log.warning(f"Could not comment on post: {e}")
                continue

    async def _get_reaction_count(self, post) -> int:
        try:
            el = await post.query_selector(
                "span.social-details-social-counts__reactions-count, "
                "span[aria-label*='reaction']"
            )
            if not el:
                return 0
            text = await el.inner_text()
            text = text.strip().replace(",", "").replace("K", "000").replace("k", "000")
            return int("".join(filter(str.isdigit, text)) or "0")
        except Exception:
            return 0
