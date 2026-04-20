package main

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/huyshop/cron/db"
	"github.com/huyshop/cron/pb"
	"github.com/joho/godotenv"
	"github.com/urfave/cli/v2"
	"golang.org/x/net/context"
)

type Configs struct {
	DbPath    string `env:"DB_PATH"`
	DbName    string `env:"DB_NAME"`
	HttpPort  string `env:"HTTP_PORT"`
	Http2Port string `env:"HTTP2_PORT"`
}

var config *Configs

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading env:", err)
	}
	config = &Configs{
		DbPath:    os.Getenv("DB_PATH"),
		DbName:    os.Getenv("DB_NAME"),
		HttpPort:  os.Getenv("HTTP_PORT"),
		Http2Port: os.Getenv("HTTP2_PORT"),
	}
}

func NewCronjob(cf *Configs) (*Cronjob, error) {
	dbase := &db.DB{}
	if err := dbase.ConnectDb(cf.DbPath, cf.DbName); err != nil {
		return nil, err
	}
	return &Cronjob{
		trigger: make(chan bool),
		db:      dbase,
	}, nil
}

func startApp(ctx *cli.Context) error {
	cronjob, err := NewCronjob(config)
	if err != nil {
		log.Fatal(err)
	}
	route := NewHttpServer(cronjob)
	cronjob.route = route
	go func() {
		route.Run(":" + config.HttpPort)
	}()
	for {
		mConfigs := map[string]*pb.Config{}
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		configs, err := cronjob.ListCronConfigs(ctx, &pb.ConfigRequest{})
		if err != nil {
			panic(err)
		}
		cancel()
		for _, data := range configs {
			mConfigs[data.GetId()] = data
		}
		log.Println("mConfigs: ", mConfigs)
		crons := cronjob.InstallCron(mConfigs)
		for _, cron := range crons {
			cron.Start()
		}
		<-cronjob.trigger
		log.Print("....reload....")
		for _, cron := range crons {
			cron.Stop()
		}
	}
}
func createTableDb(ctx *cli.Context) error {
	d := &db.DB{}
	err := d.ConnectDb(config.DbPath, config.DbName)
	if err != nil {
		panic(err)
	}
	if err := d.CreateDb(); err != nil {
		return err
	}
	log.Print("Tables created!")
	return nil
}

func appRoot() error {
	app := cli.NewApp()

	app.Action = func(c *cli.Context) error {
		return errors.New("Wow, ^.^ dumb")
	}
	app.Commands = []*cli.Command{
		{Name: "start", Action: startApp},
		{Name: "createDb", Action: createTableDb},
	}

	return app.Run(os.Args)
}

func main() {
	log.Print("$ STARTED")
	if err := appRoot(); err != nil {
		panic(err)
	}
}
