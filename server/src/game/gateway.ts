import { Body } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { ball, player1, player2, stage } from './data'
import { gameDto } from "./gameDto";

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
                if (value?.status2  == 'pending') {
                    this.roomData?.delete(key)
                }
                this.server.to(key).emit("leftGame", {
                    status: "gameOver",
                    roomName: key,
                    player1: '',
                    player2: value?.player2,
                })
                clearInterval(value?.interval)
                this.roomData?.delete(key)
                console.log("room deleted", key)
                return
            }
            else if (socket.id == value?.player2?.socketId) {
                this.server.to(key).emit("leftGame", {
                    status: "gameOver",
                    roomName: key,
                    player1: value?.player1,
                    player2: '',
                })
                clearInterval(value?.interval)
                this.roomData?.delete(key)
                console.log("room deleted", key)
                return
            }
        }
    }

    @SubscribeMessage('joinToRoom')
    JoinToRoom(@MessageBody() data: gameDto, @ConnectedSocket() socket: Socket) {
        let roomName = data.roomName
        socket.join(data.roomName)
        let socketArray = this.roomData.get(data.roomName)
        if (socketArray) {
            this.roomData.get(data.roomName).watchers.push(socket.id)
            this.server.to(roomName).emit("watcher", {
                "socketId": socket.id,
                "message": "joined to room"
            })
        }
    }

    @SubscribeMessage('findGame')
    reqToJoin(@ConnectedSocket()  socket: Socket, @MessageBody() data: gameDto) {
        let exist = 0
        if (this.count == 0) {
            this.roomName = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
            this.roomData.set(this.roomName, {
                ball: {
                    position: { x: 0, y: 0, z: 1 },
                    args: [1, 100, 100],
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
            if (data && data.receiverId && data.dificulty) {
                this.roomData.set(this.roomName, {
                    dificulty: data.dificulty,
                    status: "private",
                    status2: "pending",
                    ...this.roomData.get(this.roomName),
                    player2: data.receiverId,
                    watchers: [],
                    interval: 0
                })
                this.count = -1
                return
            }
        }
        else if (this.count == 1 && exist == 0) {
            this.roomData.set(this.roomName, {
                status: "public",
                status2: "pending",
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
        console.log(this.roomData)
    }
    
    @SubscribeMessage('acceptGame')
    acceptGame(@MessageBody() data: gameDto, @ConnectedSocket() socket: Socket) {
        let room = this.roomData.get(data.roomName)
        let roomName = data.roomName
        let player2Id = room.player2.socketId
        let id = 1
        if (!room || !roomName || player2Id != room.player2)
            return
        this.roomData.set(data.roomName, {
            ...this.roomData.get(data.roomName),
            player2: {
                socketId: socket.id,
                score: 0,
                position: { x: 0, y: 60 / 2 - 3, z: 0 }
            },

        })
    }


    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: gameDto) {
        let room = this.roomData.get(data.roomName)
        let roomName = data.roomName
        let speed = 0.5
        let time = 20

        if (!room || !roomName)
            return
        
        if (this.roomData.get(data.roomName).status2 == 'gameOver') {
            this.roomData.get(data.roomName).status2 = 'started'
            this.roomData.get(data.roomName).player1.score = 0
            this.roomData.get(data.roomName).player2.score = 0
            this.resetBall(data.roomName)
            this.resetPlayers(data.roomName)
        }
        let signalX = Math.random() > 0.5 ? speed : -speed
        let signalY = Math.random() > 0.5 ? speed : -speed

        if (this.roomData.get(data.roomName).status == 'private') {
            if (this.roomData.get(data.roomName).dificulty == 'hard')
                time = 15
            else if (this.roomData.get(data.roomName).dificulty == 'easy')
                time = 30
        }

        this.roomData.get(data.roomName).interval = setInterval(() => {
            this.roomData.get(data.roomName).status2 = "started"
            this.server.to(data.roomName).emit("gameData", {
                status: "start",
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
                        status: "gameOver",
                        player1: this.roomData.get(data.roomName).player1.score,
                        player2: this.roomData.get(data.roomName).player2.score
                    })
                    this.roomData.get(data.roomName).status2 = 'gameOver'
                    clearInterval(this.roomData.get(data.roomName).interval)
                    return
                }
                signalX = Math.random() > 0.5 ? speed : -speed
                signalY = Math.random() > 0.5 ? speed : -speed
            }
            this.roomData.get(data.roomName).ball.position.x += signalX
            this.roomData.get(data.roomName).ball.position.y += signalY
        }, time)
    }

    @SubscribeMessage('paddleMove')
    paddleMove(@MessageBody() data: gameDto) {
        const roomName = data.roomName
        const room = this.roomData.get(roomName)
        const socketId = data.socketId
        const right = data.right
        const left = data.left
        const w = stage.w / 2 - stage.cRight.args[1] / 2 - player1.size / 2
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
            status: "start",
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
        let h1  = player.position.y + ball.args[0]
        let h2 = player.position.y - ball.args[0]
        if (ball1.y + signalY == h1 || ball1.y + signalY == h2) {
            let w = player.position.x  + player1.size / 2 + ball.args[0]
            let w2 = player.position.x - player1.size / 2 - ball.args[0]
            if (ball1.x + signalX  >= w2 && ball1.x + signalX <= w)
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



