# Utilizar una imagen base de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo en la imagen
WORKDIR /

# Copiar el package.json y package-lock.json a la imagen
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN npm install --only=production

# Copiar el resto de los archivos de la aplicación a la imagen
COPY . ./

# Copiar el archivo .env a la imagen
COPY .env .env

# Reinstalar bcrypt para compilarlo en la arquitectura del contenedor
RUN npm uninstall bcrypt
RUN npm install bcrypt --only=production

# Exponer el puerto 6001 en la imagen
EXPOSE 6001

# Comando para ejecutar la aplicación al iniciar el contenedor
CMD ["node", "server.js"]

# docker build -t mi-tiendita-mx-CRUD .
# docker run -p 6001:6001 mi-tiendita-mx-CRUD