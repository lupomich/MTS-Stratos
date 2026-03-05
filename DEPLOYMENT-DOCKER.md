# 🚀 Docker Deployment Guide - MTS-Stratos

## ✅ System Status

All containers have been tested and are fully working on Windows!

## 📦 Available Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Hello App** | 3000 | http://localhost:3000 | Node.js Express Server |
| **BondVision Mockup** | 3001 | http://localhost:3001 | React App (prototype) |
| **BondVision Digital** | 3002 | http://localhost:3002 | React App (full version) |

## 🎯 Main Commands

### ✅ Start all services together (recommended)
Use **docker-compose.master.yml** to manage all services with a single command:
```bash
docker-compose -f docker-compose.master.yml up -d
```

### Start with full rebuild
```bash
docker-compose -f docker-compose.master.yml up --build -d
```

### 🎨 Start a single service
Each service has its own docker-compose.yml to work in isolation:

### View container status
```bash
docker ps
```

### View service logs
```bash
# Hello App
docker logs mts-stratos-hello-app

# BondVision Mockup
docker logs mts-stratos-bondvision-mockup -f

# BondVision Digital
docker logs mts-stratos-bondvision-digital -f
```

### Stop all services
```bash
docker-compose -f docker-compose.master.yml down
```

### Stop and remove volumes
```bash
docker-compose -f docker-compose.master.yml down -v
```

### Restart a single service
```bash
# Restart only BondVision Digital
docker-compose -f docker-compose.master.yml restart bondvision-digital
```

## 🔧 Working on a Single Service

Each service keeps its own `docker-compose.yml` for maximum flexibility.
Useful when working on a specific application without starting the others.

### Hello App (port 3000)
```bash
# From project root
docker-compose up -d

# Stop
docker-compose down
```

### BondVision Mockup (port 3001)
```bash
cd bondvision-mockup
docker-compose up -d

# Stop
docker-compose down
cd ..
```

### BondVision Digital (port 3002)
```bash
cd bondvision-digital
docker-compose up -d

# Stop
docker-compose down
cd ..
```

**💡 Note**: You can run concurrently:
- All services via master: `docker-compose -f docker-compose.master.yml up -d`
- OR individual services: `cd bondvision-digital && docker-compose up -d`
- But don’t mix both! Always use either the master or the individual ones to avoid network conflicts.

## 🛠️ Troubleshooting

### Port already in use
If you get errors like "port is already allocated":
```bash
# Check which processes are using the port (e.g. port 3000)
netstat -ano | findstr :3000

# Stop all containers
docker-compose -f docker-compose.master.yml down
```

### Rebuild from scratch
```bash
# Stop everything and remove containers
docker-compose -f docker-compose.master.yml down

# Remove old images
docker rmi mts-stratos-hello-app mts-stratos-bondvision-mockup mts-stratos-bondvision-digital

# Rebuild and start
docker-compose -f docker-compose.master.yml up --build -d
```

### Full Docker cleanup
```bash
# ⚠️ WARNING: This removes ALL containers and images
docker system prune -a
```

## 📊 Monitoring

### View resource usage
```bash
docker stats
```

### Inspect a container
```bash
docker inspect mts-stratos-hello-app
```

### Access a container shell
```bash
# Access the BondVision Digital container
docker exec -it mts-stratos-bondvision-digital /bin/sh
```

## 🌐 Docker Network

All services are connected to the `mts-stratos_mts-network` network. Containers can communicate with each other using service names:
- `hello-app`
- `bondvision-mockup`
- `bondvision-digital`

## 📝 Hot Reload

BondVision Mockup and Digital have mounted volumes for hot reload:
- Changes in `/src` are reflected automatically
- Changes in `/public` are reflected automatically
- Changes in `index.html` are reflected automatically

## 🚨 Important Notes

1. **SSL Configuration**: Dockerfiles include `npm config set strict-ssl false` for environments with corporate proxies/firewalls
2. **Restart Policy**: All containers have `restart: unless-stopped` to restart automatically
3. **Windows Path**: Windows paths with spaces (e.g. "OneDrive - Euronext") are handled correctly by Docker

## 🎉 Quick Verification

```bash
# Verify all services are active
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test endpoints
curl.exe http://localhost:3000
curl.exe http://localhost:3001
curl.exe http://localhost:3002
```

## 📚 Configuration Files

- **docker-compose.master.yml**: Orchestration of all services
- **docker-compose.yml** (root): Hello App only
- **bondvision-mockup/docker-compose.yml**: Mockup only
- **bondvision-digital/docker-compose.yml**: Digital only

## 🔄 Migration from WSL

✅ Project successfully migrated from WSL to Windows  
✅ All containers tested and working correctly  
✅ No changes required to Dockerfiles or docker-compose.yml
