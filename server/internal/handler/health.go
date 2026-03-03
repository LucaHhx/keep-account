package handler

import (
	"time"

	"github.com/gin-gonic/gin"

	"keep-account/pkg/response"
)

func HealthCheck(c *gin.Context) {
	response.Success(c, "ok", gin.H{
		"version": "1.0.0",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}
