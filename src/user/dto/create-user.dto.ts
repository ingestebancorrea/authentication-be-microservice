import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AuthMessages } from 'src/common/enum/auth-messages.enum';

export class CreateUserDto {
    @ApiProperty({
        type: String,
        description: 'Este es el email',
    })
    @MinLength(5)
    @MaxLength(25)
    @IsEmail()
    @IsString()
    username: string;

    @ApiProperty({
        type: String,
        description: AuthMessages.PASSWORD_FORMAT_REQUIRED,
    })
    @IsString()
    @MinLength(6)
    @IsOptional()
    @MaxLength(150)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: AuthMessages.PASSWORD_FORMAT_REQUIRED
    })
    password: string;

    @ApiProperty({
        type: String,
        description: 'Este es el nombre completo',
    })
    @IsString()
    @MinLength(6)
    @MaxLength(150)
    full_name: string;

    @ApiProperty({
        type: String,
        description: 'Identificador generado por el proveedor de terceros (opcional)',
    })
    @IsString()
    @IsOptional()
    sub?:string

    @ApiProperty({
        type: String,
        description: 'Esta es la imagen de la persona',
    })
    @IsString()
    @IsOptional()
    image_url:string

    @ApiProperty({
        type: Number,
        description: 'Esta es una clave única',
    })
    @IsNumber()
    role: number;

    @ApiProperty({
        type: Boolean,
        description: 'Permite saber si un usuario está activo o desactivado en el sistema',
    })
    @IsBoolean()
    is_active:boolean

}