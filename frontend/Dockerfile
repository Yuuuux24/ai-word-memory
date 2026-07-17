FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

RUN npm run build

EXPOSE 3000

CMD npx next start -p 3000
