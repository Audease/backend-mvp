import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthService } from '../src/auth/jwt.service';
import { RedisService } from '../src/shared/services/redis.service';
import { MailService } from '../src/shared/services/mail.service';
import { UserService } from '../src/users/users.service';
import { AuthRepository } from '../src/auth/auth.repository';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtAuthService;
  let redisService: RedisService;
  let mailService: MailService;
  let userService: UserService;
  let authRepository: AuthRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return access and refresh tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'teslim.edencollege.admin',
          password: 'password1234',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.token.access.token).toBeDefined();
          expect(res.body.token.refresh.token).toBeDefined();
        });
    });

    it('should return UnauthorizedException if login fails', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'teslim.edencollege.admin',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/verify (POST)', () => {
    it('should return success message if key is verified', () => {
      return request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          keyId: 'keyId',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual('Key verified successfully');
        });
    });

    it('should return NotFoundException if key verification fails', () => {
      return request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          keyId: 'invalidKeyId',
        })
        .expect(404);
    });
  });

  // Add more test cases for other endpoints

});