package handler

import (
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)

func RegisterValidators() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("alphanum_underscore", func(fl validator.FieldLevel) bool {
			return usernameRegex.MatchString(fl.Field().String())
		})
	}
}
