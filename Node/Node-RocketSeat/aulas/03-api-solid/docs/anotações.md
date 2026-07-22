# Anotações

Anotações referentes ao módulo 3 de Node.js

## Modelo de negócios

### Requisitos Funcionais (RFs)

São funcionalidades que vão partir do usuário (Ex: login, cadastro, etc)

### Regras de negócio (RNs)

São restrições de desenvolvimento para a aplicação atingir os objetivos do cliente

### Requisitos não Funcionais (RNFs)

São funcionalidades que vão partir do lado do desenvolvedor (Ex: segurança, desempenho, etc)

## ORM

Alto nível de abstração em cima do banco de dados

ORM (Object Realtional Mapping)

Mapeia a estrutura do banco de dados dentro do JavaScript, representando sua estrutura

Prisma - ORM -> Integração muito grande com TypeScript

## Prisma ORM

Gera a tipagem do Prisma
- `npx prisma generate`

Faz uma migração em hambiente de desenvolvimento
- `npx prisma migrate dev`

Faz uma migração em hambiente de produção
- `npx prisma migrate deploy`

Abre a visualização do schema do banco de dados
- `npx prisma studio`

### schema.prisma

@ -> faz interações com a coluna
@@ -> faz interações com a tabela

[] -> significa vários Ex: Um usuário faz vários check ins

Função fing unique somente encontram valores definidos como @unique e @id

## Docker

Hambientes isolados para a execução de imagens como o Postgres ou aplicações back end e mais, bastante utilizado por 

PG instalation 
``` 

docker run --name api-solid-pg -e POSTGRESQL_USERNAME=docker -e POSTGRESQL_PASSWORD=docker -e POSTGRESQL_DATABASE=apisolid -p 5432:5432 bitnami/postgresql:latest 

```

### Docker compose

Arquivo para automatização de conteiners do Docker

docker-compose.yml

version: --versão do documento compose

services: serviços a serem executados
    image: imagem do serviço
    ports: portas expostas do docker
    enviroment: variáveis de execução da imagem

Muito útil para evitar que o usuário utilize vários comandos para a execução da aplicação.

Comandos

up: inicializa e instala os serviços
stop: interrompe sem deletar os serviços
down: encerra e remove os serviços 

```

docker compose up -d

docker compose stop

docker compose down

```

## Segurança

### Hashing 

Diferente da criptografia, o dado somente vai e não volta

### Bcryptjs

Download:

- npm i bcryptjs

hash(password, 6)

primeiro parâmetro a senha e o segundo é o número de vezes que o hashing vai se repetir

# Principios SOLID

- S
- O
- L
- I
- D: Dependency Inversion Principle
Tem o principal motivo de inversão da ordem em que a dependencia, em vez do caso de uso instanciar uma dependencia, ele vai receber elas como parâmetros
