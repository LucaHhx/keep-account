package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Log      LogConfig      `mapstructure:"log"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Env  string `mapstructure:"env"`
}

// IsDev returns true when running in development mode.
func (s ServerConfig) IsDev() bool {
	return s.Env != "production"
}

type DatabaseConfig struct {
	Path string `mapstructure:"path"`
}

type JWTConfig struct {
	Secret         string  `mapstructure:"secret"`
	ExpireDays     int     `mapstructure:"expire_days"`
	RenewBeforeDays float64 `mapstructure:"renew_before_days"`
}

type LogConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
}

var C Config

func Load(configPath string) error {
	viper.SetConfigFile(configPath)
	if err := viper.ReadInConfig(); err != nil {
		return err
	}

	// 支持环境变量覆盖: JWT_SECRET -> jwt.secret
	viper.BindEnv("jwt.secret", "JWT_SECRET")

	return viper.Unmarshal(&C)
}
