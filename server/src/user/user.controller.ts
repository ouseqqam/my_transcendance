import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { userDto } from './dto/user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/')
    @UseGuards(JwtAuthGuard)
    create(@Body() user: userDto, @Req() req) {
        console.log(req.user)
        return this.userService.create(user)
    }
}