package config

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger

func InitLogger() error {
	var cfg zap.Config
	if C.Log.Format == "json" {
		cfg = zap.NewProductionConfig()
	} else {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	level, err := zapcore.ParseLevel(C.Log.Level)
	if err != nil {
		level = zapcore.InfoLevel
	}
	cfg.Level = zap.NewAtomicLevelAt(level)

	Logger, err = cfg.Build()
	if err != nil {
		return err
	}
	zap.ReplaceGlobals(Logger)
	return nil
}
