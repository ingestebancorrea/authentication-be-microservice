import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {

    @ApiProperty({
        name:'token',
        type:'string',
        description:'Generated token by Google, Microsoft OR Facebook'
      })
    @IsString()
    token:string;

    
}