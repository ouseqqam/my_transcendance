import { OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'

@WebSocketGateway({
    cors: {
        origin: '*'
    },
})
export class Mygeteway implements OnModuleInit {
    @WebSocketServer()
    server: Server
    onModuleInit() {
        this.server.on('connection', socket => {
            console.log('connected')
            console.log(socket.id)
        })
    }

    
    //how send message to client with socket
    @SubscribeMessage('newMessage')
    onNewMessage(@MessageBody() body: any) {
        this.server.emit('onMessage', {
            msg: 'New message',
            content: body
        })
    }
}