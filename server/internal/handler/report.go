package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"keep-account/internal/service"
	"keep-account/pkg/response"
)

func GetMonthlySummary(c *gin.Context) {
	userID, _ := c.Get("user_id")
	month := c.Query("month")
	if month == "" {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "month 参数必填，格式 YYYY-MM")
		return
	}

	result, err := service.GetMonthlySummary(userID.(uint), month)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, err.Error())
		return
	}

	response.Success(c, "success", result)
}

func GetCategoryBreakdown(c *gin.Context) {
	userID, _ := c.Get("user_id")
	month := c.Query("month")
	if month == "" {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "month 参数必填，格式 YYYY-MM")
		return
	}
	txType := c.Query("type")
	if txType != "expense" && txType != "income" {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "type 参数必填，值为 expense 或 income")
		return
	}

	result, err := service.GetCategoryBreakdown(userID.(uint), month, txType)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, err.Error())
		return
	}

	response.Success(c, "success", result)
}

func GetTrend(c *gin.Context) {
	userID, _ := c.Get("user_id")
	startDate := c.Query("start_date")
	if startDate == "" {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "start_date 参数必填，格式 YYYY-MM-DD")
		return
	}
	endDate := c.Query("end_date")
	if endDate == "" {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "end_date 参数必填，格式 YYYY-MM-DD")
		return
	}
	granularity := c.DefaultQuery("granularity", "day")
	if granularity != "day" && granularity != "month" {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, "granularity 参数值为 day 或 month")
		return
	}

	result, err := service.GetTrend(userID.(uint), startDate, endDate, granularity)
	if err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeValidationError, err.Error())
		return
	}

	response.Success(c, "success", result)
}
