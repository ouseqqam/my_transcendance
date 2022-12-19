import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { ball, player1, player2, stage } from './data'

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})

export class Mygeteway implements OnGatewayInit, OnGatewayConnection{

    @WebSocketServer()
    server: Server

    count  = 2
    roomData = new Map<string, any>([])
    roomName = ''
  
    afterInit(){
        // console.log("init")
    }

    handleConnection(){
        // console.log("connect")
    }

    handleDisconnect(client: Socket){
        console.log("disconnect")
        let socketId = client.id
        for (let [key, value] of this.roomData) {
            for (let i = 0; i < value.length; i++) {
                if (value[i].player1?.socketId == socketId || value[i].player2?.socketId == socketId) {
                    this.server.to(key).emit("disconnected", {
                        "socketId": socketId,
                        "message": "disconnect"
                    })
                    this.roomData.delete(key)
                    return
                }
            }
        }
    }

    @SubscribeMessage('joinToRoom')
    JoinToRoom(roomName: string, @ConnectedSocket() socket: Socket) {
        socket.join(roomName)
        let socketArray = this.roomData.get(roomName)
        if (socketArray) {
            socketArray[3].watchers.push(socket.id)
        }
        this.server.to(roomName).emit("watcher", {
            "socketId": socket.id,
            "message": "joined to room"
        })
    }

