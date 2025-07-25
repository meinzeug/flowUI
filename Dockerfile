FROM node:18-alpine as build
WORKDIR /app
# Copy frontend sources and configuration
COPY frontend ./frontend
COPY vite.config.ts ./
COPY index.html ./
# Install dependencies and build the production bundle
RUN npm --prefix frontend install \
    && npx --prefix frontend vite build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
