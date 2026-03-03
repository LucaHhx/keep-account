package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"keep-account/internal/service"
	"keep-account/pkg/response"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "未登录")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "Token 格式错误")
			c.Abort()
			return
		}

		claims, err := service.ParseToken(parts[1])
		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				response.Error(c, http.StatusUnauthorized, response.CodeTokenExpired, "Token 已过期")
			} else {
				response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "Token 无效")
			}
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)

		// Sliding renewal: issue new token if remaining time < threshold
		if service.NeedRenew(claims) {
			newToken, err := service.GenerateToken(claims.UserID, claims.Username)
			if err == nil {
				c.Header("X-New-Token", newToken)
			}
		}

		c.Next()
	}
}
