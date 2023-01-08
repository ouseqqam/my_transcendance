import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
    constructor(private notification: NotificationService) {}

    @Get('/get')
    async getInvReceive(@Query('userId') userId: number) {
        // console.log(userId)
        return await this.notification.getInvReceive(userId)
    }
}
