import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/')
    create(@Body() user: userDto) {
        console.log(user)
        return this.userService.create()
    }
}