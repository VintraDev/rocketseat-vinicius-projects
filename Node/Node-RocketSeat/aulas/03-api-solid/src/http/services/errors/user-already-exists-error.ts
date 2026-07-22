export class UserAleadyExistsError extends Error {
    constructor() {
        super('E-Mail already exists')
    }
}