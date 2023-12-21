FROM --platform=${BUILDPLATFORM:-linux/amd64} node:alpine3.18
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm install --production

RUN chown -R node /usr/src/app

USER node
ENTRYPOINT ["node", "matchmaker.js"]