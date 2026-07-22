import type { FastifyInstance } from 'fastify';
import { knex } from '../database.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionCheckIdExists } from '../middlewares/check-session-id-exists.js';

// Tipos de Teste

// Unitários: Testa uma unidade da sua aplicação
// Integração: Comunicação entre duas ou mais unidades
// e2e - Ponta a Ponta: Simulam um usuário operando nossa aplicação

// front-end: Abre a página de login, digite o texto vinicius@rocketseat.com.br no campo com ID, email, clique no botão
// back-end: chamadas HTTP, websockets

// Pirâmide de testes: E2E (não dependem de nenhuma tecnologia, não dependem de arquitetura de softwarez)
// 2000 testes -> Testes E2E -> 16min

export async function transactionsRoutes(app: FastifyInstance) {

    // Vale somente no contexto do plugin
    // app.addHook('preHandler', async (request, reply) => {
    //     console.log(`[${request.method}] - [${request.url}]`);
    // });

    app.get('/', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies;

        const transaction = await knex('transactions')
            .where('session_id', sessionId)
            .select();

        return { transaction };
    });

    // http://localhost:3333/transactions/id_da_transação
    app.get('/:id', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request) => {
        const { sessionId } = request.cookies;

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getTransactionParamsSchema.parse(request.params);

        const transaction = await knex('transactions')
            .where({
                session_id: sessionId,
                id
            })
            .first();

        return { transaction };
    });

    app.get('/summary', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request) => {
        const { sessionId } = request.cookies;
        const summary = await knex('transactions')
            .sum('amount', { as: 'amount' })
            .where('session_id', sessionId)
            .first();

        return { summary };
    });

    app.post('/', async (request, reply) => {
        // { title, amount, type: credit or debit }
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        });

        const { title, amount, type } = createTransactionBodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 Days
            });
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        });

        return reply.status(201).send();
    });
}
