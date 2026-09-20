import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginPasswordDto {

    @ApiProperty({ type: String, description: 'Email del usuario' })
    @IsString()
    username: string;

    @ApiProperty({ type: String, description: 'Password del usuario' })
    @IsString()
    @MinLength(6)
    password: string;

}