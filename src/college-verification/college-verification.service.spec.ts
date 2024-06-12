import { TestingModule, Test } from '@nestjs/testing';
import { CollegeVerificationController } from './college-verification.controller';
import { CollegeVerificationService } from './college-verification.service';
import { RedisService } from '../shared/services/redis.service';
import { MailService } from '../shared/services/mail.service';
import { v4 as uuid } from 'uuid';
import { AuthRepository } from '../auth/auth.repository';
import { NotFoundException } from '@nestjs/common';
import { RegistrationStatus } from '../utils/enum/registration_status';

describe('CollegeVerificationController', () => {
  let authRepository: AuthRepository;
  let service: CollegeVerificationService;
  let redis: RedisService;
  let mailService: MailService;
  const uuidValue = uuid();
  const uuidValue2 = uuid();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegeVerificationController],
      providers: [
        {
          provide: CollegeVerificationService,
          useValue: {
            verifyKey: jest.fn(),
            verifySchool: jest.fn(),
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
        MailService,
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

    service = module.get<CollegeVerificationService>(
      CollegeVerificationService,
    );
    redis = module.get<RedisService>(RedisService);
    mailService = module.get<MailService>(MailService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  describe('verifySchool', () => {
    it('should verify a school and send a verification email', async () => {
      const key = 'someKey';
      const schoolData = {
        id: uuidValue,
        college_name: 'Test College',
      };
      const userData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        college_id: uuidValue2,
      };

      redis.getClient = jest.fn().mockReturnValue({
        hget: jest.fn().mockResolvedValueOnce(JSON.stringify(userData)),
      });
      authRepository.updateStatus = jest.fn().mockResolvedValueOnce(schoolData);
      mailService.sendTemplateMail = jest.fn().mockResolvedValueOnce({});

      const result = await service.verifySchool(key);

      expect(redis.getClient().hget).toHaveBeenCalledWith('onboarding', key);
      expect(authRepository.updateStatus).toHaveBeenCalledWith(
        uuidValue2,
        RegistrationStatus.VERIFIED,
      );
      expect(mailService.sendTemplateMail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'School verified successfully' });
    });

    it('should throw NotFoundException if the key is invalid', async () => {
      const key = 'invalidKey';

      redis.getClient = jest.fn().mockReturnValueOnce({
        hget: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.verifySchool(key)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyKey', () => {
    it('should verify the key', async () => {
      const key = 'someKey';
      const userData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        college_id: uuidValue2,
      };

      redis.getClient = jest.fn().mockReturnValue({
        hget: jest.fn().mockResolvedValueOnce(JSON.stringify(userData)),
      });

      const result = await service.verifyKey(key);

      expect(redis.getClient().hget).toHaveBeenCalledWith('onboarding', key);
      expect(result).toEqual({ message: 'Key verified successfully' });
    });

    it('should throw NotFoundException if the key is invalid', async () => {
      const key = 'invalidKey';

      redis.getClient = jest.fn().mockReturnValueOnce({
        hget: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.verifyKey(key)).rejects.toThrow(NotFoundException);
    });
  });
});
