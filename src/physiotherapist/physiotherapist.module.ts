import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Physiotherapist } from './entities/physiotherapist.entity';
import { PhysiotherapistController } from './physiotherapist.controller';
import { PhysiotherapistService } from './physiotherapist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Physiotherapist])],
  controllers: [PhysiotherapistController],
  providers: [PhysiotherapistService],
  exports: [PhysiotherapistService],
})
export class PhysiotherapistModule {}
