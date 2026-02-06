# Hello App

Semplice applicazione web con server Node.js containerizzato.

## Struttura del progetto

```
.
├── server.js          # Server Express
├── public/
│   └── index.html     # Client HTML
├── package.json       # Dipendenze Node.js
├── Dockerfile         # Configurazione Docker
└── docker-compose.yml # Orchestrazione Docker
```

## Come avviare l'applicazione

### Con Docker (raccomandato)

```bash
# Costruisci e avvia il container
docker-compose up --build

# L'app sarà disponibile su http://localhost:3000
```

### Senza Docker

```bash
# Installa le dipendenze
npm install

# Avvia il server
npm start

# L'app sarà disponibile su http://localhost:3000
```

## Utilizzo

1. Apri il browser su http://localhost:3000
2. Inserisci il tuo nome nel campo di testo
3. Premi OK o Enter
4. Il server risponderà con "Hello [nome]"
