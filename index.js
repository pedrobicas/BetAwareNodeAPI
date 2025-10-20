const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'betaware-secret-key-2024';

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BetAware API',
      version: '2.0.0',
      description: 'API completa para gerenciamento de apostas esportivas',
      contact: {
        name: 'BetAware Team',
        email: 'contato@betaware.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'joao@email.com' },
            email: { type: 'string', example: 'joao@email.com' },
            name: { type: 'string', example: 'João Silva' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Bet: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'joao@email.com' },
            categoria: { type: 'string', example: 'Futebol' },
            jogo: { type: 'string', example: 'Flamengo vs Palmeiras' },
            valor: { type: 'number', format: 'float', example: 50.00 },
            resultado: { 
              type: 'string', 
              enum: ['PENDENTE', 'GANHOU', 'PERDEU', 'CANCELADA'],
              example: 'PENDENTE'
            },
            data: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'joao@email.com' },
            password: { type: 'string', minLength: 6, example: 'password123' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'joao@email.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            name: { type: 'string', example: 'João Silva' }
          }
        },
        BetRequest: {
          type: 'object',
          required: ['categoria', 'jogo', 'valor', 'resultado'],
          properties: {
            categoria: { type: 'string', example: 'Futebol' },
            jogo: { type: 'string', example: 'Flamengo vs Palmeiras' },
            valor: { type: 'number', format: 'float', minimum: 0.01, example: 50.00 },
            resultado: { 
              type: 'string', 
              enum: ['PENDENTE', 'GANHOU', 'PERDEU', 'CANCELADA'],
              example: 'PENDENTE'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  },
  apis: ['./index.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informações da API
 *     description: Retorna informações gerais sobre a API e seus endpoints
 *     tags: [Informações]
 *     responses:
 *       200:
 *         description: Informações da API retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "BetAware API - Node.js Completa"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 status:
 *                   type: string
 *                   example: "running"
 *                 endpoints:
 *                   type: object
 */
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
      health: 'GET /api/v1/health',
      docs: 'GET /api-docs'
    }
  });
});

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check da API
 *     description: Verifica se a API está funcionando corretamente
 *     tags: [Informações]
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "API está online"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 */
// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'API está online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// AUTHENTICATION ENDPOINTS
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
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

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro de usuário
 *     description: Registra um novo usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuário registrado com sucesso"
 *       400:
 *         description: Email já cadastrado ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
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
/**
 * @swagger
 * /api/v1/apostas:
 *   post:
 *     summary: Criar nova aposta
 *     description: Cria uma nova aposta para o usuário autenticado
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BetRequest'
 *     responses:
 *       201:
 *         description: Aposta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Bet'
 *                 message:
 *                   type: string
 *                   example: "Aposta criada com sucesso"
 *       401:
 *         description: Token não fornecido ou inválido
 *       400:
 *         description: Dados inválidos
 *   get:
 *     summary: Listar apostas do usuário
 *     description: Retorna todas as apostas do usuário autenticado
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de apostas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bet'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Token não fornecido ou inválido
 */
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

/**
 * @swagger
 * /api/v1/apostas/periodo:
 *   get:
 *     summary: Listar apostas por período
 *     description: Retorna todas as apostas dentro de um período específico
 *     tags: [Apostas]
 *     parameters:
 *       - in: query
 *         name: inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de início do período (ISO8601)
 *         example: "2024-01-01T00:00:00.000Z"
 *       - in: query
 *         name: fim
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de fim do período (ISO8601)
 *         example: "2024-12-31T23:59:59.999Z"
 *     responses:
 *       200:
 *         description: Lista de apostas por período retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bet'
 *                 total:
 *                   type: integer
 *                   example: 10
 *                 periodo:
 *                   type: object
 *                   properties:
 *                     inicio:
 *                       type: string
 *                       format: date-time
 *                     fim:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datas inválidas
 */
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

/**
 * @swagger
 * /api/v1/apostas/usuario/periodo:
 *   get:
 *     summary: Listar apostas do usuário por período
 *     description: Retorna todas as apostas do usuário autenticado dentro de um período específico
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de início do período (ISO8601)
 *         example: "2024-01-01T00:00:00.000Z"
 *       - in: query
 *         name: fim
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de fim do período (ISO8601)
 *         example: "2024-12-31T23:59:59.999Z"
 *     responses:
 *       200:
 *         description: Lista de apostas do usuário por período retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bet'
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 periodo:
 *                   type: object
 *                   properties:
 *                     inicio:
 *                       type: string
 *                       format: date-time
 *                     fim:
 *                       type: string
 *                       format: date-time
 *                 usuario:
 *                   type: string
 *                   example: "joao@email.com"
 *       401:
 *         description: Token não fornecido ou inválido
 *       400:
 *         description: Datas inválidas
 */
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
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`🎯 Apostas: http://localhost:${PORT}/api/v1/apostas`);
});

module.exports = app;