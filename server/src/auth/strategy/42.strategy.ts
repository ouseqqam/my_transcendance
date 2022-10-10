import { Strategy } from 'passport-42'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common';


@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        clientID: 'f40781aaa78fb8a4dfe8f34f138db28e546ae28add44a1aeda5cf4ec6c546676',
        clientSecret: '4641162aeeb5b23187e78a7bf43ce629ca53a15349499dbfed493ae90107cdc4',
        callbackURL: 'http://localhost:3001/api/auth/42/callback',
        scope: []
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const user = {
      username: profile.username,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatar: profile.photos[0].value,
      email: profile.emails[0].value,
    }
    return user
  }
}


