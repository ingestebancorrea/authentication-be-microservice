import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PhysiotherapistProfileDto {
    @ApiProperty({ type: String, description: 'Especialidad del fisioterapeuta' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    specialty: string;

    @ApiProperty({ type: String, description: 'Número de licencia profesional' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    license_number: string;

    @ApiProperty({ type: String, required: false, description: 'Institución donde exercise' })
    @IsString()
    @IsOptional()
    @MaxLength(160)
    institution?: string;

    @ApiProperty({ type: Number, description: 'Años de experiencia profesional', minimum: 0 })
    @IsInt()
    @Min(0)
    @Max(70)
    years_of_experience: number;
}