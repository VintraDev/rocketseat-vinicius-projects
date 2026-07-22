import fastify from 'fastify';
import cookie from '@fastify/cookie'
import { dietRoutes } from './routes/meals.js';

export const app = fastify();

app.register(cookie);

app.register(dietRoutes, {
    prefix: 'diets'
})