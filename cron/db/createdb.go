package db

import (
	"log"

	"github.com/huyshop/cron/pb"

	"xorm.io/xorm"
)

const (
	tblConfig = "config"
	tblLog    = "log"
)

func createTable(model interface{}, tblName string, engine *xorm.Engine) error {
	b, err := engine.IsTableExist(model)
	if err != nil {
		return err
	}
	log.Print(b, " ", tblName)
	if b {
		if err = engine.Sync2(model); err != nil {
			return err
		}
		return nil
	}
	if err = engine.CreateTables(model); err != nil {
		return err
	}
	return nil
}

// CreateDb func
func (d *DB) CreateDb() error {
	if err := createTable(&pb.Config{}, tblConfig, d.engine); err != nil {
		return err
	}
	if err := createTable(&pb.Log{}, tblLog, d.engine); err != nil {
		return err
	}
	return nil
}
