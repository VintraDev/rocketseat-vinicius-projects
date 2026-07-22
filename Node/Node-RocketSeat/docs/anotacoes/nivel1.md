# 📘 Anotações de Estudo — Node.js (RocketSeat)
## Curso: Ignite Node.js — RocketSeat
### 🟢 NÍVEL 1 — Fundamentos do Node.js

Este documento reúne os conceitos teóricos e práticos abordados no **Nível 1** do curso, onde foi desenvolvida uma API REST completa utilizando apenas os **módulos nativos** do Node.js, sem dependências de frameworks externos (como Express ou Fastify).

---

## 1.1 O que é o Node.js?
O **Node.js** é um runtime de JavaScript focado no lado do servidor (back-end). Ele permite executar código JavaScript fora do navegador, utilizando o motor **V8** do Google Chrome (responsável por traduzir código JS para linguagem de máquina).

*   **Não é um framework**: É um ambiente de execução (plataforma).
*   **Modelo de I/O Não-Bloqueante (Non-blocking I/O)**: As operações de leitura/escrita são executadas de forma assíncrona, liberando a thread principal para continuar processando outras requisições sem esperar pelo término de tarefas lentas (como acesso a banco de dados ou leitura de arquivos).
*   **Orientado a Eventos (Event-Driven)**: Baseado em callbacks e emissores de eventos que controlam o fluxo de execução assíncrona.
*   **Aplicações Ideais**: APIs REST, microsserviços, servidores HTTP, ferramentas CLI, aplicações em tempo real (chat/streaming), etc.

---

## 1.2 Módulos Nativos (Node Built-ins)
Para evitar conflito entre os pacotes do ecossistema NPM e os módulos integrados ao Node, a partir da versão 16+, recomenda-se utilizar o prefixo `node:` nas importações de módulos nativos.

Exemplos de importações modernas:
```javascript
import http from 'node:http';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { Readable, Transform } from 'node:stream';
```

> [!NOTE]
> **Por que usar o prefixo `node:`?**
> Além de deixar explícito que se trata de uma biblioteca nativa do ecossistema do Node.js, previne colisões com bibliotecas de terceiros de mesmo nome instaladas via npm.

---

## 1.3 Protocolo HTTP — Conceitos Fundamentais
A comunicação entre o cliente (front-end/mobile) e o servidor (back-end) ocorre utilizando o protocolo HTTP. Uma requisição HTTP é composta por:
1.  **Método HTTP** (Verbo) — Define a intenção da operação.
2.  **URL** — O caminho/recurso sendo acessado.
3.  **Headers** — Metadados sobre a requisição.
4.  **Body** — Corpo da requisição com dados adicionais (enviado em POST/PUT/PATCH).

### Métodos HTTP Principais
| Método | Descrição |
| :--- | :--- |
| **GET** | Buscar/listar informações do back-end. |
| **POST** | Criar uma nova informação no back-end. |
| **PUT** | Atualizar completamente uma informação no back-end. |
| **PATCH** | Atualizar parcialmente um recurso (ex: alterar um campo específico). |
| **DELETE** | Remover uma informação do back-end. |

### Exemplos de Rotas e Endpoints
*   `GET    /users` — Listar todos os usuários.
*   `POST   /users` — Criar um usuário.
*   `PUT    /users/:id` — Atualizar os dados do usuário com determinado ID.
*   `DELETE /users/:id` — Deletar o usuário de determinado ID.

---

## 1.4 HTTP Status Codes
Os códigos de status da resposta informam o resultado da execução da requisição:

| Faixa | Categoria | Significado | Exemplos |
| :--- | :--- | :--- | :--- |
| **100–199** | Informativas | A requisição foi recebida e o processo continua. | `100 Continue` |
| **200–299** | Sucesso | A ação foi recebida, compreendida e aceita com sucesso. | `200 OK`, `201 Created`, `204 No Content` |
| **300–399** | Redirecionamento | Mais ações são necessárias para completar a requisição. | `301 Moved Permanently`, `302 Found` |
| **400–499** | Erro do Cliente | A requisição contém sintaxe incorreta ou não pode ser processada. | `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| **500–599** | Erro do Servidor | O servidor falhou ao processar uma requisição válida. | `500 Internal Server Error` |

> [!IMPORTANT]
> **Status mais utilizados neste projeto:**
> *   `200 OK`: Requisição de leitura ou atualização executada com sucesso.
> *   `201 Created`: Criação de recurso com sucesso (usado no endpoint de criação de usuários).
> *   `204 No Content`: Sucesso na requisição, porém sem dados a retornar no corpo (comumente usado em PUT, PATCH e DELETE).
> *   `404 Not Found`: Caminho ou recurso solicitado não existe.

---

## 1.5 Cabeçalhos HTTP (Headers)
Cabeçalhos são metadados que trafegam tanto nas requisições do cliente quanto nas respostas do servidor. Eles auxiliam a definir como o conteúdo deve ser processado.

*   `Content-Type: application/json` — Avisa ao destinatário que o corpo da mensagem está em formato JSON.
*   `Authorization: Bearer <token>` — Envia dados de autenticação do usuário.
*   `Accept: application/json` — O cliente especifica que espera receber respostas em formato JSON.

---

## 1.6 Stateful vs Stateless
*   **Stateful**: O servidor mantém em memória ou em arquivos locais o estado das interações de cada usuário. *Exemplo:* Sessões clássicas armazenadas na memória RAM do servidor. Se o servidor for reiniciado, todos os usuários perdem a sessão.
*   **Stateless**: O servidor não guarda estado entre requisições. Cada requisição é independente e deve conter todas as informações necessárias para sua identificação e processamento. *Exemplo:* APIs REST modernas que usam tokens (como JWT) ou cookies trafegando a cada nova requisição.

---

## 1.7 JSON (JavaScript Object Notation)
JSON é um formato leve e universal para transferência de dados. É baseado na sintaxe de objetos JavaScript, porém estruturado puramente como texto.
```json
{
  "id": "2db4b321-df62-43cf-b676-47eb08c2d5aa",
  "name": "Vinicius",
  "email": "vinicius@email.com"
}
```
*   No Node.js, converte-se um objeto para string JSON usando `JSON.stringify(objeto)`.
*   Converte-se uma string JSON de volta para objeto JS usando `JSON.parse(texto)`.

---

## 1.8 Criando um Servidor HTTP Nativo
O módulo nativo `node:http` permite subir um servidor básico capaz de escutar requisições de rede.

No arquivo [server.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/server.js):
```javascript
import http from 'node:http';

