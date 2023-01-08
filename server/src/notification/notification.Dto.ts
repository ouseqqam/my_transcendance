import { IsNumber, IsString } from "class-validator"

export class notificationDto {
    @IsNumber()
    receiverId: number
    @IsString()
    type: string
    @IsString()
    roomId: string
}