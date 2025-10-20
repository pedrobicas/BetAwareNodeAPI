const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'betaware-secret-key-2024';

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dados em memória (simulando banco de dados)
let users = [
  { 
    id: 1, 
    username: 'joao@email.com',
    email: 'joao@email.com', 
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'João Silva',
    createdAt: new Date() 
  },
  { 
    id: 2, 
    username: 'maria@email.com',
    email: 'maria@email.com', 
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Maria Santos',
    createdAt: new Date() 
  }
];

let bets = [
  { 
    id: 1, 
    username: 'joao@email.com',
    categoria: 'Futebol', 
    jogo: 'Flamengo vs Palmeiras', 
    valor: 50.00, 
    resultado: 'PENDENTE',
    data: new Date(),
    createdAt: new Date() 
  },
  { 
    id: 2, 
    username: 'maria@email.com',
    categoria: 'Futebol', 
    jogo: 'Brasil vs Argentina', 
    valor: 100.00, 
    resultado: 'GANHOU',
    data: new Date(),
    createdAt: new Date() 
  }
];

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'BetAware API - Node.js Completa',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login',
        register: 'POST /api/v1/auth/register'
      },
      apostas: {
        create: 'POST /api/v1/apostas',
        list: 'GET /api/v1/apostas',
        byPeriod: 'GET /api/v1/apostas/periodo',
        userByPeriod: 'GET /api/v1/apostas/usuario/periodo'
      },
      health: 'GET /api/v1/health'
    }
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'API está online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// AUTHENTICATION ENDPOINTS
// POST - Login
app.post('/api/v1/auth/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST - Register
app.post('/api/v1/auth/register', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: users.length + 1,
      username: email,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// APOSTAS ENDPOINTS
// POST - Criar aposta
app.post('/api/v1/apostas', authenticateToken, [
  body('categoria').notEmpty().withMessage('A categoria é obrigatória'),
  body('jogo').notEmpty().withMessage('O jogo é obrigatório'),
  body('valor').isFloat({ min: 0.01 }).withMessage('O valor deve ser positivo'),
  body('resultado').isIn(['PENDENTE', 'GANHOU', 'PERDEU', 'CANCELADA']).withMessage('Resultado inválido'),
  handleValidationErrors
], (req, res) => {
  try {
    const { categoria, jogo, valor, resultado } = req.body;
    
    const newBet = {
      id: bets.length + 1,
      username: req.user.username,
      categoria,
      jogo,
      valor: parseFloat(valor),
      resultado,
      data: new Date(),
      createdAt: new Date()
    };
    
    bets.push(newBet);
    
    res.status(201).json({
      success: true,
      data: newBet,
      message: 'Aposta criada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET - Listar apostas do usuário autenticado
app.get('/api/v1/apostas', authenticateToken, (req, res) => {
  try {
    const userBets = bets.filter(bet => bet.username === req.user.username);
    
    res.json({
      success: true,
      data: userBets,
      total: userBets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET - Listar apostas por período
app.get('/api/v1/apostas/periodo', [
  query('inicio').isISO8601().withMessage('Data de início inválida'),
  query('fim').isISO8601().withMessage('Data de fim inválida'),
  handleValidationErrors
], (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const startDate = new Date(inicio);
    const endDate = new Date(fim);
    
    const filteredBets = bets.filter(bet => {
      const betDate = new Date(bet.data);
      return betDate >= startDate && betDate <= endDate;
    });
    
    res.json({
      success: true,
      data: filteredBets,
      total: filteredBets.length,
      periodo: { inicio, fim }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET - Listar apostas do usuário por período
app.get('/api/v1/apostas/usuario/periodo', authenticateToken, [
  query('inicio').isISO8601().withMessage('Data de início inválida'),
  query('fim').isISO8601().withMessage('Data de fim inválida'),
  handleValidationErrors
], (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const startDate = new Date(inicio);
    const endDate = new Date(fim);
    
    const filteredBets = bets.filter(bet => {
      const betDate = new Date(bet.data);
      return bet.username === req.user.username && 
             betDate >= startDate && 
             betDate <= endDate;
    });
    
    res.json({
      success: true,
      data: filteredBets,
      total: filteredBets.length,
      periodo: { inicio, fim },
      usuario: req.user.username
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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
  console.log(`🚀 BetAware API Completa rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`🎯 Apostas: http://localhost:${PORT}/api/v1/apostas`);
});

module.exports = app;