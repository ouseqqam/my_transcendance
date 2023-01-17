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
    @IsString()
    dificulty: string
    @IsString()
    status: string
}

export type postion = {
    x: number,
    y: number,
    z: number
}