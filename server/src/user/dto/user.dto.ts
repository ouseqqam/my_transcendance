import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class userDto {
    username: string

    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    lastName: string
}  
