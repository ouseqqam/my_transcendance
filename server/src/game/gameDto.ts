export class gameDto {
    roomName?: string;
    socketId?: string;
    receiverId?: string;
    right?: boolean
    left?: boolean
    dificulty: string
}

export type postion = {
    x: number,
    y: number,
    z: number
}