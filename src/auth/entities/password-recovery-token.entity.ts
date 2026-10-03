import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

/**
 * Token de recuperación de contraseña.
 *
 * Se persiste en base (y no solo como JWT) por dos motivos: permite revocar un
 * token ya emitido cuando el usuario pide otro, y permite invalidar todos los
 * tokens al cambiar la contraseña sin depender del contenido del JWT.
 */
@Entity('password_recovery_tokens')
@Index('idx_password_recovery_tokens_user', ['user'])
export class PasswordRecoveryToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar' })
  token_hash: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'bool', default: false })
  used: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  used_at: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;
}