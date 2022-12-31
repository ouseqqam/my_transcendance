import { Controller, Post, Body, Res, Get } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Response } from 'express'

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Post('banUser')
    async banUser(@Body() body: any, @Res() res: Response) {
        await this.chatService.banUser(body, res);
    }

    @Post('checkUserStatus')
    async checkuserStatus(@Body() body: any, @Res() res: Response) {
        await this.chatService.checkUserStatus(body, res);
    }
}
