import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { Role } from 'src/role/entities/role-entity';
import { Physiotherapist } from 'src/physiotherapist/entities/physiotherapist.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Role, Physiotherapist, Patient]),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
