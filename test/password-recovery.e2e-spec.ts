import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordRecoveryToken } from '../src/auth/entities/password-recovery-token.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../src/user/user.service';
import { User } from '../src/user/entities/user.entity';
import { Role } from '../src/role/entities/role-entity';
import { AuthType } from '../src/auth-type/entities/auth-type.entity';

describe('Password Recovery (e2e)', () => {
  let app: INestApplication;
  let mailServiceMock: { sendPasswordRecovery: jest.Mock };
  let recoveryRepo: Repository<PasswordRecoveryToken>;

  beforeAll(async () => {
    mailServiceMock = { sendPasswordRecovery: jest.fn().mockResolvedValue(undefined) };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v1/');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    recoveryRepo = moduleFixture.get<Repository<PasswordRecoveryToken>>(
      getRepositoryToken(PasswordRecoveryToken),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await recoveryRepo.createQueryBuilder().delete().execute();
  });

  afterEach(async () => {
    const userRepo = app.get(getRepositoryToken(User)) as any;
    await userRepo.createQueryBuilder().delete().execute();
  });

  it('should handle forgot-password for non-existent user (always returns 200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ username: 'nonexistent@example.com' })
      .expect(200);

    expect(res.body.message).toContain('correo');
    expect(mailServiceMock.sendPasswordRecovery).not.toHaveBeenCalled();
  });

  it('should create token and send email when user exists with password', async () => {
    const usersService = app.get(UsersService);
    const userRepo = app.get(getRepositoryToken(User)) as any;
    const roleRepo = app.get(getRepositoryToken(Role)) as any;
    let role = await roleRepo.findOne({ where: { id: 1 } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create({ id: 1, name: 'FIS', description: 'Fisioterapeuta' }));
    }
    const authTypeRepo = app.get(getRepositoryToken(AuthType)) as any;
    let authType = await authTypeRepo.findOne({ where: { id: 1 } });
    if (!authType) {
      authType = await authTypeRepo.save(authTypeRepo.create({ id: 1, name: 'PASS', description: 'Password' }));
    }
    const unique = Date.now();
    const email = `test${unique}@example.com`;
    const userEntity = userRepo.create({
      username: email,
      full_name: 'Test User',
      is_active: true,
      password: '$2b$12$hash',
      authRole: role,
      authTypes: [authType],
    });
    const savedUser = await userRepo.save(userEntity);
    jest.spyOn(usersService as any, 'findByEmailWithPassword').mockResolvedValue(savedUser);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ username: email })
      .expect(200);

    expect(res.body.message).toContain('correo');
    expect(mailServiceMock.sendPasswordRecovery).toHaveBeenCalledTimes(1);
  });

  it('should not send email for federated user without password', async () => {
    const usersService = app.get(UsersService);
    const user = {
      id: 998,
      username: 'fede@example.com',
      full_name: 'Fede',
      is_active: true,
      password: null,
    };
    jest.spyOn(usersService as any, 'findByEmailWithPassword').mockResolvedValue(user as any);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ username: 'fede@example.com' })
      .expect(200);

    expect(res.body.message).toContain('correo');
    expect(mailServiceMock.sendPasswordRecovery).not.toHaveBeenCalled();
  });
});


