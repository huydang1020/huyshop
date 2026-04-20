gen:
	protoc --proto_path=.  --go_out=common --go_opt=paths=source_relative common.proto
	protoc --proto_path=. --go_out=voucher --go_opt=paths=source_relative \
		--go-grpc_out=voucher --go-grpc_opt=require_unimplemented_servers=false --go-grpc_opt=paths=source_relative voucher.proto
	protoc --proto_path=. --go_out=user --go_opt=paths=source_relative \
		--go-grpc_out=user --go-grpc_opt=require_unimplemented_servers=false --go-grpc_opt=paths=source_relative user.proto
	protoc --proto_path=. --go_out=product --go_opt=paths=source_relative \
		--go-grpc_out=product --go-grpc_opt=require_unimplemented_servers=false --go-grpc_opt=paths=source_relative product.proto
	protoc --proto_path=. --go_out=permission --go_opt=paths=source_relative \
		--go-grpc_out=permission --go-grpc_opt=require_unimplemented_servers=false --go-grpc_opt=paths=source_relative permission.proto
	protoc-go-tags --dir=user
	protoc-go-tags --dir=voucher
	protoc-go-tags --dir=product
	protoc-go-tags --dir=permission
