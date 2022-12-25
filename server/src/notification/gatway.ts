import { OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'

export class Mygeteway implements OnGatewayInit, OnGatewayConnection{
    @WebSocketServer()
    server: Server

    handleConnection() {
        throw new Error("Method not implemented.");
    }
    afterInit(server: any) {
        throw new Error("Method not implemented.");
    }
    
    @SubscribeMessage('getNotificationInviteToPrivateChatRoom')
    inviteToPrivateChatRoom(@MessageBody() data: any) {
        const {id, roomName} = data
        
    }
}