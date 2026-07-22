# 📘 Anotações de Estudo — Node.js (RocketSeat)
## Curso: Ignite Node.js — RocketSeat
### 🔵 NÍVEL 2 — API REST com Node.js (Rotas e HTTP)

Este documento descreve os conceitos e implementações do **Nível 2**, onde o projeto evolui de uma estrutura HTTP nativa para um ambiente profissional com tipagem estática, banco de dados relacional com controle de migrations, validações de esquemas de dados, testes E2E automatizados e compilação para produção.

---

## 2.1 Visão Geral do Projeto
A aplicação desenvolvida é uma API REST de controle de transações financeiras pessoais (entradas e saídas). A stack utilizada é composta por:

*   **Fastify**: Framework web de alta performance e baixo overhead para gerenciar rotas e plugins.
*   **TypeScript**: Adiciona tipagem estática ao JavaScript, aumentando a segurança e produtividade em tempo de desenvolvimento.
*   **Knex.js**: Query Builder utilizado para escrever consultas SQL em formato Javascript/Typescript.
*   **SQLite / PostgreSQL**: Bancos de dados relacionais suportados de forma dinâmica na aplicação.
*   **Zod**: Biblioteca para validação de dados de requisição, variáveis de ambiente e inferência de tipos.
*   **@fastify/cookie**: Módulo Fastify para manuseio e segurança de cookies.
*   **Vitest & Supertest**: Ferramentas para testes automatizados rápidos (especialmente de integração/E2E).
*   **tsup**: Empacotador (bundler) rápido para compilar arquivos TypeScript em JavaScript moderno.

---

## 2.2 Requisitos do Sistema
Conforme documentado em [requirements.md](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/docs/requirements.md), os requisitos do projeto foram todos implementados com sucesso:

### Requisitos Funcionais (RF)
*   `[x]` O usuário deve poder criar uma nova transação;
*   `[x]` O usuário deve poder obter um resumo da sua conta (saldo líquido);
*   `[x]` O usuário deve poder listar todas as transações que já ocorreram;
*   `[x]` O usuário deve poder visualizar uma transação única;

### Regras de Negócio (RN)
*   `[x]` A transação pode ser do tipo crédito (soma ao valor total) ou débito (subtrai);
*   `[x]` Deve ser possível identificarmos o usuário entre as requisições (via cookies de sessão);
*   `[x]` O usuário só deve poder visualizar informações que ele mesmo criou;

---

## 2.3 Estrutura do Projeto
A arquitetura do projeto [02-api-rest-nodejs](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/) segue a organização abaixo:

```text
02-api-rest-nodejs/
├── db/
│   └── migrations/                  # Histórico de alterações do banco de dados (Knex)
├── docs/
│   └── requirements.md              # Lista de RF, RN e RNF do sistema
├── src/
│   ├── @types/                      # Definições de tipos customizadas (ex: Knex)
│   ├── env/
│   │   └── index.ts                 # Validação de variáveis de ambiente com Zod
│   ├── middlewares/
│   │   └── check-session-id-exists.ts # Middleware de segurança de rota
│   ├── routes/
│   │   └── transactions.ts          # Definição dos endpoints de transações
│   ├── app.ts                       # Criação e configuração do app Fastify
│   ├── database.ts                  # Configuração do Knex
│   └── server.ts                    # Inicialização e escuta da porta HTTP
├── test/
│   └── transactions.spec.ts         # Arquivo de testes E2E do sistema
├── .env.example                     # Modelo de variáveis de ambiente
├── .env.test.example                # Modelo de variáveis de ambiente de teste
├── knexfile.ts                      # Arquivo apontando para a configuração do Knex CLI
├── tsconfig.json                    # Configurações do compilador TypeScript
└── package.json                     # Scripts e dependências instaladas
```

---

## 2.4 Fastify — Framework Web
O **Fastify** substitui o Express no projeto devido à sua alta velocidade de serialização e suporte nativo a TypeScript.

### Separação de `app.ts` e `server.ts`
Para permitir a execução de testes automatizados com o Supertest sem que o servidor precise escutar em uma porta de rede física, dividimos a lógica:
*   [app.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/app.ts): Instancia o Fastify, registra as rotas e plugins de cookies.
*   [server.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/server.ts): Importa a instância de `app` e roda o método `.listen()`.

#### Código do [app.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/app.ts)
```typescript
import fastify from 'fastify';
import { transactionsRoutes } from './routes/transactions.js';
import cookie from '@fastify/cookie';

export const app = fastify();

app.register(cookie);

app.register(transactionsRoutes, {
    prefix: 'transactions'
});
```

#### Código do [server.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/server.ts)
```typescript
import { app } from './app.js';
import { env } from './env/index.js';

app
    .listen({
        host: '0.0.0.0', // Melhora a compatibilidade em ambientes Docker/WSL
        port: env.PORT,
    })
    .then(() => {
        console.log(`HTTP Server Running on port http://localhost:${env.PORT}`);
    });
