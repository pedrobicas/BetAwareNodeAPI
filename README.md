# BetAware Node.js API

API Firebase para o aplicativo móvel BetAware desenvolvida em Node.js com Express.

## 🚀 Deploy no Render.com

Esta API está configurada para deploy automático no Render.com.

### Funcionalidades

- ✅ **Autenticação de usuários** (registro e login)
- ✅ **Integração com Firebase Firestore**
- ✅ **Middleware de autenticação JWT**
- ✅ **Validação de dados**
- ✅ **CORS configurado**
- ✅ **Health check endpoint**

### Endpoints Disponíveis

#### Health Check
```
GET /health
```

#### Autenticação
```
POST /auth/register - Registro de usuário
POST /auth/login - Login de usuário
```

#### Usuários (Protegido)
```
GET /users/profile - Perfil do usuário autenticado
PUT /users/profile - Atualizar perfil
```

### Desenvolvimento Local

1. **Instalar dependências:**
```bash
npm install
```

2. **Executar emuladores Firebase:**
```bash
npm run serve
```

3. **Executar em modo desenvolvimento:**
```bash
npm run dev
```

### Variáveis de Ambiente (Render.com)

Configure no painel do Render:

- `NODE_ENV=production`
- `PORT=10000`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - JSON completo do service account

### Tecnologias

- Node.js 18
- Express.js
- Firebase Admin SDK
- JWT (jsonwebtoken)
- bcryptjs
- CORS

### Estrutura do Projeto

```
├── index.js              # Arquivo principal da API
├── package.json          # Dependências e scripts
├── render.yaml           # Configuração do Render.com
├── Dockerfile           # Container Docker (opcional)
└── README.md            # Este arquivo
```

### Deploy Automático

O deploy acontece automaticamente quando você faz push para o branch principal do GitHub conectado ao Render.com.

## 🚀 Deploy para Produção

```bash
npm run deploy
```

### URL da API em Produção
```
https://us-central1-betaware-app.cloudfunctions.net/api
```

## 📚 Endpoints da API

### 🔐 Autenticação

#### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "username": "usuario1",
  "nome": "João Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "senha": "senha123",
  "cep": "12345678",
  "endereco": "Rua Exemplo, 123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### 👤 Usuários

#### Obter Perfil
```http
GET /usuarios/perfil
Authorization: Bearer {token}
```

#### Listar Usuários (Admin)
```http
GET /usuarios
Authorization: Bearer {token}
```

### 🎲 Apostas

#### Criar Aposta
```http
POST /apostas
Authorization: Bearer {token}
Content-Type: application/json

{
  "categoria": "Futebol",
  "jogo": "Flamengo x Vasco",
  "valor": 100.50,
  "resultado": "PENDENTE"
}
```

#### Listar Minhas Apostas
```http
GET /apostas
Authorization: Bearer {token}
```

#### Listar Todas as Apostas (Admin)
```http
GET /apostas/todas
Authorization: Bearer {token}
```

#### Atualizar Aposta
```http
PUT /apostas/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "resultado": "GANHOU"
}
```

#### Deletar Aposta
```http
DELETE /apostas/{id}
Authorization: Bearer {token}
```

### 🏥 Health Check
```http
GET /health
```

## 🔑 Autenticação

A API suporta dois tipos de tokens:

1. **JWT Token** (gerado pela própria API)
2. **Firebase ID Token** (gerado pelo Firebase Auth)

### Formato do Header
```
Authorization: Bearer {token}
```

## 🗄️ Estrutura do Firestore

### Coleção `usuarios`
```javascript
{
  uid: "firebase-uid",
  username: "usuario1",
  nome: "João Silva",
  cpf: "12345678901",
  email: "joao@email.com",
  senha: "hash-bcrypt",
  cep: "12345678",
  endereco: "Rua Exemplo, 123",
  perfil: "USER", // ou "ADMIN"
  createdAt: timestamp
}
```

### Coleção `apostas`
```javascript
{
  categoria: "Futebol",
  jogo: "Flamengo x Vasco",
  valor: 100.50,
  resultado: "PENDENTE", // PENDENTE, GANHOU, PERDEU, CANCELADA
  usuarioUid: "firebase-uid",
  username: "usuario1",
  data: timestamp,
  createdAt: timestamp
}
```

## 🛡️ Segurança

- **Autenticação obrigatória** em todas as rotas (exceto auth e health)
- **Autorização por roles** (USER/ADMIN)
- **Validação de propriedade** (usuários só acessam seus dados)
- **Hash de senhas** com bcrypt
- **CORS configurado** para desenvolvimento e produção

## 🧪 Testando a API

### Com curl
```bash
# Health check
curl http://localhost:5001/betaware-app/us-central1/api/health

# Registrar usuário
curl -X POST http://localhost:5001/betaware-app/us-central1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"teste","nome":"Teste","email":"teste@email.com","senha":"123456","cpf":"12345678901"}'

# Login
curl -X POST http://localhost:5001/betaware-app/us-central1/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","senha":"123456"}'
```

## 🔧 Configuração para React Native

### Instalar dependências
```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

### Exemplo de uso
```javascript
import auth from '@react-native-firebase/auth';

// Login
const login = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const idToken = await userCredential.user.getIdToken();
    
    // Usar idToken para chamar a API
    const response = await fetch('https://us-central1-betaware-app.cloudfunctions.net/api/apostas', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const apostas = await response.json();
    return apostas;
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## 📝 Logs e Monitoramento

### Ver logs locais
```bash
# Logs das functions
firebase functions:log

# Logs em tempo real
firebase functions:log --follow
```

### Ver logs em produção
```bash
firebase functions:log --project betaware-app
```

## 🚨 Solução de Problemas

### Erro de CORS
- Verifique se o domínio está configurado no Firebase Console
- Para desenvolvimento, a API aceita qualquer origem

### Erro de autenticação
- Verifique se o token está sendo enviado corretamente
- Confirme se o usuário existe no Firebase Auth

### Erro de permissão
- Verifique as regras do Firestore
- Confirme se o usuário tem o perfil correto (USER/ADMIN)

## 🔄 Próximos Passos

1. **Configurar regras de segurança do Firestore**
2. **Implementar rate limiting**
3. **Adicionar logs estruturados**
4. **Configurar monitoramento**
5. **Implementar cache**
6. **Adicionar validação de dados mais robusta**