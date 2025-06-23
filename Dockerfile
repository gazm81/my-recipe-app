FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm cache clean --force

# Copy application code
COPY . .

# Create data directory for persistent storage
RUN mkdir -p /app/data

EXPOSE 80

# Set default port to 80 for Azure deployment
ENV PORT=80

CMD ["npm", "start"]