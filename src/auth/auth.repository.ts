import { School } from '../shared/entities/school.entity';
import { UserService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegistrationStatus } from '../utils/enum/registration_status';
import { Injectable } from '@nestjs/common';
// import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolSchema } from './auth.interface';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    private readonly userService: UserService,
  ) {}

  async create(createSchoolDto: SchoolSchema): Promise<School> {
    // Save the school details to the database
    const school = this.schoolRepository.create(createSchoolDto);
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

  async findSchool(name: string): Promise<School> {
    return await this.schoolRepository.findOne({
      where: { college_name: name },
    });
  }

  // Update the registration status of the school using the school id
  async updateStatus(id: string, status: RegistrationStatus) {
    const school = await this.findOne(id);
    school.status = status;
    return await this.schoolRepository.save(school);
  }
}
