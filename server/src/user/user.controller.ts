import { Body, Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { userDto } from './dto/user.dto'
import { UserService } from './user.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('avatar', {
            dest: './public/uploads',
        })
    )
    create(@UploadedFile() file: Express.Multer.File,  @Req() req) {
        return this.userService.create(file, req)
    }
}