import { Controller, ForbiddenException, Get, Req, Res, UseGuards } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guard/42.guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Get('42')
    @UseGuards(FortyTwoAuthGuard)
    auth() {}

    @Get('42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async handleRedirect(@Req() req) {
        return this.authService.get42Info(req.user.username, req.user.email)
    }
}


// try {

// } catch (error){
//     if (error instanceof PrismaClientKnownRequestError) {
//         if (error.code === 'P2002') {
//             throw new ForbiddenException (
//                 'Credentials taken',
//             )
//         }
            
//     }
//     throw error
// }