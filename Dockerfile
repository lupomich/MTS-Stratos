FROM node:18-alpine

WORKDIR /app

# Install build dependencies for bcrypt (disable SSL verification for corporate firewall)
RUN wget --no-check-certificate -O /etc/apk/keys/alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub https://alpinelinux.org/keys/alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub || true && \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/main" > /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/community" >> /etc/apk/repositories && \
    apk add --no-cache --allow-untrusted python3 make g++

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze (disabilita verifica SSL per ambienti con proxy/firewall)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false && npm install --omit=dev

# Copia il resto dell'applicazione
COPY server.js ./
COPY public ./public
COPY config ./config
COPY middleware ./middleware
COPY routes ./routes

# Espone la porta
EXPOSE 3000

# Comando per avviare il server
CMD ["node", "server.js"]
