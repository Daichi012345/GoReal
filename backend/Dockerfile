FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install -y netcat-openbsd

RUN chmod +x wait-for-it.sh

CMD ["./wait-for-it.sh", "db", "npm", "run", "dev"]
