package service

import (
	"errors"

	"gorm.io/gorm"

	"keep-account/internal/model"
)

var (
	ErrCategoryNameExists = errors.New("category name exists")
	ErrCategoryNotFound   = errors.New("category not found")
	ErrCategoryPreset     = errors.New("preset category cannot be deleted")
	ErrCategoryInUse      = errors.New("category is in use by transactions")
)

func ListCategories(userID uint, typ string) ([]model.Category, error) {
	query := model.DB.Where("user_id = ? OR user_id = 0", userID).Order("sort ASC, id ASC")
	if typ != "" {
		query = query.Where("type = ?", typ)
	}
	var categories []model.Category
	if err := query.Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func CreateCategory(userID uint, name, typ, icon string) (*model.Category, error) {
	var existing model.Category
	err := model.DB.Where("(user_id = ? OR user_id = 0) AND name = ? AND type = ?", userID, name, typ).First(&existing).Error
	if err == nil {
		return nil, ErrCategoryNameExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	category := model.Category{
		UserID:    userID,
		Name:      name,
		Type:      typ,
		Icon:      icon,
		Sort:      100,
		IsDefault: false,
	}
	if err := model.DB.Create(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func DeleteCategory(userID, categoryID uint) error {
	var category model.Category
	if err := model.DB.First(&category, categoryID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCategoryNotFound
		}
		return err
	}

	if category.IsDefault {
		return ErrCategoryPreset
	}

	if category.UserID != userID {
		return ErrCategoryNotFound
	}

	var count int64
	model.DB.Model(&model.Transaction{}).Where("category_id = ?", categoryID).Count(&count)
	if count > 0 {
		return ErrCategoryInUse
	}

	return model.DB.Delete(&category).Error
}
