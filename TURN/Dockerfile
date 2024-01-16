# Docker file for TURN server
ARG alpine_ver=3.18
FROM --platform=${BUILDPLATFORM:-linux/amd64} alpine:${alpine_ver}

RUN apk update && \
    apk add --no-cache  curl bind-tools  coturn

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
