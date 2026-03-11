const respostaRepository = require('../models/respostaRepository');
const topicoRepository = require('../models/topicoRepository');
const usuarioRepository = require('../models/usuarioRepository');

const projecaoResposta = (r) => {
  const autor = usuarioRepository.findById(r.autorId);
  return {
    id: r.id,
    mensagem: r.mensagem,
    solucao: r.solucao,
    topicoId: r.topicoId,
    criadoEm: r.criadoEm,
    atualizadoEm: r.atualizadoEm,
    autor: autor ? { id: autor.id, nome: autor.nome } : null
  };
};

/**
 * GET /respostas/topicos/:topicoId  — Lista respostas de um tópico
 */
const listarPorTopico = (req, res) => {
  const topico = topicoRepository.findById(req.params.topicoId);
  if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado' });

  const respostas = respostaRepository.findByTopicoId(req.params.topicoId);
  res.json({ content: respostas.map(projecaoResposta), totalElements: respostas.length });
};

/**
 * GET /respostas/usuarios/:usuarioId  — Lista respostas de um usuário
 */
const listarPorUsuario = (req, res) => {
  const usuario = usuarioRepository.findById(req.params.usuarioId);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const respostas = respostaRepository.findByAutorId(req.params.usuarioId);
  res.json({ content: respostas.map(projecaoResposta), totalElements: respostas.length });
};

/**
 * POST /respostas  — Cria nova resposta (requer auth)
 * Regra: tópico não pode estar fechado
 */
const criar = (req, res) => {
  const { mensagem, topicoId } = req.body;
  const { usuarioLogado } = req;

  const topico = topicoRepository.findById(topicoId);
  if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado' });

  if (topico.status === 'FECHADO') {
    return res.status(422).json({ erro: 'Não é possível responder a um tópico fechado' });
  }

  const salva = respostaRepository.create({ mensagem, topicoId, autorId: usuarioLogado.id });

  // Atualiza status do tópico para RESPONDIDO se estava ABERTO
  if (topico.status === 'ABERTO' || topico.status === 'NAO_RESPONDIDO') {
    topicoRepository.update(topicoId, { status: 'RESPONDIDO' });
  }

  res.status(201).json(projecaoResposta(salva));
};

/**
 * PUT /respostas/:id  — Atualiza resposta (somente autor ou ADMIN)
 */
const atualizar = (req, res) => {
  const { id } = req.params;
  const { usuarioLogado } = req;

  const resposta = respostaRepository.findById(id);
  if (!resposta) return res.status(404).json({ erro: 'Resposta não encontrada' });

  if (resposta.autorId !== usuarioLogado.id && usuarioLogado.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Você não tem permissão para editar esta resposta' });
  }

  const atualizada = respostaRepository.update(id, { mensagem: req.body.mensagem });
  res.json(projecaoResposta(atualizada));
};

/**
 * PUT /respostas/:id/solucao  — Marca resposta como solução (somente autor do tópico ou ADMIN)
 */
const marcarSolucao = (req, res) => {
  const { id } = req.params;
  const { usuarioLogado } = req;

  const resposta = respostaRepository.findById(id);
  if (!resposta) return res.status(404).json({ erro: 'Resposta não encontrada' });

  const topico = topicoRepository.findById(resposta.topicoId);
  if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado' });

  // Somente o autor do tópico ou ADMIN pode marcar solução
  if (topico.autorId !== usuarioLogado.id && usuarioLogado.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Somente o autor do tópico pode marcar a solução' });
  }

  const marcada = respostaRepository.marcarComoSolucao(id);
  topicoRepository.update(topico.id, { status: 'FECHADO' });

  res.json(projecaoResposta(marcada));
};

/**
 * DELETE /respostas/:id  — Exclui resposta (somente autor ou ADMIN)
 */
const excluir = (req, res) => {
  const { id } = req.params;
  const { usuarioLogado } = req;

  const resposta = respostaRepository.findById(id);
  if (!resposta) return res.status(404).json({ erro: 'Resposta não encontrada' });

  if (resposta.autorId !== usuarioLogado.id && usuarioLogado.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Você não tem permissão para excluir esta resposta' });
  }

  respostaRepository.delete(id);
  res.status(204).send();
};

module.exports = { listarPorTopico, listarPorUsuario, criar, atualizar, marcarSolucao, excluir };
