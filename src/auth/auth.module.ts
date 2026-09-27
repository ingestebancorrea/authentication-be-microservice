import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { Role } from 'src/role/entities/role-entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Role]),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
