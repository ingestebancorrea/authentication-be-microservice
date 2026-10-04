import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

/**
 * Transporte SMTP tradicional (STARTTLS).
 * Usamos Brevo (smtp-relay.brevo.com:587) para evitar bloqueos de puertos SMTP en Render.
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('MAIL_HOST') || 'smtp-relay.brevo.com';
        const port = Number(config.get<string>('MAIL_PORT')) || 587;
        const secureEnv = config.get<string>('MAIL_SECURE');
        const secure = secureEnv === 'true';
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASS');

        return {
          transport: {
            host,
            port,
            secure,
            requireTLS: !secure && port === 587,
            auth: {
              user,
              pass,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}