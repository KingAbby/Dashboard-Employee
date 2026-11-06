import {
  AppRpcException,
  ERROR_MESSAGES,
  HttpExceptionsFilter,
  MESSAGE_PATTERNS,
  Role,
  type EmployeeResponse,
  type LoginDto,
} from '@app/common';
import { jest } from '@jest/globals';
import { Global, Module, ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import request from 'supertest';
import { IDENTITY_CLIENT } from '../apps/gateway/src/clients/clients.module';

jest.unstable_mockModule('@nestjs/throttler', () => ({
  Throttle: () => () => undefined,
  ThrottlerGuard: class ThrottlerGuard {},
}));

const { AuthModule } = await import('../apps/gateway/src/auth/auth.module');
const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TEST_JWT_SECRET = 'test_secret_for_e2e_only';

const ADMIN_EMPLOYEE: EmployeeResponse = {
  id: ADMIN_ID,
  employeeCode: 'EMP-0001',
  fullName: 'Admin HRD',
  email: 'admin@example.com',
  role: Role.ADMIN_HRD,
  position: 'HR Manager',
  department: 'People',
  phone: null,
  joinDate: '2025-01-06',
  isActive: true,
  createdAt: new Date('2025-01-06T00:00:00.000Z'),
  updatedAt: new Date('2025-01-06T00:00:00.000Z'),
};

const loginRequest = (overrides: Partial<LoginDto> = {}): LoginDto => ({
  email: 'admin@example.com',
  password: 'Admin123!',
  ...overrides,
});

const identityClient = {
  send: (pattern: string, payload: unknown) => {
    if (pattern === MESSAGE_PATTERNS.IDENTITY_LOGIN) {
      const { email, password } = payload as LoginDto;
      if (email === ADMIN_EMPLOYEE.email && password === 'Admin123!') {
        return of({ user: ADMIN_EMPLOYEE });
      }
      return throwError(() => AppRpcException.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS));
    }

    if (pattern === MESSAGE_PATTERNS.IDENTITY_EMPLOYEE_GET) {
      return of(ADMIN_EMPLOYEE);
    }

    return throwError(() => new Error(`Pattern tidak di-stub: ${pattern}`));
  },
};

@Global()
@Module({
  providers: [{ provide: IDENTITY_CLIENT, useValue: identityClient }],
  exports: [IDENTITY_CLIENT],
})
class FakeClientsModule {}

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: {
        get: (key: string, fallback?: string) =>
          key === 'JWT_SECRET' ? TEST_JWT_SECRET : fallback,
      },
    },
  ],
  exports: [ConfigService],
})
class FakeConfigModule {}

describe('POST /api/auth/login (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FakeConfigModule,
        FakeClientsModule,
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionsFilter());

    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('mengembalikan accessToken dan profil tanpa password_hash', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginRequest())
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.user).toMatchObject({
      id: ADMIN_ID,
      email: ADMIN_EMPLOYEE.email,
      role: Role.ADMIN_HRD,
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');

    // Token yang diterbitkan gateway harus memuat sub dan role yang benar.
    const payload = await jwt.verifyAsync<{ sub: string; role: string; email: string }>(
      response.body.accessToken,
    );
    expect(payload).toMatchObject({
      sub: ADMIN_ID,
      role: Role.ADMIN_HRD,
      email: ADMIN_EMPLOYEE.email,
    });
  });

  it('menolak kredensial salah dengan 401 dan pesan dari identity', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginRequest({ password: 'salah' }))
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  });

  it('menolak body yang tidak valid dengan 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'bukan-email', password: '' })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message.length).toBeGreaterThan(0);
  });

  it('token hasil login bisa dipakai di endpoint terproteksi /api/auth/me', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginRequest())
      .expect(200);

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(me.body).toMatchObject({
      id: ADMIN_ID,
      role: Role.ADMIN_HRD,
      employeeCode: ADMIN_EMPLOYEE.employeeCode,
    });
  });
});
