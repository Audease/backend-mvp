import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Role } from '../utils/enum/role';
import { Faker } from '@faker-js/faker';
import { getFakeSchool, getFakeUser } from '../../test/test.helper';



describe('UserService', () => {
    let service: UserService;
    let faker: Faker;
    let repository: Repository<Users>;
    const getUser = getFakeUser();
    const getSchool = getFakeSchool();
    const userId = faker.string.uuid();

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
                email: faker.internet.email({ firstName: 'John', lastName: 'Doe', provider: 'example.com'}),
                password: faker.lorem.word(),
                role: Role.SCHOOL_ADMIN,
                phone: faker.phone.number(),
                first_name: 'John',
                last_name: 'Doe',
            };

            const createdUser: Users = {
                id: userId,
                username: 'johndoe.college.admin',
                email: faker.internet.email({ firstName: 'John', lastName: 'Doe', provider: 'example.com'}),
                password: faker.lorem.word(),
                role: Role.SCHOOL_ADMIN,
                phone: faker.phone.number(),
                first_name: 'John',
                last_name: 'Doe',
                school: getSchool,
                created_at: faker.date.past(),
                updated_at: faker.date.recent(),
            };

            jest.spyOn(repository, 'create').mockReturnValue(createdUser);
            jest.spyOn(repository, 'save').mockResolvedValue(createdUser);

            const result = await service.create(createUserDto);

            expect(repository.create).toHaveBeenCalledWith(createUserDto);
            expect(repository.save).toHaveBeenCalledWith(createdUser);
            expect(result).toEqual(createdUser);
        });
    });

    // describe('findAll', () => {
    //     it('should return an array of users', async () => {
    //         const users: Users[] = [
    //             getUser,
    //             getUser,
    //             getUser,
    //         ]

    //         jest.spyOn(repository, 'find').mockResolvedValue(users);

    //         const result = await service.findAll();

    //         expect(repository.find).toHaveBeenCalled();
    //         expect(result).toEqual(users);
    //     });
    // });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            const user: Users = {
                id: userId,
                username: 'johndoe.college.admin',
                email: faker.internet.email({ firstName: 'John', lastName: 'Doe', provider: 'example.com'}),
                password: faker.lorem.word(),
                role: Role.SCHOOL_ADMIN,
                phone: faker.phone.number(),
                first_name: 'John',
                last_name: 'Doe',
                school: getSchool,
                created_at: faker.date.past(),
                updated_at: faker.date.recent(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(user);

            const result = await service.findOne(userId);

            expect(repository.findOne).toHaveBeenCalledWith(userId);
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
                email: faker.internet.email({ firstName: 'John', lastName: 'Doe', provider: 'example.com'}),
                password: faker.lorem.word(),
                role: Role.SCHOOL_ADMIN,
                phone: faker.phone.number(),
                first_name: 'John',
                last_name: 'Doe',
                school: getSchool,
                created_at: faker.date.past(),
                updated_at: faker.date.recent(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(updatedUser);
            jest.spyOn(repository, 'save').mockResolvedValue(updatedUser);

            const result = await service.update(userId, updateUserDto);

            expect(repository.findOne).toHaveBeenCalledWith(userId);
            expect(repository.save).toHaveBeenCalledWith(updatedUser);
            expect(result).toEqual(updatedUser);
        });
    });
});