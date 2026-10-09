import { Controller, Get, Post, Body, Param, Delete, UseGuards, NotFoundException, Put, HttpCode } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUpdateUser } from './dto/createUpdateUser.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { PatientService } from 'src/patient/patient.service';
import { PhysiotherapistService } from 'src/physiotherapist/physiotherapist.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { AuthMessages } from 'src/common/enum/auth-messages.enum';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private patientService: PatientService,
    private physiotherapistService: PhysiotherapistService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async index() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async show(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    if (user) return user;
    throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
  }

  /**
   * Rol y perfil del usuario.
   *
   * El access token ya incluye role_alias, patient_id y physiotherapist_id, por
   * lo que physiosense-core-be-microservice puede resolver el actor sin llamar
   * a este endpoint en cada request. Se mantiene por compatibilidad y para
   * obtener el resto del perfil (nombre, avatar, etc.).
   */
  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Param('id') id: number) {
    const user = await this.userService.findWithRole(id);
    if (!user) throw new NotFoundException('User not found');

    const patient = await this.patientService.findByUserId(user.id);
    const physiotherapist = await this.physiotherapistService.findByUserId(user.id);

    return {
      user_id: user.id,
      username: user.username,
      full_name: user.full_name,
      image_url: user.image_url ?? null,
      is_active: user.is_active,
      role_id: user.role,
      role_alias: user.authRole?.alias ?? null,
      patient_id: patient?.patient_id ?? null,
      physiotherapist_id: physiotherapist?.physiotherapist_id ?? null,
    };
  }

  @Post()
  @ApiCreatedResponse({ description: AuthMessages.USER_CREATED })
  @UseGuards(JwtAuthGuard)
  async store(@Body() data: CreateUserDto) {
    return await this.userService.store(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: number, @Body() data: CreateUpdateUser) {
    return await this.userService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async destroy(@Param('id') id: number) {
    await this.userService.destroy(id);
    return;
  }
}
