FROM node:20-alpine

WORKDIR /app
COPY frontend/ .

RUN npm install
RUN npm run build

EXPOSE 80
CMD ["npx", "serve", "-s", "dist", "-l", "80"]
