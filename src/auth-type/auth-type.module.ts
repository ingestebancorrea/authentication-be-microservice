import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthType } from './entities/auth-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthType])
  ]
})
export class AuthTypeModule {}