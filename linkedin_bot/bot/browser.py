import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright, Page, BrowserContext
from .utils import log, human_delay, human_type


class LinkedInBrowser:
    def __init__(self, config: dict):
        self.config = config
        self.browser_cfg = config["browser"]
        self.creds = config["credentials"]
        self.playwright = None
        self.browser = None
        self.context: BrowserContext = None
        self.page: Page = None

    async def start(self):
        self.playwright = await async_playwright().start()
        profile_dir = Path(__file__).parent.parent / self.browser_cfg["user_data_dir"]
        profile_dir.mkdir(parents=True, exist_ok=True)

        self.context = await self.playwright.chromium.launch_persistent_context(
            str(profile_dir),
            headless=self.browser_cfg["headless"],
            slow_mo=self.browser_cfg["slow_mo_ms"],
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
        )
        self.page = self.context.pages[0] if self.context.pages else await self.context.new_page()
        log.info("Browser started.")

    async def login(self):
        await self.page.goto("https://www.linkedin.com/feed/", wait_until="domcontentloaded")
        await human_delay(2, 4)

        # Already logged in if we land on feed
        if "/feed" in self.page.url:
            log.info("Already logged in (session restored from profile).")
            return

        log.info("Logging in to LinkedIn...")
        await self.page.goto("https://www.linkedin.com/login", wait_until="domcontentloaded")
        await human_delay(1.5, 3)

        await human_type(self.page, "#username", self.creds["email"])
        await human_delay(0.5, 1.2)
        await human_type(self.page, "#password", self.creds["password"])
        await human_delay(0.8, 1.5)
        await self.page.click('[data-litms-control-urn="login-submit"]')
        await self.page.wait_for_url("**/feed/**", timeout=30000)
        log.info("Login successful.")

    async def close(self):
        if self.context:
            await self.context.close()
        if self.playwright:
            await self.playwright.stop()
        log.info("Browser closed.")
