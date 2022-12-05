import { Module } from '@nestjs/common';
import { Mygeteway } from './gateway';

@Module({
    imports: [Mygeteway],
})
export class GatwayModule {}
