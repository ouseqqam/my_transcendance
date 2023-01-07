import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection } from '@nestjs/websockets';
import { Socket } from 'socket.io'
// import { NotificationService } from './notification.service';


@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })

@WebSocketGateway()
export class NotificationGateway  implements OnGatewayConnection {
    userData = new Map<any, any>()



    handleConnection(socket: Socket, ...args: any[]) {
        const userId = socket.handshake.query.userId
        console.log('client connected', socket.id)
        this.userData.set(userId, socket)
    }

    handleDisconnect(client: Socket) {
        console.log('client disconnected', client.id)
        this.userData.delete(client.id)
    }
}
