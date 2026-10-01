import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DominantHand } from 'src/common/enum/profile-role.enum';

export class PatientProfileDto {
    @ApiProperty({ type: String, description: 'Fecha de nacimiento en formato YYYY-MM-DD' })
    @IsDateString()
    birth_date: string;

    @ApiProperty({ type: String, description: 'País de residencia' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    country: string;

    @ApiProperty({ type: String, description: 'Ciudad de residencia' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    city: string;

    @ApiProperty({
        enum: DominantHand,
        description: 'Mano dominante',
        example: DominantHand.RIGHT,
    })
    @IsEnum(DominantHand)
    dominant_hand: DominantHand;
}