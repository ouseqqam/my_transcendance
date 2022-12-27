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

    count  = 0
    roomData = new Map<string, any>()
    roomName = ''

    afterInit(){
        // console.log("init")
    }

    handleConnection(){
        // console.log("connect")
    }

    handleDisconnect(socket: Socket){
        for (let [key, value] of this.roomData) {
            if (socket.id == value?.player1?.socketId) {
                this.server.to(key).emit("leftGame", {
                    status: "player1 left game",
                    roomName: key,
                    socketId: socket.id
                })
                clearInterval(value?.interval)
                this.roomData?.delete(key)
                console.log("room deleted", key)
                return
            }
            else if (socket.id == value?.player2?.socketId) {
                this.server.to(key).emit("leftGame", {
                    status: "player2 left game",
                    roomName: key,
                    socketId: socket.id
                })
                clearInterval(value?.interval)
                this.roomData?.delete(key)
                console.log("room deleted", key)
                return
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
        if (this.count == 0) {
            this.roomName = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
            this.roomData.set(this.roomName, {
                ball: {
                    position: { x: 0, y: 0, z: 1 },
                    args: [1, 100, 100]
                },
            })
        }

        //check if socket already in room
        for (let [key, value] of this.roomData) {
            if (socket.id == value?.player1?.socketId || socket.id == value?.player2?.socketId) {
                this.server.to(this.roomName).emit("joinRoom", {
                    status: "You are already in room",
                })
                console.log("You are already in room")
                return
            }
        }

        socket.join(this.roomName)
        
        if (this.count == 0 && exist == 0) {
            this.roomData.set(this.roomName, {
                ...this.roomData.get(this.roomName),
                player1: {
                    socketId: socket.id,
                    score: 0,
                    position: { x: 0, y: -60 / 2 + 3, z: 0 }
                },
            })
        }
        else if (this.count == 1 && exist == 0) {
            this.roomData.set(this.roomName, {
                ...this.roomData.get(this.roomName),
                player2: {
                    socketId: socket.id,
                    score: 0,
                    position: { x: 0, y: 60 / 2 - 3, z: 0 }
                },
                watchers: [],
                interval: 0
            })

            this.count = -1

            this.server.to(this.roomName).emit("joinRoom", {
                status: "pending",
                roomName: this.roomName,
                player1: this.roomData.get(this.roomName).player1.socketId,
                player2: this.roomData.get(this.roomName).player2.socketId
            })
        }
        this.count++
    }



    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: any) {
        let room = this.roomData.get(data.roomName)
        let roomName = data.roomName
        if (!room || !roomName)
            return
        let signalX = Math.random() > 0.5 ? 1 : -1
        let signalY = Math.random() > 0.5 ? 1 : -1

        this.roomData.get(data.roomName).interval = setInterval(() => {
            this.server.to(data.roomName).emit("gameData", {
                ball: this.roomData.get(data.roomName).ball.position,
                player1: this.roomData.get(data.roomName).player1.position,
                player2: this.roomData.get(data.roomName).player2.position,
                score: {
                    player1: this.roomData.get(data.roomName).player1.score,
                    player2: this.roomData.get(data.roomName).player2.score
                }
            })

            if (this.ballIntersectWall(this.roomData.get(data.roomName).ball.position, signalX) == 1){
                signalX *= -1
            }
            if (this.ballIntersectPlayer(this.roomData.get(data.roomName).player1, this.roomData.get(data.roomName).ball.position, signalX, signalY) == 1 ||
                    this.ballIntersectPlayer(this.roomData.get(data.roomName).player2, this.roomData.get(data.roomName).ball.position, signalX, signalY) == 1) {
                signalY *= -1
            }
            else if (this.ballIntersectPlayer(this.roomData.get(data.roomName).player1, this.roomData.get(data.roomName).ball.position, signalX, signalY) == -1 ||
                        this.ballIntersectPlayer(this.roomData.get(data.roomName).player2, this.roomData.get(data.roomName).ball.position, signalX, signalY) == -1) {
                if (this.roomData.get(data.roomName).ball.position.y > 0)
                    this.roomData.get(data.roomName).player1.score++
                else if (this.roomData.get(data.roomName).ball.position.y < 0)
                    this.roomData.get(data.roomName).player2.score++
                this.resetBall(data.roomName)
                this.resetPlayers(data.roomName)
                if (this.roomData.get(data.roomName).player1.score == 10 || this.roomData.get(data.roomName).player2.score == 10) {
                    this.server.to(data.roomName).emit("gameOver", {
                        player1: this.roomData.get(data.roomName).player1.score,
                        player2: this.roomData.get(data.roomName).player2.score
                    })
                    clearInterval(this.roomData.get(data.roomName).interval)
                    this.roomData.delete(data.roomName)
                    return
                }
                signalX = Math.random() > 0.5 ? 1 : -1
                signalY = Math.random() > 0.5 ? 1 : -1
            }
            this.roomData.get(data.roomName).ball.position.x += signalX
            this.roomData.get(data.roomName).ball.position.y += signalY
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
        const players = []

        if (!room || !roomName || !socketId)
            return
        
        if (socketId == this.roomData.get(roomName).player1.socketId) {
            if (right && this.roomData.get(roomName).player1.position.x + 3 < w)
                this.roomData.get(roomName).player1.position.x += 3
            else if (left && this.roomData.get(roomName).player1.position.x - 3 > -w)
                this.roomData.get(roomName).player1.position.x -= 3
            players.push(this.roomData.get(roomName).player1.position, this.roomData.get(data.roomName).player2.position)
        }
        else if (socketId == this.roomData.get(roomName).player2.socketId) {
            if (right && this.roomData.get(roomName).player2.position.x + 3 < w)
            this.roomData.get(roomName).player2.position.x += 3
            else if (left && this.roomData.get(roomName).player2.position.x - 3 > -w)
            this.roomData.get(roomName).player2.position.x -= 3
                players.push(this.roomData.get(data.roomName).player1.position, this.roomData.get(roomName).player2.position)
        }
        this.server.to(roomName).emit("gameData", {
            ball: this.roomData.get(data.roomName).ball.position,
            player1: players[0],
            player2: players[1],
            score: {
                player1: this.roomData.get(data.roomName).player1.score,
                player2: this.roomData.get(data.roomName).player2.score
            }
        })
    }

    ballIntersectWall(ball1: any, signalX: number) {
        let w = stage.w / 2 - stage.cRight.args[0] / 2  - ball.args[0] / 2
        if (ball1.x + signalX >= w || ball1.x + signalX <= -w)
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
        this.roomData.get(roomName).ball.position.x = 0
        this.roomData.get(roomName).ball.position.y = 0
    }
    
    resetPlayers(roomName: string) {
        this.roomData.get(roomName).player1.position.x = 0
        this.roomData.get(roomName).player2.position.x = 0
    }
}