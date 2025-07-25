FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
# Install Python and build tools required for node-gyp
RUN apk add --no-cache python3 make g++ curl \
    && npm install --production \
    && npm install -g @anthropic-ai/claude-code claude-flow@alpha
COPY server.js ./
COPY tools.js ./
COPY knexfile.cjs ./
COPY migrations ./migrations
EXPOSE 3008
CMD ["npm", "start"]
