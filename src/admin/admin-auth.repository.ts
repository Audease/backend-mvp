import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { School } from './entities/school.entity';
import { AddCollegeDto } from './dto/add-college.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

export class AdminAuthRepository {
  constructor(
    private readonly adminRepository: Repository<Admin>,
    private readonly collegeRepository: Repository<School>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = this.adminRepository.create(createAdminDto);
    return this.adminRepository.save(admin);
  }

  async addCollege(addCollegeDto: AddCollegeDto): Promise<School> {
    const college = this.collegeRepository.create(addCollegeDto);
    return this.collegeRepository.save(college);
  }

  async getCollegeById(id: string): Promise<School> {
    return this.collegeRepository.findOne({ where: { id } });
  }

  async getAdminByUsername(username: string): Promise<Admin> {
    return this.adminRepository.findOne({ where: { username } });
  }
}
