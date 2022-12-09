import { OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { ball, player1, player2, stage } from './data'

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class Mygeteway implements OnModuleInit {
    @WebSocketServer()
    server: Server

    count  = 2
    roomData = new Map<string, any>([])
    roomName = ''
    bePlayer1 = player1
    bePlayer2 = player2
 
    onModuleInit() {
        this.server.on('connection', socket => {
            // console.log('connected: ', socket.id)
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
            this.roomData.set(this.roomName, [{"ball": ball}])
            this.count = 0
        }
        socket.join(this.roomName)
        let socketArray = this.roomData.get(this.roomName)
        for (let [key, value] of this.roomData) {
            for (let i = 0; i < value.length; i++) {
                if (value[i].player1?.socketId == socket.id || value[i].player2?.socketId == socket.id) {
                    exist = 1
                    break
                }
            }
        }
        if (exist == 0) {
            if (this.count == 0) {
                if (socketArray) {
                    this.roomData.set(this.roomName, [...socketArray, {
                        "player1": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player1.position
                        }
                    }])
                }
                else {
                    this.roomData.set(this.roomName, [{
                        "player1": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player1.position
                        }
                    }])
                }
            } else if (this.count == 1) {
                if (socketArray) {
                    this.roomData.set(this.roomName, [...socketArray, {
                        "player2": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player2.position
                        }
                    }])
                }
                else {
                    this.roomData.set(this.roomName, [{
                        "player1": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player1.position
                        }
                    }])
                }
                this.server.to(this.roomName).emit("joinRoom", {
                    "Status": "Pending",
                    "roomName": this.roomName,
                    "player1": this.roomData.get(this.roomName)[1].player1.socketId,
                    "player2": this.roomData.get(this.roomName)[2].player2.socketId
                })
            }
            this.count++
        }
        console.log(this.roomData)
    }


    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: any) {
        const len = this.roomData.get(data.roomName)
        if (!len)
            return
        const roomName = data.roomName
        this.ballIntersectWall(roomName)
        let ball1 = this.roomData.get(roomName)[0].ball.position
        let signalX = Math.random() > 0.5 ? 1 : -1
        let signalY = Math.random() > 0.5 ? 1 : -1

        const inter = setInterval(() => {
            this.server.to(roomName).emit("ball", ball1)
            if (this.ballIntersectWall(roomName) == 1){
                signalX *= -1
                console.log("change signal x")
            }
            if (this.ballIntersectPlayer(this.bePlayer1, roomName) == 1 || this.ballIntersectPlayer(this.bePlayer2, roomName) == 1) {
                signalY *= -1
                console.log("change signal y")
            }
            else if (this.ballIntersectPlayer(this.bePlayer1, roomName) == -1 || this.ballIntersectPlayer(this.bePlayer2, roomName) == -1) {
                this.resetBall(roomName)
                console.log(ball1)
                this.server.to(roomName).emit("ball", ball1)
                console.log("reset")
                this.sleep(2000)
                signalX = Math.random() > 0.5 ? 1 : -1
                signalY = Math.random() > 0.5 ? 1 : -1
            }
            //get the signal to move
            this.roomData.get(roomName)[0].ball.position.x += signalX
            this.roomData.get(roomName)[0].ball.position.y += signalY
        }, 100)
    }

    @SubscribeMessage('movePlayer')
    movePlayer(@MessageBody() data: any) {
        const roomName = data.roomName
        const socketId = data.socketId
        const signal  = data.signal
        for(let i = 0; i < this.roomData.get(roomName).length; i++) {
            if (this.roomData.get(roomName)[i].player1?.socketId == socketId) {
                this.roomData.get(roomName)[i].player1.position.x += signal
                this.server.to(roomName).emit("player1", {
                    "position": this.roomData.get(roomName)[i].player1.position,
                })
                break
            }
            else if (this.roomData.get(roomName)[i].player2?.socketId == socketId) {
                this.roomData.get(roomName)[i].player2.position.x += signal
                this.server.to(roomName).emit("player2", {
                    "position": this.roomData.get(roomName)[i].player2.position,
                })
                break
            }
        }
    }

    ballIntersectWall(roomName: string) {
        let ball1 = this.roomData.get(roomName)[0].ball.position
        let w = stage.w - 1.5 / 2 - ball.args[0] / 2
        if (ball1.x >= w || ball1.x <= -w)
            return 1
        else
            return 0
    }

    ballIntersectPlayer(player: any, roomName: string) {
        let ball1 = this.roomData.get(roomName)[0].ball.position
        let h = stage.h - 1.5 / 2 - ball.args[0] / 2 - player.width
        if (ball1.y == h) {
            let w = player.position.x  + player.size / 2
            let w2 = player.position.x - player.size / 2
            if (ball1.x >= w2 && ball1.x <= w)
                return 1
            else
                return -1
        }
        else {
            if (ball1.y > 0) {
                if (ball1.y > h)
                    return -1
                else
                    return 0
            }
            else if (ball1.y < 0) {
                if (ball1.y < -h)
                    return -1
                else
                    return 0
            }
        }
    }

    resetBall(roomName: string) {
        let ball1 = this.roomData.get(roomName)[0].ball.position
        ball1.x = 0
        ball1.y = 0
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