FROM node:alpine3.18

# Move to app dir
WORKDIR /app

# install
COPY . .
RUN npm ci

CMD ["node", "main.js"]