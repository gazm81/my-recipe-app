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

# Ensure the node user owns the /app directory
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 80

# Set default port to 80 for Azure deployment
ENV PORT=80

CMD ["npm", "start"]