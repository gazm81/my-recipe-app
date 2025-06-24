# VS Code Dev Container

This directory contains the configuration for a VS Code development container that provides a consistent development environment for the My Recipe App project.

**Note**: This dev container now uses the root Dockerfile for consistency between development and production environments, with additional development tools added via devcontainer features.

## What is a Dev Container?

A development container (dev container) is a running Docker container with a well-defined tool/runtime stack and its prerequisites. VS Code can connect to this container and provide a full-featured development environment inside it.

## Requirements

- **Docker Desktop** installed and running
  - Windows: Docker Desktop for Windows
  - Mac: Docker Desktop for Mac
- **VS Code** with the **Dev Containers** extension installed

## Getting Started

1. **Clone the repository** (if you haven't already)
2. **Open in VS Code**: Open the project folder in VS Code
3. **Reopen in Container**: VS Code should detect the dev container configuration and prompt you to "Reopen in Container". Alternatively:
   - Press `F1` to open the command palette
   - Type "Dev Containers: Reopen in Container"
   - Select the command

## What's Included

The dev container includes:

- **Node.js 18 Alpine** - Runtime environment matching production
- **Essential VS Code Extensions**:
  - Azure tools for deployment
  - Prettier for code formatting
  - ESLint for code linting
  - HTML/CSS support
  - Auto rename tag functionality
- **Development Tools**: Git, curl, wget, vim, nano (via common-utils feature)
- **Automatic Setup**: Dependencies are installed automatically via `npm install`
- **Port Forwarding**: Port 3000 is automatically forwarded for local development
- **Data Persistence**: Local data directory is mounted for persistent storage

## Usage

Once the container is running:

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Access the application**: 
   - VS Code will automatically forward port 3000
   - Open http://localhost:3000 in your browser

3. **Make changes**: 
   - Edit files normally in VS Code
   - Changes are reflected immediately due to bind mounting

## Cross-Platform Compatibility

This dev container is designed to work on both Windows and Mac:

- Uses Linux containers which work on both platforms via Docker Desktop
- Proper file permissions and bind mounting for both file systems
- Cached mounts for improved performance on macOS
- No platform-specific scripts or dependencies

## Troubleshooting

### Container Won't Start
- Ensure Docker Desktop is running
- Try rebuilding the container: `F1` → "Dev Containers: Rebuild Container"

### Port Already in Use
- Check if another process is using port 3000
- Stop other instances of the app or change the port in package.json

### Slow Performance on Windows/Mac
- The dev container uses bind mounts for real-time file syncing
- Performance is optimized with the `cached` consistency option

## Alternative Development

If you prefer not to use the dev container, you can still develop locally:

```bash
npm install
npm start
```

The dev container simply provides a consistent, isolated environment that matches the production setup.