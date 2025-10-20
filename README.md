# BetAware API

Uma API completa para gerenciamento de apostas esportivas desenvolvida em Node.js com Express.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Exemplos de Uso](#exemplos-de-uso)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

A BetAware API é uma solução robusta para gerenciamento de apostas esportivas que oferece:

- Sistema completo de autenticação JWT
- Gerenciamento de usuários
- CRUD de apostas
- Filtros por período
- Validação de dados
- Segurança com Helmet e CORS
- Documentação Swagger

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Variáveis de ambiente
- **Swagger** - Documentação da API

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd BetAwareNodeAPI
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
JWT_SECRET=seu-jwt-secret-aqui
NODE_ENV=development
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | 3000 |
| `JWT_SECRET` | Chave secreta para JWT | betaware-secret-key-2024 |
| `NODE_ENV` | Ambiente de execução | development |

## 🎮 Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

A API estará disponível em `http://localhost:3000`

## 📚 Endpoints da API

### Informações Gerais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Informações da API |
| GET | `/api/v1/health` | Health check |

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/v1/auth/login` | Login do usuário | ❌ |
| POST | `/api/v1/auth/register` | Registro de usuário | ❌ |

### Apostas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/v1/apostas` | Criar aposta | ✅ |
| GET | `/api/v1/apostas` | Listar apostas do usuário | ✅ |
| GET | `/api/v1/apostas/periodo` | Apostas por período | ❌ |
| GET | `/api/v1/apostas/usuario/periodo` | Apostas do usuário por período | ✅ |

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer <seu-token-jwt>
```

## 💡 Exemplos de Uso

### 1. Registro de Usuário

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@email.com",
    "password": "senha123",
    "name": "Nome do Usuário"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@email.com",
    "password": "senha123"
  }'
```

### 3. Criar Aposta

```bash
curl -X POST http://localhost:3000/api/v1/apostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "categoria": "Futebol",
    "jogo": "Flamengo vs Palmeiras",
    "valor": 50.00,
    "resultado": "PENDENTE"
  }'
```

### 4. Listar Apostas

```bash
curl -X GET http://localhost:3000/api/v1/apostas \
  -H "Authorization: Bearer <seu-token>"
```

### 5. Apostas por Período

```bash
curl -X GET "http://localhost:3000/api/v1/apostas/periodo?inicio=2024-01-01T00:00:00.000Z&fim=2024-12-31T23:59:59.999Z"
```

## 📊 Estrutura de Dados

### Usuário
```json
{
  "id": 1,
  "username": "usuario@email.com",
  "email": "usuario@email.com",
  "name": "Nome do Usuário",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Aposta
```json
{
  "id": 1,
  "username": "usuario@email.com",
  "categoria": "Futebol",
  "jogo": "Flamengo vs Palmeiras",
  "valor": 50.00,
  "resultado": "PENDENTE",
  "data": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Resultados Possíveis
- `PENDENTE` - Aposta aguardando resultado
- `GANHOU` - Aposta vencedora
- `PERDEU` - Aposta perdedora
- `CANCELADA` - Aposta cancelada

## 🚀 Deploy

### Render.com

O projeto está configurado para deploy no Render.com através do arquivo `render.yaml`:

```yaml
services:
  - type: web
    name: BetAwareNodeAPI
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### Passos para Deploy:

1. Conecte seu repositório ao Render
2. Configure as variáveis de ambiente
3. Faça o deploy automático

## 📝 Validações

A API implementa validações rigorosas:

- **Email**: Formato válido obrigatório
- **Senha**: Mínimo 6 caracteres
- **Nome**: Campo obrigatório
- **Valor da Aposta**: Deve ser positivo
- **Resultado**: Apenas valores permitidos
- **Datas**: Formato ISO8601

## 🛡️ Segurança

- Senhas hasheadas com bcrypt
- Headers de segurança com Helmet
- CORS configurado
- Validação de entrada em todos os endpoints
- Tokens JWT com expiração

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
npm start      # Inicia o servidor em produção
npm run dev    # Inicia o servidor em desenvolvimento com nodemon
```

### Estrutura do Projeto

```
BetAwareNodeAPI/
├── index.js           # Arquivo principal da aplicação
├── package.json       # Dependências e scripts
├── render.yaml        # Configuração de deploy
├── .gitignore        # Arquivos ignorados pelo Git
├── .env              # Variáveis de ambiente (não commitado)
└── README.md         # Documentação
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através dos issues do GitHub.

---

⭐ **Desenvolvido com ❤️ para gerenciamento de apostas esportivas**