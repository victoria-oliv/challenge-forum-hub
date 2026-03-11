const cursoRepository = require('../models/cursoRepository');

/**
 * GET /cursos  — Lista todos os cursos
 */
const listar = (req, res) => {
  const cursos = cursoRepository.findAll();
  res.json({ content: cursos, totalElements: cursos.length });
};

/**
 * GET /cursos/:id  — Detalhe de um curso
 */
const buscarPorId = (req, res) => {
  const curso = cursoRepository.findById(req.params.id);
  if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
  res.json(curso);
};

/**
 * POST /cursos  — Cria novo curso (somente ADMIN)
 */
const criar = (req, res) => {
  const { nome, categoria } = req.body;
  const salvo = cursoRepository.create({ nome, categoria });
  res.status(201).json(salvo);
};

module.exports = { listar, buscarPorId, criar };
