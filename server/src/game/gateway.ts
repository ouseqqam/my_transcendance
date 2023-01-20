import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ball, player1, stage } from './data';
import { GameService } from './game.service';
import { gameDto } from './gameDto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Mygeteway implements OnGatewayInit, OnGatewayConnection {
  constructor(private gameService: GameService) {}
  @WebSocketServer()
  server: Server;

  count = 0
  roomData = new Map<string, any>()
  roomName = ''

  afterInit() {
    // console.log("init")
  }

  handleConnection() {
    // console.log("connect")
  }

  handleDisconnect(socket: Socket) {
    /// REMOVE WATCHERS !!!!!!!!!!
    for (let [key, value] of this.roomData) {
      if (socket.id == value?.player1?.socketId) {
        if (value?.status2 == 'pending') {
          this.roomData?.delete(key);
        }
        this.server.to(key).emit('leftGame', {
          status: 'gameOver',
          roomName: key,
          player1: '',
          player2: value?.player2,
        });
        clearInterval(value?.interval);
        this.roomData?.delete(key);
        console.log('room deleted', key);
        return;
      } else if (socket.id == value?.player2?.socketId) {
        this.server.to(key).emit('leftGame', {
          status: 'gameOver',
          roomName: key,
          player1: value?.player1,
          player2: '',
        });
        clearInterval(value?.interval);
        this.roomData?.delete(key);
        console.log('room deleted', key);
        return;
      }
    }
  }


  @SubscribeMessage('leftRoom')
  leftRoom(
    @MessageBody() data: { roomName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomName } = data;

    const room = this.roomData.get(roomName);
    if (!room) return socket.emit('error');
    // If one of the players leave
    if (room.player1.socketId == socket.id) {
      this.roomData?.delete(roomName);
      return socket.to(roomName).emit('leftGame', {
        status: 'gameOver',
        player2: room.player2.socketId,
        player1: '',
      });
    }
    if (room.player2.socketId == socket.id) {
      this.roomData?.delete(roomName);
      return socket.to(roomName).emit('leftGame', {
        status: 'gameOver',
        player1: room.player1.socketId,
        player2: '',
      });
    }
    // If one of the watchers leave
    let tmp = room.watchers.filter((e: string) => e != socket.id);
    this.roomData.set(this.roomName, { ...room, watchers: [...tmp] });
    socket.leave(roomName);
    return socket.to(roomName).emit('watcher', {
      socketId: socket.id,
      type: 'LEAVE',
      watchersRoom: [...tmp],
    });
  }

  @SubscribeMessage('findGame')
  findGame(@ConnectedSocket() socket: Socket, @MessageBody() data: gameDto) {
    this.gameService.findGame(socket, data, this.server, this.roomData)
  }

  @SubscribeMessage('acceptGame')
  acceptGame(@MessageBody() data: gameDto, @ConnectedSocket() socket: Socket) {
    const room = this.roomData.get(data.roomName);
    const roomName = data.roomName;
    const id = 1;
    const player1 = room.player1
    const status = data.status
    if (!room || !roomName || id !== room.player2) return;
    if (!status || status !== 'accept') return
    socket.join(roomName)
    this.roomData.set(roomName, {
      player1,
      player2: {
        socketId: socket.id,
        score: 0,
        position: { x: 0, y: 60 / 2 - 3, z: 0 },
      },
      watchers: [],
      interval: 0
    })
  }
  
  @SubscribeMessage('startGame')
  startGame(@MessageBody() data: gameDto) {
    this.gameService.startGame(data, this.server, this.roomData)
  }

  @SubscribeMessage('paddleMove')
  paddleMove(@MessageBody() data: gameDto) {
    this.gameService.paddleMove(data, this.server, this.roomData)
  }

  @SubscribeMessage('joinToRoom')
  JoinToRoom(@MessageBody() data: gameDto, @ConnectedSocket() socket: Socket) {
    this.gameService.JoinToRoom(data, this.roomData,socket, this.server)
  }
  
}
