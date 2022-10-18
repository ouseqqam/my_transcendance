import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvitationService {
    constructor (private prisma: PrismaService) {}

    async sendInv(id1: number, id2: number) {
        return await this.prisma.friend.create({
            data: {
                user1: Number(id1),
                user2: Number(id2),
            }
        })
    }

    async getInvReceive(id: number) {
        return await this.prisma.user.findMany({
            where: {
                sender: {
                    some: {
                        accepted: false,
                        user2: Number(id),
                    },
                }
            },
        })
    }

    async getInvSent(id: number) {
        return await this.prisma.user.findMany({
            where: {
                reciver: {
                    some: {
                        accepted: false,
                        user1: Number(id),
                    },
                }
            },
        })
    }
    
    async acceptInv(id1: number, id2: number) {
        const { id }= await this.prisma.friend.findFirst({
            select: {
                id: true,
            },
            where: {
                user1: Number(id1),
                user2: Number(id2),
            }
        })
        if (!id)
            return null;

        return await this.prisma.friend.update({
            where: {
                id
            },
            data: {
                accepted: true,
            }
        })
    }
}
