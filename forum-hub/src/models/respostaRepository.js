const { v4: uuidv4 } = require('uuid');

let respostas = [
  {
    id: '1',
    mensagem: 'Para usar JWT no Spring Boot 3, adicione spring-boot-starter-security e configure a classe SecurityConfig.',
    topicoId: '1',
    autorId: '1',
    solucao: false,
    criadoEm: new Date('2024-01-11').toISOString(),
    atualizadoEm: new Date('2024-01-11').toISOString()
  }
];

module.exports = {
  findAll: () => [...respostas],
  findById: (id) => respostas.find(r => r.id === id),
  findByTopicoId: (topicoId) =>
    respostas
      .filter(r => r.topicoId === topicoId)
      .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm)),
  findByAutorId: (autorId) => respostas.filter(r => r.autorId === autorId),
  create: ({ mensagem, topicoId, autorId }) => {
    const nova = {
      id: uuidv4(),
      mensagem,
      topicoId,
      autorId,
      solucao: false,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    respostas.push(nova);
    return nova;
  },
  update: (id, dados) => {
    const idx = respostas.findIndex(r => r.id === id);
    if (idx === -1) return null;
    respostas[idx] = { ...respostas[idx], ...dados, atualizadoEm: new Date().toISOString() };
    return respostas[idx];
  },
  marcarComoSolucao: (id) => {
    const idx = respostas.findIndex(r => r.id === id);
    if (idx === -1) return null;
    // Desmarca outras soluções do mesmo tópico
    const topicoId = respostas[idx].topicoId;
    respostas.forEach((r, i) => { if (r.topicoId === topicoId) respostas[i].solucao = false; });
    respostas[idx].solucao = true;
    respostas[idx].atualizadoEm = new Date().toISOString();
    return respostas[idx];
  },
  delete: (id) => {
    const idx = respostas.findIndex(r => r.id === id);
    if (idx === -1) return false;
    respostas.splice(idx, 1);
    return true;
  },
  _reset: (data) => { respostas = data ?? []; }
};
