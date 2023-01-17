import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    intervals = new Map<string, any>()

    async banUser(body, socketUser) {
        if (!body) return
       const adminId = 1
        const { userId, conversationId, status } = body
        
        if (!userId || !conversationId || !status) return
        
        if (status !== 'muted' && status !== 'blocked') return
        console.log("1")

        try {
            const admin = await this.prisma.user.findUnique({
                where: {
                    id: adminId
                }
            })
            if (!admin) return

            const isAdmin = await this.prisma.user_Conv.findMany({
                where: {
                    userId: adminId,
                    conversationId,
                    is_admin: true
                }
            })
            if (!isAdmin.length) return

            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            if (!user) return

            const conversation = await this.prisma.conversation.findUnique({
                where: {
                    id: conversationId
                }
            })
            if (!conversation) return

            const userInConversation = await this.prisma.user_Conv.findMany({
                where: {
                    userId,
                    conversationId
                }
            })
            if (!userInConversation.length) return

            const bannedUser = await this.prisma.user_Conv.update({
                where: {
                    userId_conversationId: {
                        userId,
                        conversationId
                    }
                },
                data: {
                    status: status
                }
            })
            if (!bannedUser) return

            const socket = socketUser.get(userId)

            if (socket) {
                for (let i = 0; i < socket.length; i++) {
                    socket[i].emit("baneStatus", {
                        status,
                        conversationId
                    })
                }
            }

            this.intervals.set(userId, setInterval(async () => {
                const unbannedUser = await this.prisma.user_Conv.update({
                    where: {
                        userId_conversationId: {
                            userId,
                            conversationId
                        }
                    },
                    data: {
                        status: 'active'
                    }
                })
                if (unbannedUser) {
                    for (let i = 0; i < socket.length; i++) {
                        socket[i].emit("baneStatus", {
                            status: 'active',
                            conversationId
                        })
                    }
                    clearInterval(this.intervals.get(userId))
                    this.intervals.delete(userId)
                }
            }, 1000 * 60 * 5))
        } catch (error) {
            console.log(error)
        }
    }

    async checkUserStatus(body, res) {
        const { userId, conversationId } = body

        if (!userId || !conversationId) return

        const adminId = 1
        try {
            const admin = await this.prisma.user.findUnique({
                where: {
                    id: adminId
                }
            })
            if (!admin) return res.send({message: "User not found"})

            const isAdmin = await this.prisma.user_Conv.findMany({
                where: {
                    userId: adminId,
                    conversationId: Number(conversationId),
                    is_admin: true
                }
            })

            if (!isAdmin.length) return res.send({message: "You need to be an admin to get banned users"})

            const userStatus = await this.prisma.user_Conv.findMany({
                where: {
                    userId: Number(userId),
                    conversationId: Number(conversationId),
                },
                select: {
                    status: true
                }
            })
            if (userStatus.length > 0) return res.send(userStatus[0])
            res.send({message: "this user is not banned"})
        } catch (error) {
            console.log(error)
            return res.send({message: "Something went wrong"})
        }
    }   
}