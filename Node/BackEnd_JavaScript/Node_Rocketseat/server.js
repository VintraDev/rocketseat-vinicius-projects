// import { createServer } from 'node:http'

// const server = createServer((request, response) => {

//     response.write('Hello World')

//     return response.end()
// });

// server.listen(3000);

// POST localhost:3000/video
// DELETE localhost:3000/videos/1

import { fastify } from 'fastify'
// import { DatabaseMemory } from './database-memory.js'
import { DatabasePostgres } from './database-postgres.js';

const server = fastify();

// const database = new DatabaseMemory()

const database = new DatabasePostgres

// GET, POST, PUT, DELETE

// POST http://localhost:3000/videos
// PUT http://localhost:3000/videos/3

// Request Body

server.post('/videos', async (request, response) => {

    const { title, description, duration} = request.body

     await database.create({
        title,
        description,
        duration,
    });

    return response.status(201).send('Vídeo publicado com sucesso!');
});

server.get('/videos', async (request, response) => {
    const search = await request.query.search

    const video = await database.list(search);

    console.log(video);

    return video;
});

// Route Parameter

server.put('/videos/:id', async (request, response) => {
    const videoId = request.params.id;
    const { title, description, duration} = request.body;

    const video = await database.update(videoId, {
        title,
        description,
        title,
    });

    return response.status(204).send('Vídeo editado com sucesso!')
})

server.delete('/videos/:id', async (request, response) => {
    const videoId = request.params.id;

    await database.delete(videoId);

    return response.status(204).send('Vídeo deletado com sucesso!');
})

server.listen({
    port: 3000
});

// CRUD (Create Read Update Delete)

