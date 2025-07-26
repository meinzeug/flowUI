FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json knexfile.cjs ./
COPY src ./src
RUN npm run build
EXPOSE 4000
CMD ["node","dist/index.js"]
