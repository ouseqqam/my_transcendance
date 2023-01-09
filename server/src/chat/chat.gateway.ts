import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection } from '@nestjs/websockets';
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

    handleConnection(socket: Socket) {
     
    }

    handleDisconnect() {
     
    }
}
