FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code (excluding node_modules via explicit copy)
COPY app.js ./
COPY data/ ./data/
COPY public/ ./public/
COPY recipes/ ./recipes/
COPY views/ ./views/

# Create data directory for persistent storage
RUN mkdir -p /app/data

EXPOSE 80

# Set default port to 80 for Azure deployment
ENV PORT=80

CMD ["npm", "start"]