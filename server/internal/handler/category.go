package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"keep-account/internal/service"
	"keep-account/pkg/response"
)

func ListCategories(c *gin.Context) {
	userID, _ := c.Get("user_id")
	typ := c.Query("type")

	categories, err := service.ListCategories(userID.(uint), typ)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
		return
	}

	items := make([]gin.H, 0, len(categories))
	for _, cat := range categories {
		items = append(items, gin.H{
			"id":         cat.ID,
			"name":       cat.Name,
			"type":       cat.Type,
			"icon":       cat.Icon,
			"sort":       cat.Sort,
			"is_default": cat.IsDefault,
		})
	}

	response.Success(c, "success", gin.H{
		"items": items,
	})
}

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required,max=32"`
	Type string `json:"type" binding:"required,oneof=expense income"`
	Icon string `json:"icon" binding:"max=32"`
}

func CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "参数校验失败: "+err.Error())
		return
	}

	userID, _ := c.Get("user_id")

	category, err := service.CreateCategory(userID.(uint), req.Name, req.Type, req.Icon)
	if err != nil {
		if errors.Is(err, service.ErrCategoryNameExists) {
			response.Error(c, http.StatusConflict, response.CodeCategoryNameExists, "分类名称已存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
		return
	}

	response.Success(c, "创建成功", gin.H{
		"id":         category.ID,
		"name":       category.Name,
		"type":       category.Type,
		"icon":       category.Icon,
		"sort":       category.Sort,
		"is_default": category.IsDefault,
	})
}

func DeleteCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "无效的分类 ID")
		return
	}

	userID, _ := c.Get("user_id")

	if err := service.DeleteCategory(userID.(uint), uint(id)); err != nil {
		if errors.Is(err, service.ErrCategoryNotFound) {
			response.Error(c, http.StatusNotFound, response.CodeCategoryNotFound, "分类不存在")
			return
		}
		if errors.Is(err, service.ErrCategoryPreset) {
			response.Error(c, http.StatusForbidden, response.CodeCategoryPreset, "预设分类不可删除")
			return
		}
		if errors.Is(err, service.ErrCategoryInUse) {
			response.Error(c, http.StatusConflict, response.CodeCategoryInUse, "分类已被交易记录引用，不可删除")
			return
		}
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
		return
	}

	response.Success(c, "删除成功", nil)
}
