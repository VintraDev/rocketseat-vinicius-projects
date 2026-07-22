import { parse } from 'csv-parse'
import fs from 'node:fs'

const stream = fs.createReadStream('./files/tasks.csv')

const parser = stream.pipe(parse({
    from_line: 2
}))

for await (const [title, description] of parser) {
    await fetch('http://localhost:3333/tarefas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    })
}