FROM node:18-alpine

WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze (disabilita verifica SSL per ambienti con proxy/firewall)
RUN npm config set strict-ssl false && npm install --omit=dev

# Copia il resto dell'applicazione
COPY server.js ./
COPY public ./public

# Espone la porta
EXPOSE 3000

# Comando per avviare il server
CMD ["node", "server.js"]
