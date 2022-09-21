import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    create() {
        return "Hello from create user"
    }
}
