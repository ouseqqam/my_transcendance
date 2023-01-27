import { Module } from '@nestjs/common';
// import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
// import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { FriendModule } from './friend/friend.module';
// import { InvitationModule } from './invitation/invitation.module';
// import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';
import { Gateway } from './gateway';
import { GameService } from './game/game.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // UserModule,
    // AuthModule,
     PrismaModule,
    // FriendModule,
    // InvitationModule,
    ChatModule,
    // NotificationModule,
  ],
   providers: [GameService, Gateway],
})

export class AppModule {}