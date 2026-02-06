# Test2 - Workspace Multi-Progetto

Workspace contenente diverse applicazioni containerizzate.

## Progetti nel workspace

### 1. Hello App (porta 3000)
Semplice applicazione web con server Node.js containerizzato.

### 2. BondVision Digital (porta 3002)
Applicazione MTS BondVision Trading Platform - Versione React moderna.
- **URL:** http://localhost:3002
- **Tecnologia:** React 18 + Vite
- **Documentazione:** [bondvision-digital/README.md](bondvision-digital/README.md)

### 3. BondVision Mockup (porta 3001)
Applicazione MTS BondVision Trading Platform - Versione mockup/prototipo.
- **URL:** http://localhost:3001
- **Tecnologia:** React 18 + Vite
- **Documentazione:** [bondvision-mockup/README.md](bondvision-mockup/README.md)

### 4. BondVision Static
Versione statica dell'applicazione BondVision.

## Struttura del progetto

```
.
├── server.js                 # Hello App - Server Express
├── public/
│   └── index.html            # Hello App - Client HTML
├── package.json              # Hello App - Dipendenze Node.js
├── Dockerfile                # Hello App - Configurazione Docker
├── docker-compose.yml        # Hello App - Orchestrazione Docker
├── bondvision-digital/       # Progetto BondVision Digital (porta 3002)
├── bondvision-mockup/        # Progetto BondVision Mockup (porta 3001)
└── bondvision-static/        # Progetto BondVision Static
```

## Come avviare l'applicazione

### Hello App (porta 3000)

#### Con Docker (raccomandato)

```bash
# Costruisci e avvia il container
docker-compose up --build

# L'app sarà disponibile su http://localhost:3000
```

#### Senza Docker

```bash
# Installa le dipendenze
npm install

# Avvia il server
npm start

# L'app sarà disponibile su http://localhost:3000
```

### BondVision Digital (porta 3002)

```bash
cd bondvision-digital
docker-compose up --build

# L'app sarà disponibile su http://localhost:3002
```

Vedi [bondvision-digital/README.md](bondvision-digital/README.md) per maggiori dettagli.

### BondVision Mockup (porta 3001)

```bash
cd bondvision-mockup
docker-compose up --build

# L'app sarà disponibile su http://localhost:3001
```

Vedi [bondvision-mockup/README.md](bondvision-mockup/README.md) per maggiori dettagli.

## Utilizzo

### Hello App
1. Apri il browser su http://localhost:3000
2. Inserisci il tuo nome nel campo di testo
3. Premi OK o Enter
4. Il server risponderà con "Hello [nome]"

### BondVision Digital
1. Apri il browser su http://localhost:3002
2. Interfaccia completa della piattaforma di trading MTS BondVision

### BondVision Mockup
1. Apri il browser su http://localhost:3001
2. Versione prototipo della piattaforma di trading MTS BondVision

## Riepilogo Porte

| Applicazione | Porta | URL |
|--------------|-------|-----|
| Hello App | 3000 | http://localhost:3000 |
| BondVision Mockup | 3001 | http://localhost:3001 |
| BondVision Digital | 3002 | http://localhost:3002 |
