FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Create persistent-data directory for Azure File Share mount
RUN mkdir -p /app/persistent-data

# Ensure the node user owns the /app directory
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000

CMD ["npm", "start"]