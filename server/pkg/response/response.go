package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// Error codes
const (
	CodeSuccess            = 0
	CodeValidationError    = 1001
	CodeUsernameExists     = 1002
	CodeUserNotFound       = 1003
	CodePasswordWrong      = 1004
	CodeUnauthorized       = 1005
	CodeTokenExpired       = 1006
	CodeCategoryNameExists = 2001
	CodeCategoryNotFound   = 2002
	CodeCategoryPreset     = 2003
	CodeCategoryInUse      = 2004
	CodeTransactionNotFound = 3001
	CodeTransactionForbidden = 3002
	CodeInternalError      = 9999
)

func Success(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: message,
		Data:    data,
	})
}

func Error(c *gin.Context, httpStatus int, code int, message string) {
	c.JSON(httpStatus, Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}
