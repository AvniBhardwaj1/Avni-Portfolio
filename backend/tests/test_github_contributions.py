"""Backend tests for GitHub contributions proxy endpoint."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gesture-tech-lab.preview.emergentagent.com").rstrip("/")


def test_github_contributions_status_and_shape():
    r = requests.get(f"{BASE_URL}/api/github/contributions", timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "total" in data and isinstance(data["total"], int)
    assert "days" in data and isinstance(data["days"], list)
    assert "source" in data
    # Should have roughly a year of data (~365 +/-)
    assert len(data["days"]) >= 300, f"days length {len(data['days'])}"


def test_github_contributions_day_shape():
    r = requests.get(f"{BASE_URL}/api/github/contributions", timeout=20)
    days = r.json()["days"]
    sample = days[0]
    assert "date" in sample and "count" in sample and "level" in sample
    assert isinstance(sample["count"], int)
    assert 0 <= sample["level"] <= 4


def test_github_contributions_cache_hit_second_call():
    # 12h cache — subsequent call should also be 200 quickly
    r1 = requests.get(f"{BASE_URL}/api/github/contributions", timeout=20)
    r2 = requests.get(f"{BASE_URL}/api/github/contributions", timeout=20)
    assert r1.status_code == 200 and r2.status_code == 200
    assert r2.json()["total"] == r1.json()["total"]
