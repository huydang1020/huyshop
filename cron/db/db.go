package db

import (
	"errors"
	"fmt"
	"log"
	"time"

	// mysql driver
	_ "github.com/go-sql-driver/mysql"
	"github.com/huyshop/cron/pb"
	"github.com/huyshop/cron/utils"
	"xorm.io/xorm"
)

// DB ...
type DB struct {
	engine *xorm.Engine
}

// ConnectDb open connection to db
func (d *DB) ConnectDb(sqlPath, dbName string) error {
	sqlConnStr := fmt.Sprintf("%s/%s?charset=utf8", sqlPath, dbName)
	engine, err := xorm.NewEngine("mysql", sqlConnStr)
	if err != nil {
		return err
	}
	tickPingSql := time.NewTicker(15 * time.Minute)
	go func() {
		for {
			select {
			case <-tickPingSql.C:
				if err := engine.Ping(); err != nil {
					log.Print("sql can not ping")
				}
			}
		}
	}()
	d.engine = engine
	d.engine.ShowSQL(false)
	// SyncPartnerCache(d)
	return err
}

// -------------------------- Config ----------------------------------

// InsertConfig ...
func (d *DB) InsertConfig(config *pb.Config) error {
	affected, err := d.engine.Insert(config)
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New(utils.E_can_not_insert)
	}
	return nil
}

// UpdateConfig ...
func (d *DB) UpdateConfig(updator, selector *pb.Config) error {
	affected, err := d.engine.Update(updator, selector)
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New(utils.E_can_not_update)
	}
	return nil
}

// FindConfig ...
func (d *DB) FindConfig(in *pb.Config) (*pb.Config, error) {
	ss := d.engine.Table(tblConfig)
	found, err := ss.Get(in)
	if err != nil {
		return nil, err
	}
	if !found {
		return nil, errors.New(utils.E_not_found)
	}

	return in, nil
}

// listConfigQuery list config
func (d *DB) listConfigQuery(p *pb.ConfigRequest) *xorm.Session {
	ss := d.engine.Table(tblConfig)
	if p.GetState() != "" {
		ss.And("state = ?", p.GetState())
	}
	if p.Owner != "" {
		ss.And("owner = ?", p.Owner)
	}
	if p.GetUrl() != "" {
		ss.And("url Like  ?", "%"+p.GetUrl()+"%")
	}
	return ss
}

// CountListCrons ...
func (d *DB) CountListConfigs(in *pb.ConfigRequest) (int64, error) {
	return d.listConfigQuery(in).Count()
}

// DeleteConfig ...
func (d *DB) DeleteConfig(in *pb.Config) error {
	_, err := d.engine.Delete(in)
	return err
}

// ListConfigs ...
func (d *DB) ListConfigs(in *pb.ConfigRequest) ([]*pb.Config, error) {
	var configs []*pb.Config
	ss := d.listConfigQuery(in)
	if in.GetLimit() != 0 {
		ss.Limit(int(in.GetLimit()), int(in.GetLimit())*int(in.GetOffset()))
	}
	if err := ss.Desc("id").Find(&configs); err != nil {
		return nil, err
	}

	return configs, nil
}

// -- Log ---
func (d *DB) listLogsQuery(l *pb.LogRequest) *xorm.Session {
	ss := d.engine.Table(tblLog)
	if l.GetId() != 0 {
		ss.And("id = ?", l.GetId())
	}
	if l.GetOwner() != "" {
		ss.And("owner = ?", l.GetOwner())
	}
	if l.GetConfigId() != "" {
		ss.And("config_id = ?", l.GetConfigId())
	}
	if l.GetRequest() != "" {
		ss.And("request Like  ?", "%"+l.GetConfigId()+"%")
	}
	if l.GetResponse() != "" {
		ss.And("response Like  ?", "%"+l.GetResponse()+"%")
	}
	return ss
}

// CountLogs ...
func (d *DB) CountLogs(store *pb.LogRequest) (int64, error) {
	return d.listLogsQuery(store).Count()
}

// ListStores ...
func (d *DB) ListLogs(in *pb.LogRequest) ([]*pb.Log, error) {
	logs := []*pb.Log{}
	ss := d.listLogsQuery(in)
	if in.GetLimit() > 0 {
		ss.Limit(int(in.GetLimit()), int(in.GetLimit())*int(in.GetOffset()))
	}
	if err := ss.Desc("id").Find(&logs); err != nil {
		return nil, err
	}
	return logs, nil
}

// InsertLog ...
func (d *DB) InsertLog(st ...*pb.Log) error {
	affected, err := d.engine.Table(tblLog).Insert(st)
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New(utils.E_can_not_insert)
	}
	return nil
}
