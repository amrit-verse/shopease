FROM node:20-alpine

WORKDIR /app

# Install only what we need (no workspace install)
COPY package.json ./
RUN npm install --omit=dev --no-package-lock

COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/server.js"]
