FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install @fab-orbita/shield

CMD ["node", "app.js"]
