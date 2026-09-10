import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { federationObjects } from './services/factory/FedarationObjects';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';

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
    return this.authService.createUserWithRole(token,federationObjects[loginprovider],aliasRole); 
  }

  @ApiResponse({status:400, description: ErrorMessages.BAD_LOGIN_INSTANCE})
  @ApiResponse({status:401, description: ErrorMessages.NOT_VALID_TOKEN})
  @ApiResponse({status:404, description: ErrorMessages.USER_NOT_FOUND})
  @ApiResponse({status:500, description: ErrorMessages.APPLICATION_ERROR})
  @Post('login')
  login( @Body('token') token: string, @Body('loginprovider') loginprovider: string ){
    return this.authService.login(token,federationObjects[loginprovider]); 
  }
}
