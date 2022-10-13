import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FortyTwoStrategy } from './strategy/42.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [FortyTwoStrategy, JwtStrategy, AuthService]
}) 

export class AuthModule {}
