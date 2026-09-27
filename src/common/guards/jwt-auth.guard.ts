import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessages } from '../enum/error-messages.enum';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(ErrorMessages.MISSING_TOKEN);
    }

    try {
      // algorithms fijo: evita que un token firmado con otro algoritmo
      // (por ejemplo "none") sea aceptado como válido.
      request.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const header = request?.headers?.authorization;
    if (typeof header !== 'string') return undefined;

    const [scheme, ...rest] = header.trim().split(/\s+/);
    if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;

    return rest.join(' ') || undefined;
  }
}
