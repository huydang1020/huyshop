package main

import (
	"context"
	"time"

	"github.com/huyshop/cron/pb"
)

func (j *Cronjob) ListLogs(ctx context.Context, req *pb.LogRequest) ([]*pb.Log, error) {
	if req.Limit == 0 {
		req.Limit = 100
	}
	logs, err := j.db.ListLogs(req)
	if err != nil {
		return nil, err
	}
	return logs, nil
}

func (j *Cronjob) CountLogs(ctx context.Context, req *pb.LogRequest) (int64, error) {
	count, err := j.db.CountLogs(req)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (j *Cronjob) insertLogs(resp, url, body, owner, configId string, httpCode, duration int) error {
	l := &pb.Log{
		Request:  body,
		Response: resp,
		Url:      url,
		HttpCode: int32(httpCode),
		Duration: int32(duration),
		Created:  time.Now().Unix(),
		Owner:    owner,
		ConfigId: configId,
	}
	err := j.db.InsertLog(l)
	return err
}
