import { Injectable } from '@nestjs/common';
import { gameDto } from './gameDto';
import { ball, player1, stage } from './data'


@Injectable()
export class GameService {

    count = 0
    roomData = new Map<string, any>()
    roomName = ''

    ballIntersectWall(ball1: any, signalX: number) {
        let w = stage.w / 2 - stage.cRight.args[0] / 2 - ball.args[0] / 2;
        if (ball1.x + signalX >= w || ball1.x + signalX <= -w) return 1;
        else return 0;
    }

    ballIntersectPlayer(
        player: any,
        ball1: any,
        signalX: number,
        signalY: number,
    ) {
        let h1 = player.position.y + ball.args[0];
        let h2 = player.position.y - ball.args[0];
        if (ball1.y + signalY == h1 || ball1.y + signalY == h2) {
          let w = player.position.x + player1.size / 2 + ball.args[0];
          let w2 = player.position.x - player1.size / 2 - ball.args[0];
          if (ball1.x + signalX >= w2 && ball1.x + signalX <= w) return 1;
        } else {
          if (player.position.y > 0) {
            if (ball1.y + signalY > player.position.y) {
              return -1;
            }
          } else if (player.position.y < 0) {
            if (ball1.y + signalY < player.position.y) {
              return -1;
            }
          }
        }
    }
    
    resetBall(roomName: string, roomData) {
        const room = roomData.get(roomName);
        room.ball.position.x = 0;
        room.ball.position.y = 0;
    }
    
    resetPlayers(roomName: string, roomData) {
        const room = roomData.get(roomName);
        room.player1.position.x = 0;
        room.player2.position.x = 0;
    }

    findGame(socket, data, server, roomData) {
        let exist = 0;
        if (this.count == 0) {
          this.roomName =
            Math.random().toString(36).substring(2) +
            new Date().getTime().toString(36);
          roomData.set(this.roomName, {
            ball: {
              position: { x: 0, y: 0, z: 1 },
              args: [1, 100, 100],
            },
          });
        }
    
        //check if socket already in room
        for (let [key, value] of roomData) {
          if (
            socket.id == value?.player1?.socketId ||
            socket.id == value?.player2?.socketId
          ) {
            server.to(this.roomName).emit('joinRoom', {
              status: 'You are already in room',
            });
            console.log('You are already in room');
            return;
          }
        }
    
        socket.join(this.roomName);
    
        if (this.count == 0 && exist == 0) {
          roomData.set(this.roomName, {
            ...roomData.get(this.roomName),
            player1: {
              socketId: socket.id,
              score: 0,
              position: { x: 0, y: -60 / 2 + 3, z: 0 },
            },
          });
          if (data && data.receiverId) {
            roomData.set(this.roomName, {
              status: 'private',
              status2: 'pending',
              ...roomData.get(this.roomName),
              player2: data.receiverId,
            });
            this.count = -1;
            return;
          }
        } else if (this.count == 1 && exist == 0) {
          roomData.set(this.roomName, {
            status: 'public',
            status2: 'pending',
            ...roomData.get(this.roomName),
            player2: {
              socketId: socket.id,
              score: 0,
              position: { x: 0, y: 60 / 2 - 3, z: 0 },
            },
            watchers: [],
            interval: 0,
          });
          this.count = -1;
          server.to(this.roomName).emit('joinRoom', {
            status: 'pending',
            roomName: this.roomName,
            player1: roomData.get(this.roomName).player1.socketId,
            player2: roomData.get(this.roomName).player2.socketId,
          });
        }
        this.count++;
    }

    startGame(data, server, roomData) {
        const room = roomData.get(data.roomName);
        const roomName = data.roomName;
        const speed = 0.5;
        let time = 20;
    
        if (!room || !roomName) return;
    
        if (room.status2 == 'started') return

        let signalX = Math.random() > 0.5 ? speed : -speed;
        let signalY = Math.random() > 0.5 ? speed : -speed;
    
        if (room.status == 'private') {
          if (room.dificulty == 'hard') time = 15;
          else if (room.dificulty == 'easy') time = 30;
        }
    
        room.interval = setInterval(() => {
          room.status2 = 'started';
          server.to(data.roomName).emit('gameData', {
            status: 'start',
            ball: room.ball.position,
            player1: room.player1.position,
            player2: room.player2.position,
            score: {
              player1: room.player1.score,
              player2: room.player2.score,
            },
          });
    
          if (this.ballIntersectWall(room.ball.position, signalX) == 1) {
            signalX *= -1;
          }
          if (
            this.ballIntersectPlayer(
              room.player1,
              room.ball.position,
              signalX,
              signalY,
            ) == 1 ||
            this.ballIntersectPlayer(
              room.player2,
              room.ball.position,
              signalX,
              signalY,
            ) == 1
          ) {
            signalY *= -1;
          } else if (
            this.ballIntersectPlayer(
              room.player1,
              room.ball.position,
              signalX,
              signalY,
            ) == -1 ||
            this.ballIntersectPlayer(
              room.player2,
              room.ball.position,
              signalX,
              signalY,
            ) == -1
          ) {
            if (room.ball.position.y > 0) room.player1.score++;
            else if (room.ball.position.y < 0) room.player2.score++;
            this.resetBall(data.roomName, roomData);
            this.resetPlayers(data.roomName, roomData);
            if (room.player1.score == 10 || room.player2.score == 10) {
              server.to(data.roomName).emit('gameOver', {
                status: 'gameOver',
                player1: room.player1.score,
                player2: room.player2.score,
              });
              room.status2 = 'gameOver';
              clearInterval(room.interval);
              return;
            }
            signalX = Math.random() > 0.5 ? speed : -speed;
            signalY = Math.random() > 0.5 ? speed : -speed;
          }
          room.ball.position.x += signalX;
          room.ball.position.y += signalY;
        }, time);
    }

    paddleMove( data, server, roomData) {
        const roomName = data.roomName;
        const room = roomData.get(roomName);
        const socketId = data.socketId;
        const right = data.right;
        const left = data.left;
        const w = stage.w / 2 - stage.cRight.args[1] / 2 - player1.size / 2;
        const players = [];

        if (!room || !roomName || !socketId) return;

        if (socketId == room.player1.socketId) {
        if (right && room.player1.position.x + 3 < w)
            room.player1.position.x += 3;
            else if (left && room.player1.position.x - 3 > -w)
                room.player1.position.x -= 3;
            players.push(room.player1.position, room.player2.position);
        } else if (socketId == room.player2.socketId) {
            if (right && room.player2.position.x + 3 < w)
                room.player2.position.x += 3;
            else if (left && room.player2.position.x - 3 > -w)
                room.player2.position.x -= 3;
            players.push(room.player1.position, room.player2.position);
        }
        server.to(roomName).emit('gameData', {
            status: 'start',
            ball: room.ball.position,
            player1: players[0],
            player2: players[1],
            score: {
                player1: room.player1.score,
                player2: room.player2.score,
            },
        });
    }

    JoinToRoom(data, roomData,  socket, server) {
        const roomName = data.roomName;
        const room = roomData.get(data.roomName);
        if (!room || room.status2 == 'gameOver') return socket.emit('error');
        if (
          room.player1.socketId != socket.id &&
          room.player2.socketId != socket.id &&
          !room.watchers.includes(socket.id)
        ) {
          room.watchers.push(socket.id);
          socket.join(data.roomName);
          server.to(roomName).emit('watcher', {
            socketId: socket.id,
            roomName,
            watchersRoom: room.watchers,
          });
        }
      }
}
