import type { UsersRepository } from "@/repositories/users-repository.js";
import { hash } from "bcryptjs";
import { UserAleadyExistsError } from "./errors/user-already-exists-error.js";
import type { User } from "../../../generated/prisma/index.js";

interface RegisterUseCaseRequest {
    name: string;
    email: string;
    password: string;
}

interface RegisterUseCaseResponse {
    user: User
}

export class RegisterUserCase {// Sempre um único método

    constructor(private usersRepository: UsersRepository) {
        this.usersRepository = usersRepository;
    }

    async execute({ name, email, password }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {

        const password_hash = await hash(password, 6);

        const userWithSameEmail = await this.usersRepository.findByEmail(email)

        if (userWithSameEmail) {
            throw new UserAleadyExistsError()
        }

        // const prismaUsersRepository = new PrismaUsersRepository()

        const user = await this.usersRepository.create({
            name,
            email,
            password_hash
        })

        return {
            user
        }
    }
}
