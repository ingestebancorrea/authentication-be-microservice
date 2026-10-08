import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Physiotherapist } from './entities/physiotherapist.entity';

/**
 * Perfil profesional con la identidad resuelta desde `users`.
 *
 * physiosense-core-be-microservice no guarda copia de `physiotherapists`:
 * usa esta representacion para mostrar el nombre del fisioterapeuta y para
 * resolver `actor.therapistId`.
 */
export interface PhysiotherapistProfileResponse {
  physiotherapist_id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  specialty: string;
  license_number: string;
  institution: string | null;
  years_of_experience: number;
  phone: string | null;
  notes: string | null;
}

/**
 * Lectura del perfil de fisioterapeuta para los demas servicios.
 *
 * No hay escrituras desde fuera: el perfil se crea en `AuthService.register`
 * y se modifica con los endpoints propios de este microservicio.
 */
@Injectable()
export class PhysiotherapistService {
  constructor(
    @InjectRepository(Physiotherapist)
    private readonly physiotherapistRepository: Repository<Physiotherapist>,
  ) {}

  async findAll(): Promise<PhysiotherapistProfileResponse[]> {
    const physiotherapists = await this.physiotherapistRepository.find({
      relations: { user: true },
      order: { physiotherapist_id: 'ASC' },
    });

    return physiotherapists.map((physiotherapist) =>
      this.toResponse(physiotherapist),
    );
  }

  async findOne(physiotherapistId: number): Promise<PhysiotherapistProfileResponse> {
    const physiotherapist = await this.physiotherapistRepository.findOne({
      where: { physiotherapist_id: physiotherapistId },
      relations: { user: true },
    });

    if (!physiotherapist) {
      throw new NotFoundException('Physiotherapist not found');
    }

    return this.toResponse(physiotherapist);
  }

  async findByUserId(
    userId: number,
  ): Promise<PhysiotherapistProfileResponse | null> {
    const physiotherapist = await this.physiotherapistRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    return physiotherapist ? this.toResponse(physiotherapist) : null;
  }

  private toResponse(
    physiotherapist: Physiotherapist,
  ): PhysiotherapistProfileResponse {
    return {
      physiotherapist_id: physiotherapist.physiotherapist_id,
      user_id: physiotherapist.user.id,
      full_name: physiotherapist.user.full_name,
      email: physiotherapist.user.username,
      avatar_url: physiotherapist.user.image_url ?? null,
      is_active: physiotherapist.user.is_active,
      specialty: physiotherapist.specialty,
      license_number: physiotherapist.license_number,
      institution: physiotherapist.institution ?? null,
      years_of_experience: physiotherapist.years_of_experience,
      phone: physiotherapist.phone ?? null,
      notes: physiotherapist.notes ?? null,
    };
  }
}
