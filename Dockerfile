# Use Node.js 18 LTS
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY index.js ./

# Expor porta (Cloud Run usa PORT env var)
EXPOSE 8080

# Definir variável de ambiente para produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "index.js"]