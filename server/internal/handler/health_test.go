package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"keep-account/internal/config"
	"keep-account/internal/handler"
	"keep-account/internal/model"
	"keep-account/internal/router"
)

func setupTestRouter(t *testing.T) http.Handler {
	t.Helper()

	config.C.Log.Level = "warn"
	config.C.Log.Format = "console"
	config.C.JWT.Secret = "test-secret-key-for-testing"
	config.C.JWT.ExpireDays = 7
	config.C.JWT.RenewBeforeDays = 1
	if err := config.InitLogger(); err != nil {
		t.Fatalf("failed to init logger: %v", err)
	}

	if err := model.InitDB(":memory:"); err != nil {
		t.Fatalf("failed to init test db: %v", err)
	}

	handler.RegisterValidators()

	return router.Setup()
}

// TC-001: Health check returns code 0 with version and time
func TestHealthCheck_Success(t *testing.T) {
	r := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	code, ok := resp["code"].(float64)
	if !ok || code != 0 {
		t.Errorf("expected code 0, got %v", resp["code"])
	}

	data, ok := resp["data"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected data to be an object, got %v", resp["data"])
	}

	if _, ok := data["version"]; !ok {
		t.Error("data.version is missing")
	}
	if _, ok := data["time"]; !ok {
		t.Error("data.time is missing")
	}
}

// TC-002: Health check requires no authentication
func TestHealthCheck_NoAuth(t *testing.T) {
	r := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200 (no auth needed), got %d", w.Code)
	}
}
