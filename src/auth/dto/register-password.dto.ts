import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterPasswordDto {

    @ApiProperty({ type: String, description: 'Email del usuario' })
    @IsEmail()
    username: string;

    @ApiProperty({ type: String, description: 'Password con mayúscula, minúscula y número' })
    @IsString()
    @MinLength(6)
    @MaxLength(150)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have an Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({ type: String, description: 'Nombre completo' })
    @IsString()
    @MinLength(6)
    @MaxLength(150)
    full_name: string;

    @ApiProperty({ type: Number, description: 'Id del rol (1 Fisioterapeuta, 2 Paciente)' })
    @IsNumber()
    role: number;

    @ApiProperty({ type: String, required: false, description: 'URL de la foto de perfil' })
    @IsString()
    @IsOptional()
    image_url: string;
}