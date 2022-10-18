import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';

@Module({
  controllers: [InvitationController],
  providers: [InvitationService]
})
export class InvitationModule {}
