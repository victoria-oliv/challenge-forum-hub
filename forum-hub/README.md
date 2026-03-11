# 🗣️ Forum Hub API — Challenge Alura

> **Spring Framework: Challenge Forum Hub**  
> API REST completa para um fórum de estudantes, implementada em **Node.js + Express**.

---

## 📋 Sobre o Projeto

Replica os conceitos do challenge da Alura de Spring Boot 3 em Node.js, aplicando:

| Requisito do Challenge | Implementação Node.js |
|---|---|
| CRUD de Tópicos | `GET/POST/PUT/DELETE /topicos` |
| Autenticação JWT | `jsonwebtoken` + middleware `autenticar` |
| Validação de dados | `express-validator` |
| Regras de negócio | Sem tópico duplicado, tópico fechado bloqueado |
| Documentação | Swagger UI (OpenAPI 3.0) |
| Testes | Jest + Supertest (+40 casos de teste) |
| Deploy | Docker + docker-compose |

---

## 🗂️ Entidades

```
Usuário ──< Tópico ──< Resposta
    └──────────────────────┘
Curso ──< Tópico
```

### Status dos Tópicos
```
ABERTO → (recebe resposta) → RESPONDIDO → (solução marcada) → FECHADO
```

---

## 🔐 Autenticação

Todos os endpoints (exceto `POST /login` e `POST /usuarios`) requerem JWT.

```http
POST /login
Content-Type: application/json

{ "email": "admin@forumhub.com", "senha": "Forum@123" }
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "tipo": "Bearer",
  "expiresIn": "2h"
}
```

Use o token em todas as requisições:
```http
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### Usuários de teste
| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@forumhub.com | Forum@123 | ADMIN |
| estudante@forumhub.com | password | USUARIO |

---

## 📡 Endpoints

### 🔓 Autenticação (público)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/login` | Autentica e retorna JWT |

### 👤 Usuários
| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| POST | `/usuarios` | Público | Cadastro de novo usuário |
| GET | `/usuarios` | ADMIN | Lista todos os usuários |
| GET | `/usuarios/:id` | Auth | Detalhe de um usuário |
| PUT | `/usuarios/:id` | Próprio ou ADMIN | Atualiza dados |

### 📚 Cursos
| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | `/cursos` | Auth | Lista todos os cursos |
| GET | `/cursos/:id` | Auth | Detalhe de um curso |
| POST | `/cursos` | ADMIN | Cria novo curso |

### 💬 Tópicos (core do challenge)
| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | `/topicos` | Auth | Lista tópicos (paginado + filtros) |
| GET | `/topicos/:id` | Auth | Detalhe com respostas |
| POST | `/topicos` | Auth | Cria tópico (sem duplicata!) |
| PUT | `/topicos/:id` | Autor ou ADMIN | Atualiza tópico |
| DELETE | `/topicos/:id` | Autor ou ADMIN | Exclui tópico |

**Filtros disponíveis em GET /topicos:**
- `?page=1&size=10` — paginação
- `?cursoId=<id>` — filtra por curso
- `?status=ABERTO` — filtra por status

### 💡 Respostas
| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| POST | `/respostas` | Auth | Responde um tópico |
| GET | `/respostas/topicos/:topicoId` | Auth | Respostas de um tópico |
| GET | `/respostas/usuarios/:usuarioId` | Auth | Respostas de um usuário |
| PUT | `/respostas/:id` | Autor ou ADMIN | Atualiza resposta |
| PUT | `/respostas/:id/solucao` | Autor do tópico ou ADMIN | Marca como solução (fecha tópico) |
| DELETE | `/respostas/:id` | Autor ou ADMIN | Exclui resposta |

---

## 🧩 Regras de Negócio

1. **Tópico duplicado:** Não é possível criar dois tópicos com o mesmo título E a mesma mensagem → `409 Conflict`
2. **Tópico fechado:** Não aceita novas respostas → `422 Unprocessable Entity`
3. **Marcar solução:** Apenas o autor do tópico (ou ADMIN) pode marcar uma resposta como solução
4. **Fechamento automático:** Ao marcar uma solução, o tópico muda para status `FECHADO`
5. **Fluxo de status:** `ABERTO` → primeira resposta → `RESPONDIDO` → solução marcada → `FECHADO`
6. **Autorização:** Cada usuário só pode editar/excluir seus próprios tópicos e respostas; ADMIN pode tudo

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm

### Instalação

```bash
git clone https://github.com/seu-usuario/forum-hub-api
cd forum-hub-api

npm install

cp .env.example .env
# Edite o .env com sua JWT_SECRET

npm run dev
```

Acesse:
- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/docs
- **Health Check:** http://localhost:8080/health

---

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Com relatório de cobertura
npm test -- --coverage

# Watch mode
npm run test:watch
```

**+40 casos de teste cobrindo:**
- Autenticação JWT (login, token inválido, sem token)
- CRUD completo de Tópicos
- Regras de negócio (duplicata, tópico fechado, fluxo de status)
- Autorização por perfil (ADMIN vs USUARIO)
- CRUD de Respostas + marcação de solução
- Usuários e Cursos

---

## 🐳 Deploy com Docker

```bash
# Build
docker build -t forum-hub-api .

# Com docker-compose
docker-compose up -d

# Logs
docker-compose logs -f

# Parar
docker-compose down
```

### Deploy no Railway
```bash
railway init
railway up
```
Defina as variáveis de ambiente no painel: `JWT_SECRET`, `PORT`

---

## 📁 Estrutura do Projeto

```
forum-hub/
├── src/
│   ├── app.js                         # Express + middlewares + Swagger
│   ├── server.js                      # Entry point
│   ├── config/
│   │   └── swagger.js                 # OpenAPI 3.0 spec
│   ├── controllers/
│   │   ├── authController.js          # Login JWT
│   │   ├── usuarioController.js       # CRUD usuários
│   │   ├── cursoController.js         # CRUD cursos
│   │   ├── topicoController.js        # CRUD tópicos (core)
│   │   └── respostaController.js      # CRUD respostas + solução
│   ├── middlewares/
│   │   ├── auth.js                    # JWT guard + autorização por perfil
│   │   ├── validacoes.js              # express-validator rules
│   │   └── errorHandler.js           # Handler global de erros
│   ├── models/
│   │   ├── usuarioRepository.js       # Repositório em memória (plugável)
│   │   ├── cursoRepository.js
│   │   ├── topicoRepository.js
│   │   └── respostaRepository.js
│   ├── routes/
│   │   └── index.js                   # Todas as rotas com JSDoc Swagger
│   └── services/
│       └── tokenService.js            # Geração/validação JWT
├── tests/
│   └── forumHub.test.js               # +40 testes de integração
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🔄 Migração para DB Real

Para usar PostgreSQL com Prisma:

```bash
npm install prisma @prisma/client
npx prisma init
```

Substitua os repositórios em memória pelas chamadas ao Prisma Client.

---

## 📊 Paralelo Spring Boot 3 × Node.js

| Spring Boot 3 | Node.js/Express |
|---|---|
| `@RestController` | `express.Router()` |
| `@Valid` + Bean Validation | `express-validator` |
| `Spring Security` + JWT | `jsonwebtoken` + middleware |
| `@PreAuthorize("hasRole...")` | `autorizar('ADMIN')` middleware |
| `Page<T>` Spring Data | Paginação manual |
| `Flyway` migrations | Repositório em memória / Prisma |
| `@SpringBootTest` | Jest + Supertest |
| Springdoc OpenAPI | swagger-jsdoc + swagger-ui-express |
| `application.properties` | `.env` + dotenv |
