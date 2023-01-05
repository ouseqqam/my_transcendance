import { IsBoolean, IsString } from "class-validator"


export class gameDto {
    @IsString()
    roomName?: string
    @IsString()
    socketId?: string
    @IsString()
    receiverId?: string
    @IsBoolean()
    right?: boolean
    @IsBoolean()
    left?: boolean
    @IsBoolean()
    dificulty: string
}

export type postion = {
    x: number,
    y: number,
    z: number
}