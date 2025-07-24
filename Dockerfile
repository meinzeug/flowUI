FROM node:18-alpine as build
WORKDIR /app
# Install dependencies for the frontend inside its directory
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install
# Copy the frontend sources and Vite config
COPY frontend ./frontend
COPY vite.config.ts ./
COPY index.html ./
# Build the production bundle using the frontend package
RUN npm --prefix frontend run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