const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    // Toda a lógica de leitura de streams e roteamento é tratada aqui.
    return res.writeHead(404).end();
});

server.listen(3333, () => {
    console.log('Server is running on port 3333');
});
```
*   `req` (IncomingMessage): Contém dados da requisição (URL, cabeçalhos, método, etc.) e funciona como uma *Readable Stream*.
*   `res` (ServerResponse): Objeto usado para formular e enviar os dados de volta para o cliente. Funciona como uma *Writable Stream*.

---

## 1.9 Middleware — Conceito e Implementação
Um middleware é um interceptador colocado na rota que executa uma determinada lógica antes de o fluxo principal ser processado.

No Nível 1, implementamos um parser de JSON como middleware no arquivo [json.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/middlewares/json.js):
```javascript
// src/middlewares/json.js
export async function json(req, res) {
    const buffers = [];

    // Lê os chunks de dados que estão chegando no corpo da requisição (Stream)
    for await (const chunk of req) {
        buffers.push(chunk);
    }

    try {
        // Concatena os pedaços e realiza o parse do JSON
        req.body = JSON.parse(Buffer.concat(buffers).toString());
    } catch {
        req.body = null; // Caso não haja corpo ou o JSON seja inválido
    }

    // Garante que todas as respostas padrão retornadas do servidor tenham a flag JSON
    res.setHeader('Content-type', 'application/json');
}
```

> [!TIP]
> **Por que usar Buffers e Streams aqui?**
> O corpo da requisição HTTP é transmitido em partes (chunks). O loop `for await (const chunk of req)` captura cada pedaço de forma não bloqueante, guardando-os em um array de Buffers e juntando tudo com `Buffer.concat()` no final antes de fazer a desserialização.

---

## 1.10 Parâmetros de Requisição (HTTP Parameters)
Existem três maneiras fundamentais de enviar parâmetros ao servidor back-end:

1.  **Query Parameters** (Parâmetros de Consulta):
    *   Ficam embutidos na URL após o caractere `?` (ex: `/users?search=Vinicius&page=2`).
    *   Usados para paginação, ordenação e filtros opcionais.
    *   Não são obrigatórios para a estrutura básica da rota.
    *   Extraídos via função utilitária [extract-query-params.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/utils/extract-query-params.js).
2.  **Route Parameters** (Parâmetros de Rota):
    *   Fazem parte da URL e servem para identificar de forma única um recurso específico (ex: `/users/:id` -> `/users/abc-123`).
    *   São obrigatórios para o funcionamento da rota correspondente.
3.  **Request Body** (Corpo da Requisição):
    *   Dados enviados em formato estruturado (comumente JSON) que não aparecem na URL.
    *   Usados principalmente para criação (`POST`) ou atualização (`PUT`/`PATCH`).

---

## 1.11 Sistema de Roteamento Manual
Como o servidor nativo `node:http` não fornece controle de rotas avançado, desenvolveu-se um mini-roteador manual baseado em Regex para detectar caminhos dinâmicos (como parâmetros de rota `/users/:id`).

### Conversor de Rota para Regex
No arquivo [build-route-path.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/utils/build-route-path.js):
```javascript
export function buildRoutePath(path) {
    const routeParametersRegex = /:([a-zA-Z]+)/g;
    const pathWithParams = path.replaceAll(
        routeParametersRegex,
        '(?<$1>[a-z0-9\\-_]+)' // Cria um grupo nomeado da Regex correspondente ao parâmetro
    );

    // Permite correspondência com query parameters opcionais no final do path
    const pathRegex = new RegExp(`^${pathWithParams}(?<query>\\?(.*))?$`);

    return pathRegex;
}
```

### Definição e Processamento das Rotas
As rotas são descritas em um array de objetos em [routes.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/routes.js) e processadas no arquivo principal [server.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/server.js):
```javascript
// Exemplo de busca e processamento de rotas
const route = routes.find(route => {
    return route.method === method && route.path.test(url);
});

