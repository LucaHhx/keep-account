package router

import (
	"github.com/gin-gonic/gin"

	"keep-account/internal/handler"
	"keep-account/internal/middleware"
)

func Setup() *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.RequestLogger())
	r.Use(middleware.CORS())

	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", handler.HealthCheck)

		auth := v1.Group("/auth")
		{
			auth.POST("/register", handler.Register)
			auth.POST("/login", handler.Login)
			auth.POST("/logout", middleware.JWTAuth(), handler.Logout)
		}

		user := v1.Group("/user")
		user.Use(middleware.JWTAuth())
		{
			user.GET("/profile", handler.GetProfile)
		}

		categories := v1.Group("/categories")
		categories.Use(middleware.JWTAuth())
		{
			categories.GET("", handler.ListCategories)
			categories.POST("", handler.CreateCategory)
			categories.DELETE("/:id", handler.DeleteCategory)
		}

		transactions := v1.Group("/transactions")
		transactions.Use(middleware.JWTAuth())
		{
			transactions.GET("", handler.ListTransactions)
			transactions.POST("", handler.CreateTransaction)
			transactions.GET("/:id", handler.GetTransaction)
			transactions.PUT("/:id", handler.UpdateTransaction)
			transactions.DELETE("/:id", handler.DeleteTransaction)
		}

		reports := v1.Group("/reports")
		reports.Use(middleware.JWTAuth())
		{
			reports.GET("/monthly-summary", handler.GetMonthlySummary)
			reports.GET("/category-breakdown", handler.GetCategoryBreakdown)
			reports.GET("/trend", handler.GetTrend)
		}
	}

	return r
}
