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
            console.log('connected: ', socket.id)
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
            if (this.count == 2) {
                this.server.to(this.roomName).emit("joinRoom", {
                    status: "Pending",
                    roomName: this.roomName,
                    player1: this.roomData.get(this.roomName)[0]["socketId"],
                    player2: this.roomData.get(this.roomName)[1]["socketId"],
                })
            }
        }
    }

    ballIntersectWall() {
        let w = this.beStage.w - 1.5 / 2 - this.beBall.args[0] / 2
        if (this.beBall.position.x >= w || this.beBall.position.x <= -w)
            return 1
        else
            return 0
    }

    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: any) {
        this.server.to(data.roomName).emit("ball", this.beBall)
        const maxW = this.beStage.w - 1.5 / 2 - this.beBall.args[0] / 2
        const maxH = this.beStage.h - 1.5 / 2 - this.beBall.args[0] / 2
        let signalX = Math.random() > 0.5 ? 1 : -1
        let signalY = Math.random() > 0.5 ? 1 : -1

        const inter = setInterval(async () => {
            if (this.ballIntersectWall() == 1){
                signalX *= -1
                console.log("change signal x")
            }
            if (this.ballIntersectPlayer(this.bePlayer1) == 1 || this.ballIntersectPlayer(this.bePlayer2) == 1) {
                signalY *= -1
                console.log("change signal y")
            }
            else if (this.ballIntersectPlayer(this.bePlayer1) == -1 || this.ballIntersectPlayer(this.bePlayer2) == -1) {
                // if (this.beBall.position.y > 0) {
                //     this.roomData.get(roomName)[1]["score"]++
                //     this.server.emit("onMessage", "player 2 score")
                // }
                // else if (this.beBall.position.y < 0) {
                //     this.roomData.get(roomName)[0]["score"]++
                //     this.server.emit("onMessage", "player 1 score")
                // }
                this.resetBall()
                console.log("reset")
                this.sleep(2000)
                signalX = Math.random() > 0.5 ? 1 : -1
                signalY = Math.random() > 0.5 ? 1 : -1
            }
            this.beBall.position.x += signalX
            this.beBall.position.y += signalY
            console.log(this.beBall.position)
        }, 100)
    }

    ballIntersectPlayer(player: any) {
        let h = this.beStage.h - 1.5 / 2 - this.beBall.args[0] / 2 - player.width
        if (this.beBall.position.y == h) {
            let w = player.position.x  + player.size / 2
            let w2 = player.position.x - player.size / 2
            if (this.beBall.position.x >= w2 && this.beBall.position.x <= w)
                return 1
            else
                return -1
        }
        else {
            if (this.beBall.position.y > 0) {
                if (this.beBall.position.y > h)
                    return -1
                else
                    return 0
            }
            else if (this.beBall.position.y < 0) {
                if (this.beBall.position.y < -h)
                    return -1
                else
                    return 0
            }
        }
    }
    resetBall() {
        this.beBall.position.x = 0
        this.beBall.position.y = 0
    }
    
    changePlayerPosition(player: any, direction: number) {
        player.position.x += direction
    }
    sleep(seconds) {
        var currentTime = new Date().getTime();
        while (currentTime + seconds >= new Date().getTime()) {
        }
     }
}