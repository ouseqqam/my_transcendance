import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class userDto {
    @IsString()
    @IsNotEmpty()
    avatar: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    @IsString()
    firstName: string
    
    @IsNotEmpty()
    @IsString()
    lastName: string

    @IsEmail()
    email?: string
}
