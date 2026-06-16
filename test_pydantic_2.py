from backend.app.schemas import RoadmapMe

data = {
    "id": 1,
    "title": "Test",
    "slug": "test",
    "description": "desc",
    "roadmap_plan": {},
    "clone_count": 13
}
obj = RoadmapMe(**data)
print(obj.dict())
