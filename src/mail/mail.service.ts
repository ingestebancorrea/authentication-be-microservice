import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Envío de correo transaccional. Hoy solo se usa para la recuperación de
 * contraseña, así que expone un método por tipo de correo en lugar de una API
 * genérica: cada plantilla queda versionada junto al flujo que la usa.
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
   *
   * `resetUrl` ya viene armado por el llamador porque la URL pública del
   * frontend es configuración del negocio, no del transporte de correo.
   */
  async sendPasswordRecovery(
    to: string,
    name: string,
    token: string,
    resetUrl: string,
    expiresInMinutes: number,
  ) {
    const link = `${resetUrl}?token=${encodeURIComponent(token)}`;

    try {
      await this.mailerService.sendMail({
        to,
        from: this.fromAddress(),
        subject: 'Recuperación de contraseña - PhysioSense',
        text: [
          `Hola ${name},`,
          '',
          'Recibimos una solicitud para recuperar la contraseña de tu cuenta.',
          `Usá este enlace dentro de las próximas ${expiresInMinutes} minutos:`,
          '',
          link,
          '',
          'Si no solicitaste el cambio, ignorá este mensaje y tu contraseña seguirá',
          'siendo la misma.',
        ].join('\n'),
        html: this.passwordRecoveryTemplate(name, link, expiresInMinutes),
      });
      this.logger.log(`Correo de recuperación enviado a ${to}`);
    } catch (error) {
      this.logger.error(`No se pudo enviar el correo de recuperación: ${error?.message}`);
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
        Si el botón no funciona, copiá esta URL y abrila en tu navegador:<br />
        <span style="word-break:break-all;">${link}</span>
      </p>
      <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#616e7c;">
        Si no solicitaste el cambio, ignorá este mensaje: tu contraseña seguirá siendo la misma.
      </p>
    </div>
  </body>
</html>`;
  }
}