```

---

## 2.5 Variáveis de Ambiente com Validação (Zod + dotenv)
Validar variáveis de ambiente na inicialização impede que o servidor execute com configurações quebradas (como uma string de banco de dados nula).

No arquivo [index.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/env/index.ts):
```typescript
import { config } from 'dotenv';
import { z } from 'zod';

// Se for ambiente de testes, carrega .env.test. Caso contrário, carrega o .env padrão.
if (process.env.NODE_ENV === 'test') {
    config({ path: '.env.test' });
} else {
    config();
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3333) // z.coerce garante a conversão de string para number
});

const _env = envSchema.safeParse(process.env);

if(_env.success === false) {
    console.error('Invalid environment variables!', _env.error.format());
    throw new Error('Invalid environment variables.');
}

export const env = _env.data;
```

---

## 2.6 Zod — Validação de Schemas
O Zod é usado para validar corpos de requisições (`req.body`), parâmetros de rota (`req.params`) e consultas (`req.query`), aplicando regras como `.uuid()` para IDs:

```typescript
const getTransactionParamsSchema = z.object({
    id: z.string().uuid(),
});

// Valida req.params. Lança erro automático se não for um UUID válido.
const { id } = getTransactionParamsSchema.parse(request.params);
```

---

## 2.7 Knex.js — Query Builder
O Knex abstrai comandos SQL brutos em JavaScript. A configuração no projeto permite chavear de forma dinâmica entre bancos (ex: SQLite local em desenvolvimento/teste e PostgreSQL em produção).

No arquivo [database.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/database.ts):
```typescript
import setupKnex, { type Knex } from 'knex';
import { env } from './env/index.js';

export const config: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection: env.DATABASE_CLIENT === 'sqlite' 
        ? { filename: env.DATABASE_URL }
        : env.DATABASE_URL,
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations'
    }
};

export const knex = setupKnex(config);
```

---

## 2.8 Migrations — Controle de Versão do Banco
As migrations controlam o histórico evolutivo da estrutura do banco.

1.  **Criação da tabela de Transações**:
    No arquivo [20260523000420_create-transactions.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/db/migrations/20260523000420_create-transactions.ts):
    ```typescript
    export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable('transactions', (table) => {
            table.uuid('id').primary();
            table.text('title').notNullable();
            table.decimal('amount', 10, 2).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        });
    }
    export async function down(knex: Knex): Promise<void> {
        await knex.schema.dropTable('transactions');
    }
    ```
2.  **Adição da Coluna `session_id`**:
    No arquivo [20260524224047_add-session-id-to-transactions.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/db/migrations/20260524224047_add-session-id-to-transactions.ts):
    ```typescript
    export async function up(knex: Knex): Promise<void> {
        await knex.schema.alterTable('transactions', (table) => {
            table.uuid('session_id').index(); // Cria coluna indexada para melhorar a performance das buscas
        });
    }
    export async function down(knex: Knex): Promise<void> {
        await knex.schema.alterTable('transactions', (table) => {
            table.dropColumn('session');
        });
    }
    ```

### Comandos da CLI do Knex
*   Executar migrations pendentes: `npm run knex migrate:latest`
*   Desfazer última migration: `npm run knex migrate:rollback`
*   Desfazer todas as migrations: `npm run knex migrate:rollback --all`
*   Criar nova migration: `npm run knex migrate:make nome_da_migration`

---

## 2.9 session_id — Identificação e Cookies
Para cumprir a RN de manter o estado stateless e isolar os dados dos usuários de forma segura sem uma autenticação tradicional por login/senha, implementou-se o uso de cookies.

### 1. Registro do Cookie
No [app.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/app.ts), registramos o plugin `@fastify/cookie`.

### 2. Criação do Cookie de Sessão
No `POST /transactions` (arquivo [transactions.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/routes/transactions.ts)), o cookie é criado caso o usuário não possua um:
```typescript
let sessionId = request.cookies.sessionId;

