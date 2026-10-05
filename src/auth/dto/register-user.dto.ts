import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class RegisterUserDto {

    @ApiProperty({
        name:'token',
        type:'string',
        description:'Token generado por Google o Microsoft'
      })
    @IsString()
    token:string;

    @ApiProperty({
        name:'loginprovider',
        type:'string',
        description: 'Proveedor de inicio de sesión [googleTokenValidation, azureTokenValidation, facebookTokenValidation]'
    })
    @IsString()
    loginprovider:string;

    @ApiProperty({
        name:'alias_role',
        type:'string',
        description: 'Rol con el que se va a registrar el usuario (PROFESOR, ESTUDIANTE)',
    })
    @Length(2,50)
    @IsString()
    alias_role?:string;
}