FROM --platform=${BUILDPLATFORM:-linux/amd64} alpine:3.18

# add dependencies
RUN apk update && \
  apk add -u --no-cache \
  curl jq docker-cli

# Install kubectl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/${BUILDPLATFORM:-linux/amd64}/kubectl && \
  chmod +x ./kubectl && \
  mv ./kubectl /usr/local/bin
