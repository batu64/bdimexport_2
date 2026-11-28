FROM alpine:3.21

ARG PB_VERSION=0.42.3

RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    tzdata

WORKDIR /pb

RUN wget -q "https://ganigeorgiev.com/meta/pocketbase/pocketbase/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
    && unzip -q /tmp/pb.zip -d /pb \
    && rm -f /tmp/pb.zip \
    && chmod +x /pb/pocketbase

COPY pb_migrations /pb/pb_migrations
COPY entrypoint.sh /pb/entrypoint.sh
RUN sed -i 's/\r$//' /pb/entrypoint.sh && chmod +x /pb/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/pb/entrypoint.sh"]
