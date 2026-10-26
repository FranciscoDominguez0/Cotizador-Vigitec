FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el código fuente
COPY src ./src
COPY public ./public

# Variables por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto interno
EXPOSE 3000

# Iniciar la aplicación
CMD ["node", "src/server.js"]
