import { TestingModule, Test } from '@nestjs/testing';
import { CollegeVerificationController } from './college-verification.controller';
import { CollegeVerificationService } from './college-verification.service';
import { RedisService } from '../shared/services/redis.service';
import { MailService } from '../shared/services/mail.service';
import { verifyDto } from '../auth/dto/misc-dto';
import { AuthRepository } from '../auth/auth.repository';
import { NotFoundException } from '@nestjs/common';

describe('CollegeVerificationController', () => {
  let controller: CollegeVerificationController;
  let service: CollegeVerificationService;

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

    controller = module.get<CollegeVerificationController>(
      CollegeVerificationController
    );
    service = module.get<CollegeVerificationService>(
      CollegeVerificationService
    );
  });

  describe('verifyKey', () => {
    it('should call authService.verify and return the result', async () => {
      const verifyDto: verifyDto = {
        keyId: 'keyId',
      };

      const expectedResult = {
        message: 'Key verified successfully',
      };

      jest
        .spyOn(service, 'verifyKey')
        .mockResolvedValue(expectedResult as never);

      const result = await controller.verifyKey(verifyDto);

      expect(service.verifyKey).toHaveBeenCalledWith(verifyDto.keyId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifySchool', () => {
    it('should call authService.verifySchool and return the result', async () => {
      const verifyDto: verifyDto = {
        keyId: 'keyId',
      };

      // const expectedResult = {
      //   message: 'School verified successfully',
      // };

      jest
        .spyOn(service, 'verifySchool')
        .mockRejectedValue(new NotFoundException('Invalid key'));

      // const result = await controller.verify(verifyDto);

      await expect(controller.verifySchool(verifyDto)).rejects.toThrowError(
        NotFoundException
      );
    });

    it('should throw NotFoundException if authService.verifySchool throws an error', async () => {
      const verifyDto: verifyDto = {
        keyId: 'keyId',
      };
      const error = new Error('Key verification failed');

      jest.spyOn(service, 'verifySchool').mockRejectedValue(error);

      await expect(controller.verifySchool(verifyDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
