import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { userDto } from './dto/user.dto';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/CompleteProfil')
    create(@Body() user: userDto) {
        return this.userService.create(user)
    }

    @Get('/test')
    user() {
        return this.userService.user()
    }

    @Get('/:username')
    users(@Param('username') username: string) {
        return this.userService.users(username)
    }
}