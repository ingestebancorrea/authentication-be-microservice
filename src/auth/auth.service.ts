import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { ProfileRoleAlias } from 'src/common/enum/profile-role.enum';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RegisterPasswordDto } from './dto/register-password.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { CreatorFactory } from './services/factory/CreatorFactory';
import { User } from 'src/user/entities/user.entity';
import { UserToReturnDto } from './dto/return-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordService } from 'src/common/services/password.service';
import { Role } from 'src/role/entities/role-entity';
import { Physiotherapist } from 'src/physiotherapist/entities/physiotherapist.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private dataSource: DataSource,
    @InjectRepository(Role) private rolRepository: Repository<Role>,
    @InjectRepository(Physiotherapist) private physiotherapistRepository: Repository<Physiotherapist>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
  ){}

  private readonly PROVIDER_AUTH_TYPE: Record<string, string> = {
    googleTokenValidation: 'GOOGLE',
    facebookTokenValidation: 'FACEBOOK',
    azureTokenValidation: 'AZURE',
  };
  
  async createUserWithRole(token:string, loginprovider: string, creatorFactory:CreatorFactory, aliasRole: string){
    const payload = await creatorFactory.checkToken(token);//CreateAzureFederation instead of creatorFactory
    
    if(!payload){
      throw new BadRequestException(ErrorMessages.NOT_VALID_TOKEN)
    }

    const email = payload.email?.toLowerCase().trim();
    let user = email ? await this.usersService.findByEmail(email) : undefined;
    
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
    const userToReturn = this.mapUser(user);
    const access_token = await this.generateAccesToken(userToReturn);
    return { ...userToReturn, access_token }
  }

  /**
   * Registra una cuenta con contraseña y, según el rol, su perfil específico.
   */
