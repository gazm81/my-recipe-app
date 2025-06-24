FROM node:18

# Install additional tools for development
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create node user's home directory and set permissions
RUN mkdir -p /home/node && chown -R node:node /home/node

# Switch to node user
USER node

# Keep container running
CMD ["sleep", "infinity"]