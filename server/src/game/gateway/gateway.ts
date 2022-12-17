import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { PrismaService } from "src/prisma/prisma.service";
import { ball, player1, player2, stage } from './data'

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})

export class Mygeteway implements OnGatewayInit, OnGatewayConnection{
    constructor (private prisma: PrismaService) {}

    @WebSocketServer()
    server: Server

    count  = 2
    roomData = new Map<string, any>([])
    roomName = ''
  
    afterInit(){
        console.log("init")
    }

    handleConnection(){
        console.log("connect")
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
        let socketArray = this.roomData.get(this.roomName)
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
                    }])
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
                    "Status": "Pending",
                    "roomName": this.roomName,
                    "player1": this.roomData.get(this.roomName)[1].player.socketId,
                    "player2": this.roomData.get(this.roomName)[2].player.socketId
                })
            }
            this.count++
        }
        console.log(this.roomData)
    }



    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: any) {
        const room = this.roomData.get(data.roomName)
        const roomName = data.roomName
        if (!room || !roomName)
            return
        let signalX = Math.random() > 0.5 ? 1 : -1
        let signalY = Math.random() > 0.5 ? 1 : -1

        const interval = setInterval(() => {
            let ballPos = this.roomData.get(roomName)[0].ball.position
            let bePlayer1 = this.roomData.get(roomName)[1].player
            let bePlayer2 = this.roomData.get(roomName)[2].player

            this.server.to(roomName).emit("gameData", {
                "ball": ballPos,
                "player1": bePlayer1.position,
                "player2": bePlayer2.position,
                score: {
                    "player1": bePlayer1.score,
                    "player2": bePlayer2.score
                }
            })
            if (this.ballIntersectWall(ballPos) == 1){
                signalX *= -1
                console.log("change signal x")
            }
            if (this.ballIntersectPlayer(bePlayer1, ballPos) == 1 ||
                    this.ballIntersectPlayer(bePlayer2, ballPos) == 1) {
                signalY *= -1
                console.log("change signal y")
            }
            else if (this.ballIntersectPlayer(bePlayer1, ballPos) == -1 ||
                        this.ballIntersectPlayer(bePlayer2, ballPos) == -1) {
                if (ballPos.y > 0)
                    this.roomData.get(roomName)[1].player.score++
                else if (ballPos.y < 0)
                    this.roomData.get(roomName)[2].player.score++
                this.resetBall(roomName)
                this.resetPlayers(roomName)
                if (this.roomData.get(roomName)[1].player.score == 10 || this.roomData.get(roomName)[2].player.score == 10) {
                    this.server.to(roomName).emit("gameOver", {
                        "player1": this.roomData.get(roomName)[1].player.score,
                        "player2": this.roomData.get(roomName)[2].player.score
                    })
                    this.roomData.delete(roomName)
                    clearInterval(interval)
                }
                console.log("reset")
                signalX = Math.random() > 0.5 ? 1 : -1
                signalY = Math.random() > 0.5 ? 1 : -1
            }
            this.roomData.get(roomName)[0].ball.position.x += signalX
            this.roomData.get(roomName)[0].ball.position.y += signalY
            console.log(this.roomData.get(roomName)[0].ball.position)
        }, 100)
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

    ballIntersectWall(ball1: any) {
        let w = stage.w / 2 - 1.5 - ball.args[0]
        if (ball1.x > w || ball1.x < -w)
            return 1
        else
            return 0
    }

    ballIntersectPlayer(player: any, ball1: any, signalX: number, signalY: number) {
        if (ball1.y + signalY == player.position.y) {
            let w = player.position.x  + player1.size / 2
            let w2 = player.position.x - player1.size / 2
            if (ball1.x + signalX >= w2 && ball1.x + signalX <= w)
                return 1
        }
        else {
            if (ball1.y + signalY > 0){
                if (ball1.y > player.position.y) {
                    return -1
                }
            }
            else if (ball1.y + signalY < 0){
                if (ball1.y < player.position.y) {
                    return -1
                }
            }
        }
    }

    resetBall(roomName: string) {
        let ball1 = this.roomData.get(roomName)[0].ball.position
        // console.log("position before: ", this.roomData.get(roomName)[0].ball.position)
        ball1.x = 0
        ball1.y = 0
        // console.log("position: ", this.roomData.get(roomName)[0].ball.position)
    }
    
    resetPlayers(roomName: string) {
        let player1 = this.roomData.get(roomName)[1].player.position
        let player2 = this.roomData.get(roomName)[2].player.position
        player1.x = 0
        player2.x = 0
    }
}