import type { FastifyInstance } from "fastify";
import { checkSessionCheckIdExists } from "../middlewares/check-session-id-exists.js";
import { knex } from "../database.js";
import z from "zod";
import { randomUUID } from "node:crypto";

export async function dietRoutes(app: FastifyInstance) {
    app.get('/', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies;

        const meal = await knex('meals')
            .where('session_id', sessionId)
            .select();

        return { meal }
    });

    app.get('/:id', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies

        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMealParamsSchema.parse(request.params);

        const meal = await knex('meals')
            .where({
                session_id: sessionId,
                id
            })
            .first();

        return meal
    });

    app.get('/summary', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies;

        const meals = await knex('meals')
            .where({ session_id: sessionId })
            .orderBy('date', 'asc');

        const totalMeals = meals.length;

        const totalOnDiet = meals.filter(meal => meal.is_on_diet).length;
        const totalOffDiet = totalMeals - totalOnDiet;

        let bestSequence = 0;
        let currentSequence = 0;

        for (let i = 0; i < meals.length; i++) {
            const meal = meals[i];

            if (meal.is_on_diet) {
                currentSequence += 1;

                if (currentSequence > bestSequence) {
                    bestSequence = currentSequence;
                }
            } else {
                currentSequence = 0;
            }
        }

        return {
            totalMeals,
            totalOnDiet,
            totalOffDiet,
            bestSequence
        };
    });

    app.post('/', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.boolean()
        });

        const { name, description, is_on_diet } = createMealBodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            });
        };

        await knex('meals').insert({
            id: randomUUID(),
            name,
            description,
            is_on_diet,
            session_id: sessionId
        });

        return reply.status(201).send();
    })

    app.put('/:id', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies;

        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMealParamsSchema.parse(request.params);

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.boolean()
        });

        const { name, description, is_on_diet } = createMealBodySchema.parse(request.body);

        await knex('meals')
            .where({
                id: id,
                session_id: sessionId
            })
            .update({
                name,
                description,
                is_on_diet
            })

        return reply.status(204).send()
    })

    app.delete('/:id', {
        preHandler: [checkSessionCheckIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies;

        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMealParamsSchema.parse(request.params);

        await knex('meals')
            .where({
                id: id,
                session_id: sessionId
            })
            .delete()

        return reply.status(204).send();
    })
}