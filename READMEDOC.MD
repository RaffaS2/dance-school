# EntArtes — Plataforma de Gestão de Escola de Dança

Sistema web de gestão para escolas de dança, desenvolvido como projeto académico. Permite gerir professores, alunos, aulas (coachings), horários e inventário, com controlo de acessos baseado em três tipos de utilizador.

---

## Índice

1. [Descrição do Sistema](#1-descrição-do-sistema)
2. [Tech Stack](#2-tech-stack)
3. [Arquitetura](#3-arquitetura)
4. [Modelo de Dados](#4-modelo-de-dados)
5. [Funcionalidades por Perfil](#5-funcionalidades-por-perfil)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [API Reference](#7-api-reference)
8. [Estrutura de Pastas](#8-estrutura-de-pastas)
9. [Instalação e Configuração](#9-instalação-e-configuração)
10. [Testes](#10-testes)
11. [Regras de Negócio](#11-regras-de-negócio)

---

## 1. Descrição do Sistema

O **EntArtes** é uma plataforma de gestão para escolas de dança que centraliza a administração de:

- Professores e as suas disponibilidades e modalidades
- Alunos e os seus encarregados de educação
- Aulas (coachings) com deteção automática de conflitos de horário
- Estúdios e as modalidades que suportam
- Inventário de equipamento e pedidos de material

O sistema suporta três perfis de utilizador com permissões distintas: **Coordenação (Admin)**, **Professor** e **Encarregado de Educação**.

---

## 2. Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, TypeScript, Anime.js
- **Backend:** Node.js, Express
- **Base de Dados:** PostgreSQL (Neon)
- **Autenticação:** JWT via cookie HttpOnly
- **Email:** Nodemailer
- **Testes:** Jest + Supertest

---

## 3. Arquitetura

```
┌─────────────────────────────┐
│        Browser / Client     │
└────────────┬────────────────┘
             │ HTTP (cookies HttpOnly)
             ▼
┌─────────────────────────────┐
│     Next.js Frontend        │
│     localhost:3000          │
│                             │
│  /login     /dashboard      │
│  /coaching  /inventario     │
│  /perfil    /admin/...      │
└────────────┬────────────────┘
             │ REST API (JSON)
             ▼
┌─────────────────────────────┐
│     Express.js Backend      │
│     localhost:3001          │
│                             │
│  authMiddleware (JWT)       │
│  authorize(roles...)        │
│  Controllers → Pool (pg)    │
└────────────┬────────────────┘
             │ SQL
             ▼
┌─────────────────────────────┐
│   PostgreSQL — Neon Cloud   │
└─────────────────────────────┘
```

O frontend comunica com o backend exclusivamente via REST API. A autenticação é feita por cookie `HttpOnly` contendo um JWT, tornando o sistema seguro contra ataques XSS.

---

## 4. Modelo de Dados

### Entidades Principais

```
users
├── id_user (PK)
├── name
├── email
├── phone_number
├── password (bcrypt hash)
└── id_user_type (FK → user_types)

user_types
├── id_user_type (PK)      -- 1=Admin, 2=Professor, 3=Encarregado
└── name

professors
├── id_professor (PK)
├── specialty
├── active
└── id_user (FK → users)

students
├── id_student (PK)
├── name
├── birth_date
└── id_user (FK → users)    -- encarregado de educação

studios
├── id_studio (PK)
├── name
└── max_capacity

modalities
├── id_modality (PK)
├── name
└── description

coachings                   -- aulas
├── id_coaching (PK)
├── id_professor (FK)
├── id_studio (FK)
├── id_modality (FK)
├── date
├── start_time
├── duration_minutes
├── status
└── price

availabilities              -- disponibilidades dos professores
├── id_availability (PK)
├── date
├── start_time
├── end_time
├── recurring
└── id_professor (FK)

items                       -- inventário
├── id_item (PK)
├── name
├── status
├── image_url
├── id_category (FK)
└── id_user (FK)

categories                  -- categorias de inventário
├── id_category (PK)
└── name

item_requests               -- pedidos de material
├── id_item_request (PK)
└── ...

pending_teachers            -- professores aguardando aprovação
├── id (PK)
├── name, email, phone
├── password (hash)
└── approval_token

-- Tabelas de relação N:M
professor_modalities (id_professor, id_modality)
studio_modalities    (id_studio, id_modality)
student_coachings    (id_student, id_coaching)
```

---

## 5. Funcionalidades por Perfil

### 🔴 Admin (Coordenação) — Acesso Total

- Gerir todos os utilizadores (criar, editar, apagar)
- Aprovar registos de professores via email
- Gerir professores: criar, editar, ativar/desativar
- Gerir estúdios e capacidades
- Gerir modalidades de dança
- Associar modalidades a professores e estúdios
- Criar e gerir aulas (coachings)
- Gerir inventário completo (itens e categorias)
- Gerir pedidos de material

### 🟡 Professor — Acesso Intermédio

- Consultar o seu perfil e editar password
- Gerir as suas disponibilidades (criar/apagar)
- Consultar e gerir aulas onde é professor
- Consultar alunos inscritos nas suas aulas
- Consultar estúdios e modalidades
- Gerir inventário e fazer pedidos de material

### 🟢 Encarregado de Educação — Acesso Limitado

- Registo imediato (sem aprovação)
- Consultar o seu perfil e editar password
- Consultar as aulas do seu educando
- Consultar disponibilidades de professores
- Fazer pedidos de material

---

## 6. Autenticação e Autorização

### Fluxo de Login

```
1. POST /api/auth/login  { email, password }
2. Backend valida credenciais com bcrypt
3. Gera JWT (expira em 7 dias)
4. Define cookie HttpOnly: token=<JWT>
5. Frontend recebe { id_user_type } para redirecionamento
```

### Fluxo de Registo de Professor

```
1. Professor submete registo  →  POST /api/auth/register  { id_user_type: 2 }
2. Conta fica em pending_teachers com approval_token (JWT 48h)
3. Email enviado à coordenação com link de aprovação
4. Coordenação clica  →  GET /api/auth/approve-teacher?token=...
5. Conta movida de pending_teachers para users
```

### Middleware de Autorização

Todas as rotas (exceto `/api/auth/*`) requerem autenticação. As permissões são definidas por `authorize(...roles)`:

```js
// 1 = Admin | 2 = Professor | 3 = Encarregado
authorize(1)        // só Admin
authorize(1, 2)     // Admin e Professor
authorize(1, 2, 3)  // todos os autenticados
```

### Recuperação de Password

```
1. POST /api/auth/forgot-password  { email }
2. Link enviado por email (JWT 15 min)
3. POST /api/auth/reset-password   { token, password }
```

---

## 7. API Reference

Base URL: `http://localhost:3001/api`

> Todas as rotas (exceto `/auth/register`, `/auth/login`, `/auth/forgot-password`) requerem cookie de sessão válido.

### Auth

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | Público | Registo de utilizador |
| POST | `/auth/login` | Público | Login |
| POST | `/auth/logout` | Público | Logout (limpa cookie) |
| POST | `/auth/forgot-password` | Público | Pedido de reset de password |
| POST | `/auth/reset-password` | Público | Reset de password via token |
| POST | `/auth/change-password` | Auth | Alterar password em sessão |
| GET | `/auth/me` | Auth | Dados do utilizador atual |
| GET | `/auth/approve-teacher` | Público | Aprovação de professor (via email) |

### Utilizadores

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/users` | Admin | Criar utilizador |
| GET | `/users` | Admin | Listar todos |
| GET | `/users/:id` | Todos | Consultar por ID |
| PUT | `/users/:id` | Admin | Atualizar |
| DELETE | `/users/:id` | Todos | Apagar |

### Professores

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/professors` | Admin | Criar professor |
| GET | `/professors` | Todos | Listar todos |
| GET | `/professors/:id` | Todos | Consultar por ID |
| PUT | `/professors/:id` | Admin | Atualizar |
| DELETE | `/professors/:id` | Admin | Apagar |
| GET | `/professors/:id/availabilities` | Todos | Disponibilidades do professor |

### Alunos

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/students` | Admin | Criar aluno |
| GET | `/students` | Admin, Prof | Listar todos |
| GET | `/students/me` | Encarregado | Aluno do utilizador autenticado |
| GET | `/students/:id` | Todos | Consultar por ID |
| PUT | `/students/:id` | Admin | Atualizar |
| DELETE | `/students/:id` | Admin | Apagar |

### Aulas (Coachings)

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/coachings` | Todos | Criar aula (verifica conflitos) |
| GET | `/coachings` | Todos | Listar todas |
| GET | `/coachings/:id` | Todos | Consultar por ID |
| GET | `/coachings/professor/:id` | Admin, Prof | Aulas de um professor |
| GET | `/coachings/guardian/:id` | Admin, Enc | Aulas de um encarregado |
| PUT | `/coachings/:id` | Todos | Atualizar |
| DELETE | `/coachings/:id` | Todos | Cancelar/apagar |

### Disponibilidades

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/availabilities` | Admin, Prof | Criar disponibilidade |
| GET | `/availabilities` | Todos | Listar todas |
| GET | `/availabilities/:id` | Todos | Consultar por ID |
| GET | `/availabilities/professor/:id` | Todos | Por professor |
| DELETE | `/availabilities/:id` | Admin, Prof | Apagar |

### Estúdios

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/studios` | Admin | Criar |
| GET | `/studios` | Todos | Listar |
| GET | `/studios/:id` | Todos | Consultar por ID |
| PUT | `/studios/:id` | Admin | Atualizar |
| DELETE | `/studios/:id` | Admin | Apagar |

### Modalidades

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/modalities` | Admin | Criar |
| GET | `/modalities` | Todos | Listar |
| GET | `/modalities/:id` | Todos | Consultar por ID |
| PUT | `/modalities/:id` | Admin | Atualizar |
| DELETE | `/modalities/:id` | Admin | Apagar |

### Inventário (Items)

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/items` | Todos | Criar item |
| GET | `/items` | Todos | Listar |
| GET | `/items/:id` | Todos | Consultar por ID |
| PUT | `/items/:id` | Todos | Atualizar |
| DELETE | `/items/:id` | Todos | Apagar |

### Categorias de Inventário

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/categories` | Todos | Criar |
| GET | `/categories` | Todos | Listar |
| GET | `/categories/:id` | Todos | Consultar por ID |
| PUT | `/categories/:id` | Admin | Atualizar |
| DELETE | `/categories/:id` | Admin | Apagar |

### Pedidos de Material

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/item-requests` | Todos | Criar pedido |
| GET | `/item-requests` | Todos | Listar |
| GET | `/item-requests/:id` | Todos | Consultar por ID |
| PUT | `/item-requests/:id` | Todos | Atualizar |
| DELETE | `/item-requests/:id` | Admin | Apagar |

### Relações N:M

| Endpoint | Descrição |
|---|---|
| `/professorModalities` | Modalidades de professores |
| `/studioModalities` | Modalidades de estúdios |
| `/studentCoachings` | Inscrições de alunos em aulas |

---

## 8. Estrutura de Pastas

```
dance-school/
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   └── studios/        # Gestão de estúdios (Admin)
│   │   ├── availabilities/     # Disponibilidades
│   │   │   └── novo/
│   │   ├── coaching/           # Aulas
│   │   │   └── novo/
│   │   ├── dashboard/          # Página principal após login
│   │   ├── inventario/         # Inventário
│   │   │   └── novo/
│   │   ├── perfil/             # Perfil do utilizador
│   │   │   ├── editar/
│   │   │   └── alterar-password/
│   │   ├── professor/
│   │   │   └── validar/        # Aprovação de professores
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgotpassword/
│   │   ├── resetpassword/
│   │   ├── pendingapproval/    # Página de espera (registo professor)
│   │   └── approvedteacher/    # Confirmação de aprovação
│   ├── components/             # Componentes reutilizáveis
│   ├── middleware.ts            # Proteção de rotas Next.js
│   └── package.json
│
├── backend/
│   ├── controllers/            # Lógica de negócio por entidade
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── professorsController.js
│   │   ├── studentsController.js
│   │   ├── studiosController.js
│   │   ├── modalitiesController.js
│   │   ├── coachingsController.js
│   │   ├── availabilitiesController.js
│   │   ├── itemsController.js
│   │   ├── categoriesController.js
│   │   ├── itemRequestsController.js
│   │   ├── professorModalitiesController.js
│   │   ├── studioModalitiesController.js
│   │   └── studentCoachingsController.js
│   ├── routes/
│   │   ├── index.js            # Router principal
│   │   ├── auth.js
│   │   ├── authorize.js        # Middleware de roles
│   │   └── [entidade].js       # Uma rota por entidade
│   ├── middleware/
│   │   └── authMiddleware.js   # Verificação JWT
│   ├── migrations/             # Scripts SQL de migração
│   ├── __tests__/
│   │   ├── integration/        # Testes HTTP (rota → controller → DB)
│   │   └── unit/               # Testes unitários (funções isoladas)
│   ├── db.js                   # Pool de ligação PostgreSQL
│   ├── server.js               # Entry point Express
│   └── package.json
│
├── package.json                # Scripts raiz (dev, test)
└── README.md
```

---

## 9. Instalação e Configuração

### Pré-requisitos

- Node.js >= 18
- Conta Neon (PostgreSQL cloud) ou PostgreSQL local

### 1. Clonar o repositório

```bash
git clone https://github.com/RaffaS2/dance-school.git
cd dance-school
```

### 2. Instalar dependências

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Variáveis de ambiente

Cria um ficheiro `.env` dentro da pasta `backend/`:

```env
# Base de dados
DATABASE_URL=your_neon_connection_string

# JWT
JWT_SECRET=your_secret_key_here

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# URLs
FRONTEND_URL=http://localhost:3000
COORDINATOR_EMAIL=coordinator@example.com

# Ambiente
NODE_ENV=development
```

> Para `EMAIL_PASS`, usa uma **App Password** do Gmail (não a password normal). Ativa em: Google Account → Segurança → Verificação em dois passos → Palavras-passe de aplicações.

### 4. Correr o projeto

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

## 10. Testes

Os testes estão escritos com **Jest** e **Supertest** e encontram-se em `backend/__tests__/`.

```
backend/
└── __tests__/
    ├── integration/   # Testes HTTP (rota → controller → DB)
    └── unit/          # Testes de lógica isolada (funções puras)
```

> O servidor **não arranca automaticamente** nos testes — `server.js` exporta `app` sem chamar `listen()` quando é importado pelo Jest, o que permite ao Supertest gerir a porta.

### Scripts disponíveis

```bash
# Correr todos os testes uma vez
npm test

# Modo watch — recorre ao guardar ficheiro (recomendado durante desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

### Correr um ficheiro específico

```bash
npx jest studios      # corre qualquer ficheiro com "studios" no nome
npx jest coachings    # corre qualquer ficheiro com "coachings" no nome
```

---

## 11. Regras de Negócio

### Conflitos de Horário (Coachings)

Ao criar uma aula, o sistema verifica automaticamente dois tipos de conflito:

1. **Conflito de Professor** — o mesmo professor não pode ter duas aulas sobrepostas no mesmo dia
2. **Conflito de Estúdio** — o mesmo estúdio não pode estar ocupado em horários sobrepostos

Aulas com status `cancelado` não são consideradas no cálculo de conflitos.

### Registo de Professores

- Professores **não são ativados imediatamente** — o registo fica pendente em `pending_teachers`
- Um email é enviado à coordenação com um link de aprovação válido por **48 horas**
- Só após aprovação a conta é criada em `users`

### Registo de Encarregados de Educação

- O registo é imediato, sem necessidade de aprovação
- Um registo como Encarregado cria automaticamente um registo em `students` associado ao utilizador

### Tokens de Segurança

| Operação | Duração do Token |
|---|---|
| Sessão de login | 7 dias |
| Reset de password | 15 minutos |
| Aprovação de professor | 48 horas |

### Autenticação sem Estado (Stateless)

A API é completamente stateless — toda a informação de sessão está no JWT. O cookie `HttpOnly` impede acesso ao token via JavaScript, protegendo contra XSS.