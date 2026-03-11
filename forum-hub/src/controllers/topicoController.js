const topicoRepository = require('../models/topicoRepository');
const usuarioRepository = require('../models/usuarioRepository');
const cursoRepository = require('../models/cursoRepository');
const respostaRepository = require('../models/respostaRepository');

// ── Projeções ─────────────────────────────────────────────────
const projecaoResumo = (topico) => {
  const autor = usuarioRepository.findById(topico.autorId);
  const curso = cursoRepository.findById(topico.cursoId);
  return {
    id: topico.id,
    titulo: topico.titulo,
    mensagem: topico.mensagem,
    status: topico.status,
    criadoEm: topico.criadoEm,
    autor: autor ? { id: autor.id, nome: autor.nome } : null,
    curso: curso ? { id: curso.id, nome: curso.nome } : null
  };
};

const projecaoDetalhe = (topico) => {
  const resumo = projecaoResumo(topico);
  const respostas = respostaRepository.findByTopicoId(topico.id).map(r => {
    const autor = usuarioRepository.findById(r.autorId);
    return {
      id: r.id,
      mensagem: r.mensagem,
      solucao: r.solucao,
      criadoEm: r.criadoEm,
      autor: autor ? { id: autor.id, nome: autor.nome } : null
    };
  });
  return { ...resumo, atualizadoEm: topico.atualizadoEm, respostas };
};

// ── Controllers ───────────────────────────────────────────────

/**
 * GET /topicos  — Lista todos os tópicos (paginado, com filtros)
 */
const listar = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const cursoId = req.query.cursoId;
  const status = req.query.status;

  if (status && !topicoRepository.STATUS.includes(status.toUpperCase())) {
    return res.status(400).json({
      erro: 'Status inválido',
      statusValidos: topicoRepository.STATUS
    });
  }

  const result = topicoRepository.findAll({ page, size, cursoId, status });
  res.json({
    content: result.content.map(projecaoResumo),
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    pageable: { page, size },
    first: page === 1,
    last: page >= result.totalPages
  });
};

/**
 * GET /topicos/:id  — Detalha um tópico com suas respostas
 */
const buscarPorId = (req, res) => {
  const topico = topicoRepository.findById(req.params.id);
  if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado' });
  res.json(projecaoDetalhe(topico));
};

/**
 * POST /topicos  — Cria novo tópico (requer auth)
 * Regra de negócio: não permite tópico duplicado (mesmo título + mensagem)
 */
const criar = (req, res) => {
  const { titulo, mensagem, cursoId } = req.body;
  const { usuarioLogado } = req;

  // Validar se o curso existe
  const curso = cursoRepository.findById(cursoId);
  if (!curso) {
    return res.status(404).json({ erro: 'Curso não encontrado' });
  }

  // Regra de negócio: não duplicar tópico com mesmo título E mensagem
  if (topicoRepository.existsByTituloAndMensagem(titulo, mensagem)) {
    return res.status(409).json({
      erro: 'Já existe um tópico com o mesmo título e mensagem'
    });
  }

  const salvo = topicoRepository.create({
    titulo,
    mensagem,
    autorId: usuarioLogado.id,
    cursoId
  });

  res.status(201).json(projecaoDetalhe(salvo));
};

/**
 * PUT /topicos/:id  — Atualiza tópico (somente autor ou ADMIN)
 */
const atualizar = (req, res) => {
  const { id } = req.params;
  const { usuarioLogado } = req;
  const { titulo, mensagem, status, cursoId } = req.body;

  const topico = topicoRepository.findById(id);
  if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado' });

  // Só o autor ou ADMIN podem editar
  if (topico.autorId !== usuarioLogado.id && usuarioLogado.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Você não tem permissão para editar este tópico' });
  }

  // Validar novo curso se informado
  if (cursoId) {
    const curso = cursoRepository.findById(cursoId);
    if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
  }

  // Verificar duplicidade se título ou mensagem mudarem
  const novoTitulo = titulo || topico.titulo;
  const novaMensagem = mensagem || topico.mensagem;
  if (topicoRepository.existsByTituloAndMensagem(novoTitulo, novaMensagem, id)) {
    return res.status(409).json({ erro: 'Já existe um tópico com o mesmo título e mensagem' });
  }

  const dados = {};
  if (titulo) dados.titulo = titulo;
  if (mensagem) dados.mensagem = mensagem;
  if (status) dados.status = status.toUpperCase();
  if (cursoId) dados.cursoId = cursoId;

  const atualizado = topicoRepository.update(id, dados);
  res.json(projecaoDetalhe(atualizado));
};

/**
 * DELETE /topicos/:id  — Exclui tópico (somente autor ou ADMIN)
 */
const excluir = (req, res) => {
  const { id } = req.params;
  const { usuarioLogado } = req;

  const topico = topicoRepository.findById(id);
  if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado' });

  if (topico.autorId !== usuarioLogado.id && usuarioLogado.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Você não tem permissão para excluir este tópico' });
  }

  topicoRepository.delete(id);
  res.status(204).send();
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
