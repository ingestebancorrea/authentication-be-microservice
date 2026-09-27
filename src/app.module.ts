import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthTypeModule } from './auth-type/auth-type.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { JwtConfigModule } from './auth/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
      }
    ),
    CommonModule,
    JwtConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [ User ],
      subscribers: [ ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule, 
    AuthTypeModule, 
    UserModule, 
  ]
})
export class AppModule {}
