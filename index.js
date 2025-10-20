const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Configurar Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Constantes
const JWT_SECRET = 'betaware-firebase-secret-key-2024';
const JWT_EXPIRATION = '24h';

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    // Verificar se é token Firebase ou JWT
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = { uid: decodedToken.uid, email: decodedToken.email };
      next();
    } catch (firebaseError) {
      // Se falhar com Firebase, tentar JWT
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
      } catch (jwtError) {
        return res.status(403).json({ error: 'Token inválido' });
      }
    }
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registrar usuário
app.post('/auth/register', async (req, res) => {
  try {
    const { username, nome, cpf, email, senha, cep, endereco } = req.body;

    // Validações básicas
    if (!username || !nome || !cpf || !email || !senha) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se usuário já existe
    const existingUser = await db.collection('usuarios').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const existingUsername = await db.collection('usuarios').where('username', '==', username).get();
    if (!existingUsername.empty) {
      return res.status(400).json({ error: 'Username já cadastrado' });
    }

    // Criar usuário no Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: senha,
      displayName: nome
    });

    // Hash da senha para salvar no Firestore
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Salvar dados do usuário no Firestore
    const userData = {
      uid: userRecord.uid,
      username,
      nome,
      cpf,
      email,
      senha: hashedPassword,
      cep: cep || '',
      endereco: endereco || '',
      perfil: 'USER',
      createdAt: new Date()
    };

    await db.collection('usuarios').doc(userRecord.uid).set(userData);

    // Gerar token JWT
    const token = jwt.sign(
      { uid: userRecord.uid, email, username, perfil: 'USER' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        uid: userRecord.uid,
        username,
        nome,
        email,
        perfil: 'USER'
      },
      token
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no Firestore
    const userQuery = await db.collection('usuarios').where('email', '==', email).get();
    
    if (userQuery.empty) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, userData.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        uid: userData.uid, 
        email: userData.email, 
        username: userData.username, 
        perfil: userData.perfil 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        uid: userData.uid,
        username: userData.username,
        nome: userData.nome,
        email: userData.email,
        perfil: userData.perfil
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE USUÁRIOS ====================

// Listar usuários (apenas admin)
app.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    if (req.user.perfil !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const usersSnapshot = await db.collection('usuarios').get();
    const users = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: userData.uid,
        username: userData.username,
        nome: userData.nome,
        email: userData.email,
        cpf: userData.cpf,
        perfil: userData.perfil
      });
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter perfil do usuário
app.get('/usuarios/perfil', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('usuarios').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();
    res.json({
      uid: userData.uid,
      username: userData.username,
      nome: userData.nome,
      email: userData.email,
      cpf: userData.cpf,
      cep: userData.cep,
      endereco: userData.endereco,
      perfil: userData.perfil
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE APOSTAS ====================

// Criar aposta
app.post('/apostas', authenticateToken, async (req, res) => {
  try {
    const { categoria, jogo, valor, resultado } = req.body;

    if (!categoria || !jogo || !valor) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const apostaData = {
      categoria,
      jogo,
      valor: parseFloat(valor),
      resultado: resultado || 'PENDENTE',
      usuarioUid: req.user.uid,
      username: req.user.username,
      data: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const apostaRef = await db.collection('apostas').add(apostaData);

    res.status(201).json({
      id: apostaRef.id,
      ...apostaData,
      data: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao criar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar apostas do usuário
app.get('/apostas', authenticateToken, async (req, res) => {
  try {
    const apostasSnapshot = await db.collection('apostas')
      .where('usuarioUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const apostas = [];
    apostasSnapshot.forEach(doc => {
      const apostaData = doc.data();
      apostas.push({
        id: doc.id,
        categoria: apostaData.categoria,
        jogo: apostaData.jogo,
        valor: apostaData.valor,
        resultado: apostaData.resultado,
        data: apostaData.data?.toDate?.()?.toISOString() || apostaData.data,
        username: apostaData.username
      });
    });

    res.json(apostas);
  } catch (error) {
    console.error('Erro ao listar apostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as apostas (apenas admin)
app.get('/apostas/todas', authenticateToken, async (req, res) => {
  try {
    if (req.user.perfil !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const apostasSnapshot = await db.collection('apostas')
      .orderBy('createdAt', 'desc')
      .get();

    const apostas = [];
    apostasSnapshot.forEach(doc => {
      const apostaData = doc.data();
      apostas.push({
        id: doc.id,
        categoria: apostaData.categoria,
        jogo: apostaData.jogo,
        valor: apostaData.valor,
        resultado: apostaData.resultado,
        data: apostaData.data?.toDate?.()?.toISOString() || apostaData.data,
        username: apostaData.username,
        usuarioUid: apostaData.usuarioUid
      });
    });

    res.json(apostas);
  } catch (error) {
    console.error('Erro ao listar todas as apostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar aposta
app.put('/apostas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, jogo, valor, resultado } = req.body;

    const apostaRef = db.collection('apostas').doc(id);
    const apostaDoc = await apostaRef.get();

    if (!apostaDoc.exists) {
      return res.status(404).json({ error: 'Aposta não encontrada' });
    }

    const apostaData = apostaDoc.data();

    // Verificar se o usuário é o dono da aposta ou admin
    if (apostaData.usuarioUid !== req.user.uid && req.user.perfil !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const updateData = {};
    if (categoria) updateData.categoria = categoria;
    if (jogo) updateData.jogo = jogo;
    if (valor) updateData.valor = parseFloat(valor);
    if (resultado) updateData.resultado = resultado;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await apostaRef.update(updateData);

    res.json({ message: 'Aposta atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar aposta
app.delete('/apostas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const apostaRef = db.collection('apostas').doc(id);
    const apostaDoc = await apostaRef.get();

    if (!apostaDoc.exists) {
      return res.status(404).json({ error: 'Aposta não encontrada' });
    }

    const apostaData = apostaDoc.data();

    // Verificar se o usuário é o dono da aposta ou admin
    if (apostaData.usuarioUid !== req.user.uid && req.user.perfil !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await apostaRef.delete();

    res.json({ message: 'Aposta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTA DE HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Firebase BetAware está online',
    timestamp: new Date().toISOString()
  });
});

// Configuração para diferentes ambientes
if (process.env.NODE_ENV === 'production' && !process.env.FUNCTIONS_EMULATOR) {
  // Modo Cloud Run - servidor standalone
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`API BetAware rodando na porta ${PORT}`);
  });
} else {
  // Modo Firebase Functions
  exports.api = functions.https.onRequest(app);
}