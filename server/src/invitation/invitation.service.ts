import { Injectable, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { json } from 'stream/consumers';

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
        const id= await this.prisma.friend.findFirst({
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
                id: id.id
            },
            data: {
                accepted: true,
            }
        })
    }

    async deleteInv(id1: number, id2: number, res) {
        const id= await this.prisma.friend.findFirst({
            select: {
                id: true,
            },
            where: {
                user1: Number(id1),
                user2: Number(id2),
            }
        })
        if (!id)
            return res.status(404).send("This invitation doesn't exist")

        return await this.prisma.friend.delete({
            where: {
                id: id.id
            }
        })
    }
}
