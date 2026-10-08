import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PatientService } from './patient.service';

/**
 * Lectura del perfil de paciente para physiosense-core-be-microservice.
 *
 * Ese microservicio ya no guarda una copia de `patients`: consulta estos
 * endpoints (con un token emitido con el JWT_SECRET compartido) para resolver
 * identidad, fecha de nacimiento y mano dominante.
 */
@ApiTags('Patient')
@ApiBearerAuth()
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async index() {
    return this.patientService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async show(@Param('id') id: number) {
    return this.patientService.findOne(id);
  }
}
