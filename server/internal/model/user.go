package model

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"type:varchar(32);uniqueIndex;not null" json:"username"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	CreatedAt    time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt    time.Time `gorm:"not null" json:"updated_at"`
}
