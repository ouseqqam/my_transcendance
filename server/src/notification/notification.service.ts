import { Injectable, Res } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'


@Injectable()
export class NotificationService {
    constructor (private prisma: PrismaService) {}
    
    async getInvReceive(userId: number) {
        const notifications = await this.prisma.notification.findMany({
            where: {
                receiverId: Number(userId),
            },
            select: {
                senderId: true,
                type: true,
                roomId: true,
            }
        })
        

        const senderNames = await Promise.all(
            notifications.map(async (notification) => {
                const sender = await this.prisma.user.findUnique({
                    where: {
                        id: notification.senderId
                    },
                    select: {
                        userName: true
                    }
                })
                return sender.userName
            })
        )

        const result = notifications.map((notification, index) => {
            return {
                senderName : senderNames[index],
                type: notification.type,
                roomId: notification.roomId
            }
        })
        return result
    }
}
