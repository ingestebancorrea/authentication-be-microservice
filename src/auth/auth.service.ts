import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RegisterPasswordDto } from './dto/register-password.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { CreatorFactory } from './services/factory/CreatorFactory';
import { User } from 'src/user/entities/user.entity';
import { UserToReturnDto } from './dto/return-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/role/entities/role-entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Role) private rolRepository: Repository<Role>,
  ){}

  private readonly PROVIDER_AUTH_TYPE: Record<string, string> = {
    googleTokenValidation: 'GOOGLE',
    facebookTokenValidation: 'FACEBOOK',
    azureTokenValidation: 'AZURE',
  };
  
  async createUserWithRole(token:string, loginprovider: string, creatorFactory:CreatorFactory,aliasRole: string){
    const payload = await creatorFactory.checkToken(token);//CreateAzureFederation instead of creatorFactory
    
    if(!payload){
      throw new BadRequestException(ErrorMessages.NOT_VALID_TOKEN)
    }

    let user = await this.usersService.findByEmail(payload.email);
    
    if(!user){
      const role = await this.rolRepository.findOne({ where: { alias: aliasRole } });
      if(!role){
        throw new NotFoundException(ErrorMessages.ROLE_NOT_FOUND);
      }
      
      const createUserDto:CreateUserDto = {
          username: payload.email,
          password: null,
          full_name: payload.full_name,
          image_url: payload.picture,
          sub: payload.sub,
          role: role.id,
          is_active: true
      }
      user = await this.usersService.store(createUserDto, this.PROVIDER_AUTH_TYPE[loginprovider] ?? 'PASS');
    }else{
      throw new ConflictException(`Ya existe un usuario registrado con el email ${payload.email}`);
    }
    const access_token = this.jwtService.sign({ username: payload.email }, {secret: process.env.JWT_SECRET })
    return {...user,access_token}
  }

  async registerPassword(dto: RegisterPasswordDto) {
    const existing = await this.usersService.findByEmail(dto.username.toLowerCase().trim());
    if (existing) {
      throw new ConflictException(`User ${dto.username} already is registered`);
    }

    const role = await this.rolRepository.findOne({ where: { id: dto.role } });
    if (!role) {
      throw new NotFoundException(ErrorMessages.ROLE_NOT_FOUND);
    }

    const createUserDto: CreateUserDto = {
      username: dto.username,
      password: dto.password,
      full_name: dto.full_name,
      image_url: dto.image_url ?? null,
      role: role.id,
      is_active: true,
    };

    const user = await this.usersService.store(createUserDto, 'PASS');

    const access_token = this.jwtService.sign(
      { username: user.username },
      { secret: process.env.JWT_SECRET },
    );
    return { ...user, access_token };
  }

  async loginPassword(dto: LoginPasswordDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.username.toLowerCase().trim());
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const userToReturn = this.mapUser(user);
    const access_token = await this.generateAccesToken(userToReturn);
    return { ...userToReturn, access_token };
  }

  async login(token:string, creatorFactory:CreatorFactory) {
    const payload = await creatorFactory.checkToken(token);
    if(!payload){
      throw new BadRequestException(ErrorMessages.NOT_VALID_TOKEN)
    }

    const user = await this.usersService.findByEmail(payload.email);
    if(!user){
      throw new NotFoundException(`User ${payload.email} not found`);
    }

    const userToReturn = this.mapUser(user); 
    const access_token = await this.generateAccesToken(userToReturn);
    return {...userToReturn,access_token}
  }

  async generateAccesToken(user:any){
    return await this.jwtService.signAsync(
      {
        uuid: user.uid, 
        username: user.email, 
        name: user.displayName,
      },{
        secret: process.env.JWT_SECRET,
        expiresIn:'60m'
      }
    );
  }

  mapUser = (user:User):UserToReturnDto=> {
    const userToReturn:UserToReturnDto =
    {
      id: user.id,
      email: user.username,
      displayName: user.full_name,
      photoURL: user.image_url || null
    }
    return userToReturn;
  }
   
}