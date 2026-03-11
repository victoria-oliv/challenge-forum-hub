const request = require('supertest');
const app = require('../src/app');
const usuarioRepository = require('../src/models/usuarioRepository');
const topicoRepository = require('../src/models/topicoRepository');
const respostaRepository = require('../src/models/respostaRepository');
const cursoRepository = require('../src/models/cursoRepository');
const bcrypt = require('bcryptjs');

// ── Helpers ───────────────────────────────────────────────────
let tokenAdmin, tokenEstudante, tokenEstudante2;
let cursoId, topicoId, respostaId, usuarioEstudanteId;

const seedDb = () => {
  usuarioRepository._reset([
    {
      id: 'admin-1',
      nome: 'Admin Test',
      email: 'admin@test.com',
      senha: bcrypt.hashSync('Admin@123', 10),
      perfil: 'ADMIN',
      ativo: true,
      criadoEm: new Date().toISOString()
    },
    {
      id: 'user-1',
      nome: 'Estudante Test',
      email: 'estudante@test.com',
      senha: bcrypt.hashSync('Alura@123', 10),
      perfil: 'USUARIO',
      ativo: true,
      criadoEm: new Date().toISOString()
    },
    {
      id: 'user-2',
      nome: 'Outro Estudante',
      email: 'outro@test.com',
      senha: bcrypt.hashSync('Outro@123', 10),
      perfil: 'USUARIO',
      ativo: true,
      criadoEm: new Date().toISOString()
    }
  ]);
  cursoRepository._reset([
    { id: 'curso-1', nome: 'Spring Boot 3', categoria: 'BACKEND', criadoEm: new Date().toISOString() },
    { id: 'curso-2', nome: 'React', categoria: 'FRONTEND', criadoEm: new Date().toISOString() }
  ]);
  topicoRepository._reset([
    {
      id: 'topico-1',
      titulo: 'Tópico existente',
      mensagem: 'Mensagem existente',
      status: 'ABERTO',
      autorId: 'user-1',
      cursoId: 'curso-1',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }
  ]);
  respostaRepository._reset([]);
  cursoId = 'curso-1';
  topicoId = 'topico-1';
  usuarioEstudanteId = 'user-1';
};

const autenticarComo = async (email, senha) => {
  const res = await request(app).post('/login').send({ email, senha });
  return res.body.token;
};

