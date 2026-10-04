import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Envío de correo transaccional. Solo se usa para recuperación de contraseña.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía el correo con el enlace/token de recuperación.
   */
  async sendPasswordRecovery(
    to: string,
    name: string,
    token: string,
    resetUrl: string,
    expiresInMinutes: number,
  ) {
    const link = `${resetUrl}?token=${encodeURIComponent(token)}`;

    const from = this.fromAddress();
    const subject = 'Recuperación de contraseña - PhysioSense';
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<string>('MAIL_PORT');
    const secure = this.configService.get<string>('MAIL_SECURE');

    this.logger.log(
      `Intentando enviar correo de recuperación | to=${to} | from=${from} | host=${host} | port=${port} | secure=${secure}`,
    );

    try {
      const info = await this.mailerService.sendMail({
        to,
        from,
        subject,
        text: [
          `Hola ${name},`,
          '',
          'Recibimos una solicitud para recuperar la contraseña de tu cuenta.',
          `Usa este enlace dentro de las próximas ${expiresInMinutes} minutos:`,
          '',
          link,
          '',
          'Si no solicitaste el cambio, ignora este mensaje y tu contraseña seguirá',
          'siendo la misma.',
        ].join('\n'),
        html: this.passwordRecoveryTemplate(name, link, expiresInMinutes),
      });

      this.logger.log(
        `Correo de recuperación enviado correctamente a ${to} | messageId=${info?.messageId || 'N/A'}`,
      );
    } catch (error) {
      this.logger.error(
        `ERROR al enviar correo de recuperación a ${to}: ${error?.message}`,
      );
      if (error?.response) {
        this.logger.error(`SMTP response: ${error.response}`);
      }
      if (error?.stack) {
        this.logger.error(`Stack: ${error.stack}`);
      }
      throw error;
    }
  }

  private fromAddress(): string {
    return (
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      ''
    );
  }

  private passwordRecoveryTemplate(name: string, link: string, expiresInMinutes: number) {
    return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;">Recuperación de contraseña</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:20px;">Hola ${name},</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:20px;">
        Recibimos una solicitud para recuperar la contraseña de tu cuenta de PhysioSense.
        El enlace vence en ${expiresInMinutes} minutos.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${link}"
           style="background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;font-size:14px;">
          Restablecer contraseña
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:12px;line-height:18px;color:#616e7c;">
        Si el botón no funciona, copia esta URL y ábrela en tu navegador:<br />
        <span style="word-break:break-all;">${link}</span>
      </p>
      <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#616e7c;">
        Si no solicitaste el cambio, ignora este mensaje: tu contraseña seguirá siendo la misma.
      </p>
    </div>
  </body>
</html>`;
  }
}