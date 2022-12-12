import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ball, paddle1, paddle2, stage } from './data';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Mygeteway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  count = 2;
  roomData = new Map<string, any>([]);
  roomName = '';
  bePlayer1 = paddle1;
  bePlayer2 = paddle2;
  interval = null;
  onModuleInit() {
    this.server.on('connection', (socket) => {
      // console.log('connected: ', socket.id)
    });
  }

  @SubscribeMessage('joinToRoom')
  JoinToRoom(roomName: string, @ConnectedSocket() socket: Socket) {
    socket.join(roomName);
    let socketArray = this.roomData.get(this.roomName);
    this.roomData.set(this.roomName, [
      ...socketArray,
      {
        socketId: socket.id,
        role: 'watcher',
      },
    ]);
    this.server.to(roomName).emit('onMessage', 'you can now watch the game');
  }

  @SubscribeMessage('findGame')
  reqToJoin(@ConnectedSocket() socket: Socket) {
    let exist = 0;
    if (this.count == 2) {
      this.roomName =
        Math.random().toString(36).substring(2) +
        new Date().getTime().toString(36);
      this.roomData.set(this.roomName, [{ ball: ball }]);
      this.count = 0;
    }
    socket.join(this.roomName);
    let socketArray = this.roomData.get(this.roomName);
    for (let [key, value] of this.roomData) {
      for (let i = 0; i < value.length; i++) {
        if (
          value[i].player1?.socketId == socket.id ||
          value[i].player2?.socketId == socket.id
        ) {
          exist = 1;
          break;
        }
      }
    }
    if (exist == 0) {
      if (this.count == 0) {
        if (socketArray) {
          this.roomData.set(this.roomName, [
            ...socketArray,
            {
              player1: {
                socketId: socket.id,
                score: 0,
                position: paddle1.position,
              },
            },
          ]);
        } else {
          this.roomData.set(this.roomName, [
            {
              player1: {
                socketId: socket.id,
                score: 0,
                position: paddle1.position,
              },
            },
          ]);
        }
      } else if (this.count == 1) {
        if (socketArray) {
          this.roomData.set(this.roomName, [
            ...socketArray,
            {
              player2: {
                socketId: socket.id,
                score: 0,
                position: paddle2.position,
              },
            },
          ]);
        } else {
          this.roomData.set(this.roomName, [
            {
              player1: {
                socketId: socket.id,
                score: 0,
                position: paddle1.position,
              },
            },
          ]);
        }
        this.server.to(this.roomName).emit('joinRoom', {
          status: 'pending',
          roomName: this.roomName,
          player1: this.roomData.get(this.roomName)[1].player1.socketId,
          player2: this.roomData.get(this.roomName)[2].player2.socketId,
        });
      }
      this.count++;
    }
    console.log(this.roomData);
  }

  @SubscribeMessage('startGame')
  startGame(@MessageBody() data: any) {
    const len = this.roomData.get(data.roomName);
    if (!len) return;
    const roomName = data.roomName;
    let ball1 = this.roomData.get(roomName)[0].ball.position;
    let dx = Math.random() > 0.5 ? 1 : -1;
    let dy = Math.random() > 0.5 ? 1 : -1;

    this.interval = setInterval(() => {
      if (this.ballIntersectWall(roomName, dx) == 1) dx *= -1;
      if (
        this.ballIntersectPlayer(roomName, dx, dy) == 1 ||
        this.ballIntersectPlayer(roomName, dx, dy) == 1
      )
        dy *= -1;
      //   } else if (
      //     this.ballIntersectPlayer(this.bePlayer1, roomName) == -1 ||
      //     this.ballIntersectPlayer(this.bePlayer2, roomName) == -1
      //   ) {
      //     if (ball1.y > 0) this.roomData.get(roomName)[1].player1.score++;
      //     else if (ball1.y < 0) this.roomData.get(roomName)[2].player2.score++;
      //     this.resetBall(roomName);
      //     let test = this.server.to(roomName).emit('reset', {
      //       ball: this.roomData.get(roomName)[0].ball.position,
      //       player1Score: this.roomData.get(roomName)[1].player1.score,
      //       player2Score: this.roomData.get(roomName)[2].player2.score,
      //     });
      //     console.log(test);
      //     console.log('reset');
      //     this.sleep(2000);
      //     dx = Math.random() > 0.5 ? 1 : -1;
      //     dy = Math.random() > 0.5 ? 1 : -1;
      //   }
      this.roomData.get(roomName)[0].ball.position.x += dx;
      this.roomData.get(roomName)[0].ball.position.y += dy;
    }, 1000 / 100);
  }

  @SubscribeMessage('movePlayer')
  movePlayer(@MessageBody() data: any) {
    const roomName = data.roomName;
    const socketId = data.socketId;
    const signal = data.signal;
    for (let i = 0; i < this.roomData.get(roomName).length; i++) {
      if (this.roomData.get(roomName)[i].player1?.socketId == socketId) {
        this.roomData.get(roomName)[i].player1.position.x += signal;
        this.server.to(roomName).emit('player1', {
          position: this.roomData.get(roomName)[i].player1.position,
        });
        break;
      } else if (this.roomData.get(roomName)[i].player2?.socketId == socketId) {
        this.roomData.get(roomName)[i].player2.position.x += signal;
        this.server.to(roomName).emit('player2', {
          position: this.roomData.get(roomName)[i].player2.position,
        });
        break;
      }
    }
  }

  ballIntersectWall(roomName: string, dx: number) {
    let currentBall = this.roomData.get(roomName)[0].ball.position;
    if (
      currentBall.x + dx < -stage.w / 2 + stage.cLeft.args[1] ||
      currentBall.x + dx > stage.w / 2 - stage.cRight.args[1]
    )
      return 1;
    return 0;
  }
  // we must switch m,ap to objects

  ballIntersectPlayer(roomName: string, dx: number, dy: number) {
    let currentRoom = this.roomData.get(roomName);
    let currentBall = currentRoom[0].position;
    let player1 = currentRoom[1].position;
    let player2 = currentRoom[2].position;
    console.log('CuurentBall:', currentBall);
    if (
      currentBall.y + dy - 0.5 == player2.y ||
      (currentBall.y + dy - 0.5 == player1.y &&
        currentBall.x + dx >= player1.x - paddle1.size / 2 &&
        currentBall.x + dx <= player1.x + paddle1.size / 2)
    )
      return 1;
    return 0;
  }

  resetBall(roomName: string) {
    let ball1 = this.roomData.get(roomName)[0].ball.position;
    ball1.x = 0;
    ball1.y = 0;
  }

  changePlayerPosition(player: any, direction: number) {
    player.position.x += direction;
  }

  sleep(seconds: number) {
    var currentTime = new Date().getTime();
    while (currentTime + seconds >= new Date().getTime()) {}
  }
}
