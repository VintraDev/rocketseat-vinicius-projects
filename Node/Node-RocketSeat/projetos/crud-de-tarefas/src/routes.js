import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tarefas'),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(tasks));
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tarefas'),
        handler: (req, res) => {
            const { title, description } = req.body;

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            database.insert('tasks', task);
            res.writeHead(201);
            return res.end('Tarefa Criada!');
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tarefas/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.select('tasks', { id })

            if (!task.length) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Tarefa não encontrada' }))
            }

            const { title, description } = req.body;

            database.update('tasks', id, {
                title,
                description
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tarefas/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.select('tasks', { id })

            if (!task.length) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Tarefa não encontrada!' }))
            }

            database.delete('tasks', id);

            return res.writeHead(200).end(JSON.stringify({ message: 'Tarefa deletada com sucesso!' }))
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tarefas/:id/concluida'),
        handler: (req, res) => {

            const { id } = req.params;

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Tarefa não encontrada!' }))
            }

            database.update('tasks', id, {
                updated_at: new Date()
            })

            completed_at: task.completed_at ? null : new Date()

            return res.writeHead(204).end()
        }
    }
];