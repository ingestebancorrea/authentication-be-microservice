import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 12;

// Hash válido usado para igualar el tiempo de respuesta cuando el usuario
// no existe o no tiene password (evita enumeración de usuarios por timing).
const DUMMY_HASH = '$2b$12$hUWp1yB2zvxvA0h8pG0keWzpH0BS4ZRRwZiU6UX/4d1UwWWvhS6Zi';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor() {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS);
    this.saltRounds =
      Number.isInteger(rounds) && rounds >= 4 && rounds <= 15
        ? rounds
        : DEFAULT_SALT_ROUNDS;
  }

  isHash(value: string): boolean {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
  }

  async hash(plainPassword: string): Promise<string> {
    if (!plainPassword) return null;
    return await bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    if (!plainPassword || !hash) return false;
    try {
      return await bcrypt.compare(plainPassword, hash);
    } catch {
      return false;
    }
  }

  /**
   * Verifica la contraseña contra el hash guardado. Si el usuario no tiene hash
   * (registro federado) o el valor no es un hash válido, se compara siempre
   * contra DUMMY_HASH para no filtrar información por tiempo de respuesta.
   */
  async verify(plainPassword: string, storedHash: string): Promise<boolean> {
    if (!this.isHash(storedHash)) {
      await this.compare(plainPassword, DUMMY_HASH);
      return false;
    }
    return await this.compare(plainPassword, storedHash);
  }
}
