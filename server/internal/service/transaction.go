package service

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"keep-account/internal/model"
)

var (
	ErrInvalidTransactionType  = errors.New("invalid transaction type")
	ErrInvalidAmount           = errors.New("amount must be positive")
	ErrCategoryRequired        = errors.New("category_id is required for expense/income")
	ErrCategoryInvalid         = errors.New("category not found or not accessible")
	ErrTransactionNotFound     = errors.New("transaction not found")
	ErrTransactionForbidden    = errors.New("no permission to access this transaction")
)

type CreateTransactionInput struct {
	UserID     uint
	Type       string
	Amount     int64
	CategoryID *uint
	Note       string
	OccurredAt *time.Time
}

type ListTransactionsInput struct {
	UserID     uint
	Page       int
	PageSize   int
	Type       string
	CategoryID *uint
	StartDate  string
	EndDate    string
}

type UpdateTransactionInput struct {
	Amount     *int64
	CategoryID *uint
	Note       *string
	OccurredAt *time.Time
}

type TransactionResult struct {
	ID           uint      `json:"id"`
	Type         string    `json:"type"`
	Amount       int64     `json:"amount"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName string    `json:"category_name"`
	CategoryIcon string    `json:"category_icon"`
	Note         string    `json:"note"`
	OccurredAt   time.Time `json:"occurred_at"`
	CreatedAt    time.Time `json:"created_at"`
}

type TransactionDetailResult struct {
	ID           uint      `json:"id"`
	Type         string    `json:"type"`
	Amount       int64     `json:"amount"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName string    `json:"category_name"`
	CategoryIcon string    `json:"category_icon"`
	Note         string    `json:"note"`
	OccurredAt   time.Time `json:"occurred_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type TransactionListResult struct {
	Items    []TransactionResult `json:"items"`
	Total    int64               `json:"total"`
	Page     int                 `json:"page"`
	PageSize int                 `json:"page_size"`
}

func CreateTransaction(input CreateTransactionInput) (*TransactionResult, error) {
	if input.Type != "expense" && input.Type != "income" && input.Type != "transfer" {
		return nil, ErrInvalidTransactionType
	}
	if input.Amount <= 0 {
		return nil, ErrInvalidAmount
	}
	if (input.Type == "expense" || input.Type == "income") && (input.CategoryID == nil || *input.CategoryID == 0) {
		return nil, ErrCategoryRequired
	}

	var categoryName string
	if input.CategoryID != nil && *input.CategoryID != 0 {
		var category model.Category
		err := model.DB.Where("id = ? AND (user_id = ? OR user_id = 0)", *input.CategoryID, input.UserID).First(&category).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrCategoryInvalid
			}
			return nil, err
		}
		categoryName = category.Name
	}

	occurredAt := time.Now()
	if input.OccurredAt != nil {
		occurredAt = *input.OccurredAt
	}

	tx := model.Transaction{
		UserID:     input.UserID,
		Type:       input.Type,
		Amount:     input.Amount,
		CategoryID: input.CategoryID,
		Note:       input.Note,
		OccurredAt: occurredAt,
	}

	if err := model.DB.Create(&tx).Error; err != nil {
		return nil, err
	}

	return &TransactionResult{
		ID:           tx.ID,
		Type:         tx.Type,
		Amount:       tx.Amount,
		CategoryID:   tx.CategoryID,
		CategoryName: categoryName,
		Note:         tx.Note,
		OccurredAt:   tx.OccurredAt,
		CreatedAt:    tx.CreatedAt,
	}, nil
}

func ListTransactions(input ListTransactionsInput) (*TransactionListResult, error) {
	query := model.DB.Where("transactions.user_id = ?", input.UserID)

	if input.Type != "" {
		query = query.Where("transactions.type = ?", input.Type)
	}
	if input.CategoryID != nil {
		query = query.Where("transactions.category_id = ?", *input.CategoryID)
	}
	if input.StartDate != "" {
		startTime, err := time.Parse("2006-01-02", input.StartDate)
		if err == nil {
			query = query.Where("transactions.occurred_at >= ?", startTime)
		}
	}
	if input.EndDate != "" {
		endTime, err := time.Parse("2006-01-02", input.EndDate)
		if err == nil {
			query = query.Where("transactions.occurred_at < ?", endTime.AddDate(0, 0, 1))
		}
	}

	var total int64
	if err := query.Model(&model.Transaction{}).Count(&total).Error; err != nil {
		return nil, err
	}

	type txRow struct {
		model.Transaction
		CategoryName string `gorm:"column:category_name"`
		CategoryIcon string `gorm:"column:category_icon"`
	}

	var rows []txRow
	offset := (input.Page - 1) * input.PageSize
	err := query.Table("transactions").
		Select("transactions.*, categories.name as category_name, categories.icon as category_icon").
		Joins("LEFT JOIN categories ON categories.id = transactions.category_id").
		Order("transactions.occurred_at DESC, transactions.id DESC").
		Offset(offset).Limit(input.PageSize).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	items := make([]TransactionResult, len(rows))
	for i, row := range rows {
		items[i] = TransactionResult{
			ID:           row.ID,
			Type:         row.Type,
			Amount:       row.Amount,
			CategoryID:   row.CategoryID,
			CategoryName: row.CategoryName,
			CategoryIcon: row.CategoryIcon,
			Note:         row.Note,
			OccurredAt:   row.OccurredAt,
			CreatedAt:    row.CreatedAt,
		}
	}

	return &TransactionListResult{
		Items:    items,
		Total:    total,
		Page:     input.Page,
		PageSize: input.PageSize,
	}, nil
}

func GetTransaction(userID, txID uint) (*TransactionDetailResult, error) {
	type txRow struct {
		model.Transaction
		CategoryName string `gorm:"column:category_name"`
		CategoryIcon string `gorm:"column:category_icon"`
	}

	var row txRow
	err := model.DB.Table("transactions").
		Select("transactions.*, categories.name as category_name, categories.icon as category_icon").
		Joins("LEFT JOIN categories ON categories.id = transactions.category_id").
		Where("transactions.id = ?", txID).
		First(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTransactionNotFound
		}
		return nil, err
	}

	if row.UserID != userID {
		return nil, ErrTransactionForbidden
	}

	return &TransactionDetailResult{
		ID:           row.ID,
		Type:         row.Type,
		Amount:       row.Amount,
		CategoryID:   row.CategoryID,
		CategoryName: row.CategoryName,
		CategoryIcon: row.CategoryIcon,
		Note:         row.Note,
		OccurredAt:   row.OccurredAt,
		CreatedAt:    row.CreatedAt,
		UpdatedAt:    row.UpdatedAt,
	}, nil
}

func UpdateTransaction(userID, txID uint, input UpdateTransactionInput) (*TransactionDetailResult, error) {
	var tx model.Transaction
	if err := model.DB.First(&tx, txID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTransactionNotFound
		}
		return nil, err
	}

	if tx.UserID != userID {
		return nil, ErrTransactionForbidden
	}

	if input.Amount != nil {
		if *input.Amount <= 0 {
			return nil, ErrInvalidAmount
		}
		tx.Amount = *input.Amount
	}
	if input.CategoryID != nil {
		var category model.Category
		err := model.DB.Where("id = ? AND (user_id = ? OR user_id = 0)", *input.CategoryID, userID).First(&category).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrCategoryInvalid
			}
			return nil, err
		}
		tx.CategoryID = input.CategoryID
	}
	if input.Note != nil {
		tx.Note = *input.Note
	}
	if input.OccurredAt != nil {
		tx.OccurredAt = *input.OccurredAt
	}

	if err := model.DB.Save(&tx).Error; err != nil {
		return nil, err
	}

	return GetTransaction(userID, txID)
}

func DeleteTransaction(userID, txID uint) error {
	var tx model.Transaction
	if err := model.DB.First(&tx, txID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTransactionNotFound
		}
		return err
	}

	if tx.UserID != userID {
		return ErrTransactionForbidden
	}

	return model.DB.Delete(&tx).Error
}
