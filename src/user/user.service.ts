import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUpdateUser } from './dto/createUpdateUser.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) 
    private userRepository: Repository<User>
  ){}

  async findAll(): Promise<User[]>  {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({where:{id}});
  }

  async findBy(criteria: any): Promise<User[]> {
      return this.userRepository.find(criteria);
  }

  async store(createUserDto:CreateUserDto) {
      try{
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
      }catch(error){
        const logger = new Logger();
        logger.error(error);
        throw new InternalServerErrorException(ErrorMessages.INTERNAL_SERVER_ERROR)
      }
  }

  async update(id: number, data: CreateUpdateUser) {
    const user = await this.userRepository.findOne({where:{id}});
    if(!user) throw new NotFoundException();

    // WARNING: In this case password is stored as PLAINTEXT
    // It is only for show how it works!!!
    Object.assign(user, data);

    this.userRepository.update(id, user);
    return user;
  }

  async destroy(id: number) {
    const user = await this.userRepository.findOne({where:{id}});
    if(!user) throw new NotFoundException();
    this.userRepository.remove(user);
  }

  async findByEmail(username: string) {
    try{
      const user = await this.userRepository.findOne({ where: { username }});      
      return user;
    }
    catch(error){
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_SERVER_ERROR)
    }
  }
}