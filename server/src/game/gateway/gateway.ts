import { OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
    cors: {
        origin: '*'
    },
})

export class Mygeteway implements OnModuleInit {
    @WebSocketServer()
    server: Server
    sockets = new Map<string, Socket>()
    request = new Map<string, Socket>()
 
    onModuleInit() {
        this.server.on('connection', socket => {
            console.log('connected')
             console.log(socket.id)
            this.sockets.set(socket.id, socket)
        })
    }

    @SubscribeMessage('join')
    createRoom(@MessageBody() data: any,@ConnectedSocket()  socket: Socket) {
        socket.join(data.room)
    }

    @SubscribeMessage('start')
    startGame(@MessageBody() data: any,@ConnectedSocket()  socket: Socket) {
        socket.to(data.room).emit('start')
    }

    @SubscribeMessage('requestToJoin')
    requestToJoin(@MessageBody() data: any,@ConnectedSocket()  socket: Socket) {

}