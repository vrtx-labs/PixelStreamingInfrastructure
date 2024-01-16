# ---------------------------------------------------------------------------
# This is a package the Matchmaker application for the Pixel Streaming 
# Infrastructure into and alpine container and adjust the user so
# "runAsNonRoot" works on Kubernetes. Running as node user means we can only 
# bind to ports higher then 1024, adjust the config or configmap accordingly
# ---------------------------------------------------------------------------

FROM --platform=${BUILDPLATFORM:-linux/amd64} node:alpine3.18
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm install --production

RUN chown -R node:node /usr/src/app

USER node
ENTRYPOINT ["node", "matchmaker.js"]