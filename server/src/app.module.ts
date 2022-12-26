import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FriendModule } from './friend/friend.module';
import { InvitationModule } from './invitation/invitation.module';
import { GatwayModule } from './game/gateway/gateway.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    FriendModule,
    InvitationModule,
    GatwayModule,
    NotificationModule,
  ],
  //  providers: [UserService, FriendService],
})
export class AppModule {}