import { School } from '../shared/entities/school.entity';
import { UserService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    private readonly userService: UserService,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const school = new School();
    school.name = createSchoolDto.name;
    school.users = await this.userService.findAll();
    return await this.schoolRepository.save(school);
  }

  async findAll(): Promise<School[]> {
    return await this.schoolRepository.find();
  }

  async findOne(id: string): Promise<School> {
    return await this.schoolRepository.findOne({
      where: { id },
    });
  }
}
