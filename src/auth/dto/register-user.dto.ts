import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class RegisterUserDto {

    @ApiProperty({
        name:'token',
        type:'string',
        description:'Generated token by Google or Microsoft'
      })
    @IsString()
    token:string;

    @ApiProperty({
        name:'loginprovider',
        type:'string',
        description: 'Sing in provider [googleTokenValidation, azureTokenValidation, facebookTokenValidation]'
    })
    @IsString()
    loginprovider:string;

    @ApiProperty({
        name:'alias_role',
        type:'string',
        description: 'Role with which the user is going to register (PROFESOR, ESTUDIANTE)',
    })
    @Length(2,50)
    @IsString()
    alias_role?:string;
}