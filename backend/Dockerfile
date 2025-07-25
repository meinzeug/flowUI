FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm install
COPY src ./src
RUN npx tsc
EXPOSE 4000
CMD ["node", "dist/server.js"]
