const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🗣️ Forum Hub API',
      version: '1.0.0',
      description: `
## Forum Hub — Challenge Alura Spring Boot 3

API REST completa para um fórum de estudantes, implementada em **Node.js + Express**.

### 🎯 Funcionalidades
- ✅ **CRUD completo de Tópicos** (regra de negócio: sem duplicatas)
- ✅ **Sistema de Respostas** com marcação de solução
- ✅ **Autenticação JWT** — todos os endpoints protegidos
- ✅ **Autorização por perfil** (ADMIN / USUARIO)
- ✅ **Gerenciamento de Usuários e Cursos**
- ✅ **Paginação e filtros**
- ✅ **Documentação OpenAPI/Swagger**
- ✅ **Testes automatizados** (Jest + Supertest)
- ✅ **Deploy-ready** com Docker

### 🔐 Como autenticar
1. Faça **POST /login** com as credenciais abaixo
2. Copie o \`token\` da resposta
3. Clique em **Authorize** (cadeado 🔒) e cole: \`Bearer <token>\`

### 👤 Usuários de teste
| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@forumhub.com | Forum@123 | ADMIN |
| estudante@forumhub.com | password | USUARIO |

### 📊 Status dos Tópicos
\`ABERTO\` → \`RESPONDIDO\` → \`FECHADO\`

### 📚 Categorias de Cursos
\`PROGRAMACAO\` | \`FRONTEND\` | \`BACKEND\` | \`DEVOPS\` | \`MOBILE\` | \`BANCO_DE_DADOS\` | \`ARQUITETURA\` | \`OUTROS\`
      `,
      contact: { name: 'Alura Challenge', url: 'https://www.alura.com.br' }
    },
    servers: [
      { url: 'http://localhost:8080', description: 'Desenvolvimento' },
      { url: 'https://forum-hub-api.railway.app', description: 'Produção' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido via POST /login'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@forumhub.com' },
            senha: { type: 'string', example: 'Forum@123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            tipo: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '2h' },
            usuario: { '$ref': '#/components/schemas/UsuarioResumo' }
          }
        },
        UsuarioResumo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            perfil: { type: 'string', enum: ['ADMIN', 'USUARIO'] }
          }
        },
        CadastroUsuario: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: { type: 'string', example: 'Novo Estudante' },
            email: { type: 'string', format: 'email', example: 'novo@forumhub.com' },
            senha: { type: 'string', minLength: 8, example: 'Senha@123' },
            perfil: { type: 'string', enum: ['ADMIN', 'USUARIO'], default: 'USUARIO' }
          }
        },
        Curso: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string', example: 'Spring Boot 3' },
            categoria: { type: 'string', example: 'BACKEND' },
            criadoEm: { type: 'string', format: 'date-time' }
          }
        },
        CadastroTopico: {
          type: 'object',
          required: ['titulo', 'mensagem', 'cursoId'],
          properties: {
            titulo: { type: 'string', example: 'Como configurar Flyway no Spring Boot?' },
            mensagem: { type: 'string', example: 'Preciso de ajuda para configurar migrations com Flyway.' },
            cursoId: { type: 'string', example: '1' }
          }
        },
        AtualizacaoTopico: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            mensagem: { type: 'string' },
            status: { type: 'string', enum: ['ABERTO', 'RESPONDIDO', 'FECHADO', 'NAO_RESPONDIDO'] },
            cursoId: { type: 'string' }
          }
        },
        TopicoResumo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            titulo: { type: 'string' },
            mensagem: { type: 'string' },
            status: { type: 'string' },
            criadoEm: { type: 'string', format: 'date-time' },
            autor: { '$ref': '#/components/schemas/UsuarioResumo' },
            curso: { '$ref': '#/components/schemas/Curso' }
          }
        },
        Resposta: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            mensagem: { type: 'string' },
            solucao: { type: 'boolean' },
            criadoEm: { type: 'string', format: 'date-time' },
            autor: { '$ref': '#/components/schemas/UsuarioResumo' }
          }
        },
        CadastroResposta: {
          type: 'object',
          required: ['mensagem', 'topicoId'],
          properties: {
            mensagem: { type: 'string', example: 'Para isso, adicione a dependência flyway-core no pom.xml.' },
            topicoId: { type: 'string', example: '1' }
          }
        },
        ErroValidacao: {
          type: 'object',
          properties: {
            erro: { type: 'string' },
            campos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campo: { type: 'string' },
                  mensagem: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);
