import { IsNotEmpty, IsEmail } from "class-validator";

export class CreateUpdateUser {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    image: string;
}
