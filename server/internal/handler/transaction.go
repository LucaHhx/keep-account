package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"keep-account/internal/service"
	"keep-account/pkg/response"
)

type CreateTransactionRequest struct {
	Type       string     `json:"type" binding:"required,oneof=expense income transfer"`
	Amount     int64      `json:"amount" binding:"required,gt=0"`
	CategoryID *uint      `json:"category_id"`
	Note       string     `json:"note" binding:"max=255"`
	OccurredAt *time.Time `json:"occurred_at"`
}

type UpdateTransactionRequest struct {
	Amount     *int64     `json:"amount"`
	CategoryID *uint      `json:"category_id"`
	Note       *string    `json:"note"`
	OccurredAt *time.Time `json:"occurred_at"`
}

func CreateTransaction(c *gin.Context) {
	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "参数校验失败: "+err.Error())
		return
	}

	userID, _ := c.Get("user_id")

	result, err := service.CreateTransaction(service.CreateTransactionInput{
		UserID:     userID.(uint),
		Type:       req.Type,
		Amount:     req.Amount,
		CategoryID: req.CategoryID,
		Note:       req.Note,
		OccurredAt: req.OccurredAt,
	})
	if err != nil {
		handleTransactionError(c, err)
		return
	}

	response.Success(c, "记账成功", result)
}

func ListTransactions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	var categoryID *uint
	if cidStr := c.Query("category_id"); cidStr != "" {
		cid, err := strconv.ParseUint(cidStr, 10, 32)
		if err == nil {
			cidUint := uint(cid)
			categoryID = &cidUint
		}
	}

	input := service.ListTransactionsInput{
		UserID:     userID.(uint),
		Page:       page,
		PageSize:   pageSize,
		Type:       c.Query("type"),
		CategoryID: categoryID,
		StartDate:  c.Query("start_date"),
		EndDate:    c.Query("end_date"),
	}

	result, err := service.ListTransactions(input)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
		return
	}

	response.Success(c, "success", result)
}

func GetTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	txID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "无效的流水ID")
		return
	}

	result, err := service.GetTransaction(userID.(uint), uint(txID))
	if err != nil {
		handleTransactionError(c, err)
		return
	}

	response.Success(c, "success", result)
}

func UpdateTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	txID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "无效的流水ID")
		return
	}

	var req UpdateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "参数校验失败: "+err.Error())
		return
	}

	if req.Amount != nil && *req.Amount <= 0 {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "金额必须大于0")
		return
	}

	result, err := service.UpdateTransaction(userID.(uint), uint(txID), service.UpdateTransactionInput{
		Amount:     req.Amount,
		CategoryID: req.CategoryID,
		Note:       req.Note,
		OccurredAt: req.OccurredAt,
	})
	if err != nil {
		handleTransactionError(c, err)
		return
	}

	response.Success(c, "更新成功", result)
}

func DeleteTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	txID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "无效的流水ID")
		return
	}

	if err := service.DeleteTransaction(userID.(uint), uint(txID)); err != nil {
		handleTransactionError(c, err)
		return
	}

	response.Success(c, "删除成功", nil)
}

func handleTransactionError(c *gin.Context, err error) {
	if errors.Is(err, service.ErrInvalidTransactionType) {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "无效的交易类型")
		return
	}
	if errors.Is(err, service.ErrInvalidAmount) {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "金额必须大于0")
		return
	}
	if errors.Is(err, service.ErrCategoryRequired) {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "支出/收入类型必须选择分类")
		return
	}
	if errors.Is(err, service.ErrCategoryInvalid) {
		response.Error(c, http.StatusBadRequest, response.CodeCategoryNotFound, "分类不存在")
		return
	}
	if errors.Is(err, service.ErrTransactionNotFound) {
		response.Error(c, http.StatusNotFound, response.CodeTransactionNotFound, "流水不存在")
		return
	}
	if errors.Is(err, service.ErrTransactionForbidden) {
		response.Error(c, http.StatusForbidden, response.CodeTransactionForbidden, "无权操作此流水")
		return
	}
	response.Error(c, http.StatusInternalServerError, response.CodeInternalError, "服务器内部错误")
}
