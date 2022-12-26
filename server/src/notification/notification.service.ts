import { Injectable, Res } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'


@Injectable()
export class NotificationService {
    constructor (private prisma: PrismaService) {}
    

    async inviteToChatRoom(senderId: number, reciverId: number) {
        const sender = await this.prisma.user.findUnique({
            where: {
                id: senderId
            }
        })
        if (!sender)
            return null
        const reciver = await this.prisma.user.findUnique({
            where: {
                id: reciverId
            }
        })
        if (!reciver)
            return null
        return await this.prisma.notification.create({
            data: {
                sender: Number(senderId),
                reciver: Number(reciverId),
                type: 'inviteToChatRoom',
            },
        })
    }

    // async getInvReceive(id: number) {
    //     return await this.prisma.user.findMany({
    //         where: {
    //             sender: {
    //                 some: {
    //                     accepted: false,
    //                     reciver: Number(id),
    //                 },
    //             }
    //         },
    //     })
    // }
}
