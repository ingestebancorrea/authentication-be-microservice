import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { federationObjects } from './services/factory/FedarationObjects';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { RegisterPasswordDto } from './dto/register-password.dto';
import { LoginPasswordDto } from './dto/login-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor( private readonly authService: AuthService) {}

  @ApiResponse({status:201, description: 'Success SingUp'})
  @ApiResponse({status:400, description: ErrorMessages.BAD_LOGIN_INSTANCE})
  @ApiResponse({status:404, description: ErrorMessages.ROLE_NOT_FOUND})
  @ApiResponse({status:401, description: ErrorMessages.NOT_VALID_TOKEN})
  @ApiResponse({status:500, description: ErrorMessages.APPLICATION_ERROR})
  @Post('register')
  createUserWithRole( @Body('token') token: string, @Body('loginprovider') loginprovider: string, @Body('alias_role') aliasRole: string ){
    const factory = federationObjects[loginprovider];
    if(!factory){
      throw new BadRequestException(ErrorMessages.BAD_LOGIN_INSTANCE);
    }
    return this.authService.createUserWithRole(token, loginprovider, factory, aliasRole); 
  }

  @ApiResponse({status:400, description: ErrorMessages.BAD_LOGIN_INSTANCE})
  @ApiResponse({status:401, description: ErrorMessages.NOT_VALID_TOKEN})
  @ApiResponse({status:404, description: ErrorMessages.ROLE_NOT_FOUND})
  @ApiResponse({status:409, description: 'El usuario ya está registrado'})
  @Post('register-password')
  registerWithPassword( @Body() data: RegisterPasswordDto ){
    return this.authService.registerPassword(data);
  }

  @ApiResponse({status:401, description: 'Credenciales inválidas'})
  @Post('login-password')
  loginPassword( @Body() data: LoginPasswordDto ){
    return this.authService.loginPassword(data);
  }

  @ApiResponse({status:400, description: ErrorMessages.BAD_LOGIN_INSTANCE})
  @ApiResponse({status:401, description: ErrorMessages.NOT_VALID_TOKEN})
  @ApiResponse({status:404, description: ErrorMessages.USER_NOT_FOUND})
  @ApiResponse({status:500, description: ErrorMessages.APPLICATION_ERROR})
  @Post('login')
  login( @Body('token') token: string, @Body('loginprovider') loginprovider: string ){
    const factory = federationObjects[loginprovider];
    if(!factory){
      throw new BadRequestException(ErrorMessages.BAD_LOGIN_INSTANCE);
    }
    return this.authService.login(token, factory); 
  }
}
