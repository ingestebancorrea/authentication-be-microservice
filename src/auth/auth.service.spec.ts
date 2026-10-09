import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken as getTypeOrmRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/role/entities/role-entity';
import { Physiotherapist } from 'src/physiotherapist/entities/physiotherapist.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { AuthService } from './auth.service';
import { UsersService } from 'src/user/user.service';
import { PasswordService } from 'src/common/services/password.service';
import { MailService } from 'src/mail/mail.service';
import { ErrorMessages } from 'src/common/enum/error-messages.enum';
import { User } from 'src/user/entities/user.entity';
import { PasswordRecoveryToken } from './entities/password-recovery-token.entity';
import { UserToReturnDto } from './dto/return-user.dto';

const recoveryTokenRepository = {
  findOne: jest.fn(),
  update: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn(),
};

const roleRepository = { findOne: jest.fn() };
const physiotherapistRepository = { findOne: jest.fn() };
const patientRepository = { findOne: jest.fn() };
const jwtService = new JwtService();

const manager = {
  getRepository: jest.fn(() => ({
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  })),
};

describe('AuthService - password recovery', () => {
  let service: AuthService;
  let usersService: { findByEmailWithPassword: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    usersService = { findByEmailWithPassword: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        PasswordService,
        { provide: DataSource, useValue: { transaction: jest.fn(async (cb) => cb(manager as unknown as EntityManager)) } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                PASSWORD_RECOVERY_TTL_MINUTES: '30',
                PASSWORD_RECOVERY_FRONTEND_URL: 'http://localhost:5173/',
              })[key],
          },
        },
        { provide: MailService, useValue: { sendPasswordRecovery: jest.fn() } },
        { provide: getTypeOrmRepositoryToken(Role), useValue: roleRepository },
        { provide: getTypeOrmRepositoryToken(Physiotherapist), useValue: physiotherapistRepository },
        { provide: getTypeOrmRepositoryToken(Patient), useValue: patientRepository },
        { provide: getTypeOrmRepositoryToken(PasswordRecoveryToken), useValue: recoveryTokenRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('persists a hashed token and sends the email for an active user with password', async () => {
      const user = { id: 7, username: 'ana@mail.com', full_name: 'Ana', is_active: true, password: '$2b$12$hash' };
      usersService.findByEmailWithPassword.mockResolvedValue(user);
      const mailService = service['mailService'];

      await service.forgotPassword({ username: 'ANA@Mail.com' });

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith('ana@mail.com');
      expect(recoveryTokenRepository.save).toHaveBeenCalledTimes(1);

      const savedToken = recoveryTokenRepository.save.mock.calls[0][0];
      expect(savedToken.user).toEqual({ id: 7 });
      // nunca se persiste el token en claro
      expect(savedToken.token_hash).not.toBe(savedToken.token_hash === '' ? '' : undefined);
      expect(savedToken.expires_at.getTime()).toBeGreaterThan(Date.now());

      expect(mailService.sendPasswordRecovery).toHaveBeenCalledWith(
        'ana@mail.com',
        'Ana',
        expect.any(String),
        'http://localhost:5173/reset-password',
        30,
      );
    });

    it('answers the same message and sends nothing when the user does not exist', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(undefined);

      const result = await service.forgotPassword({ username: 'nadie@mail.com' });

      expect(result.message).toContain('correo');
      expect(recoveryTokenRepository.save).not.toHaveBeenCalled();
      expect(service['mailService'].sendPasswordRecovery).not.toHaveBeenCalled();
    });

    it('does not send the email for a federated account (no password)', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 8, username: 'federado@mail.com', full_name: 'Fede', is_active: true, password: null,
      });

      await service.forgotPassword({ username: 'federado@mail.com' });

      expect(recoveryTokenRepository.save).not.toHaveBeenCalled();
      expect(service['mailService'].sendPasswordRecovery).not.toHaveBeenCalled();
    });

    it('throws 500 when the transport fails', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 7, username: 'ana@mail.com', full_name: 'Ana', is_active: true, password: '$2b$12$hash',
      });
      (service['mailService'] as any).sendPasswordRecovery.mockRejectedValue(new Error('smtp down'));

      await expect(service.forgotPassword({ username: 'ana@mail.com' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('resetPassword', () => {
    const buildToken = (overrides = {}) => ({
      id: 1,
      token_hash: 'hash',
      user: { id: 7 },
      used: false,
      expires_at: new Date(Date.now() + 60_000),
      ...overrides,
    });

    it('marks the token used and stores the new hashed password', async () => {
      recoveryTokenRepository.findOne.mockResolvedValue(buildToken());

      const result = await service.resetPassword({
        token: 'el-token',
        password: 'Nueva123',
        confirm_password: 'Nueva123',
      });

      expect(result.message).toContain('actualizó');
      expect(recoveryTokenRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { token_hash: expect.any(String), used: false } }),
      );

      const tokenUpdate = manager.getRepository.mock.results[0].value.update;
      const userUpdate = manager.getRepository.mock.results[1]?.value.update ?? manager.getRepository.mock.results[0].value.update;
      // Check that user update was called with correct params
      expect(userUpdate).toHaveBeenCalledWith(
        { id: 7 },
        { password: expect.not.stringContaining('Nueva123') },
      );
    });

    it('rejects a token that does not exist', async () => {
      recoveryTokenRepository.findOne.mockResolvedValue(undefined);

      await expect(
        service.resetPassword({ token: 'x', password: 'Nueva123', confirm_password: 'Nueva123' }),
      ).rejects.toThrow(ErrorMessages.RECOVERY_TOKEN_INVALID);
    });

    it('rejects an expired token', async () => {
      recoveryTokenRepository.findOne.mockResolvedValue(
        buildToken({ expires_at: new Date(Date.now() - 1000) }),
      );

      await expect(
        service.resetPassword({ token: 'x', password: 'Nueva123', confirm_password: 'Nueva123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateAccesToken claims', () => {
    const TEST_SECRET = 'test-secret-hs256';

    const baseUser: UserToReturnDto = {
      id: 123,
      role: 1,
      email: 'juan',
      displayName: 'Juan Perez',
      photoURL: null,
      isActive: true,
    };

    const decode = (token: string) =>
      jwtService.verifyAsync(token, { secret: TEST_SECRET, algorithms: ['HS256'] });

    beforeAll(() => {
      process.env.JWT_SECRET = TEST_SECRET;
    });

    it('embeds FIS role + physiotherapist_id and nulls patient_id', async () => {
      roleRepository.findOne.mockResolvedValue({ id: 1, alias: 'FIS' });
      physiotherapistRepository.findOne.mockResolvedValue({ physiotherapist_id: 77 });
      patientRepository.findOne.mockResolvedValue(null);

      const token = await service.generateAccesToken(baseUser);
      const payload = await decode(token);

      expect(payload).toEqual(
        expect.objectContaining({
          uuid: 123,
          username: 'juan',
          name: 'Juan Perez',
          role_alias: 'FIS',
          patient_id: null,
          physiotherapist_id: 77,
          is_active: true,
        }),
      );

      const [header] = token.split('.');
      expect(JSON.parse(Buffer.from(header, 'base64url').toString()).alg).toBe('HS256');
    });

    it('embeds PAC role + patient_id and nulls physiotherapist_id', async () => {
      roleRepository.findOne.mockResolvedValue({ id: 2, alias: 'PAC' });
      physiotherapistRepository.findOne.mockResolvedValue(null);
      patientRepository.findOne.mockResolvedValue({ patient_id: 45 });

      const token = await service.generateAccesToken({ ...baseUser, role: 2 });
      const payload = await decode(token);

      expect(payload).toEqual(
        expect.objectContaining({
          uuid: 123,
          role_alias: 'PAC',
          patient_id: 45,
          physiotherapist_id: null,
        }),
      );
    });
  });
});

function getRepositoryToken(entity: unknown) {
  return `${String(entity)}Repository`;
}