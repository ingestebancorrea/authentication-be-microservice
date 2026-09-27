import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

/**
 * Configuración única de JWT para toda la app.
 *
 * Se registra como @Global para que AuthModule y UserModule (que ya se
 * importan mutuamente) puedan inyectar JwtService sin generar una
 * dependencia circular entre módulos.
 *
 * registerAsync + ConfigService es necesario porque JwtModule.register({...})
 * se evalúa al importar el archivo, antes de que ConfigModule cargue el .env:
 * process.env.JWT_SECRET todavía valía undefined en ese momento.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRES_IN')) || 3600,
        },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
