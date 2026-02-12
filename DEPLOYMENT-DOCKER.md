# 🚀 Guida al Deployment Docker - MTS-Stratos

## ✅ Stato del Sistema

Tutti i container sono stati testati e sono completamente funzionanti su Windows!

## 📦 Servizi Disponibili

| Servizio | Porta | URL | Descrizione |
|----------|-------|-----|-------------|
| **Hello App** | 3000 | http://localhost:3000 | Server Express Node.js |
| **BondVision Mockup** | 3001 | http://localhost:3001 | App React (prototipo) |
| **BondVision Digital** | 3002 | http://localhost:3002 | App React (versione completa) |

## 🎯 Comandi Principali

### ✅ Avviare tutti i servizi insieme (raccomandato)
Usa il **docker-compose.master.yml** per gestire tutti i servizi con un unico comando:
```bash
docker-compose -f docker-compose.master.yml up -d
```

### Avviare con rebuild completo
```bash
docker-compose -f docker-compose.master.yml up --build -d
```

### 🎨 Avviare un singolo servizio
Ogni servizio ha il suo docker-compose.yml per lavorare in modo isolato:

### Visualizzare lo stato dei container
```bash
docker ps
```

### Visualizzare i log di un servizio
```bash
# Hello App
docker logs mts-stratos-hello-app

# BondVision Mockup
docker logs mts-stratos-bondvision-mockup -f

# BondVision Digital
docker logs mts-stratos-bondvision-digital -f
```

### Fermare tutti i servizi
```bash
docker-compose -f docker-compose.master.yml down
```

### Fermare e rimuovere anche i volumi
```bash
docker-compose -f docker-compose.master.yml down -v
```

### Riavviare un singolo servizio
```bash
# Riavvia solo BondVision Digital
docker-compose -f docker-compose.master.yml restart bondvision-digital
```

## 🔧 Lavorare su un Singolo Servizio

Ogni servizio mantiene il proprio `docker-compose.yml` per massima flessibilità.
Utile quando lavori solo su una specifica applicazione senza avviare le altre.

### Hello App (porta 3000)
```bash
# Dalla root del progetto
docker-compose up -d

# Fermare
docker-compose down
```

### BondVision Mockup (porta 3001)
```bash
cd bondvision-mockup
docker-compose up -d

# Fermare
docker-compose down
cd ..
```

### BondVision Digital (porta 3002)
```bash
cd bondvision-digital
docker-compose up -d

# Fermare
docker-compose down
cd ..
```

**💡 Nota**: Puoi avere contemporaneamente:
- Tutti i servizi via master: `docker-compose -f docker-compose.master.yml up -d`
- OPPURE i singoli servizi: `cd bondvision-digital && docker-compose up -d`
- Ma non mescolare! Usa sempre o il master o i singoli per evitare conflitti di rete.

## 🛠️ Troubleshooting

### Porta già in uso
Se ricevi errori tipo "port is already allocated":
```bash
# Verifica quali processi usano la porta (esempio porta 3000)
netstat -ano | findstr :3000

# Ferma tutti i container
docker-compose -f docker-compose.master.yml down
```

### Ricostruire da zero
```bash
# Ferma tutto e rimuovi i container
docker-compose -f docker-compose.master.yml down

# Rimuovi le immagini vecchie
docker rmi mts-stratos-hello-app mts-stratos-bondvision-mockup mts-stratos-bondvision-digital

# Ricostruisci e avvia
docker-compose -f docker-compose.master.yml up --build -d
```

### Pulire completamente Docker
```bash
# ⚠️ ATTENZIONE: Questo rimuove TUTTI i container e immagini
docker system prune -a
```

## 📊 Monitoraggio

### Visualizzare l'utilizzo delle risorse
```bash
docker stats
```

### Ispezionare un container
```bash
docker inspect mts-stratos-hello-app
```

### Accedere alla shell di un container
```bash
# Accedi al container BondVision Digital
docker exec -it mts-stratos-bondvision-digital /bin/sh
```

## 🌐 Rete Docker

Tutti i servizi sono connessi alla rete `mts-stratos_mts-network`. I container possono comunicare tra loro usando i nomi dei servizi:
- `hello-app`
- `bondvision-mockup`
- `bondvision-digital`

## 📝 Hot Reload

BondVision Mockup e Digital hanno volumi montati per il hot reload:
- Modifiche in `/src` si riflettono automaticamente
- Modifiche in `/public` si riflettono automaticamente
- Modifiche in `index.html` si riflettono automaticamente

## 🚨 Note Importanti

1. **SSL Configuration**: I Dockerfile includono `npm config set strict-ssl false` per ambienti con proxy/firewall aziendali
2. **Restart Policy**: Tutti i container hanno `restart: unless-stopped` per ripartire automaticamente
3. **Windows Path**: I percorsi Windows con spazi (es. "OneDrive - Euronext") sono gestiti correttamente da Docker

## 🎉 Verifica Rapida

```bash
# Verifica che tutti i servizi siano attivi
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Testa gli endpoint
curl.exe http://localhost:3000
curl.exe http://localhost:3001
curl.exe http://localhost:3002
```

## 📚 File di Configurazione

- **docker-compose.master.yml**: Orchestrazione di tutti i servizi
- **docker-compose.yml** (root): Solo Hello App
- **bondvision-mockup/docker-compose.yml**: Solo Mockup
- **bondvision-digital/docker-compose.yml**: Solo Digital

## 🔄 Migrazione da WSL

✅ Il progetto è stato migrato con successo da WSL a Windows
✅ Tutti i container sono stati testati e funzionano correttamente
✅ Non sono richieste modifiche ai Dockerfile o ai docker-compose.yml
