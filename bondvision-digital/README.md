# BondVision Digital

MTS BondVision Trading Platform application - Modern React version.

## Project Structure

```
bondvision-digital/
├── src/
│   ├── components/     # React components
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── docker-compose.yml  # Docker configuration
├── Dockerfile.dev      # Development Dockerfile
├── Dockerfile          # Production Dockerfile
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Ports

- **External port (host):** 3002
- **Internal port (container):** 3001
- **Access:** http://localhost:3002

## How to Start the Application

### With Docker (recommended)

```bash
cd bondvision-digital

# Build and start the container
docker-compose up --build

# The app will be available at http://localhost:3002
```

### Without Docker

```bash
cd bondvision-digital

# Install dependencies
npm install

# Start the development server
npm run dev

# The app will be available at http://localhost:3001
```

## Available Commands

```bash
# Development with hot-reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- **Framework:** React 18 + Vite
- **Styling:** CSS modules
- **Containerization:** Docker + Docker Compose
- **Node.js:** v18-alpine
