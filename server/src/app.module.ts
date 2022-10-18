import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FriendService } from './friend/friend.service';
import { FriendModule } from './friend/friend.module';
import { UserService } from './user/user.service';
import { InvitationModule } from './invitation/invitation.module';

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
  ],
  // providers: [UserService, FriendService],
})
export class AppModule {}