package model

import "time"

type Category struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Name      string    `gorm:"type:varchar(32);not null" json:"name"`
	Type      string    `gorm:"type:varchar(10);not null" json:"type"`
	Icon      string    `gorm:"type:varchar(32)" json:"icon"`
	Sort      int       `gorm:"default:0" json:"sort"`
	IsDefault bool      `gorm:"default:false" json:"is_default"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}
