import { Module } from '@nestjs/common';
import { Mygeteway } from './gateway';
import { SocketClients } from './socketClients';


@Module({
    imports: [Mygeteway],
    providers: [SocketClients],
})
export class GatwayModule {}
