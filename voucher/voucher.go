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

func (v *Voucher) CreateVoucher(ctx context.Context, in *pb.Voucher) (*common.Empty, error) {
	if in.GetName() == "" {
		return nil, errors.New(utils.E_name_voucher_empty)
	}
	if in.GetType() == pb.Voucher_point.String() && in.GetPointExchange() <= 0 {
		return nil, errors.New(utils.E_point_exchange_empty)
	}
	if in.GetTotalQuantity() <= 0 {
		return nil, errors.New(utils.E_total_quantity_empty)
	}
	if in.GetStartAt() == 0 {
		return nil, errors.New(utils.E_start_at_empty)
	}
	if in.GetEndAt() == 0 {
		return nil, errors.New(utils.E_end_at_empty)
	}
	if in.GetEndAt() < time.Now().Unix() {
		return nil, errors.New(utils.E_end_at_in_the_past)
	}
	if in.GetStartAt() >= in.GetEndAt() {
		return nil, errors.New(utils.E_start_at_end_at_invalid)
	}
	in.Id = utils.MakeVoucherId()
	in.State = pb.Voucher_active.String()
	in.CreatedAt = time.Now().Unix()
	_, err := v.Db.InsertVoucher(in)
	if err != nil {
		return nil, err
	}
	return &common.Empty{}, nil
}

func (v *Voucher) UpdateVoucher(ctx context.Context, in *pb.Voucher) (*common.Empty, error) {
	if in.GetId() == "" {
		return nil, errors.New(utils.E_not_found_id)
	}
	voucher, err := v.Db.GetVoucher(&pb.Voucher{Id: in.GetId()})
	if err != nil {
		return nil, errors.New(utils.E_not_found_voucher)
	}
	if in.GetDiscountPercent() != 0 {
		if in.GetDiscountPercent() < 0 || in.GetDiscountPercent() > 100 {
			return nil, errors.New(utils.E_discount_percent_invalid)
		} else {
			voucher.DiscountPercent = in.GetDiscountPercent()
		}
	}
	if in.GetDiscountCash() != 0 {
		if in.GetDiscountCash() < 0 {
			return nil, errors.New(utils.E_discount_amount_invalid)
		} else {
			voucher.DiscountCash = in.GetDiscountCash()
		}
	}
	in.UpdatedAt = time.Now().Unix()
	if err := v.Db.UpdateVoucher(in); err != nil {
		return nil, err
	}
	return &common.Empty{}, nil
}

func (v *Voucher) DeleteVoucher(ctx context.Context, in *pb.Voucher) (*common.Empty, error) {
	if in.GetId() == "" {
		return nil, errors.New(utils.E_not_found_id)
	}
	if err := v.Db.DeleteVoucher(in); err != nil {
		return nil, err
	}
	return &common.Empty{}, nil
}

func (v *Voucher) GetVoucher(ctx context.Context, in *pb.Voucher) (*pb.Voucher, error) {
	return v.Db.GetVoucher(in)
}

func (v *Voucher) ListVouchers(ctx context.Context, in *pb.VoucherRequest) (*pb.Vouchers, error) {
	log.Println("in ", in)
	list, err := v.Db.ListVoucher(in)
	if err != nil {
		return nil, err
	}
	count, err := v.Db.CountVouchers(in)
	if err != nil {
		return nil, err
	}
	return &pb.Vouchers{Vouchers: list, Total: int32(count)}, nil
}

func (v *Voucher) ListVouchersCustomer(ctx context.Context, in *pb.VoucherRequest) (*pb.Vouchers, error) {
	log.Println("in ", in)
	list, err := v.Db.ListVoucherCustomer(in)
	if err != nil {
		return nil, err
	}
	count, err := v.Db.CountVouchersCustomer(in)
	if err != nil {
		return nil, err
	}
	return &pb.Vouchers{Vouchers: list, Total: int32(count)}, nil
}
