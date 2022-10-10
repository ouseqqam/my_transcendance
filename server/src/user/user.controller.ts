import { Body, Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { userDto } from './dto/user.dto'
import { UserService } from './user.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    // @Post('/')
    // @UseGuards(JwtAuthGuard)
    // create(@Body() user: userDto, @Req() req) {
    //     console.log(req.user)
    //     return this.userService.create(user)
    // }

    @Post('/')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('avatar', {
            dest: './public/uploads',
        })
    )
    signup(@UploadedFile() file,  @Req() req) {
        if (file)
            console.log(file)
        console.log(req.user)
        if (req.body.username)
            console.log(req.body)
    }
}