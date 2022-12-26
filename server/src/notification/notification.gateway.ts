import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io'
import { NotificationService } from './notification.service';

@WebSocketGateway()
export class NotificationGateway {
  constructor(private invitationService: NotificationService) {}

  @SubscribeMessage('inviteToChatRoom')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    const roomName = data.roomName
    const reciverId = data.reciverId
    const senderId = data.senderId
    const socketId = data.socketId
    try {
      this.invitationService.inviteToChatRoom(senderId, reciverId)
      socket.broadcast.to(socketId).emit('sendInvToChatRoom', {
        senderId,
        roomName,
      })
    } catch (error) {
      console.log(error)
    }
  }
}