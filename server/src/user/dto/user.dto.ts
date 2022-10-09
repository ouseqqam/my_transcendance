import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class userDto {
    @IsString()
    @IsNotEmpty()
    username: string
    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    lastName: string
}  
