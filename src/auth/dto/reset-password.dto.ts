import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PasswordMatch } from 'src/common/validators/password-match.validator';
import { AuthMessages } from 'src/common/enum/auth-messages.enum';

export class ResetPasswordDto {
  @ApiProperty({ type: String, description: 'Token recibido en el correo de recuperación' })
  @IsString()
  token: string;

  @ApiProperty({ type: String, description: 'Nueva contraseña con mayúscula, minúscula y número' })
  @IsString()
  @MinLength(6)
  @MaxLength(150)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: AuthMessages.PASSWORD_FORMAT_REQUIRED,
  })
  password: string;

  @ApiProperty({ type: String, description: 'Repetición de la nueva contraseña' })
  @IsString()
  @PasswordMatch()
  confirm_password: string;
}