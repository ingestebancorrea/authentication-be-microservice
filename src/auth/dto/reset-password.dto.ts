import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PasswordMatch } from 'src/common/validators/password-match.validator';

export class ResetPasswordDto {
  @ApiProperty({ type: String, description: 'Token recibido en el correo de recuperación' })
  @IsString()
  token: string;

  @ApiProperty({ type: String, description: 'Nueva contraseña con mayúscula, minúscula y número' })
  @IsString()
  @MinLength(6)
  @MaxLength(150)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({ type: String, description: 'Repetición de la nueva contraseña' })
  @IsString()
  @PasswordMatch()
  confirm_password: string;
}