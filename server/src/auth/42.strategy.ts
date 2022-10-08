import { Strategy, Profile } from 'passport-42'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';


@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        clientID: 'f40781aaa78fb8a4dfe8f34f138db28e546ae28add44a1aeda5cf4ec6c546676',
        clientSecret: '4641162aeeb5b23187e78a7bf43ce629ca53a15349499dbfed493ae90107cdc4',
        callbackURL: 'http://localhost:3001/auth/42/callback',
        scope: []
    })
  }

  async validate(accessToken: string, refreshToken: string, user: Profile) {
      console.log("access token = ", accessToken)
      console.log('refreshToken = ',refreshToken)
      console.log("user : ", user)
  }
}