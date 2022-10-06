import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { userDto } from './dto/user.dto';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/')
    create(@Body() user: userDto) {
        return this.userService.create(user)
    }
}