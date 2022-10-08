import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    // constructor(private authService: AuthService) {}
    @Get('42')
    @UseGuards(FortyTwoAuthGuard)
    handleLogin() {
        return {
            msg: "hello from 42 Auth"
        }
    }
    @Get('42/callback')
    handleRedirect() {
        return {
            msg: "test "
        }
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