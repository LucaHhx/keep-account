package middleware_test

import (
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

// TC-003: Any origin is allowed
func TestCORS_AnyOrigin(t *testing.T) {
	r := setupTestRouter(t)

	origins := []string{
		"http://localhost:5173",
		"tauri://localhost",
		"capacitor://localhost",
		"http://192.168.0.145:5173",
		"http://8.8.8.8:5173",
		"http://10.0.0.1:3000",
	}

	for _, o := range origins {
		req := httptest.NewRequest("OPTIONS", "/api/v1/health", nil)
		req.Header.Set("Origin", o)
		req.Header.Set("Access-Control-Request-Method", "GET")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		got := w.Header().Get("Access-Control-Allow-Origin")
		if got != o {
			t.Errorf("origin %s: expected Allow-Origin '%s', got '%s'", o, o, got)
		}
	}
}

// TC-007: X-New-Token is in Access-Control-Expose-Headers
func TestCORS_ExposeHeaders(t *testing.T) {
	r := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	expose := w.Header().Get("Access-Control-Expose-Headers")
	if expose != "X-New-Token" {
		t.Errorf("expected Expose-Headers to contain 'X-New-Token', got '%s'", expose)
	}
}

// TC-008: Allow-Credentials is true
func TestCORS_AllowCredentials(t *testing.T) {
	r := setupTestRouter(t)

	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	creds := w.Header().Get("Access-Control-Allow-Credentials")
	if creds != "true" {
		t.Errorf("expected Allow-Credentials 'true', got '%s'", creds)
	}
}
