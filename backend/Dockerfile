FROM node:20-alpine

WORKDIR /app

# Install deps first so this layer is cached unless package.json changes
COPY package*.json ./
RUN npm install

# Then bring in the rest of the source
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
