import { Controller, Get, Param } from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friend')
export class FriendController {
    constructor(private friendService: FriendService) {}

    @Get('sendInv/:id1/:id2')
    sendInv(@Param('id1') id1: number, @Param('id2') id2: number) {
        return this.friendService.sendInv(id1, id2);
    }
    @Get('/getInvReceive/:id')
    getInv(@Param('id') id: number) {
        return this.friendService.getInvReceive(id);
    }

    @Get('/getInvSent/:id')
    getInvSent(@Param('id') id: number) {
        return this.friendService.getInvSent(id);
    }
}
