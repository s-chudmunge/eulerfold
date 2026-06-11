import asyncio
from ddgs import DDGS

def fetch():
    try:
        with DDGS() as ddgs:
            return list(ddgs.text("python tutorial", max_results=3))
    except Exception as e:
        print(f"Exception: {e}")
        return []

async def main():
    res = await asyncio.to_thread(fetch)
    print("Result:", res)

asyncio.run(main())
