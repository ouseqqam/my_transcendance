import { Module } from '@nestjs/common';
import { FortyTwoStrategy } from './42.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy]
}) 
export class AuthModule {}
