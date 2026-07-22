import z from "zod";
import type { FastifyRequest, FastifyReply } from 'fastify'
import { RegisterUserCase } from "../services/register.js";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository.js";
import { UserAleadyExistsError } from "../services/errors/user-already-exists-error.js";

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6)
    });

    const { name, email, password } = registerBodySchema.parse(request.body);

    try {
        const prismaUsersRepository = new PrismaUsersRepository()
        const registerUseCase = new RegisterUserCase(prismaUsersRepository)

        await registerUseCase.execute({
            name,
            email,
            password
        })
    } catch (err) {
        if (err instanceof UserAleadyExistsError) {
            return reply.status(409).send()
        }

        throw err
    }

    return reply.status(201).send()
}
