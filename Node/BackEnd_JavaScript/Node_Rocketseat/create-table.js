import { sql } from './db.js';

sql`
    CREATE TABLE video (
        id          TEXT PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        duration    INTEGER
    );
`.then(() => {
    console.log('Table "video" created successfully!');
}).catch((err) => {
    console.error('Error creating table:', err);
});