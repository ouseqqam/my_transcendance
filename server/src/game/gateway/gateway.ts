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
    count  = 2
    roomData = new Map<string, string[]>([])
    roomName = ''
 
    onModuleInit() {
        this.server.on('connection', socket => {
            // console.log('connected')
            // console.log(socket.id)
        })
    }

    @SubscribeMessage('joinToRoom')
    JoinToRoom(roomName: string,@ConnectedSocket()  socket: Socket) {
        socket.join(roomName)
    }

    @SubscribeMessage('start')
    startGame(@MessageBody() data: any, @ConnectedSocket()  socket: Socket) {
        if (this.count == 2) {
            this.roomName = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
            this.count = 0
        }
        this.count++
        socket.join(this.roomName)
        this.server.to(this.roomName).emit('onMessage', "hello1")
        let socketArray = this.roomData.get(this.roomName)
        if (socketArray) {
            this.roomData.set(this.roomName, [...socketArray, socket.id])
        } else {
            this.roomData.set(this.roomName, [socket.id])
        }
        console.log(this.roomData)
    }

}