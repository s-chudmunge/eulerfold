#!/bin/bash
alembic revision --autogenerate -m "Auto-generated migration"
alembic upgrade head