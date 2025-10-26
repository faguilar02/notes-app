FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY bun.lockb ./

RUN npm install -g @angular/cli && npm install

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
