import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Get('42')
    @UseGuards(FortyTwoAuthGuard)
    auth() {}

    @Get('42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async handleRedirect(@Req() req) {
        console.log(req.user)
       return await this.authService.signToken("ouseqqam", "email")
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