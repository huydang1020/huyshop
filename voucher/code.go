package main

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/huyshop/header/common"
	pb "github.com/huyshop/header/voucher"
	"github.com/huyshop/voucher/utils"
)

func (v *Voucher) CreateCode(ctx context.Context, in *pb.Code) (*common.Empty, error) {
	if in.GetVoucherId() == "" {
		return nil, errors.New(utils.E_voucher_id_empty)
	}
	code := utils.MakeCode()
	codedata := &pb.Code{
		Id:        utils.MakeCodeId(),
		Code:      code,
		VoucherId: in.GetVoucherId(),
		State:     in.GetState(),
		CreatedAt: time.Now().Unix(),
	}
	if err := v.Db.InsertCode(codedata); err != nil {
		log.Println("err ", err)
		return nil, errors.New(utils.E_can_not_insert_code)
	}
	return &common.Empty{}, nil
}

func (v *Voucher) ListCodes(ctx context.Context, in *pb.CodeRequest) (*pb.Codes, error) {
	list, err := v.Db.ListCode(in)
	if err != nil {
		log.Println("err ", err)
		return nil, err
	}
	count, err := v.Db.CountCode(in)
	if err != nil {
		log.Println("err ", err)
		return nil, err
	}
	return &pb.Codes{Codes: list, Total: int32(count)}, nil
}

func (v *Voucher) UseCode(ctx context.Context, in *pb.Code) (*pb.Code, error) {
	code, err := v.Db.GetCode(in)
	if err != nil {
		log.Println("err ", err)
		return nil, err
	}
	code.State = pb.Code_used.String()
	code.UsedAt = time.Now().Unix()
	if err := v.Db.UpdateCode(code); err != nil {
		return nil, err
	}
	return code, nil
}

func (v *Voucher) VerifyCode(ctx context.Context, in *pb.VerifyCodeRequest) (*common.Empty, error) {
	voucher, err := v.Db.GetVoucher(&pb.Voucher{Id: in.GetVoucherId()})
	if err != nil {
		log.Println("get voucher err:", err)
		return nil, errors.New(utils.E_voucher_not_existed)
	}
	if voucher.GetState() != pb.Voucher_active.String() {
		return nil, errors.New(utils.E_voucher_not_active)
	}
	if voucher.GetEndAt() < time.Now().Unix() {
		return nil, errors.New(utils.E_voucher_expired)
	}
	if in.GetTotalBill() < voucher.GetMinTotalBillValue() {
		return nil, errors.New(utils.E_total_bill_not_enough)
	}
	code, err := v.Db.GetCode(&pb.Code{Id: in.GetCodeId()})
	if err != nil {
		log.Println("get code err:", err)
		return nil, errors.New(utils.E_code_not_existed)
	}
	if code.GetState() != pb.Code_got.String() {
		return nil, errors.New(utils.E_code_state_invalid)
	}
	return &common.Empty{}, nil
}
