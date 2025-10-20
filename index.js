const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dados em memória (simulando banco de dados)
let users = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', createdAt: new Date() },
  { id: 2, name: 'Maria Santos', email: 'maria@email.com', createdAt: new Date() }
];

let bets = [
  { 
    id: 1, 
    userId: 1, 
    description: 'Flamengo vs Palmeiras', 
    amount: 50.00, 
    odds: 2.5, 
    status: 'pending',
    createdAt: new Date() 
  },
  { 
    id: 2, 
    userId: 2, 
    description: 'Brasil vs Argentina', 
    amount: 100.00, 
    odds: 1.8, 
    status: 'won',
    createdAt: new Date() 
  }
];

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'BetAware API - Node.js',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      users: '/api/users',
      bets: '/api/bets',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// USERS ENDPOINTS
// GET - Listar todos os usuários
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    total: users.length
  });
});

// GET - Buscar usuário por ID
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// POST - Criar novo usuário
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome e email são obrigatórios'
    });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    data: newUser,
    message: 'Usuário criado com sucesso'
  });
});

// PUT - Atualizar usuário
app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    updatedAt: new Date()
  };
  
  res.json({
    success: true,
    data: users[userIndex],
    message: 'Usuário atualizado com sucesso'
  });
});

// DELETE - Deletar usuário
app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }
  
  users.splice(userIndex, 1);
  
  res.json({
    success: true,
    message: 'Usuário deletado com sucesso'
  });
});

// BETS ENDPOINTS
// GET - Listar todas as apostas
app.get('/api/bets', (req, res) => {
  const { userId, status } = req.query;
  let filteredBets = bets;
  
  if (userId) {
    filteredBets = filteredBets.filter(bet => bet.userId === parseInt(userId));
  }
  
  if (status) {
    filteredBets = filteredBets.filter(bet => bet.status === status);
  }
  
  res.json({
    success: true,
    data: filteredBets,
    total: filteredBets.length
  });
});

// GET - Buscar aposta por ID
app.get('/api/bets/:id', (req, res) => {
  const betId = parseInt(req.params.id);
  const bet = bets.find(b => b.id === betId);
  
  if (!bet) {
    return res.status(404).json({
      success: false,
      message: 'Aposta não encontrada'
    });
  }
  
  res.json({
    success: true,
    data: bet
  });
});

// POST - Criar nova aposta
app.post('/api/bets', (req, res) => {
  const { userId, description, amount, odds } = req.body;
  
  if (!userId || !description || !amount || !odds) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios'
    });
  }
  
  const newBet = {
    id: bets.length + 1,
    userId: parseInt(userId),
    description,
    amount: parseFloat(amount),
    odds: parseFloat(odds),
    status: 'pending',
    createdAt: new Date()
  };
  
  bets.push(newBet);
  
  res.status(201).json({
    success: true,
    data: newBet,
    message: 'Aposta criada com sucesso'
  });
});

// PUT - Atualizar status da aposta
app.put('/api/bets/:id', (req, res) => {
  const betId = parseInt(req.params.id);
  const { status } = req.body;
  
  const betIndex = bets.findIndex(b => b.id === betId);
  
  if (betIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Aposta não encontrada'
    });
  }
  
  if (!['pending', 'won', 'lost'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status inválido. Use: pending, won ou lost'
    });
  }
  
  bets[betIndex] = {
    ...bets[betIndex],
    status,
    updatedAt: new Date()
  };
  
  res.json({
    success: true,
    data: bets[betIndex],
    message: 'Aposta atualizada com sucesso'
  });
});

// DELETE - Deletar aposta
app.delete('/api/bets/:id', (req, res) => {
  const betId = parseInt(req.params.id);
  const betIndex = bets.findIndex(b => b.id === betId);
  
  if (betIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Aposta não encontrada'
    });
  }
  
  bets.splice(betIndex, 1);
  
  res.json({
    success: true,
    message: 'Aposta deletada com sucesso'
  });
});

// Middleware de erro 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 BetAware API rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;