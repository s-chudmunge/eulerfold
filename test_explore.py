import asyncio
import json
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        r = await client.get("http://127.0.0.1:45992/explore?limit=1")
        try:
            print(json.dumps(r.json(), indent=2))
        except:
            print(r.text)

asyncio.run(main())
