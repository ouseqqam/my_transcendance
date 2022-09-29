import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { userDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    async create(dto: userDto) {
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                firstName: dto.firstName,
                lastName: dto.lastName,
                avatar: "hello"
            }
        })
        return user

    }
}