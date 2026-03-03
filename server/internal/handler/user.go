package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"keep-account/internal/service"
	"keep-account/pkg/response"
)

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	user, err := service.GetUserByID(userID.(uint))
	if err != nil {
		response.Error(c, http.StatusNotFound, response.CodeUserNotFound, "用户不存在")
		return
	}

	response.Success(c, "success", gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"created_at": user.CreatedAt,
	})
}
