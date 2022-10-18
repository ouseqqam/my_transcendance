import { Controller, Get, Param } from '@nestjs/common';
import { InvitationService } from './invitation.service';

@Controller('invitation')
export class InvitationController {
    constructor(private invitationSevice: InvitationService) {}

    @Get('sendInv/:id1/:id2')
    sendInv(@Param('id1') id1: number, @Param('id2') id2: number) {
        return this.invitationSevice.sendInv(id1, id2);
    }
    @Get('/getInvReceive/:id')
    getInv(@Param('id') id: number) {
        return this.invitationSevice.getInvReceive(id);
    }

    @Get('/getInvSent/:id')
    getInvSent(@Param('id') id: number) {
        return this.invitationSevice.getInvSent(id);
    }

    @Get('/acceptInv/:id1/:id2')
    acceptInv(@Param('id1') id1: number, @Param('id2') id2: number) {
        return this.invitationSevice.acceptInv(id1, id2);
    }
}
