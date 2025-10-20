# Deploy da API BetAware no Google Cloud Run

## Pré-requisitos
1. Google Cloud CLI instalado
2. Projeto Firebase configurado
3. Service Account do Firebase

## Passos para Deploy

### 1. Instalar Google Cloud CLI
```bash
# Windows (via Chocolatey)
choco install gcloudsdk

# Ou baixar do site oficial
# https://cloud.google.com/sdk/docs/install
```

### 2. Autenticar no Google Cloud
```bash
gcloud auth login
gcloud config set project betaware-app
```

### 3. Habilitar APIs necessárias
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### 4. Build e Deploy
```bash
# Build da imagem
gcloud builds submit --tag gcr.io/betaware-app/betaware-api

# Deploy no Cloud Run
gcloud run deploy betaware-api \
  --image gcr.io/betaware-app/betaware-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### 5. Configurar Service Account (Importante!)
```bash
# Criar service account para Cloud Run
gcloud iam service-accounts create betaware-api-runner

# Dar permissões para Firestore
gcloud projects add-iam-policy-binding betaware-app \
  --member="serviceAccount:betaware-api-runner@betaware-app.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Atualizar o serviço para usar a service account
gcloud run services update betaware-api \
  --service-account=betaware-api-runner@betaware-app.iam.gserviceaccount.com \
  --region=us-central1
```

## Vantagens do Cloud Run
- ✅ **Gratuito**: 2 milhões de requests/mês
- ✅ **Escalabilidade**: Escala automaticamente de 0 a N instâncias
- ✅ **Integração**: Mesmo ecossistema do Firebase
- ✅ **Performance**: Cold start rápido
- ✅ **Segurança**: Integração nativa com IAM

## URL da API
Após o deploy, sua API estará disponível em:
`https://betaware-api-[hash]-uc.a.run.app`

## Testando a API
```bash
# Health check
curl https://betaware-api-[hash]-uc.a.run.app/health

# Registro de usuário
curl -X POST https://betaware-api-[hash]-uc.a.run.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "nome": "Test User",
    "cpf": "12345678901",
    "email": "test@example.com",
    "senha": "123456"
  }'
```

## Monitoramento
- Console Cloud Run: https://console.cloud.google.com/run
- Logs: `gcloud run services logs tail betaware-api --region=us-central1`
- Métricas: Disponíveis no console do Google Cloud