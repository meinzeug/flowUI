FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY knexfile.cjs ./
COPY migrations ./migrations
COPY src ./src
RUN npm run build
EXPOSE 3008
CMD ["node","dist/server.js"]
