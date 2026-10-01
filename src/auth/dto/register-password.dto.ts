import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    ValidateNested,
} from "class-validator";
import { PasswordMatch } from "src/common/validators/password-match.validator";
import { PatientProfileDto } from "./patient-profile.dto";
import { PhysiotherapistProfileDto } from "./physiotherapist-profile.dto";

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
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({ type: String, description: 'Repetición de la contraseña' })
    @IsString()
    @PasswordMatch()
    confirm_password: string;

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

    @ApiProperty({ type: String, required: false, description: 'Teléfono de contacto' })
    @IsString()
    @IsOptional()
    @MaxLength(30)
    @Matches(/^[0-9+\-\s()]{6,30}$/, {
        message: 'El teléfono solo puede contener números, espacios y los signos + - ( )'
    })
    phone: string;

    @ApiProperty({ type: String, required: false, description: 'Notas adicionales' })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    notes: string;

    @ApiProperty({
        type: PhysiotherapistProfileDto,
        required: false,
        description: 'Datos del perfil. Obligatorio cuando el rol es FIS (Fisioterapeuta)'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PhysiotherapistProfileDto)
    physiotherapist_profile?: PhysiotherapistProfileDto;

    @ApiProperty({
        type: PatientProfileDto,
        required: false,
        description: 'Datos del perfil. Obligatorio cuando el rol es PAC (Paciente)'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PatientProfileDto)
    patient_profile?: PatientProfileDto;
}