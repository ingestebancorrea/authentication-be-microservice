import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Physiotherapist } from './entities/physiotherapist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Physiotherapist])],
  exports: [TypeOrmModule],
})
export class PhysiotherapistModule {}