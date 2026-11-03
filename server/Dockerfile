# ---------- Etapa de build ----------
# node:22-slim (Debian/glibc) para que bcrypt use su binario precompilado
FROM node:22-slim AS build
WORKDIR /app

# Copiar la config del workspace (root) y los package.json de cada workspace
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Instalar TODAS las dependencias (incluye devDeps para compilar)
RUN npm ci

# Copiar el código del server y compilar con tsc
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN npm run build -w server

# ---------- Etapa de runtime ----------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci --omit=dev

# Copiar el build del server
COPY --from=build /app/server/dist ./dist

# Marcar el build como ESM (evita el warning de Node sobre "type": "module")
RUN printf '{"type":"module"}\n' > ./dist/package.json

EXPOSE 3000
CMD ["node", "dist/index.js"]