async registerPassword(dto: RegisterPasswordDto) {
    const username = dto.username.toLowerCase().trim();

    const existing = await this.usersService.findByEmail(username);
    if (existing) {
      throw new ConflictException(`User ${dto.username} already is registered`);
    }

    const role = await this.rolRepository.findOne({ where: { id: dto.role } });
    if (!role) {
      throw new NotFoundException(ErrorMessages.ROLE_NOT_FOUND);
    }

    const requiresProfile =
      role.alias === ProfileRoleAlias.PHYSIOTHERAPIST ||
      role.alias === ProfileRoleAlias.PATIENT;

    this.assertProfilePayload(dto, role.alias, requiresProfile);

    if (role.alias === ProfileRoleAlias.PATIENT) {
      this.assertBirthDate(dto.patient_profile.birth_date);
    }

    if (role.alias === ProfileRoleAlias.PHYSIOTHERAPIST) {
      const licenseTaken = await this.physiotherapistRepository.findOne({
        where: { license_number: dto.physiotherapist_profile.license_number.trim() },
      });
      if (licenseTaken) {
        throw new ConflictException(ErrorMessages.LICENSE_NUMBER_ALREADY_REGISTERED);
      }
    }

    const createUserDto: CreateUserDto = {
      username: dto.username,
      password: dto.password,
      full_name: dto.full_name.trim(),
      image_url: dto.image_url ?? null,
      role: role.id,
      is_active: true,
    };

    const { user, profile } = await this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.store(
        createUserDto,
        'PASS',
        manager,
        (error) => this.translateDbError(error, username),
      );

      if (!requiresProfile) {
        return { user, profile: null };
      }

      const profile = await this.createProfile(manager, user, dto, role.alias);

      return { user, profile };
    });

    // Se conserva la forma de respuesta previa ({...user, access_token}) y se
    // agrega `profile` para que el frontend reciba los datos del paso 2.
    const access_token = this.jwtService.sign(
      { username: user.username },
      { secret: process.env.JWT_SECRET },
    );
    return { ...user, profile, access_token };
  }

  private async createProfile(
    manager: EntityManager,
    user: User,
    dto: RegisterPasswordDto,
    roleAlias: string,
  ) {
    if (roleAlias === ProfileRoleAlias.PHYSIOTHERAPIST) {
      const repository = manager.getRepository(Physiotherapist);
      return await repository.save(
        repository.create({
          user: { id: user.id } as User,
          specialty: dto.physiotherapist_profile.specialty.trim(),
          license_number: dto.physiotherapist_profile.license_number.trim(),
          institution: dto.physiotherapist_profile.institution?.trim() ?? null,
          years_of_experience: dto.physiotherapist_profile.years_of_experience,
          phone: dto.phone ?? null,
          notes: dto.notes ?? null,
        }),
      );
    }

    const repository = manager.getRepository(Patient);
    return await repository.save(
      repository.create({
        user: { id: user.id } as User,
        birth_date: dto.patient_profile.birth_date,
        country: dto.patient_profile.country.trim(),
        city: dto.patient_profile.city.trim(),
        dominant_hand: dto.patient_profile.dominant_hand,
        phone: dto.phone ?? null,
        notes: dto.notes ?? null,
      }),
    );
  }

  /**
   * Valida que el bloque de perfil enviado corresponda al rol elegido y que esté
   * presente cuando el rol lo exige.
   */
  private assertProfilePayload(
    dto: RegisterPasswordDto,
    roleAlias: string,
    requiresProfile: boolean,
  ) {
    const isPhysiotherapist = roleAlias === ProfileRoleAlias.PHYSIOTHERAPIST;
    const isPatient = roleAlias === ProfileRoleAlias.PATIENT;

    if (requiresProfile && !dto.physiotherapist_profile && !dto.patient_profile) {
      throw new BadRequestException(ErrorMessages.PROFILE_BLOCK_REQUIRED);
    }
    if (isPhysiotherapist && !dto.physiotherapist_profile) {
      throw new BadRequestException(ErrorMessages.PROFILE_BLOCK_REQUIRED);
    }
    if (isPatient && !dto.patient_profile) {
      throw new BadRequestException(ErrorMessages.PROFILE_BLOCK_REQUIRED);
    }
    if (isPhysiotherapist && dto.patient_profile) {
      throw new BadRequestException(ErrorMessages.PROFILE_BLOCK_NOT_ALLOWED);
    }
    if (isPatient && dto.physiotherapist_profile) {
      throw new BadRequestException(ErrorMessages.PROFILE_BLOCK_NOT_ALLOWED);
    }
  }

  private assertBirthDate(birthDate: string) {
    const parsed = new Date(`${birthDate}T00:00:00.000Z`);
    const min = new Date('1900-01-01T00:00:00.000Z');

    if (Number.isNaN(parsed.getTime()) || parsed > new Date() || parsed < min) {
      throw new BadRequestException(ErrorMessages.INVALID_BIRTH_DATE);
    }
  }

  /**
   * Traduce una violación de unicidad de Postgres (23505) a un 409 para que el
   * frontend pueda diferenciar el conflicto de un error de servidor.
   */
  private translateDbError(error: unknown, username: string) {
    const driverError = (error as QueryFailedError)?.driverError as { code?: string } | undefined;
    if (error instanceof QueryFailedError && driverError?.code === '23505') {
      return new ConflictException(`User ${username} already is registered`);
    }
    return new InternalServerErrorException(ErrorMessages.INTERNAL_SERVER_ERROR);
  }

  async loginPassword(dto: LoginPasswordDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.username.toLowerCase().trim());
    if (!user) {
      await this.passwordService.verify(dto.password, null);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await this.passwordService.verify(dto.password, user.password);
    if (!isValid) {
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

    const email = payload.email?.toLowerCase().trim();
    const user = email ? await this.usersService.findByEmail(email) : undefined;
    if(!user){
      throw new NotFoundException(`User ${payload.email} not found`);
    }

    const userToReturn = this.mapUser(user); 
    const access_token = await this.generateAccesToken(userToReturn);
    return {...userToReturn,access_token}
  }

  async generateAccesToken(user:UserToReturnDto){
    return await this.jwtService.signAsync(
      {
        uuid: user.id,
        username: user.email,
        name: user.displayName,
      },{
        secret: process.env.JWT_SECRET,
        expiresIn:'15m'
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