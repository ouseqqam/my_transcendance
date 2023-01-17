import { Controller, Body, Res, Get, Query, Param } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Response } from 'express'

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Get('checkUserStatus/:userId/:conversationId')
    async checkuserStatus(@Param() body: any, @Res() res: Response) {
        await this.chatService.checkUserStatus(body, res);
    }
}
