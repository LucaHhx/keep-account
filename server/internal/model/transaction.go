package model

import "time"

type Transaction struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     uint      `gorm:"not null;index" json:"user_id"`
	Type       string    `gorm:"type:varchar(10);not null" json:"type"`
	Amount     int64     `gorm:"not null" json:"amount"`
	CategoryID *uint     `gorm:"" json:"category_id"`
	Note       string    `gorm:"type:varchar(255)" json:"note"`
	OccurredAt time.Time `gorm:"not null" json:"occurred_at"`
	CreatedAt  time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt  time.Time `gorm:"not null" json:"updated_at"`
}
