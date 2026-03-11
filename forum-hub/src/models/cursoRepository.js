const { v4: uuidv4 } = require('uuid');

const CATEGORIAS = ['PROGRAMACAO', 'FRONTEND', 'BACKEND', 'DEVOPS', 'MOBILE', 'BANCO_DE_DADOS', 'ARQUITETURA', 'OUTROS'];

let cursos = [
  {
    id: '1',
    nome: 'Spring Boot 3',
    categoria: 'BACKEND',
    criadoEm: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    nome: 'React com TypeScript',
    categoria: 'FRONTEND',
    criadoEm: new Date('2024-01-01').toISOString()
  },
  {
    id: '3',
    nome: 'Node.js com Express',
    categoria: 'BACKEND',
    criadoEm: new Date('2024-01-01').toISOString()
  }
];

module.exports = {
  CATEGORIAS,
  findAll: () => [...cursos],
  findById: (id) => cursos.find(c => c.id === id),
  create: ({ nome, categoria }) => {
    const novo = {
      id: uuidv4(),
      nome,
      categoria: categoria.toUpperCase(),
      criadoEm: new Date().toISOString()
    };
    cursos.push(novo);
    return novo;
  },
  _reset: (data) => { cursos = data ?? []; }
};
