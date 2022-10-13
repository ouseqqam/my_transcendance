import { Injectable, Req } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { userDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    async create(file: Express.Multer.File, @Req() req) : Promise<userDto> {
        const data= {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            avatar: "",
        }
        if (req.body.username) {
            data.username = req.body.username
        }
        else {
            data.username = req.user.username
        }
        if (file) {
            data.avatar = file.filename + "." + file.mimetype 
        }
        else {
            data.avatar = req.user.avatar
        }
        data.firstName = req.user.firstName
        data.lastName = req.user.lastName
        data.email = req.user.email
        const user = await this.prisma.user.create({
            data: data
        })
        return user
    }

    async user() {
        return await this.prisma.user.findMany();
    }

    async users(username: string) {
        return await this.prisma.user.findUnique({
            where: {
                username
            }
        })
    }
}