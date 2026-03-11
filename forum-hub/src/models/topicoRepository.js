const { v4: uuidv4 } = require('uuid');

const STATUS = ['ABERTO', 'RESPONDIDO', 'FECHADO', 'NAO_RESPONDIDO'];

let topicos = [
  {
    id: '1',
    titulo: 'Como usar Spring Security com JWT?',
    mensagem: 'Preciso implementar autenticação JWT no meu projeto Spring Boot 3. Como faço?',
    status: 'ABERTO',
    autorId: '2',
    cursoId: '1',
    criadoEm: new Date('2024-01-10').toISOString(),
    atualizadoEm: new Date('2024-01-10').toISOString()
  },
  {
    id: '2',
    titulo: 'Diferença entre useState e useReducer no React',
    mensagem: 'Quando devo usar useReducer ao invés de useState? Quais são as vantagens?',
    status: 'RESPONDIDO',
    autorId: '2',
    cursoId: '2',
    criadoEm: new Date('2024-01-12').toISOString(),
    atualizadoEm: new Date('2024-01-13').toISOString()
  }
];

module.exports = {
  STATUS,
  findAll: ({ page = 1, size = 10, cursoId, status } = {}) => {
    let lista = [...topicos];
    if (cursoId) lista = lista.filter(t => t.cursoId === cursoId);
    if (status) lista = lista.filter(t => t.status === status.toUpperCase());
    lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    const total = lista.length;
    const start = (page - 1) * size;
    return {
      content: lista.slice(start, start + size),
      totalElements: total,
      totalPages: Math.ceil(total / size),
      page,
      size
    };
  },
  findById: (id) => topicos.find(t => t.id === id),
  create: ({ titulo, mensagem, autorId, cursoId }) => {
    const novo = {
      id: uuidv4(),
      titulo,
      mensagem,
      status: 'ABERTO',
      autorId,
      cursoId,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    topicos.push(novo);
    return novo;
  },
  update: (id, dados) => {
    const idx = topicos.findIndex(t => t.id === id);
    if (idx === -1) return null;
    topicos[idx] = {
      ...topicos[idx],
      ...dados,
      atualizadoEm: new Date().toISOString()
    };
    return topicos[idx];
  },
  delete: (id) => {
    const idx = topicos.findIndex(t => t.id === id);
    if (idx === -1) return false;
    topicos.splice(idx, 1);
    return true;
  },
  existsByTituloAndMensagem: (titulo, mensagem, excludeId = null) =>
    topicos.some(t => t.titulo === titulo && t.mensagem === mensagem && t.id !== excludeId),
  findByAutorId: (autorId) => topicos.filter(t => t.autorId === autorId),
  _reset: (data) => { topicos = data ?? []; }
};
