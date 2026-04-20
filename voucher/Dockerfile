FROM alpine:3.14

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root

# Copy binary đã build sẵn và assets
COPY voucher .

EXPOSE 4000 4001

CMD ["./voucher", "start"]