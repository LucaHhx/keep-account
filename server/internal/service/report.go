package service

import (
	"fmt"
	"math"
	"time"

	"keep-account/internal/model"
)

// --- Monthly Summary ---

type MonthlySummaryResult struct {
	Month   string `json:"month"`
	Income  int64  `json:"income"`
	Expense int64  `json:"expense"`
	Balance int64  `json:"balance"`
}

func GetMonthlySummary(userID uint, month string) (*MonthlySummaryResult, error) {
	start, end, err := parseMonthRange(month)
	if err != nil {
		return nil, err
	}

	type sumRow struct {
		Type   string
		Total  int64
	}

	var rows []sumRow
	err = model.DB.Table("transactions").
		Select("type, SUM(amount) as total").
		Where("user_id = ? AND occurred_at >= ? AND occurred_at < ?", userID, start, end).
		Group("type").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	var income, expense int64
	for _, r := range rows {
		switch r.Type {
		case "income":
			income = r.Total
		case "expense":
			expense = r.Total
		}
	}

	return &MonthlySummaryResult{
		Month:   month,
		Income:  income,
		Expense: expense,
		Balance: income - expense,
	}, nil
}

// --- Category Breakdown ---

type CategoryBreakdownItem struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	CategoryIcon string  `json:"category_icon"`
	Amount       int64   `json:"amount"`
	Percentage   float64 `json:"percentage"`
}

type CategoryBreakdownResult struct {
	Month string                  `json:"month"`
	Type  string                  `json:"type"`
	Total int64                   `json:"total"`
	Items []CategoryBreakdownItem `json:"items"`
}

func GetCategoryBreakdown(userID uint, month, txType string) (*CategoryBreakdownResult, error) {
	start, end, err := parseMonthRange(month)
	if err != nil {
		return nil, err
	}

	type catRow struct {
		CategoryID   uint   `gorm:"column:category_id"`
		CategoryName string `gorm:"column:category_name"`
		CategoryIcon string `gorm:"column:category_icon"`
		Amount       int64  `gorm:"column:amount"`
	}

	var rows []catRow
	err = model.DB.Table("transactions").
		Select("transactions.category_id, categories.name as category_name, categories.icon as category_icon, SUM(transactions.amount) as amount").
		Joins("LEFT JOIN categories ON categories.id = transactions.category_id").
		Where("transactions.user_id = ? AND transactions.type = ? AND transactions.occurred_at >= ? AND transactions.occurred_at < ?",
			userID, txType, start, end).
		Group("transactions.category_id").
		Order("amount DESC").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	var total int64
	for _, r := range rows {
		total += r.Amount
	}

	items := make([]CategoryBreakdownItem, len(rows))
	for i, r := range rows {
		var pct float64
		if total > 0 {
			pct = math.Round(float64(r.Amount)*10000/float64(total)) / 100
		}
		items[i] = CategoryBreakdownItem{
			CategoryID:   r.CategoryID,
			CategoryName: r.CategoryName,
			CategoryIcon: r.CategoryIcon,
			Amount:       r.Amount,
			Percentage:   pct,
		}
	}

	return &CategoryBreakdownResult{
		Month: month,
		Type:  txType,
		Total: total,
		Items: items,
	}, nil
}

// --- Trend ---

type TrendItem struct {
	Date    string `json:"date"`
	Income  int64  `json:"income"`
	Expense int64  `json:"expense"`
}

type TrendResult struct {
	Granularity string      `json:"granularity"`
	Items       []TrendItem `json:"items"`
}

func GetTrend(userID uint, startDate, endDate, granularity string) (*TrendResult, error) {
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date format")
	}
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date format")
	}
	// end date is inclusive
	endExclusive := end.AddDate(0, 0, 1)

	if granularity == "" {
		granularity = "day"
	}

	type aggRow struct {
		DateKey string `gorm:"column:date_key"`
		Type    string `gorm:"column:type"`
		Total   int64  `gorm:"column:total"`
	}

	var dateExpr string
	if granularity == "month" {
		dateExpr = "strftime('%Y-%m', occurred_at)"
	} else {
		dateExpr = "strftime('%Y-%m-%d', occurred_at)"
	}

	var rows []aggRow
	err = model.DB.Table("transactions").
		Select(fmt.Sprintf("%s as date_key, type, SUM(amount) as total", dateExpr)).
		Where("user_id = ? AND occurred_at >= ? AND occurred_at < ?", userID, start, endExclusive).
		Group(fmt.Sprintf("%s, type", dateExpr)).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	// Build lookup map
	type key struct {
		date, txType string
	}
	lookup := make(map[key]int64)
	for _, r := range rows {
		lookup[key{r.DateKey, r.Type}] = r.Total
	}

	// Generate complete date series
	var items []TrendItem
	if granularity == "month" {
		cur := time.Date(start.Year(), start.Month(), 1, 0, 0, 0, 0, time.UTC)
		endMonth := time.Date(end.Year(), end.Month(), 1, 0, 0, 0, 0, time.UTC)
		for !cur.After(endMonth) {
			dk := cur.Format("2006-01")
			items = append(items, TrendItem{
				Date:    dk,
				Income:  lookup[key{dk, "income"}],
				Expense: lookup[key{dk, "expense"}],
			})
			cur = cur.AddDate(0, 1, 0)
		}
	} else {
		cur := start
		for cur.Before(endExclusive) {
			dk := cur.Format("2006-01-02")
			items = append(items, TrendItem{
				Date:    dk,
				Income:  lookup[key{dk, "income"}],
				Expense: lookup[key{dk, "expense"}],
			})
			cur = cur.AddDate(0, 0, 1)
		}
	}

	return &TrendResult{
		Granularity: granularity,
		Items:       items,
	}, nil
}

// --- Helpers ---

func parseMonthRange(month string) (time.Time, time.Time, error) {
	t, err := time.Parse("2006-01", month)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid month format, expected YYYY-MM")
	}
	start := t
	end := t.AddDate(0, 1, 0)
	return start, end, nil
}
