package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/schema"
	"github.com/huyshop/cron/pb"
	cron "github.com/robfig/cron/v3"
)

var decoder = schema.NewDecoder()

func init() {
	decoder.SetAliasTag("json")
	log.SetFlags(log.Llongfile)
}

func BindQuery(in interface{}, ctx *gin.Context) error {
	err := decoder.Decode(in, ctx.Request.URL.Query())
	return err
}

type Cronjob struct {
	route   *gin.Engine
	db      IDB
	session *cron.Cron
	trigger chan bool
}

type IDB interface {
	InsertConfig(config *pb.Config) error
	UpdateConfig(updator, selector *pb.Config) error
	FindConfig(in *pb.Config) (*pb.Config, error)
	CountListConfigs(in *pb.ConfigRequest) (int64, error)
	ListConfigs(in *pb.ConfigRequest) ([]*pb.Config, error)
	DeleteConfig(in *pb.Config) error

	CountLogs(store *pb.LogRequest) (int64, error)
	ListLogs(in *pb.LogRequest) ([]*pb.Log, error)
	InsertLog(st ...*pb.Log) error
}

func (j *Cronjob) handleListCronjobs(ctx *gin.Context) {
	req := &pb.ConfigRequest{}
	BindQuery(req, ctx)
	configs, err := j.ListCronConfigs(ctx, req)
	if err != nil {
		ctx.JSON(200, gin.H{"error": 1, "message": err.Error()})
		return
	}
	ctx.JSON(200, gin.H{"cronjobs": configs})
}

func (j *Cronjob) handleGetCronjob(ctx *gin.Context) {
	req := &pb.ConfigRequest{}
	BindQuery(req, ctx)
	req.Id = ctx.Param("id")
	config, err := j.GetCronConfig(ctx, req)
	if err != nil {
		ctx.JSON(200, gin.H{"error": 1, "message": err.Error()})
		return
	}
	ctx.JSON(200, config)
}

func (j *Cronjob) handleCreateCronjob(ctx *gin.Context) {
	job := &pb.Config{}
	ctx.ShouldBindJSON(job)
	config, err := j.CreateCronConfig(ctx, job)
	log.Println("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
	log.Println("config: ", config)
	if err != nil {
		log.Println("create cron config err: ", err)
		ctx.JSON(200, gin.H{"error": 1, "message": err.Error()})
		return
	}
	ctx.JSON(200, config)
}

func (j *Cronjob) handleUpdateCronjob(ctx *gin.Context) {
	job := &pb.Config{}
	ctx.ShouldBindJSON(job)
	config, err := j.UpdateCronConfig(ctx, job)
	if err != nil {
		ctx.JSON(200, gin.H{"error": 1, "message": err.Error()})
		return
	}
	ctx.JSON(200, config)
}

func (j *Cronjob) handleDeleteCronjob(ctx *gin.Context) {
	req := &pb.ConfigRequest{Id: ctx.Param("id")}
	_, err := j.DeleteCronConfig(ctx, req)
	if err != nil {
		ctx.JSON(200, gin.H{"error": 1, "message": err.Error()})
		return
	}
	ctx.JSON(200, gin.H{"error": "0"})
}

func (j *Cronjob) handleListCronlogs(ctx *gin.Context) {
	req := &pb.LogRequest{}
	BindQuery(req, ctx)
	logs, err := j.ListLogs(ctx, req)
	if err != nil {
		ctx.JSON(200, gin.H{"error": 1, "message": err.Error()})
		return
	}
	count, _ := j.CountLogs(ctx, req)
	ctx.JSON(200, gin.H{"cronlogs": logs, "total": int32(count)})
}

func NewHttpServer(job *Cronjob) *gin.Engine {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	v1 := r.Group("/cron")
	v1.GET("/cronjobs", job.handleListCronjobs)
	v1.GET("/cronjobs/:id", job.handleGetCronjob)
	v1.POST("/cronjobs/:id", job.handleUpdateCronjob)
	v1.POST("/cronjobs", job.handleCreateCronjob)
	v1.DELETE("/cronjobs/:id", job.handleDeleteCronjob)

	v1.GET("/cronlogs", job.handleListCronlogs)
	return r
}
