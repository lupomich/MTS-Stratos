# BondVision Mockup

Applicazione MTS BondVision Trading Platform - Versione mockup/prototipo.

## Struttura del progetto

```
bondvision-mockup/
├── src/
│   ├── components/     # Componenti React
│   ├── App.jsx         # Componente principale
│   └── main.jsx        # Entry point
├── public/             # Asset statici
├── docker-compose.yml  # Configurazione Docker
├── Dockerfile.dev      # Dockerfile per sviluppo
├── Dockerfile          # Dockerfile per produzione
├── package.json        # Dipendenze
└── vite.config.js      # Configurazione Vite
```

## Porte

- **Porta esterna (host):** 3001
- **Porta interna (container):** 3001
- **Accesso:** http://localhost:3001

## Come avviare l'applicazione

### Con Docker (raccomandato)

```bash
cd bondvision-mockup

# Costruisci e avvia il container
docker-compose up --build

# L'app sarà disponibile su http://localhost:3001
```

### Senza Docker

```bash
cd bondvision-mockup

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# L'app sarà disponibile su http://localhost:3001
```

## Comandi disponibili

```bash
# Sviluppo con hot-reload
npm run dev

# Build per produzione
npm run build

# Anteprima build di produzione
npm run preview
```

## Stack Tecnologico

- **Framework:** React 18 + Vite
- **Styling:** CSS modules
- **Containerizzazione:** Docker + Docker Compose
- **Node.js:** v18-alpine
