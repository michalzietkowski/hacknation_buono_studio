import json
import time

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.db import get_db
from app.main import app
from app.models.analysis import AnalysisCase, AnalysisDocument
from app.models.base import Base


SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine, tables=[AnalysisCase.__table__, AnalysisDocument.__table__])


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client(monkeypatch):
    async def fake_process_case(files, case_id):
        return {"case_id": case_id, "files": len(files)}

    monkeypatch.setattr("app.services.pipeline.process_case", fake_process_case)
    return TestClient(app)


def test_pipeline_run_stores_case_and_documents(client):
    meta = [
        {"id": "1", "name": "sample.pdf", "type": "notification", "form": "printed"}
    ]
    files = {"files": ("sample.pdf", b"dummy", "application/pdf")}

    response = client.post(
        "/api/v1/pipeline/run",
        data={"documents_meta": json.dumps(meta)},
        files=files,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["case_id"]
    assert body["status"] in ("processing", "completed")

    db = TestingSessionLocal()
    try:
        # allow background task to finish
        for _ in range(10):
            case = db.query(AnalysisCase).first()
            if case and case.status == "completed":
                break
            time.sleep(0.05)
            db.expire_all()

        case = db.query(AnalysisCase).first()
        assert case is not None
        assert case.status in ("processing", "completed")
        assert db.query(AnalysisDocument).count() == 1
    finally:
        db.close()
