import { Users } from './entities/user.entity';
import { Roles } from '../shared/entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { UserSchema } from '../auth/auth.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    @InjectRepository(Roles)
    private readonly userRepository: Repository<Users>,
    private readonly roleRepository: Repository<Roles>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    return await this.userRepository.save(createUserDto);
  }

  // Write a query builder to create a user and relate them to the college_id
  async createUserWithCollegeId(
    createUser: UserSchema,
    college_id: string,
  ): Promise<Users> {
    return await this.userRepository.save({
      ...createUser,
      college_id,
    });
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
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<Users> {
    await this.userRepository.update(id, updateUserDto);
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  // Get a users role by their id using a query builder
  async getRoleByUserId(id: string): Promise<Roles> {
    return await this.roleRepository
      .createQueryBuilder('roles')
      .leftJoinAndSelect('roles.user', 'user')
      .where('user.id = :id', { id })
      .getOne();
  }

  // Get a role by the role id using a query builder
  async getRoleById(id: string): Promise<Roles> {
    return await this.roleRepository
      .createQueryBuilder('roles')
      .where('roles.id = :id', { id })
      .getOne();
  }
}