if (route) {
    const routeParams = req.url.match(route.path);
    const { query, ...params } = routeParams.groups;

    req.params = params; // Armazena parâmetros como { id: '...' }
    req.query = query ? extractQueryParams(query) : {};

    return route.handler(req, res);
}
```

---

## 1.12 Banco de Dados em Arquivo JSON
Para simular um banco de dados relacional simples sem dependências de infraestrutura complexa no Nível 1, criamos a classe utilitária [database.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/src/database.js) que persiste os dados localmente em um arquivo chamado `db.json` localizado na pasta raiz do módulo.

A persistência utiliza o módulo nativo `node:fs/promises`:
```javascript
import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {} // Propriedade privada (#)

    constructor() {
        fs.readFile(databasePath, 'utf-8')
            .then(data => { this.#database = JSON.parse(data); })
            .catch(() => { this.#persist(); });
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
    }

    select(table, search) {
        let data = this.#database[table] ?? [];
        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase());
                });
            });
        }
        return data;
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }
        this.#persist();
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id);
        if (rowIndex > -1) {
            this.#database[table][rowIndex] = { id, ...data };
            this.#persist();
        }
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id);
        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }
}
```

---

## 1.13 CRUD de Usuários
Foi construída uma API CRUD completa com as rotas:
*   `GET /users?search=texto`: Lista usuários cadastrados, com filtro por nome e e-mail via Query Params.
*   `POST /users`: Cria um novo usuário. Utiliza `randomUUID()` do módulo nativo `node:crypto` para gerar identificadores únicos de forma segura.
*   `PUT /users/:id`: Edita os dados (`name`, `email`) de um usuário a partir do seu Route Parameter `id`.
*   `DELETE /users/:id`: Deleta um usuário do banco a partir do `id`.

---

## 1.14 Streams no Node.js
Streams são canais de entrada e saída de dados que permitem que a aplicação leia e escreva informações em pequenos pedaços (*chunks*) conforme eles chegam, sem a necessidade de manter todo o conteúdo carregado na memória RAM.

### Tipos de Streams
1.  **Readable Stream**: Produz dados de onde o Node.js pode ler. *Exemplo:* Um arquivo sendo lido no disco, ou uma requisição HTTP (`req`).
2.  **Writable Stream**: Consome dados para onde o Node.js pode escrever. *Exemplo:* Gravar um arquivo no disco, ou a resposta de uma requisição HTTP (`res`).
3.  **Transform Stream**: Lê, processa/modifica e emite dados modificados. *Exemplo:* Criptografia, compressão (gzip).
4.  **Duplex Stream**: Permite tanto leitura quanto escrita simultâneas e independentes. *Exemplo:* Sockets TCP.

### Implementações Práticas
Todas as práticas de stream do Nível 1 estão no diretório [streams/](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/streams/):

*   **Readable Stream Básica** ([fundamentals.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/streams/fundamentals.js)):
    Emite números sequenciais de 1 a 100 com delay de 1 segundo entre eles.
*   **Transform Stream** ([stream-http-server.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/streams/stream-http-server.js)):
    Gera a inversão de sinais numéricos recebidos por requisição e retorna o resultado dinamicamente ao cliente.
*   **Fake Upload Stream** ([fake-upload-to-http-stream.js](file:///c:/Users/viniw/Documents/GitHub/Node-RocketSeat/aulas/01-fundamentos-nodejs/streams/fake-upload-to-http-stream.js)):
    Simula uma requisição HTTP enviando dados de forma lenta via Streams para o servidor local.

---

## 1.15 Buffer no Node.js
O **Buffer** é uma representação de um espaço fixo de alocação de memória física na memória RAM do computador que armazena dados binários (bytes). 
```javascript
const buf = Buffer.from("Vinicius");
console.log(buf.toJSON());
// Imprime bytes correspondentes ao encoding UTF-8 de cada letra:
// { type: 'Buffer', data: [ 86, 105, 110, 105, 99, 105, 117, 115 ] }
```
O Node.js faz uso intenso de Buffers de forma interna ao lidar com arquivos e fluxos de rede, visto que a comunicação nativa lida com bytes brutos e não com texto puro.

---

## 1.16 Configuração do Projeto (ES Modules)
No Nível 1, configurou-se o projeto para rodar em modo ES Modules adicionando a tag `"type": "module"` no arquivo `package.json`, o que permite utilizar `import` e `export` de forma nativa.
Adicionalmente, utilizou-se o script:
```json
"dev": "node --watch src/server.js"
```
A flag `--watch` é nativa nas versões modernas do Node.js (18+) e reinicia o processo automaticamente a cada alteração salva em arquivos monitorados, eliminando a necessidade de ferramentas como o `nodemon`.
