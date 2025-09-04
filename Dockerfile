FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY public ./public
COPY src ./src
RUN npm install && npm run build
CMD ["npm", "start"]
