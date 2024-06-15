import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthService } from '../src/auth/jwt.service';
import { RedisService } from '../src/shared/services/redis.service';
import { MailService } from '../src/shared/services/mail.service';
import { UserService } from '../src/users/users.service';
import { AuthRepository } from '../src/auth/auth.repository';
import * as bcrypt from 'bcrypt';
import * as Faker from '@faker-js/faker';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let keyId: string;
  let refreshToken: string;
  // let authService: AuthService;
  // let jwtService: JwtAuthService;
  // let redisService: RedisService;
  // let mailService: MailService;
  // let userService: UserService;
  // let authRepository: AuthRepository;
  const uuidValue3 = uuid();
  const faker = Faker.faker;
  faker.seed();
  const username = faker.internet.userName();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findSchool: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: JwtAuthService,
          useValue: {
            generateAuthTokens: jest.fn(),
            verifyRefreshToken: jest.fn(),
            generateAccessToken: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              hset: jest.fn(),
              hget: jest.fn(),
              hdel: jest.fn(),
              set: jest.fn(),
              get: jest.fn(),
              del: jest.fn(),
            }),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendTemplateMail: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getRoleByName: jest.fn(),
            getUserByUsername: jest.fn().mockResolvedValue({
              id: uuidValue3,
              username: 'testuser',
              password: await bcrypt.hash('password', 10),
            }),
            createUserWithCollegeId: jest.fn(),
            getUserRoleById: jest.fn().mockReturnValue({
              id: '07186a09-8ced-4e6c-afca-54d226596363',
            }),
            findOne: jest.fn(),
            getUserByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should return success message if school is created successfully', async () => {
      return await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          college_name: faker.company.name(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          no_of_employee: faker.number.int({
            min: 10,
            max: 200,
          }),
          country: faker.location.country(),
          business_code: '3992202',
          address_line1: faker.location.streetAddress(),
          address_line2: faker.location.streetAddress(),
          city: faker.location.county(),
          post_code: faker.location.zipCode(),
          county: faker.location.state(),
          username: username,
          password: 'password1234',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.message).toEqual(
            'School created successfully check your mail for further instructions'
          );
          expect(res.body.keyId).toBeDefined();
          keyId = res.body.keyId;
          console.log(keyId)
        });
    }, 10000);
  });

  describe('/auth/login (POST)', () => {
    it('should return access and refresh tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: username,
          password: 'password1234',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.token.access.token).toBeDefined();
          expect(res.body.token.refresh.token).toBeDefined();
          refreshToken = res.body.token.refresh.token;
        });
    });

    it('should return UnauthorizedException if login fails', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: username,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/refresh-token (POST)', () => {
    it('should send access token to user', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.token);
        });
    });
    it('should return 404 if token is invalid', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(404);
    });
  });
});
