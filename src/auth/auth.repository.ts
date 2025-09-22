import { School } from '../shared/entities/school.entity';
import { UserService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegistrationStatus } from '../utils/enum/registration_status';
import { Injectable } from '@nestjs/common';
// import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolSchema } from './auth.interface';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    private readonly userService: UserService,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>
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

  // Find school with the user id
  async findSchoolByUserId(userId: string): Promise<School> {
    return await this.schoolRepository.findOne({
      where: { users: { id: userId } },
    });
  }

  async findSchool(name: string): Promise<School> {
    return await this.schoolRepository.findOne({
      where: { college_name: name },
    });
  }

  // Find a student with their email
  async findStudentByEmail(email: string): Promise<ProspectiveStudent> {
    return await this.learnerRepository.findOne({
      where: { email },
    });
  }

  // Update the registration status of the school using the school id
  async updateStatus(id: string, status: RegistrationStatus) {
    const school = await this.findOne(id);
    school.status = status;
    return await this.schoolRepository.save(school);
  }

  async findSchoolBySubdomain(subdomain: string): Promise<School> {
    return await this.schoolRepository.findOne({
      where: { subdomain },
    });
  }

  async findSchoolByDomain(domain: string): Promise<School> {
    return await this.schoolRepository.findOne({
      where: { custom_domain: domain },
    });
  }

  async updateSchoolDomain(
    schoolId: string,
    subdomain: string,
    customDomain: string
  ): Promise<School> {
    await this.schoolRepository.update(schoolId, {
      subdomain,
      custom_domain: customDomain,
      domain_configured_at: new Date(),
    });

    return await this.schoolRepository.findOne({
      where: { id: schoolId },
    });
  }

  async verifySchoolDomain(schoolId: string): Promise<School> {
    await this.schoolRepository.update(schoolId, {
      domain_verified: true,
    });

    return await this.schoolRepository.findOne({
      where: { id: schoolId },
    });
  }
}
