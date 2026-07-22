// d.ts Definição de tipos
// eslint-disable-next-line
import { knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        transactions: {
            id: string
            title: string
        }
    }
}