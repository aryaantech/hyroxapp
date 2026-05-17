import asyncio
import random
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger("linkedin_bot")


async def human_delay(min_sec: float, max_sec: float):
    delay = random.uniform(min_sec, max_sec)
    await asyncio.sleep(delay)


async def human_type(page, selector: str, text: str):
    await page.click(selector)
    await human_delay(0.3, 0.8)
    for char in text:
        await page.keyboard.type(char)
        await asyncio.sleep(random.uniform(0.04, 0.12))


async def scroll_down(page, times: int = 3, delay_range=(2, 4)):
    for _ in range(times):
        await page.mouse.wheel(0, random.randint(600, 1000))
        await human_delay(*delay_range)


def timestamp() -> str:
    return datetime.now().isoformat()
