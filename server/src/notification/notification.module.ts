import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Module({
    // imports: [NotificationGateway],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway]
})

export class NotificationModule {}
