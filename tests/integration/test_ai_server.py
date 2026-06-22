import httpx


class TestAIHealth:
    def test_health(self, ai_server):
        r = httpx.get(f"{ai_server}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["service"] == "ai-server"


class TestProviders:
    def test_list_providers(self, ai_server):
        r = httpx.get(f"{ai_server}/api/providers")
        assert r.status_code == 200
        data = r.json()
        assert "providers" in data
        assert len(data["providers"]) > 0

    def test_provider_has_required_fields(self, ai_server):
        r = httpx.get(f"{ai_server}/api/providers")
        providers = r.json()["providers"]
        for p in providers:
            assert "id" in p
            assert "name" in p
            assert "hasKey" in p


class TestGenerate:
    def test_missing_prompt(self, ai_server):
        r = httpx.post(f"{ai_server}/api/generate", json={}, timeout=10)
        assert r.status_code == 400
        assert "prompt" in r.json()["error"].lower()

    def test_unknown_provider(self, ai_server):
        r = httpx.post(
            f"{ai_server}/api/generate",
            json={"prompt": "a box", "provider": "nonexistent"},
            timeout=10,
        )
        assert r.status_code == 400
        assert "provider" in r.json()["error"].lower()


class TestUpdateParams:
    def test_update_params(self, ai_server, cad_server):
        code = 'import cadquery as cq\nw = 10.0\nh = 20.0\nresult = cq.Workplane("XY").box(w, h, 30)'
        r1 = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r1.json()["success"] is True

        r2 = httpx.post(
            f"{ai_server}/api/update-params",
            json={"code": code, "params": {"w": 20, "h": 40}},
            timeout=60,
        )
        assert r2.status_code == 200
        data = r2.json()
        assert data["success"] is True
        assert data["validation"]["volume"] == 24000.0