    @SubscribeMessage('findGame')
    reqToJoin(@ConnectedSocket()  socket: Socket) {
        let exist = 0
        if (this.count == 2) {
            this.roomName = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
            console.log(ball)
            this.roomData.set(this.roomName, [{"ball": ball}])
            this.count = 0
        }
        socket.join(this.roomName)
        let socketArray = this.roomData.get(this.roomName)
        for (let [key, value] of this.roomData) {
            for (let i = 0; i < value.length; i++) {
                if (value[i].player?.socketId == socket.id || value[i].player?.socketId == socket.id) {
                    exist = 1
                    break
                }
            }
        }
        if (exist == 0) {
            if (this.count == 0) {
                if (socketArray) {
                    this.roomData.set(this.roomName, [...socketArray, {
                        "player": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player1.position
                        }
                    }])
                }
                else {
                    this.roomData.set(this.roomName, [{
                        "player": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player1.position
                        }
                    }])
                }
            } else if (this.count == 1) {
                if (socketArray) {
                    this.roomData.set(this.roomName, [...socketArray, {
                        "player": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player2.position
                        },
                    },
                    {
                        "watchers": []
                    },
                    {interval: 0},
                ])
                }
                else {
                    this.roomData.set(this.roomName, [{
                        "player": {
                            "socketId": socket.id,
                            "score": 0,
                            "position": player2.position
                        }
                    }])
                }
                this.server.to(this.roomName).emit("joinRoom", {
                    "status": "pending",
                    "roomName": this.roomName,
                    "player1": this.roomData.get(this.roomName)[1].player.socketId,
                    "player2": this.roomData.get(this.roomName)[2].player.socketId
                })
            }
            this.count++
        }
    }



    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: any) {
        let room = this.roomData.get(data.roomName)
        let roomName = data.roomName
        if (!room || !roomName)
            return
        let signalX = Math.random() > 0.5 ? 1 : -1
        let signalY = Math.random() > 0.5 ? 1 : -1

        this.roomData.get(data.roomName)[4].interval = setInterval(() => {
            this.server.to(data.roomName).emit("gameData", {
                "ball": this.roomData.get(data.roomName)[0].ball.position,
                "player1": this.roomData.get(data.roomName)[1].player.position,
                "player2": this.roomData.get(data.roomName)[2].player.position,
                score: {
                    "player1": this.roomData.get(data.roomName)[1].player.score,
                    "player2": this.roomData.get(data.roomName)[2].player.score
                }
            })

            if (this.ballIntersectWall(this.roomData.get(data.roomName)[0].ball.position, signalX) == 1){
                signalX *= -1
                // console.log("change signal x")
            }
            if (this.ballIntersectPlayer(this.roomData.get(data.roomName)[1].player, this.roomData.get(data.roomName)[0].ball.position, signalX, signalY) == 1 ||
                    this.ballIntersectPlayer(this.roomData.get(data.roomName)[2].player, this.roomData.get(data.roomName)[0].ball.position, signalX, signalY) == 1) {
                signalY *= -1
                // console.log("change signal y")
            }
            else if (this.ballIntersectPlayer(this.roomData.get(data.roomName)[1].player, this.roomData.get(data.roomName)[0].ball.position, signalX, signalY) == -1 ||
                        this.ballIntersectPlayer(this.roomData.get(data.roomName)[2].player, this.roomData.get(data.roomName)[0].ball.position, signalX, signalY) == -1) {
                if (this.roomData.get(data.roomName)[0].ball.position.y > 0)
                    this.roomData.get(data.roomName)[1].player.score++
                else if (this.roomData.get(data.roomName)[0].ball.position.y < 0)
                    this.roomData.get(data.roomName)[2].player.score++
                this.resetBall(data.roomName)
                this.resetPlayers(data.roomName)
                if (this.roomData.get(data.roomName)[1].player.score == 10 || this.roomData.get(data.roomName)[2].player.score == 10) {
                    this.server.to(data.roomName).emit("gameOver", {
                        "player1": this.roomData.get(data.roomName)[1].player.score,
                        "player2": this.roomData.get(data.roomName)[2].player.score
                    })
                    this.roomData.delete(data.roomName)
                    return clearInterval(this.roomData.get(data.roomName)[4].interval)
                }
                // console.log("reset")
                signalX = Math.random() > 0.5 ? 1 : -1
                signalY = Math.random() > 0.5 ? 1 : -1
            }
            this.roomData.get(data.roomName)[0].ball.position.x += signalX
            this.roomData.get(data.roomName)[0].ball.position.y += signalY
        }, 80)
    }

    @SubscribeMessage('paddleMove')
    player1(@MessageBody() data: any) {
        const roomName = data.roomName
        const room = this.roomData.get(roomName)
        const socketId = data.socketId
        const right = data.right
        const left = data.left
        const w = stage.w / 2 - stage.cRight.args[1] - player1.size / 2

        if (!room || !roomName || !socketId)
            return
        
        if (socketId == room[1].player.socketId) {
            const player = room[1].player.position
            if (right && player.x + 3 < w)
                player.x += 3
            else if (left && player.x - 3 > -w)
                player.x -= 3
            this.server.to(roomName).emit("player1", player)
        }
        else if (socketId == room[2].player.socketId) {
            const player = room[2].player.position
            if (right && player.x + 3 < w)
                player.x += 3
            else if (left && player.x - 3 > -w)
                player.x -= 3
            this.server.to(roomName).emit("player2", player)
        }
    }

    ballIntersectWall(ball1: any, signalX: number) {
        let w = stage.w / 2 - stage.cRight.args[0] / 2  - ball.args[0] / 2
        if (ball1.x + signalX > w || ball1.x + signalX < -w)
            return 1
        else
            return 0
    }

    ballIntersectPlayer(player: any, ball1: any, signalX: number, signalY: number) {
        if (ball1.y + signalY == player.position.y) {
            let w = player.position.x  + player1.size / 2 - 0.5 - 1.5 / 2
            let w2 = player.position.x - player1.size / 2 - 0.5 - 1.5 / 2
            if (ball1.x + signalX > w2 && ball1.x + signalX < w)
                return 1
        }
        else {
            
            if (player.position.y > 0) {
                if (ball1.y + signalY > player.position.y) {
                    return -1
                }
            }
            else if (player.position.y < 0) {
                if (ball1.y + signalY < player.position.y) {
                    return -1
                }
            }
        }
    }

    resetBall(roomName: string) {
        this.roomData.get(roomName)[0].ball.position.x = 0
        this.roomData.get(roomName)[0].ball.position.y = 0
    }
    
    resetPlayers(roomName: string) {
        let player1 = this.roomData.get(roomName)[1].player.position
        let player2 = this.roomData.get(roomName)[2].player.position
        player1.x = 0
        player2.x = 0
    }
}