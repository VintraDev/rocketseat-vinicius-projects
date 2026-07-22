# 🚀 API de Cadastro de Usuários (Backend)

Este projeto é uma API RESTful desenvolvida para gerenciar um sistema de cadastro de usuários. Construída com **Node.js** e **Express**, ela utiliza o **Prisma ORM** para interagir de forma eficiente com um banco de dados **MySQL**.

O projeto serve como back-end para uma aplicação Full Stack, gerenciando operações de CRUD (Create, Read, Update, Delete) e garantindo a integridade dos dados.

## 🛠️ Tecnologias Utilizadas

* **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript server-side.
* **[Express](https://expressjs.com/)**: Framework web rápido e minimalista.
* **[Prisma](https://www.prisma.io/)**: ORM moderno para Node.js e TypeScript.
* **[MySQL](https://www.mysql.com/)**: Sistema de gerenciamento de banco de dados relacional.
* **[Cors](https://www.npmjs.com/package/cors)**: Middleware para habilitar CORS (Cross-Origin Resource Sharing).

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/en/download/) (v14 ou superior)
* [MySQL](https://dev.mysql.com/downloads/installer/) (Rodando localmente ou via Docker)
* [Git](https://git-scm.com/)

## 🔧 Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/RosiestSloth/BackEnd_JavaScript]
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    Crie um arquivo chamado `.env` na raiz do projeto. Dentro dele, configure a variável `DATABASE_URL` com as suas credenciais do MySQL.
    
    *Exemplo de arquivo .env:*
    ```env
    # Modelo: 
    DATABASE_URL="mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"
    ```

4.  **Execute as Migrations (Prisma):**
    Para criar as tabelas no seu banco de dados MySQL automaticamente:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Inicie o Servidor:**
    ```bash
    node server.js
    npm run dev
    ```

    O servidor iniciará em: `http://localhost:3000`

## 🔗 Documentação da API

Abaixo estão listados os endpoints disponíveis na aplicação.

### 🟢 Status da API
Verifica se a API está online.
- **Rota:** `GET /`
- **Resposta:**
  ```json
  {
    "mensagem": "API está funcionando",
    "status": 200
  }
