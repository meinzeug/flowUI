FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production \
    && npm install -g @anthropic-ai/claude-code claude-flow@alpha
COPY server.js ./
COPY tools.js ./
COPY knexfile.cjs ./
COPY migrations ./migrations
EXPOSE 3008
CMD ["npm", "start"]
