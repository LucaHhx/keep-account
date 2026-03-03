package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"keep-account/internal/model"
)

var (
	ErrUsernameExists = errors.New("username already exists")
	ErrUserNotFound   = errors.New("user not found")
	ErrPasswordWrong  = errors.New("password wrong")
)

func Register(username, password string) (*model.User, error) {
	var existing model.User
	if err := model.DB.Where("username = ?", username).First(&existing).Error; err == nil {
		return nil, ErrUsernameExists
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := model.User{
		Username:     username,
		PasswordHash: string(hash),
	}
	if err := model.DB.Create(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func Login(username, password string) (*model.User, error) {
	var user model.User
	if err := model.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrPasswordWrong
	}
	return &user, nil
}

func GetUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := model.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}
