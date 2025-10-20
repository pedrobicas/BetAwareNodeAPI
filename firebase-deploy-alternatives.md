# Alternativas para Deploy no Plano Spark (Gratuito)

## Problema
O Firebase Functions requer plano Blaze para deploy em produção, mas você quer manter o plano Spark gratuito.

## Soluções Alternativas

### 1. Firebase Hosting + Netlify/Vercel Functions
- Deploy do frontend no Firebase Hosting (gratuito)
- API hospedada em Netlify ou Vercel (planos gratuitos generosos)
- Integração com Firestore ainda funciona

### 2. Google Cloud Run (Recomendado)
- Container da API no Cloud Run
- Plano gratuito: 2 milhões de requests/mês
- Integração nativa com Firebase/Firestore
- Escalabilidade automática

### 3. Railway/Render
- Plataformas com planos gratuitos
- Deploy direto do código Node.js
- Integração com Firebase via SDK

### 4. Heroku (Limitado)
- Plano gratuito descontinuado, mas ainda tem opções baratas
- Fácil deploy de aplicações Node.js

## Recomendação: Google Cloud Run

### Vantagens:
- Mesmo ecossistema do Firebase
- Plano gratuito generoso
- Escalabilidade automática
- Integração perfeita com Firestore

### Como implementar:
1. Criar Dockerfile para a aplicação
2. Deploy no Google Cloud Run
3. Configurar variáveis de ambiente
4. Conectar com Firestore usando service account

## Próximos Passos
Escolha uma das alternativas e podemos implementar a solução.