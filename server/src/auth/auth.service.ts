import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { VerifyCallback } from 'passport-42';

@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private config: ConfigService
    ) {}
    
    async get42Info(username: string, email: string): Promise<{access_token: string}> {
        const payload = {
            username: username,
            email: email
        }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        })
        return {
            access_token: token,
        }
    }
}
