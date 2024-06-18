import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CollegeVerificationService } from '../src/college-verification/college-verification.service';
import { RedisService } from '../src/shared/services/redis.service';
import { MailService } from '../src/shared/services/mail.service';

describe('CollegeVerificationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [CollegeVerificationService, RedisService, MailService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /verification/verify-school', () => {
    it('should return 200 status code', () => {
      return request(app.getHttpServer())
        .post('/verification/verify-school')
        .send({
          keyId: 'test',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
        });
    });
  });
});
