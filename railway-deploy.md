# Deploy da API BetAware no Railway

## Por que Railway?
- ✅ **Plano gratuito**: $5 de crédito mensal (suficiente para desenvolvimento)
- ✅ **Deploy automático**: Conecta direto com GitHub
- ✅ **Sem configuração complexa**: Deploy em 1 clique
- ✅ **Suporte nativo**: Node.js, Docker, variáveis de ambiente

## Passos para Deploy

### 1. Criar conta no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Conecte seu repositório

### 2. Configurar variáveis de ambiente
No painel do Railway, adicione:
```
NODE_ENV=production
PORT=3000
```

### 3. Adicionar Service Account
1. Copie o conteúdo do arquivo `betaware-app-firebase-adminsdk-fbsvc-11ebb763b0.json`
2. No Railway, adicione como variável de ambiente:
   - Nome: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Valor: Cole todo o JSON

### 4. Deploy automático
- Railway detecta automaticamente que é uma aplicação Node.js
- Executa `npm install` e `npm start` automaticamente
- Deploy acontece a cada push no GitHub

## Vantagens
- **Gratuito para desenvolvimento**
- **Deploy automático via GitHub**
- **SSL/HTTPS automático**
- **Logs em tempo real**
- **Escalabilidade automática**

## URL da API
Após o deploy: `https://betaware-api-production.up.railway.app`

## Alternativa: Render.com
Se preferir o Render.com:
1. Conecte o repositório GitHub
2. Use o arquivo `render.yaml` já criado
3. Deploy automático configurado