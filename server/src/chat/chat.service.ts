import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    intervals = new Map<string, any>()

    async banUser(body, res) {
       const adminId = 1
        const { userId, conversationId, status } = body
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
                    conversationId: conversationId,
                    is_admin: true
                }
            })
            if (!isAdmin.length) return res.send({message: "You need to be an admin to ban a user"})

            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            if (!user) return res.send({message: "User not found"})

            const conversation = await this.prisma.conversation.findUnique({
                where: {
                    id: conversationId
                }
            })
            if (!conversation) return res.send({message: "Conversation not found"})

            const userInConversation = await this.prisma.user_Conv.findMany({
                where: {
                    userId: userId,
                    conversationId: conversationId
                }
            })
            if (!userInConversation.length) return res.send({message: "User not found in conversation"})

            const bannedUser = await this.prisma.user_Conv.update({
                where: {
                    userId_conversationId: {
                        userId: userId,
                        conversationId: conversationId
                    }
                },
                data: {
                    status: status
                }
            })
            if (!bannedUser) return res.send({message: "User not found in conversation"})
            res.send({message: "User are " + status + " successfully"})

            this.intervals.set(userId, setInterval(async () => {
                const unbannedUser = await this.prisma.user_Conv.update({
                    where: {
                        userId_conversationId: {
                            userId: userId,
                            conversationId: conversationId
                        }
                    },
                    data: {
                        status: 'active'
                    }
                })
                if (unbannedUser) {
                    clearInterval(this.intervals.get(userId))
                    this.intervals.delete(userId)
                }
            }, 1000 * 60 * 5))
        } catch (error) {
            console.log(error)
            return res.send({message: "Something went wrong"})
        }
    }

    async checkUserStatus(body, res) {
        const { userId, conversationId } = body
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
                    conversationId,
                    is_admin: true
                }
            })
            if (!isAdmin.length) return res.send({message: "You need to be an admin to get banned users"})

            const bannedUsers = await this.prisma.user_Conv.findMany({
                where: {
                    userId,
                    conversationId,
                    OR: [
                        {
                            status: 'mute'
                        },
                        {
                            status: 'block'
                        }
                    ]
                }
            })
            if (bannedUsers.length > 0) return res.send({message: "this user is banned"})
            res.send({message: "this user is not banned"})
        } catch (error) {
            console.log(error)
            return res.send({message: "Something went wrong"})
        }
    }
}
