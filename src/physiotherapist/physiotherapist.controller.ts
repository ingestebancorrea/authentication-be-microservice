import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PhysiotherapistService } from './physiotherapist.service';

/**
 * Lectura del perfil de fisioterapeuta para physiosense-core-be-microservice.
 *
 * Ese microservicio ya no guarda una copia de `physiotherapists`: consulta
 * estos endpoints (con un token emitido con el JWT_SECRET compartido) para
 * resolver `actor.therapistId` y mostrar el nombre en sus pantallas.
 */
@ApiTags('Physiotherapist')
@ApiBearerAuth()
@Controller('physiotherapists')
export class PhysiotherapistController {
  constructor(
    private readonly physiotherapistService: PhysiotherapistService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async index() {
    return this.physiotherapistService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async show(@Param('id') id: number) {
    return this.physiotherapistService.findOne(id);
  }
}
