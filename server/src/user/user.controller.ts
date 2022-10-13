<<<<<<< HEAD
import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { userDto } from './dto/user.dto';
import { UserService } from './user.service';

=======
import { Body, Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { userDto } from './dto/user.dto'
import { UserService } from './user.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { FileInterceptor } from '@nestjs/platform-express'
>>>>>>> f3395621790485680da976350739b3a331271067

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

<<<<<<< HEAD
    @Post('/CompleteProfil')
    create(@Body() user: userDto) {
        return this.userService.create(user)
=======
    @Post('/')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('avatar', {
            dest: './public/uploads',
        })
    )
    create(@UploadedFile() file: Express.Multer.File,  @Req() req) {
        return this.userService.create(file, req)
>>>>>>> f3395621790485680da976350739b3a331271067
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