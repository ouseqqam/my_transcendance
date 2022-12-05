import { OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { ball, player1, player2, stage } from './data'

@WebSocketGateway({
    cors: {
        origin: '*'
    },
})

export class Mygeteway implements OnModuleInit {
    @WebSocketServer()
    server: Server

    count  = 2
    roomData = new Map<string, any>([])
    roomName = ''
    beStage = stage
    beBall = ball
    bePlayer1 = player1
    bePlayer2 = player2
 
    onModuleInit() {
        this.server.on('connection', socket => {
            // console.log('connected')
            // console.log(socket.id)
        })
    }

    @SubscribeMessage('joinToRoom')
    JoinToRoom(roomName: string, @ConnectedSocket() socket: Socket) {
        socket.join(roomName)
        let socketArray = this.roomData.get(this.roomName)
        this.roomData.set(this.roomName, [...socketArray,{
            "socketId": socket.id,
            "role": "watcher"
        }])
        this.server.to(roomName).emit("onMessage", "you can now watch the game")
    }

    @SubscribeMessage('findGame')
    reqToJoin(@ConnectedSocket()  socket: Socket) {
        console.log(socket.id)
        let exist = 0
        if (this.count == 2) {
            this.roomName = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
            this.count = 0
        }
        socket.join(this.roomName)
        let socketArray = this.roomData.get(this.roomName)
        this.roomData.forEach((value) => {
            if (value.includes(socket.id)) {
                socket.emit("onMessage", "You are already in the room")
                exist = 1
                return
            }
        })
        if (exist == 0) {
            if (socketArray) {
                this.roomData.set(this.roomName, [...socketArray,{
                    "socketId": socket.id,
                    "role": this.count == 0 ? "player1" : "player2",
                    "score": 0,
                }])
            } else {
                this.roomData.set(this.roomName, [{
                    "socketId": socket.id, 
                    "role": this.count == 0 ? "player1" : "player2",
                    "score": 0,
                }])
            }
            this.count++
            if (this.count == 1) {
                socket.emit("onMessage", "Waiting for another player to join")
            }
            else if (this.count == 2) {
                this.server.to(this.roomName).emit("joinRoom", {
                    status: "Pending",
                    roomName: this.roomName,
                    player1: this.roomData.get(this.roomName)[0]["socketId"],
                    player2: this.roomData.get(this.roomName)[1]["socketId"],
                })
            }
        }
        console.log(this.roomData)
    }

    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: any, roomName: string) {
        this.server.to(roomName).emit("onMessage", "game started")
        const maxW = this.beStage.w - 1.5 / 2 - this.beBall.args[0] / 2
        const maxH = this.beStage.h - 1.5 / 2 - this.beBall.args[0] / 2
        let signalX = Math.random() > 0.5 ? 1 : -1
        let signalY = Math.random() > 0.5 ? 1 : -1

        setInterval(() => {
            if (this.beBall.position.x >= maxW || this.beBall.position.x <= -maxW)
                signalX *= -1
            this.beBall.position.x += signalX
            if (this.beBall.position.y >= maxH || this.beBall.position.y <= -maxH)
                signalY *= -1
            this.beBall.position.y += signalY
            this.server.to(roomName).emit("onMessage", "hello")
            console.log(this.beBall.position)
        }, 1000 /110)
    }
}