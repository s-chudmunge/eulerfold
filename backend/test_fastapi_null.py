import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Payload(BaseModel):
    answers: List[int]

@app.post("/test")
def test(payload: Payload):
    return payload

client = TestClient(app)
res = client.post("/test", json={"answers": [1, None, 2]})
print(res.status_code, res.json())
