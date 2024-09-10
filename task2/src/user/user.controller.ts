import { Controller, Patch } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Patch('update-problems-flag')
    async updateProblemsFlag() {
        const count = await this.userService.updateProblemsFlag();
        return { updated: true, usersWithProblems: count };
    }
}
