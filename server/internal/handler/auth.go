package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"keep-account/internal/service"
	"keep-account/pkg/response"
)

type AuthRequest struct {
	Username string `json:"username" binding:"required,min=3,max=32,alphanum_underscore"`
	Password string `json:"password" binding:"required,min=6,max=32"`
}

func Register(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "参数校验失败: "+err.Error())
		return
	}

	user, err := service.Register(req.Username, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrUsernameExists) {
			response.Error(c, http.StatusConflict, response.CodeUsernameExists, "用户名已存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
		return
	}

	token, err := service.GenerateToken(user.ID, user.Username)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "Token 生成失败")
		return
	}

	response.Success(c, "注册成功", gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}

func Login(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "参数校验失败: "+err.Error())
		return
	}

	user, err := service.Login(req.Username, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			response.Error(c, http.StatusUnauthorized, response.CodeUserNotFound, "用户不存在")
			return
		}
		if errors.Is(err, service.ErrPasswordWrong) {
			response.Error(c, http.StatusUnauthorized, response.CodePasswordWrong, "密码错误")
			return
		}
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
		return
	}

	token, err := service.GenerateToken(user.ID, user.Username)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "Token 生成失败")
		return
	}

	response.Success(c, "登录成功", gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}

func Logout(c *gin.Context) {
	response.Success(c, "已退出登录", nil)
}
