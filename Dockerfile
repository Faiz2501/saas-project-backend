FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN NODE_OPTIONS="--max-old-space-size=460" npm run build

EXPOSE 3000

CMD ["node", "dist/main"]