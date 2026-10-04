import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Envío de correo transaccional vía Brevo API v3 (HTTP/HTTPS).
 * Compatible con Render Free (sin tráfico SMTP bloqueado).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

  constructor(private readonly configService: ConfigService) {}

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
    const apiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!apiKey) {
      this.logger.error('BREVO_API_KEY no está configurada');
      throw new Error('BREVO_API_KEY no está configurada');
    }

    const link = `${resetUrl}?token=${encodeURIComponent(token)}`;
    const { senderEmail, senderName } = this.parseFromAddress();
    const subject = 'Recuperación de contraseña - PhysioSense';

    const textContent = [
      `Hola ${name},`,
      '',
      'Recibimos una solicitud para recuperar la contraseña de tu cuenta.',
      `Usa este enlace dentro de las próximas ${expiresInMinutes} minutos:`,
      '',
      link,
      '',
      'Si no solicitaste el cambio, ignora este mensaje y tu contraseña seguirá',
      'siendo la misma.',
    ].join('\n');

    const htmlContent = this.passwordRecoveryTemplate(name, link, expiresInMinutes);

    this.logger.log(`Enviando correo de recuperación vía Brevo API a: ${to}`);

    try {
      const response = await fetch(this.BREVO_API_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: to,
              name: name || to,
            },
          ],
          subject,
          htmlContent,
          textContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Error al enviar correo vía Brevo API: ${response.status} ${response.statusText}`,
        );
        this.logger.error(`Respuesta de Brevo: ${errorBody}`);
        throw new Error('No se pudo enviar el correo de recuperación');
      }

      this.logger.log('Correo de recuperación enviado correctamente vía Brevo API');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Fallo al enviar correo vía Brevo API: ${message}`);
      throw error;
    }
  }

  private parseFromAddress(): { senderEmail: string; senderName: string } {
    const from = this.configService.get<string>('MAIL_FROM') || '';

    const match = from.match(/^(.*)<([^>]+)>$/);
    if (match) {
      const name = match[1].trim();
      const email = match[2].trim();
      return {
        senderName: name || 'PhysioSense',
        senderEmail: email,
      };
    }

    const trimmed = from.trim();
    if (trimmed.includes('@')) {
      return {
        senderName: 'PhysioSense',
        senderEmail: trimmed,
      };
    }

    // Fallback por si no está configurado
    return {
      senderName: 'PhysioSense',
      senderEmail: 'no-reply@physiosense.com',
    };
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