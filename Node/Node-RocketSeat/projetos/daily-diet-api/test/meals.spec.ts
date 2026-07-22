import { afterAll, beforeAll, describe, beforeEach, it, expect } from "vitest";
import { app } from "../src/app.js";
import request from 'supertest';
import { execSync } from "node:child_process";

describe('Meals routes', () => {
    beforeAll(async () => {
        await app.ready();
    })

    afterAll(async () => {
        app.close();
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    })

    it('Sould be able to create a new meal', async () => {
        await request(app.server)
            .post('/diets')
            .send({
                name: 'New Meal',
                description: 'Description of a New Meal',
                is_on_diet: true,
            })
            .expect(201);
    });

    it('Sould be able to list all meals', async () => {
        const createMealResponse = await request(app.server)
            .post('/diets')
            .send({
                name: 'New Meal',
                description: 'Description of a New Meal',
                is_on_diet: true,
            });

        const cookies = createMealResponse.get('Set-Cookie') ?? [];

        const listMealsResponse = await request(app.server)
            .get('/diets')
            .set('Cookie', cookies)
            .expect(200);

        expect(listMealsResponse.body.meal).toEqual([
            expect.objectContaining({
                name: 'New Meal',
                description: 'Description of a New Meal',
                is_on_diet: 1,
            })
        ])
    })

    it('Should be able to get a especific Meal', async () => {
        const createMealResponse = await request(app.server)
            .post('/diets')
            .send({
                name: 'New Meal',
                description: 'Description of a New Meal',
                is_on_diet: true,
            });

        const cookies = createMealResponse.get('Set-Cookie') ?? [];

        const listMealsResponse = await request(app.server)
            .get('/diets')
            .set('Cookie', cookies)
            .expect(200);

        const mealId = listMealsResponse.body.meal[0].id;

        const getMealResponse = await request(app.server)
            .get(`/diets/${mealId}`)
            .set('Cookie', cookies)
            .expect(200);

        expect(getMealResponse.body).toEqual(
            expect.objectContaining({
                name: 'New Meal',
                description: 'Description of a New Meal',
                is_on_diet: 1,
            })
        );
    });

    it('Should be able to get the summary', async () => {
        const createMealResponse = await request(app.server)
            .post('/diets')
            .send({
                name: 'In a diet Meal',
                description: 'Description of a New Meal',
                is_on_diet: true,
            });

        const cookies = createMealResponse.get('Set-Cookie') ?? [];

        await request(app.server)
            .post('/diets')
            .set('Cookie', cookies)
            .send({
                name: 'Out of diet Meal',
                description: 'Description of a New Meal',
                is_on_diet: false,
            });

        const summaryResponse = await request(app.server)
            .get('/diets/summary')
            .set('Cookie', cookies)
            .expect(200)

        expect(summaryResponse.body).toEqual({
            "totalMeals": 2,
            "totalOnDiet": 1,
            "totalOffDiet": 1,
            "bestSequence": 1
        })
    })
})