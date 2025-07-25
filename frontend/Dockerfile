FROM node:20-alpine as build
WORKDIR /app

# Copy frontend sources
COPY . .

# Install dependencies and build the production bundle
RUN npm install \
    && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
