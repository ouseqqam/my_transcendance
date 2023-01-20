import { Module } from '@nestjs/common';
import { Mygeteway } from './gateway';
import { GameService } from './game.service';

@Module({
    // imports: [Mygeteway],
    providers: [Mygeteway, GameService],
})
export class GatwayModule {}
