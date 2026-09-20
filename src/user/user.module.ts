import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthType } from 'src/auth-type/entities/auth-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthType])
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UserModule {}
