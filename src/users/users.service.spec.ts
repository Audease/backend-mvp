import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Role } from '../utils/enum/role';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { getFakeSchool } from '../../test/test.helper';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<Users>;
  const userId = uuidv4();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'johndoe.college.admin',
        email: faker.internet.email({
          firstName: 'John',
          lastName: 'Doe',
          provider: 'example.com',
        }),
        password: faker.lorem.word(),
        role: Role.SCHOOL_ADMIN,
        phone: faker.phone.number(),
        first_name: 'John',
        last_name: 'Doe',
      };

      const createdUser: Users = {
        id: userId,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        school: getFakeSchool(),
        ...createUserDto,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(repository.save).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: Users[] = [
        {
          id: uuidv4(),
          username: 'user1',
          email: faker.internet.email(),
          password: faker.lorem.word(),
          role: Role.SCHOOL_ADMIN,
          phone: faker.phone.number(),
          first_name: 'User',
          last_name: 'One',
          school: null,
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
        {
          id: uuidv4(),
          username: 'user2',
          email: faker.internet.email(),
          password: faker.lorem.word(),
          role: Role.SCHOOL_ADMIN,
          phone: faker.phone.number(),
          first_name: 'User',
          last_name: 'Two',
          school: null,
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user: Users = {
        id: userId,
        username: 'johndoe.college.admin',
        email: faker.internet.email({
          firstName: 'John',
          lastName: 'Doe',
          provider: 'example.com',
        }),
        password: faker.lorem.word(),
        role: Role.SCHOOL_ADMIN,
        phone: faker.phone.number(),
        first_name: 'John',
        last_name: 'Doe',
        school: null,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user by id', async () => {
      const updateUserDto: Partial<CreateUserDto> = {
        username: 'john.college.admin',
      };

      const updatedUser: Users = {
        id: userId,
        username: 'john.college.admin',
        email: faker.internet.email({
          firstName: 'John',
          lastName: 'Doe',
          provider: 'example.com',
        }),
        password: faker.lorem.word(),
        role: Role.SCHOOL_ADMIN,
        phone: faker.phone.number(),
        first_name: 'John',
        last_name: 'Doe',
        school: null,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };

      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
