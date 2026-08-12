FROM node:20-alpine

# Install OpenSSL 1.1 compatibility package for Prisma Linux query engine
RUN apk add --no-cache openssl openssl1.1-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
