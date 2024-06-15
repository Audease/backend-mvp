import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CollegeVerificationService } from '../src/college-verification/college-verification.service';
import { RedisService } from '../src/shared/services/redis.service';
import { MailService } from '../src/shared/services/mail.service';
import { AuthRepository } from '../src/auth/auth.repository';

describe('CollegeVerificationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        CollegeVerificationService,
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              hget: jest.fn(),
              hset: jest.fn(),
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
          provide: AuthRepository,
          useValue: {
            findSchool: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
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

  describe('/verification/verify-key (POST)', () => {
    it('should return success message if key is verified', () => {
      return request(app.getHttpServer())
        .post('/verification/verify-key')
        .send({
          keyId: 'd9927908-94bf-4856-866a-0622939abb8c',
        })
        .expect(200)
        .expect(res => {
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

  describe('/verification/verify-school (POST)', () => {
    it('should verify school onboarding key', () => {
      return request(app.getHttpServer())
        .post('/verification/verify-school')
        .send({
          keyId: 'd9927908-94bf-4856-866a-0622939abb8c',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.message).toEqual('School verified successfully');
        });
    });
    it('should return NotFoundException is key verification fails', () => {
      return request(app.getHttpServer())
        .post('/auth/verify-school')
        .send({
          keyId: 'invalidKey',
        })
        .expect(404);
    });
  });
});
