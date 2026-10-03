import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

/**
 * Transporte SMTP de Gmail (smtp.gmail.com:465, SSL).
 *
 * Gmail exige contraseña de aplicación en lugar de la contraseña de la cuenta:
 * Google Account -> Seguridad -> Verificación en 2 pasos -> Contraseñas de
 * aplicación. La credencial vive solo en SMTP_USER/SMTP_PASS (archivo .env).
 *
 * registerAsync + ConfigService por la misma razón que JwtConfigModule: el .env
 * todavía no está cargado cuando se evalúa la configuración del módulo.
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST') || 'smtp.gmail.com',
          port: Number(config.get<string>('MAIL_PORT')) || 465,
          secure: config.get<string>('MAIL_SECURE') !== 'false',
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}