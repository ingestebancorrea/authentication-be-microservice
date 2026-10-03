import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ type: String, description: 'Email del usuario' })
  @IsEmail()
  username: string;
}