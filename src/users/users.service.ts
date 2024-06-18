/* eslint-disable @typescript-eslint/no-unused-vars */
import { Users } from './entities/user.entity';
import { School } from '../shared/entities/school.entity';
import { Roles } from '../shared/entities/role.entity';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSchoolDto } from 'src/auth/dto/create-school.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { RegistrationStatus } from '../utils/enum/registration_status';
import { UserSchema } from '../auth/auth.interface';
import { Role } from '../utils/enum/role';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    return await this.userRepository.save(createUserDto);
  }

  async createTransaction(
    data: Partial<CreateSchoolDto>,
    transaction: EntityManager
  ): Promise<School> {
    const getSchoolrepo = transaction.getRepository(School);

    const { username, password, phone, first_name, last_name, email, ...rest } =
      data;

    const school = await getSchoolrepo.save({
      ...rest,
      status: RegistrationStatus.IN_PROGRESS,
    });

    return school;
  }

  async createUserTransaction(
    users: UserSchema,
    college_id: string,
    transaction: EntityManager
  ) {
    const college = await transaction.findOne(School, {
      where: { id: college_id },
    });

    const newUsers = transaction.create(Users, {
      ...users,
      school: college,
    });

    return await transaction.save(newUsers);
  }

  // Write a query builder to create a user and relate them to the college_id
  async createUserWithCollegeId(users: UserSchema, college_id: string) {
    const college = await this.schoolRepository.findOne({
      where: { id: college_id },
    });

    const newUsers = this.userRepository.create({
      ...users,
      school: college,
    });

    return await this.userRepository.save(newUsers);
  }

  async findAll(): Promise<Users[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<Users> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>
  ): Promise<Users> {
    await this.userRepository.update(id, updateUserDto);
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  // Get a user by their username using a query builder
  async getUserByUsername(username: string): Promise<Users> {
    return await this.userRepository
      .createQueryBuilder('users')
      .where('users.username = :username', { username })
      .getOne();
  }

  async getUserRoleById(id: string): Promise<Roles> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    return user.role;
  }

  async getUserByEmail(email: string): Promise<Users> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  // Get a role by the role id using a query builder
  async getRoleById(id: string): Promise<Roles> {
    return await this.roleRepository
      .createQueryBuilder('roles')
      .where('roles.id = :id', { id })
      .getOne();
  }

  // Get a role by the role name using a query builder
  async getRoleByName(role: Role): Promise<Roles> {
    return await this.roleRepository
      .createQueryBuilder('roles')
      .where('roles.role = :role', { role })
      .getOne();
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