// ═════════════════════════════════════════════════════════════
describe('🗣️  Forum Hub API — Testes de Integração', () => {

  beforeAll(async () => {
    seedDb();
    tokenAdmin = await autenticarComo('admin@test.com', 'Admin@123');
    tokenEstudante = await autenticarComo('estudante@test.com', 'Alura@123');
    tokenEstudante2 = await autenticarComo('outro@test.com', 'Outro@123');
  });

  // ── Health ─────────────────────────────────────────────────
  describe('GET /health', () => {
    it('deve retornar status UP', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  // ── Autenticação ───────────────────────────────────────────
  describe('POST /login', () => {
    it('deve autenticar com credenciais válidas e retornar token JWT', async () => {
      const res = await request(app).post('/login').send({
        email: 'admin@test.com',
        senha: 'Admin@123'
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.tipo).toBe('Bearer');
      expect(res.body.usuario.perfil).toBe('ADMIN');
    });

    it('deve retornar 401 com e-mail errado', async () => {
      const res = await request(app).post('/login').send({
        email: 'errado@test.com',
        senha: 'Admin@123'
      });
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 com senha errada', async () => {
      const res = await request(app).post('/login').send({
        email: 'admin@test.com',
        senha: 'senhaerrada'
      });
      expect(res.status).toBe(401);
    });

    it('deve retornar 400 sem e-mail', async () => {
      const res = await request(app).post('/login').send({ senha: 'Admin@123' });
      expect(res.status).toBe(400);
    });
  });

  // ── Usuários ───────────────────────────────────────────────
  describe('Usuários', () => {
    it('POST /usuarios — deve cadastrar novo usuário publicamente', async () => {
      const res = await request(app).post('/usuarios').send({
        nome: 'Novo Aluno',
        email: 'novo@test.com',
        senha: 'Novo@1234'
      });
      expect(res.status).toBe(201);
      expect(res.body.email).toBe('novo@test.com');
      expect(res.body).not.toHaveProperty('senha');
    });

    it('POST /usuarios — deve retornar 409 para e-mail duplicado', async () => {
      const res = await request(app).post('/usuarios').send({
        nome: 'Duplicado',
        email: 'admin@test.com',
        senha: 'Dup@12345'
      });
      expect(res.status).toBe(409);
    });

    it('POST /usuarios — deve retornar 400 para senha fraca', async () => {
      const res = await request(app).post('/usuarios').send({
        nome: 'Fraco',
        email: 'fraco@test.com',
        senha: '1234'
      });
      expect(res.status).toBe(400);
    });

    it('GET /usuarios — deve exigir auth', async () => {
      const res = await request(app).get('/usuarios');
      expect(res.status).toBe(401);
    });

    it('GET /usuarios — somente ADMIN acessa lista de usuários', async () => {
      const res = await request(app).get('/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('content');
    });

    it('GET /usuarios — USUARIO comum recebe 403', async () => {
      const res = await request(app).get('/usuarios')
        .set('Authorization', `Bearer ${tokenEstudante}`);
      expect(res.status).toBe(403);
    });

    it('GET /usuarios/:id — deve retornar dados do usuário', async () => {
      const res = await request(app).get(`/usuarios/${usuarioEstudanteId}`)
        .set('Authorization', `Bearer ${tokenEstudante}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(usuarioEstudanteId);
      expect(res.body).not.toHaveProperty('senha');
    });

    it('GET /usuarios/:id — 404 para usuário inexistente', async () => {
      const res = await request(app).get('/usuarios/nao-existe')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(404);
    });
  });

  // ── Cursos ─────────────────────────────────────────────────
  describe('Cursos', () => {
    it('GET /cursos — deve exigir auth', async () => {
      const res = await request(app).get('/cursos');
      expect(res.status).toBe(401);
    });

    it('GET /cursos — lista cursos com auth', async () => {
      const res = await request(app).get('/cursos')
        .set('Authorization', `Bearer ${tokenEstudante}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.content)).toBe(true);
    });

    it('GET /cursos/:id — retorna detalhe do curso', async () => {
      const res = await request(app).get(`/cursos/${cursoId}`)
        .set('Authorization', `Bearer ${tokenEstudante}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(cursoId);
    });

    it('GET /cursos/:id — 404 para curso inexistente', async () => {
      const res = await request(app).get('/cursos/inexistente')
        .set('Authorization', `Bearer ${tokenEstudante}`);
      expect(res.status).toBe(404);
    });

    it('POST /cursos — somente ADMIN pode criar curso', async () => {
      const res = await request(app).post('/cursos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'Docker Avançado', categoria: 'DEVOPS' });
      expect(res.status).toBe(201);
      expect(res.body.categoria).toBe('DEVOPS');
    });

    it('POST /cursos — USUARIO comum recebe 403', async () => {
      const res = await request(app).post('/cursos')
        .set('Authorization', `Bearer ${tokenEstudante}`)
        .send({ nome: 'Curso Qualquer', categoria: 'OUTROS' });
      expect(res.status).toBe(403);
    });

    it('POST /cursos — deve retornar 400 para categoria inválida', async () => {
      const res = await request(app).post('/cursos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nome: 'Inválido', categoria: 'CATEGORIA_INEXISTENTE' });
      expect(res.status).toBe(400);
    });
  });

  // ── Tópicos (core do challenge) ───────────────────────────
  describe('Tópicos', () => {
    describe('GET /topicos', () => {
      it('deve exigir autenticação', async () => {
        const res = await request(app).get('/topicos');
        expect(res.status).toBe(401);
      });

      it('deve retornar lista paginada de tópicos', async () => {
        const res = await request(app).get('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('content');
        expect(res.body).toHaveProperty('totalElements');
        expect(res.body).toHaveProperty('pageable');
      });

      it('deve filtrar por cursoId', async () => {
        const res = await request(app).get(`/topicos?cursoId=${cursoId}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(200);
        res.body.content.forEach(t => expect(t.curso.id).toBe(cursoId));
      });

      it('deve filtrar por status', async () => {
        const res = await request(app).get('/topicos?status=ABERTO')
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(200);
        res.body.content.forEach(t => expect(t.status).toBe('ABERTO'));
      });

      it('deve retornar 400 para status inválido', async () => {
        const res = await request(app).get('/topicos?status=INVALIDO')
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(400);
      });
    });

    describe('GET /topicos/:id', () => {
      it('deve retornar tópico com respostas', async () => {
        const res = await request(app).get(`/topicos/${topicoId}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(topicoId);
        expect(res.body).toHaveProperty('respostas');
        expect(res.body).toHaveProperty('autor');
        expect(res.body).toHaveProperty('curso');
      });

      it('deve retornar 404 para tópico inexistente', async () => {
        const res = await request(app).get('/topicos/nao-existe')
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(404);
      });
    });

    describe('POST /topicos', () => {
      it('deve criar tópico com dados válidos', async () => {
        const res = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({
            titulo: 'Novo tópico sobre JWT',
            mensagem: 'Como funciona o JWT em Node.js?',
            cursoId
          });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('ABERTO');
        expect(res.body.autor.id).toBe('user-1');
        topicoId = res.body.id; // atualiza para próximos testes
      });

      it('deve retornar 409 para tópico duplicado (mesmo título + mensagem)', async () => {
        const res = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({
            titulo: 'Novo tópico sobre JWT',
            mensagem: 'Como funciona o JWT em Node.js?',
            cursoId
          });
        expect(res.status).toBe(409);
      });

      it('deve retornar 400 sem título', async () => {
        const res = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ mensagem: 'Sem título', cursoId });
        expect(res.status).toBe(400);
      });

      it('deve retornar 404 para cursoId inexistente', async () => {
        const res = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ titulo: 'Teste', mensagem: 'Teste', cursoId: 'curso-nao-existe' });
        expect(res.status).toBe(404);
      });

      it('deve exigir autenticação', async () => {
        const res = await request(app).post('/topicos')
          .send({ titulo: 'Sem auth', mensagem: 'Sem auth', cursoId });
        expect(res.status).toBe(401);
      });
    });

    describe('PUT /topicos/:id', () => {
      it('deve atualizar tópico próprio', async () => {
        const res = await request(app).put(`/topicos/${topicoId}`)
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ titulo: 'Título atualizado' });
        expect(res.status).toBe(200);
        expect(res.body.titulo).toBe('Título atualizado');
      });

      it('deve atualizar status do tópico', async () => {
        const res = await request(app).put(`/topicos/${topicoId}`)
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ status: 'FECHADO' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('FECHADO');
      });

      it('deve retornar 403 quando outro usuário tenta editar', async () => {
        const res = await request(app).put(`/topicos/${topicoId}`)
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ titulo: 'Invasão' });
        expect(res.status).toBe(403);
      });

      it('ADMIN pode editar qualquer tópico', async () => {
        const res = await request(app).put(`/topicos/${topicoId}`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ titulo: 'Editado pelo Admin' });
        expect(res.status).toBe(200);
      });

      it('deve retornar 404 para tópico inexistente', async () => {
        const res = await request(app).put('/topicos/nao-existe')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ titulo: 'x' });
        expect(res.status).toBe(404);
      });
    });

    describe('DELETE /topicos/:id', () => {
      let topicoParaExcluir;

      beforeAll(async () => {
        const res = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ titulo: 'Para excluir', mensagem: 'Mensagem para excluir', cursoId });
        topicoParaExcluir = res.body.id;
      });

      it('deve retornar 403 quando outro usuário tenta excluir', async () => {
        const res = await request(app).delete(`/topicos/${topicoParaExcluir}`)
          .set('Authorization', `Bearer ${tokenEstudante2}`);
        expect(res.status).toBe(403);
      });

      it('deve excluir tópico próprio (204)', async () => {
        const res = await request(app).delete(`/topicos/${topicoParaExcluir}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(204);
      });

      it('deve retornar 404 após excluir', async () => {
        const res = await request(app).get(`/topicos/${topicoParaExcluir}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(404);
      });

      it('ADMIN pode excluir qualquer tópico', async () => {
        const novoRes = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ titulo: 'Tópico do admin', mensagem: 'Admin deleta', cursoId });
        const id = novoRes.body.id;

        const del = await request(app).delete(`/topicos/${id}`)
          .set('Authorization', `Bearer ${tokenAdmin}`);
        expect(del.status).toBe(204);
      });
    });
  });

  // ── Respostas ──────────────────────────────────────────────
  describe('Respostas', () => {
    let topicoAberto;

    beforeAll(async () => {
      const res = await request(app).post('/topicos')
        .set('Authorization', `Bearer ${tokenEstudante}`)
        .send({ titulo: 'Tópico para respostas', mensagem: 'Preciso de ajuda', cursoId });
      topicoAberto = res.body.id;
    });

    describe('POST /respostas', () => {
      it('deve criar resposta em tópico aberto', async () => {
        const res = await request(app).post('/respostas')
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ mensagem: 'Boa pergunta! Use Spring Security.', topicoId: topicoAberto });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.solucao).toBe(false);
        respostaId = res.body.id;
      });

      it('tópico deve mudar para RESPONDIDO após primeira resposta', async () => {
        const res = await request(app).get(`/topicos/${topicoAberto}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.body.status).toBe('RESPONDIDO');
      });

      it('deve retornar 400 sem mensagem', async () => {
        const res = await request(app).post('/respostas')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ topicoId: topicoAberto });
        expect(res.status).toBe(400);
      });

      it('deve retornar 404 para tópico inexistente', async () => {
        const res = await request(app).post('/respostas')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ mensagem: 'Oi', topicoId: 'nao-existe' });
        expect(res.status).toBe(404);
      });
    });

    describe('GET /respostas/topicos/:topicoId', () => {
      it('deve listar respostas do tópico', async () => {
        const res = await request(app).get(`/respostas/topicos/${topicoAberto}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(200);
        expect(res.body.content.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('GET /respostas/usuarios/:usuarioId', () => {
      it('deve listar respostas do usuário', async () => {
        const res = await request(app).get('/respostas/usuarios/user-2')
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.content)).toBe(true);
      });
    });

    describe('PUT /respostas/:id/solucao', () => {
      it('autor do tópico pode marcar solução', async () => {
        const res = await request(app).put(`/respostas/${respostaId}/solucao`)
          .set('Authorization', `Bearer ${tokenEstudante}`); // user-1 é autor do tópico
        expect(res.status).toBe(200);
        expect(res.body.solucao).toBe(true);
      });

      it('tópico deve fechar após marcar solução', async () => {
        const res = await request(app).get(`/topicos/${topicoAberto}`)
          .set('Authorization', `Bearer ${tokenEstudante}`);
        expect(res.body.status).toBe('FECHADO');
      });

      it('não deve permitir nova resposta em tópico fechado', async () => {
        const res = await request(app).post('/respostas')
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ mensagem: 'Tentando responder tópico fechado', topicoId: topicoAberto });
        expect(res.status).toBe(422);
      });

      it('deve retornar 403 se não for o autor do tópico', async () => {
        // Cria novo tópico do user-2 e tenta marcar solução como user-1
        const tRes = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ titulo: 'Tópico user2', mensagem: 'Questão do user2', cursoId });
        const tId = tRes.body.id;

        const rRes = await request(app).post('/respostas')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ mensagem: 'Resposta aqui', topicoId: tId });
        const rId = rRes.body.id;

        const solucaoRes = await request(app).put(`/respostas/${rId}/solucao`)
          .set('Authorization', `Bearer ${tokenEstudante}`); // não é o autor do tópico
        expect(solucaoRes.status).toBe(403);
      });
    });

    describe('PUT /respostas/:id', () => {
      it('deve atualizar própria resposta', async () => {
        const res = await request(app).put(`/respostas/${respostaId}`)
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ mensagem: 'Resposta atualizada com mais detalhes.' });
        expect(res.status).toBe(200);
        expect(res.body.mensagem).toBe('Resposta atualizada com mais detalhes.');
      });

      it('deve retornar 403 se não for o autor da resposta', async () => {
        const res = await request(app).put(`/respostas/${respostaId}`)
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ mensagem: 'Invasão' });
        expect(res.status).toBe(403);
      });
    });

    describe('DELETE /respostas/:id', () => {
      it('deve excluir própria resposta', async () => {
        const novaRes = await request(app).post('/topicos')
          .set('Authorization', `Bearer ${tokenEstudante}`)
          .send({ titulo: 'Temp delete', mensagem: 'Para testar exclusão de resposta', cursoId });
        const tId = novaRes.body.id;

        const rRes = await request(app).post('/respostas')
          .set('Authorization', `Bearer ${tokenEstudante2}`)
          .send({ mensagem: 'Resposta para deletar', topicoId: tId });
        const rId = rRes.body.id;

        const del = await request(app).delete(`/respostas/${rId}`)
          .set('Authorization', `Bearer ${tokenEstudante2}`);
        expect(del.status).toBe(204);
      });
    });
  });

  // ── Segurança — token inválido ─────────────────────────────
  describe('Segurança JWT', () => {
    it('deve rejeitar token inválido', async () => {
      const res = await request(app).get('/topicos')
        .set('Authorization', 'Bearer token-invalido-qualquer');
      expect(res.status).toBe(401);
    });

    it('deve rejeitar requisição sem token', async () => {
      const res = await request(app).get('/topicos');
      expect(res.status).toBe(401);
    });

    it('deve rejeitar token mal formatado (sem Bearer)', async () => {
      const res = await request(app).get('/topicos')
        .set('Authorization', tokenAdmin); // sem "Bearer "
      expect(res.status).toBe(401);
    });
  });
});
