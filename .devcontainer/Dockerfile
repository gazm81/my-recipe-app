FROM node:18

# Install additional tools for development
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and set proper ownership
WORKDIR /app
RUN chown -R node:node /app

# Create node user's home directory and set permissions
RUN mkdir -p /home/node && chown -R node:node /home/node

# Add sudo capability for development environment
RUN apt-get update && apt-get install -y sudo && \
    echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    rm -rf /var/lib/apt/lists/*

# Switch to node user
USER node

# Keep container running
CMD ["sleep", "infinity"]