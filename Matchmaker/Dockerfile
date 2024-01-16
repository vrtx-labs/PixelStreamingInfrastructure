# ---------------------------------------------------------------------------
# This is a package the Matchmaker application for the Pixel Streaming 
# Infrastructure into and alpine container and adjusted the user so
# "runAsNonRoot" works on Kubernetes. Running as node user means we can only 
# bind to ports higher then 1024, adjust the config or configmap accordingly
# ---------------------------------------------------------------------------

FROM --platform=${BUILDPLATFORM:-linux/amd64} node:alpine3.18 as builder

RUN npm config set loglevel warn \
  && npm set progress=false

# install dependencies
COPY package*.json /tmp/
RUN cd /tmp && npm ci
RUN mkdir -p /src && cp -a /tmp/node_modules /src
RUN rm -rf /tmp/node_modules

# copy source and build
WORKDIR /src
COPY . .
RUN npm prune --production


# Runtime container (node)

FROM --platform=${TARGETPLATFORM:-linux/amd64} node:alpine3.18
COPY --from=builder /src /app
WORKDIR /app
RUN chown -R node:node /app

USER node
# entrypoint
ENTRYPOINT [ "node", "wrapper.js" ]