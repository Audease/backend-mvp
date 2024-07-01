

import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterService } from './recruiter.service';
import { RecruiterRepository } from './recruiter.repository';
import { ProspectiveStudent } from './entities/prospective-student.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RecruiterService', () => {
  let service: RecruiterService;
  let mockRecruiterRepository: jest.Mocked<RecruiterRepository>;
  // let mockLearnerRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruiterService,
        {
          provide: RecruiterRepository,
          useFactory: () => ({ findRecruiter: jest.fn() }),
        },
        {
          provide: getRepositoryToken(ProspectiveStudent),
          useFactory: () => ({
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<RecruiterService>(RecruiterService);
    mockRecruiterRepository =
      module.get<jest.Mocked<RecruiterRepository>>(RecruiterRepository);
    // mockLearnerRepository = module.get(getRepositoryToken(ProspectiveStudent));
  });

  it('should throw NotFoundException if recruiter is not found', async () => {
    mockRecruiterRepository.findRecruiter.mockReturnValue(null);

    try {
      await service.createLearner('123', {} as CreateLearnerDto);
      fail('Expected NotFoundException');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
    }
  });

  it('should throw BadRequestException if createLearnerDto is missing', async () => {
    try {
      await service.createLearner('123', null);
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Kindly fill all fields.');
    }
  });

  // it('should throw ConflictException if existing learner is found', async () => {
  //   const existingLearner = new ProspectiveStudent();
  //   existingLearner.email = 'test@example.com';
  //   mockLearnerRepository.findOne.mockReturnValue(existingLearner);

  //   try {
  //     const dto: CreateLearnerDto = { email: 'test@example.com', mobile_number: '123456', date_of_birth: '1' };
  //     await service.createLearner('123', dto);
  //     fail('Expected ConflictException');
  //   }
  // })
});
