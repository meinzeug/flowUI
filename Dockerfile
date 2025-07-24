FROM node:18-alpine as build
WORKDIR /app
# Install dependencies for the frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
# Copy the frontend sources and Vite config
COPY frontend ./frontend
COPY vite.config.ts ./
COPY index.html ./
# Build the production bundle
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
