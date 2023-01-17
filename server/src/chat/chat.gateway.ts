import { Body, Res } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection } from '@nestjs/websockets';
import { Socket } from 'socket.io'
import { gameDto } from 'src/game/gameDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from './chat.service';
// import { NotificationService } from './notification.service';


@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })

@WebSocketGateway()
export class ChatGateway  implements OnGatewayConnection {
    constructor(
      private chatService: ChatService
    ) {}
    
    userSocket = new Map<number, [Socket]>()

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
    }

    @SubscribeMessage('banUser')
    async banUser(@Body() body: any, socket: Socket) {
        await this.chatService.banUser(body, this.userSocket)
    }
}