import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';

/**
 * Perfil de paciente con la identidad resuelta desde `users`.
 *
 * Es la representacion que consume physiosense-core-be-microservice: ahi ya no
 * hay tabla `patients`, así que este servicio es la fuente de verdad de
 * nombre, email, avatar y fecha de nacimiento.
 */
export interface PatientProfileResponse {
  patient_id: number;
  user_id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  birth_date: string;
  country: string;
  city: string;
  dominant_hand: string;
  phone: string | null;
  notes: string | null;
}

/**
 * Lectura del perfil de paciente para los demas servicios.
 *
 * No hay escrituras desde fuera: el perfil se crea en `AuthService.register`
 * y se modifica con los endpoints propios de este microservicio.
 */
@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<PatientProfileResponse[]> {
    const patients = await this.patientRepository.find({
      relations: { user: true },
      order: { patient_id: 'ASC' },
    });

    return patients.map((patient) => this.toResponse(patient));
  }

  async findOne(patientId: number): Promise<PatientProfileResponse> {
    const patient = await this.patientRepository.findOne({
      where: { patient_id: patientId },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.toResponse(patient);
  }

  async findByUserId(userId: number): Promise<PatientProfileResponse | null> {
    const patient = await this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    return patient ? this.toResponse(patient) : null;
  }

  private toResponse(patient: Patient): PatientProfileResponse {
    return {
      patient_id: patient.patient_id,
      user_id: patient.user.id,
      full_name: patient.user.full_name,
      email: patient.user.username,
      avatar_url: patient.user.image_url ?? null,
      is_active: patient.user.is_active,
      birth_date: patient.birth_date,
      country: patient.country,
      city: patient.city,
      dominant_hand: patient.dominant_hand,
      phone: patient.phone ?? null,
      notes: patient.notes ?? null,
    };
  }
}