if (!sessionId) {
    sessionId = randomUUID();

    reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // Mantém ativo por 7 dias (em segundos)
    });
}
```

### 3. Middleware de Proteção
Para as rotas que exigem um `sessionId` (como listagem e detalhes), utiliza-se o middleware [check-session-id-exists.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/middlewares/check-session-id-exists.ts):
```typescript
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function checkSessionCheckIdExists(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId;

    if (!sessionId) {
        return reply.status(401).send({
            error: 'Unauthorized'
        });
    }
}
```

---

## 2.10 Rotas de Transações
Definidas no arquivo [transactions.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/src/routes/transactions.ts):

| Método | Rota | Protegido por Cookie? | Descrição |
| :--- | :--- | :---: | :--- |
| **POST** | `/transactions` | Não | Cria transação (gera cookie se não existir). |
| **GET** | `/transactions` | Sim | Lista apenas as transações do usuário atual (`session_id`). |
| **GET** | `/transactions/:id` | Sim | Busca detalhes de uma transação específica por ID se pertencer ao usuário. |
| **GET** | `/transactions/summary` | Sim | Retorna a soma líquida de entradas e saídas do usuário. |

> [!TIP]
> **Lógica de Crédito e Débito**
> Os valores de transação são persistidos no banco de dados como números com sinal:
> `amount: type === 'credit' ? amount : amount * -1`
> *   Depósitos são salvos positivos (ex: `100.00`)
> *   Retiradas são salvas negativas (ex: `-50.00`)
> 
> Dessa forma, o cálculo do sumário é simplesmente a soma matemática (`sum('amount')`) da coluna no banco de dados.

---

## 2.11 Testes Automatizados (Vitest + Supertest)
O repositório implementa testes automatizados **E2E (End-to-End)** em [transactions.spec.ts](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/test/transactions.spec.ts).

*   **Vitest**: Motor de execução de testes moderno e rápido compatível com ES Modules.
*   **Supertest**: Executa chamadas HTTP falsas na API passando o objeto de servidor do Fastify (`app.server`), sem abrir portas reais de escuta no SO.

### Estrutura de Ciclo de Vida do Teste
Para garantir que os testes rodem de forma limpa e paralela sem poluir os dados de desenvolvimento, a cada suite:
1.  **Carrega `.env.test`**: A URL de banco de dados passa a ser `./db/test.db` (bancoSQLite temporário).
2.  **`beforeAll`**: Prepara o app Fastify (`await app.ready()`).
3.  **`beforeEach`**: Limpa o banco de dados temporário rodando um `rollback` completo e roda as migrations do zero antes do teste (`knex migrate:latest`).
4.  **`afterAll`**: Fecha o app e conexões de banco de dados (`await app.close()`).

Exemplo do setup dos testes:
```typescript
import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import { app } from '../src/app.js';
import request from 'supertest';

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        // execSync executa comandos de terminal de forma síncrona
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    });
    
    // Casos de testes
});
```

---

## 2.12 TypeScript e Build
Configuração do TypeScript definida em [tsconfig.json](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/02-api-rest-nodejs/tsconfig.json) com parâmetros estritos:
*   `"module": "nodenext"` e `"moduleResolution": "NodeNext"`: Garante a compatibilidade e resolução de módulos nativos do Node de forma moderna.
*   `"verbatimModuleSyntax": true`: Elimina erros de importação de tipagens em runtime garantindo que apenas tipos importados via `import type` sejam ignorados no build de Javascript.

### Processo de Build
A compilação do TypeScript para JavaScript puro de produção é realizada com a biblioteca **tsup**:
```json
"build": "tsup src --out-dir build --format esm"
```
Este comando lê os arquivos na pasta `src/`, converte e empacota-os na pasta de saída `build/` usando o formato ES Modules (`esm`).

---

## 🔄 Comparativo: Nível 1 vs Nível 2

| Característica | Nível 1 (HTTP Nativo) | Nível 2 (Fastify & TS) |
| :--- | :--- | :--- |
| **Framework Web** | Nenhum (`node:http`) | Fastify |
| **Linguagem** | JavaScript (ESM) | TypeScript |
| **Banco de Dados** | Arquivo JSON local (`db.json`) | SQLite / PostgreSQL dinâmico |
| **Interface de Banco** | Classe `Database` personalizada | Knex.js (Query Builder) |
| **Controle de Schema** | Não aplicável | Migrations estruturadas |
| **Validação de Dados** | Estruturas condicionais simples | Zod (Schemas estruturados) |
| **Variáveis de Ambiente** | Nenhuma | Dotenv + Zod na inicialização |
| **Segurança/Sessão** | Stateless puro | Cookies de sessão (`@fastify/cookie`) |
| **Testes** | Sem testes automatizados | Testes E2E com Vitest e Supertest |
| **Processo de Build** | Execução direta de arquivos JS | Compilação com `tsup` |

---

## 📚 Conceitos-Chave para Revisão
1.  **Diferença de App e Server**: Isolamento de inicialização do roteamento e middleware da escuta de portas físicas para permitir ambiente de testes ágil.
2.  **preHandler Hooks**: Como utilizar interceptores no Fastify para validação automática de dados ou sessão.
3.  **Ambiente de Testes Isolar**: Utilizar scripts separados como `process.env.NODE_ENV === 'test'` para apontar para configurações temporárias prevenindo deleção de dados de homologação/desenvolvimento.
4.  **Uso de Migrations**: Criar alterações no banco em etapas reversíveis (`up` e `down`) facilitando a manutenção e trabalho em equipe.
5.  **Coerce no Zod**: Converter valores automaticamente na validação (como porta HTTP passada via string convertida em inteiro).
