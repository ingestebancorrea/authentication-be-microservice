import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        type: String,
        description: 'This is the email',
    })
    @MinLength(5)
    @MaxLength(25)
    @IsEmail()
    @IsString()
    username: string;

    @ApiProperty({
        type: String,
        description: 'The password must have a Uppercase, lowercase letter and a number',
    })
    @IsString()
    @MinLength(6)
    @IsOptional()
    @MaxLength(150)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({
        type: String,
        description: 'This is the full name',
    })
    @IsString()
    @MinLength(6)
    @MaxLength(150)
    full_name: string;

    @ApiProperty({
        type: String,
        description: 'This is a unique key',
    })
    @IsString()
    @IsOptional()
    sub:string

    @ApiProperty({
        type: String,
        description: 'This is the image of someone people',
    })
    @IsString()
    @IsOptional()
    image_url:string

    @ApiProperty({
        type: Number,
        description: 'This is a unique key',
    })
    @IsNumber()
    role: number;

    @ApiProperty({
        type: Boolean,
        description: 'This allow know if a user is active or desactive in the system',
    })
    @IsBoolean()
    is_active:boolean

}