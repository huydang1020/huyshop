package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"github.com/huyshop/cron/pb"
	"github.com/huyshop/cron/utils"
	"github.com/lithammer/shortuuid"
	cron "github.com/robfig/cron/v3"
)

func (j *Cronjob) httpCaller(conf *pb.Config) (string, error) {
	now := time.Now()
	if strings.ToUpper(conf.Method) == "POST" {
		code, resp, err := utils.SendReqPost(conf.Url, map[string]string{"Content-type": "application/json"}, []byte(conf.Body))
		if err := j.insertLogs(string(resp), conf.Url, conf.Body, conf.Owner, conf.Id, code, int(time.Since(now).Milliseconds())); err != nil {
			log.Print(err)
		}
		if code != 200 {
			log.Print(string(resp))
		}
		if err != nil {
			log.Print(err)
		}
		return string(resp), nil
	}
	if strings.ToUpper(conf.Method) == "GET" {
		code, resp, err := utils.SendReqGet(conf.Url, map[string]string{"Content-type": "application/json"})
		if err := j.insertLogs(string(resp), conf.Url, conf.Body, conf.Owner, conf.Id, code, int(time.Since(now).Milliseconds())); err != nil {
			log.Print(err)
		}
		if code != 200 {
			log.Print(string(resp))
		}
		if err != nil {
			log.Print(err)
		}
		return string(resp), nil
	}
	log.Print("method not match!!")
	return "", nil
}

func LoadConfig(url string) (map[string]*pb.Config, error) {
	bin, err := os.ReadFile(url)
	if err != nil {
		return nil, err
	}
	mConfigs := make(map[string]*pb.Config)
	if err := json.Unmarshal(bin, &mConfigs); err != nil {
		return nil, err
	}
	return mConfigs, nil
}
func makeSpec(name string, config *pb.Config) string {
	if config.Expression == "" {
		log.Print("not found expression of ", name)
	}
	if config.Url == "" {
		log.Print("not found url of !", name)
	}
	if config.Timezone == "" {
		log.Print("not found url of ", name)
		return config.Expression
	}
	return "CRON_TZ=" + config.Timezone + " " + config.Expression
}

func (j *Cronjob) startCronConfig(config *pb.Config, name string) *cron.Cron {

	c := cron.New()
	id, err := c.AddFunc(makeSpec(name, config), func() {
		log.Print(name + " running...")
		body, err := j.httpCaller(config)
		if err != nil {
			log.Print("error with ", name, " url: ", config.Url+" ", err)
		} else {
			log.Print("success full caller ", name, " ", body)
		}
	})
	log.Print("err: ", err, " ", id)
	return c
}

func (j *Cronjob) InstallCron(configs map[string]*pb.Config) []*cron.Cron {
	crons := make([]*cron.Cron, 0)
	for name, config := range configs {
		if config.State != "active" {
			log.Print(name + " " + "not active")
			continue
		}
		crons = append(crons, j.startCronConfig(config, name))
	}
	return crons
}

func (j *Cronjob) ListCronConfigs(ctx context.Context, req *pb.ConfigRequest) ([]*pb.Config, error) {
	configs, err := j.db.ListConfigs(req)
	if err != nil {
		return nil, err
	}
	return configs, nil
}

func (j *Cronjob) GetCronConfig(ctx context.Context, req *pb.ConfigRequest) (*pb.Config, error) {
	if req.GetId() == "" {
		return nil, errors.New(utils.E_not_found_id)
	}
	config, err := j.db.FindConfig(&pb.Config{Id: req.GetId(), Owner: req.Owner})
	if err != nil {
		return nil, err
	}
	return config, nil
}

func (j *Cronjob) CreateCronConfig(ctx context.Context, in *pb.Config) (*pb.Config, error) {
	log.Println("create cron in: ", in)
	if in.GetExpression() == "" {
		return nil, errors.New(utils.E_not_found_expression)
	}
	if in.GetTimezone() == "" {
		return nil, errors.New(utils.E_not_found_timezone)
	}
	if in.GetUrl() == "" {
		return nil, errors.New(utils.E_not_found_url)
	}
	if in.GetMethod() == "" {
		return nil, errors.New(utils.E_not_found_method)
	}
	in.Id = shortuuid.New()
	// config, err := j.db.FindConfig(&pb.Config{Id: in.GetId()})
	// if err == nil && config.Id != "" {
	// 	return nil, errors.New(utils.E_config_existed)
	// }
	defer func() {
		log.Println("start trigger ")
		j.trigger <- true
		j.trigger = make(chan bool)
	}()
	log.Println("here")
	if in.State == "" {
		in.State = pb.Config_active.String()
	}
	in.Created = time.Now().Unix()
	if err := j.db.InsertConfig(in); err != nil {
		return nil, err
	}
	log.Println("done create cron config ")
	log.Println("IINNNNNNNNNN ", in)
	return in, nil
}

func (j *Cronjob) UpdateCronConfig(ctx context.Context, in *pb.Config) (*pb.Config, error) {
	if in.GetId() == "" {
		return nil, errors.New(utils.E_not_found_id)
	}
	_, err := j.db.FindConfig(&pb.Config{Id: in.GetId(), Owner: in.Owner})
	if err != nil {
		return nil, err
	}
	defer func() {
		j.trigger <- true
		j.trigger = make(chan bool)
	}()
	in.UpdatedAt = time.Now().Unix()
	if err := j.db.UpdateConfig(in, &pb.Config{Id: in.GetId()}); err != nil {
		return nil, err
	}
	return in, nil
}

func (j *Cronjob) DeleteCronConfig(ctx context.Context, in *pb.ConfigRequest) (*pb.Config, error) {
	if in.GetId() == "" {
		return nil, errors.New(utils.E_not_found_id)
	}
	defer func() {
		j.trigger <- true
		j.trigger = make(chan bool)
	}()
	return nil, j.db.DeleteConfig(&pb.Config{Id: in.GetId()})
}
