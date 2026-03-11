const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ── Banco em memória (substitua por ORM/DB real em produção) ──
let usuarios = [
  {
    id: '1',
    nome: 'Admin Forum Hub',
    email: 'admin@forumhub.com',
    // senha: "Forum@123" com bcrypt
    senha: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    perfil: 'ADMIN',
    ativo: true,
    criadoEm: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    nome: 'Estudante Alura',
    email: 'estudante@forumhub.com',
    // senha: "Alura@123" com bcrypt
    senha: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    perfil: 'USUARIO',
    ativo: true,
    criadoEm: new Date('2024-01-02').toISOString()
  }
];

module.exports = {
  findAll: () => usuarios.filter(u => u.ativo),
  findById: (id) => usuarios.find(u => u.id === id && u.ativo),
  findByEmail: (email) => usuarios.find(u => u.email === email),
  create: ({ nome, email, senha, perfil = 'USUARIO' }) => {
    const hash = bcrypt.hashSync(senha, 10);
    const novo = {
      id: uuidv4(),
      nome,
      email,
      senha: hash,
      perfil,
      ativo: true,
      criadoEm: new Date().toISOString()
    };
    usuarios.push(novo);
    return novo;
  },
  update: (id, dados) => {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx === -1) return null;
    if (dados.senha) dados.senha = bcrypt.hashSync(dados.senha, 10);
    usuarios[idx] = { ...usuarios[idx], ...dados };
    return usuarios[idx];
  },
  existsByEmail: (email, excludeId = null) =>
    usuarios.some(u => u.email === email && u.id !== excludeId),
  _reset: (data) => { usuarios = data ?? []; }
};
