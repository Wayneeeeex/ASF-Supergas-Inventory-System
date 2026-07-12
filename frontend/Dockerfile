FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5174

# --host is required so Vite listens on 0.0.0.0 inside the container —
# without it, Vite only binds to localhost *inside* the container, which
# the host-side port mapping can't reach.
CMD ["npm", "run", "dev", "--", "--host"]
