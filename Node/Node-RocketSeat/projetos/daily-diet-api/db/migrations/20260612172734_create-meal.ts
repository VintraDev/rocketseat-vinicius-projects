import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('description').nullable();
        table.timestamp('date').defaultTo(knex.fn.now()).notNullable();
        table.boolean('is_on_diet').defaultTo(true).notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}

