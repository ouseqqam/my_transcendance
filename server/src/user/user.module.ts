import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TestController } from './test/test.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, TestController],
  providers: [UserService]
})
export class UserModule {}
