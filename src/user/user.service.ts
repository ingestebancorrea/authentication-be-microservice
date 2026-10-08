import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { PasswordService } from 'src/common/services/password.service';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUpdateUser } from './dto/createUpdateUser.dto';
import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role-entity';
import { AuthType } from 'src/auth-type/entities/auth-type.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) 
    private userRepository: Repository<User>,
    @InjectRepository(AuthType)
    private authTypeRepository: Repository<AuthType>,
    private passwordService: PasswordService,
  ){}

  async findAll(): Promise<User[]>  {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({where:{id}});
  }

  /**
   * Como `findOne`, pero con el rol cargado.
   *
   * `role` (el id) viene de `@RelationId` y sale siempre; `authRole` no, porque
   * la relacion no es eager. Sin esto no se puede devolver el alias 'FIS'/'PAC'.
   */
  async findWithRole(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { id },
      relations: { authRole: true },
    });
  }

  async findBy(criteria: any): Promise<User[]> {
      return this.userRepository.find(criteria);
  }

  /**
   * Crea el usuario y lo vincula con su auth type.
   *
   * `manager` permite que la escritura se integre en una transacción abierta por
   * otro servicio (registro con perfil). Si no se pasa, se usan los repositorios
   * por defecto y la operación queda fuera de cualquier transacción.
   *
   * `errorFactory` permite conservar el error de negocio (por ejemplo un 409 por
   * username duplicado) en lugar de convertirlo siempre en un 500.
   */
  async store(
    createUserDto: CreateUserDto,
    authTypeAlias = 'PASS',
    manager?: EntityManager,
    errorFactory: (error: unknown) => HttpException = () =>
      new InternalServerErrorException(ErrorMessages.INTERNAL_SERVER_ERROR),
  ) {
    const userRepository = manager ? manager.getRepository(User) : this.userRepository;
    const authTypeRepository = manager
      ? manager.getRepository(AuthType)
      : this.authTypeRepository;

    try {
      const user = userRepository.create(createUserDto);
      user.authRole = createUserDto.role as unknown as Role;
      user.password = await this.passwordService.hash(createUserDto.password);
      const saved = await userRepository.save(user);

      const authType = await authTypeRepository.findOne({ where: { alias: authTypeAlias } });
      if (authType) {
        await userRepository
          .createQueryBuilder()
          .relation(User, 'authTypes')
          .of(saved.id)
          .add(authType.id);
      }

      return await userRepository.findOne({ where: { id: saved.id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const logger = new Logger();
      logger.error(error);
      throw errorFactory(error);
    }
  }

  async update(id: number, data: CreateUpdateUser) {
    const user = await this.userRepository.findOne({where:{id}});
    if(!user) throw new NotFoundException();

    // La contraseña nunca se escribe en claro: si viene en el payload se hashea.
    const { password, ...safeData } = data as CreateUpdateUser & { password?: string };
    Object.assign(user, safeData);
    if (password) {
      user.password = await this.passwordService.hash(password);
    }

    await this.userRepository.update(id, user);
    return user;
  }

  async destroy(id: number) {
    const user = await this.userRepository.findOne({where:{id}});
    if(!user) throw new NotFoundException();
    this.userRepository.remove(user);
  }

  async findByEmail(username: string) {
    if (!username) return undefined;
    try{
      const user = await this.userRepository.findOne({ where: { username }});      
      return user;
    }
    catch(error){
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_SERVER_ERROR)
    }
  }

  async findByEmailWithPassword(username: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();
  }
}