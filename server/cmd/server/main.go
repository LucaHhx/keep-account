package main

import (
	"flag"
	"fmt"
	"log"

	"go.uber.org/zap"

	"keep-account/internal/config"
	"keep-account/internal/handler"
	"keep-account/internal/model"
	"keep-account/internal/router"
)

func main() {
	configPath := flag.String("config", "config.yaml", "path to config file")
	flag.Parse()

	if err := config.Load(*configPath); err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	if err := config.InitLogger(); err != nil {
		log.Fatalf("failed to init logger: %v", err)
	}
	defer config.Logger.Sync()

	if err := model.InitDB(config.C.Database.Path); err != nil {
		zap.L().Fatal("failed to init database", zap.Error(err))
	}

	handler.RegisterValidators()

	r := router.Setup()

	addr := fmt.Sprintf(":%d", config.C.Server.Port)
	zap.L().Info("server starting", zap.String("addr", addr))
	if err := r.Run(addr); err != nil {
		zap.L().Fatal("failed to start server", zap.Error(err))
	}
}
