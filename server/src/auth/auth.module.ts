import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FortyTwoStrategy } from './42.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [FortyTwoStrategy, AuthService]
}) 

export class AuthModule {}
