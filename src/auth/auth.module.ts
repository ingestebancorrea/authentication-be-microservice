import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { Role } from 'src/role/entities/role-entity';
import { Physiotherapist } from 'src/physiotherapist/entities/physiotherapist.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecoveryToken } from './entities/password-recovery-token.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UserModule,
    MailModule,
    TypeOrmModule.forFeature([Role, Physiotherapist, Patient, PasswordRecoveryToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
