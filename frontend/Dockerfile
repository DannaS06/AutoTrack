# Imagen ligera de Node.js
FROM node:20-alpine

WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente de React
COPY . .

EXPOSE 5173

# Exponer Vite fuera del contenedor (--host)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]