FROM node:20
WORKDIR /app
COPY package.json .
RUN apt-get update \
	&& apt-get install -y python3 make g++ \
	&& npm config set strict-ssl false \
	&& npm config set registry http://registry.npmjs.org/ \
	&& npm install \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
