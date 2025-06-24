FROM node:18

# Install additional tools for development
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Create workspaces directory structure and set proper ownership
RUN mkdir -p /workspaces && chown -R node:node /workspaces

# Create node user's home directory and set permissions
RUN mkdir -p /home/node && chown -R node:node /home/node

# Add sudo capability for development environment
RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Switch to node user
USER node

# Set working directory
WORKDIR /workspaces

# Keep container running
CMD ["sleep", "infinity"]