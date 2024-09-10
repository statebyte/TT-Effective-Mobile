import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async updateProblemsFlag(): Promise<number> {
        const usersWithProblems = await this.usersRepository.count({
            where: { problems: true },
        });

        await this.usersRepository.update({ problems: true }, { problems: false });

        return usersWithProblems;
    }
}
