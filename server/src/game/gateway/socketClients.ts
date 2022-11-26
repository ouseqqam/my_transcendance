import { Injectable, OnModuleInit } from "@nestjs/common";
import { io, Socket } from "socket.io-client";

@Injectable()
export class SocketClients implements OnModuleInit {
    public socketClient: Socket
    
    constructor () {
        this.socketClient = io('http://localhost:3000')
    }

    onModuleInit() {
        this.events()
    }

    private events() {
        this.socketClient.emit('message', 'hello')
        this.socketClient.on('connect', () => {
            console.log('connected')
            console.log(this.socketClient.id)
        })

        this.socketClient.on('onMessage', (payload: any) => {
            console.log(payload)
        })
    }
}