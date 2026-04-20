package utils

import (
	"bytes"
	"io"
	"net/http"
	"time"
)

func SendReqPost(url string, headers map[string]string, body []byte) (int, []byte, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return 0, nil, err
	}
	for k, val := range headers {
		req.Header.Set(k, val)
	}
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer func() {
		req.Close = true
		resp.Body.Close()
	}()
	body, _ = io.ReadAll(resp.Body)
	return resp.StatusCode, body, nil
}

func SendReqGet(url string, headers map[string]string) (int, []byte, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, nil, err
	}
	for k, val := range headers {
		req.Header.Set(k, val)
	}

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer func() {
		req.Close = true
		resp.Body.Close()
	}()
	body, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, body, nil
}
