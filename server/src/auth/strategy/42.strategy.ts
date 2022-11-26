import { Strategy } from 'passport-42'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common';


@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        clientID: 'f40781aaa78fb8a4dfe8f34f138db28e546ae28add44a1aeda5cf4ec6c546676',
        clientSecret: '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',
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


