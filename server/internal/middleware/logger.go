package middleware

import (
	"bytes"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// responseBodyWriter wraps gin.ResponseWriter to capture the response body.
type responseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *responseBodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// ANSI color codes
const (
	reset   = "\033[0m"
	red     = "\033[31m"
	green   = "\033[32m"
	yellow  = "\033[33m"
	blue    = "\033[34m"
	magenta = "\033[35m"
	cyan    = "\033[36m"
	white   = "\033[37m"
	gray    = "\033[90m"
	bold    = "\033[1m"
)

func statusColor(code int) string {
	switch {
	case code >= 200 && code < 300:
		return green
	case code >= 300 && code < 400:
		return cyan
	case code >= 400 && code < 500:
		return yellow
	default:
		return red
	}
}

func methodColor(method string) string {
	switch method {
	case "GET":
		return blue
	case "POST":
		return green
	case "PUT":
		return yellow
	case "DELETE":
		return red
	case "OPTIONS":
		return gray
	default:
		return white
	}
}

func latencyColor(d time.Duration) string {
	switch {
	case d < 100*time.Millisecond:
		return green
	case d < 500*time.Millisecond:
		return yellow
	default:
		return red
	}
}

const maxBodyLog = 2048

func truncate(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) > max {
		return s[:max] + fmt.Sprintf("... (%d bytes truncated)", len(s)-max)
	}
	return s
}

// RequestLogger logs every request with method, path, status, latency,
// request body, and response body in a pretty terminal format.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// --- Read request body ---
		var reqBody string
		if c.Request.Body != nil && c.Request.ContentLength != 0 {
			bodyBytes, err := io.ReadAll(c.Request.Body)
			if err == nil {
				reqBody = string(bodyBytes)
			}
			// Always restore body so downstream handlers can read it,
			// even if ReadAll returned an error (body may be partially consumed).
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// --- Wrap response writer to capture body ---
		rbw := &responseBodyWriter{
			ResponseWriter: c.Writer,
			body:           bytes.NewBufferString(""),
		}
		c.Writer = rbw

		// --- Process request ---
		c.Next()

		// --- Compute latency ---
		latency := time.Since(start)
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.String()
		clientIP := c.ClientIP()

		// --- Format output ---
		mc := methodColor(method)
		sc := statusColor(status)
		lc := latencyColor(latency)

		separator := fmt.Sprintf("%s%s┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄%s",
			gray, reset, reset)

		fmt.Println(separator)
		fmt.Printf(" %s%s%-7s%s %s  %s%s%d%s  %s%s%s%s  %s%s%s%s\n",
			bold, mc, method, reset,
			path,
			bold, sc, status, reset,
			lc, latency.Truncate(time.Microsecond), reset, "",
			gray, clientIP, reset, "",
		)

		if reqBody != "" {
			fmt.Printf(" %s▸ Request:%s  %s\n", cyan, reset, truncate(reqBody, maxBodyLog))
		}

		respBody := rbw.body.String()
		if respBody != "" {
			fmt.Printf(" %s◂ Response:%s %s\n", magenta, reset, truncate(respBody, maxBodyLog))
		}
	}
}
