import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthType } from 'src/auth-type/entities/auth-type.entity';
import { PatientModule } from 'src/patient/patient.module';
import { PhysiotherapistModule } from 'src/physiotherapist/physiotherapist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthType]),
    PatientModule,
    PhysiotherapistModule,
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UserModule {}
