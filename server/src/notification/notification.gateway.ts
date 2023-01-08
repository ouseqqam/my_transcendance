import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection } from '@nestjs/websockets';
import { copyFileSync } from 'fs';
import { Socket } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service';
// import { NotificationService } from './notification.service';


@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })

@WebSocketGateway()
export class NotificationGateway  implements OnGatewayConnection {
    constructor(private prisma: PrismaService) {}

    userSocket = new Map<any, any>()

    handleConnection(socket: Socket) {
      const userId = 2
      if (userId) {
        if (!this.userSocket.has(userId)) {
            this.userSocket.set(userId, [socket])
        } 
        else {
          const sockets = this.userSocket.get(userId)
            sockets.push(socket)
            this.userSocket.set(userId, sockets)
        }
      }
    }

    handleDisconnect() {
      const userId = 2
      this.userSocket.delete(userId)
    }

    @SubscribeMessage('enviteToRoom')
    async enviteToChatRoom(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
      if (!data )
        return
      // console.log(data)
      const roomId = data.roomId
      const receiverId = data.receiverId
      const type = data.type
      const senderId = 3
      if (!roomId || !receiverId || !senderId || !type)
        return
      if (type != 'chat' && type != 'game' && type != 'friendRequest')
        return
      const sockets = this.userSocket.get(receiverId)
      if (sockets) {
        sockets.forEach((socket: Socket) => {
          socket.emit('sentInvToReceiver', {
            type,
            roomId,
            senderId
          })
        })
        if (type == 'chat' || type == 'friendRequest') {
          console.log('create notification')
          await this.prisma.notification.create({
            data: {
              type,
              roomId,
              senderId,
              receiverId
            }
          })
        }
      }
    }
}
