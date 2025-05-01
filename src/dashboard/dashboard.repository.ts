import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruiterDashboard } from './entity/recruiter-dashboard.entity';
import { BKSDDashboard } from './entity/bksd-dashboard.entity';
import { AccessorDashboard } from './entity/acessor-dashboard.entity';
import { InductorDashboard } from './entity/inductor-dashboard.entity';
import { School } from '../shared/entities/school.entity';
import { UpdateLearnerDto } from './dto/update-learner.dto';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(RecruiterDashboard)
    private readonly recruiterRepository: Repository<RecruiterDashboard>,
    @InjectRepository(BKSDDashboard)
    private readonly bksdRepository: Repository<BKSDDashboard>,
    @InjectRepository(AccessorDashboard)
    private readonly accessorRepository: Repository<AccessorDashboard>,
    @InjectRepository(InductorDashboard)
    private readonly inductorRepository: Repository<InductorDashboard>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(ProspectiveStudent)
    private readonly prospectiveStudentRepository: Repository<ProspectiveStudent>
  ) {}

  // async findRecruiters(
  //   schoolId: string,
  //   page: number,
  //   limit: number
  // ): Promise<{ list: RecruiterDashboard[]; count: number }> {
  //   const [list, count] = await this.recruiterRepository.findAndCount({
  //     where: { school: { id: schoolId } },
  //     take: limit,
  //     skip: (page - 1) * limit,
  //   });

  //   return { list, count };
  // }

  async findBKSDDs(schoolId: string, page: number, limit: number) {
    const [list, count] = await this.bksdRepository.findAndCount({
      where: { school: { id: schoolId } },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      list,
      totalPage: Math.ceil(count / limit),
      page,
      limit,
    };
  }

  async findAccessors(schoolId: string, page: number, limit: number) {
    const [list, count] = await this.accessorRepository.findAndCount({
      where: { school: { id: schoolId } },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      list,
      totalPage: Math.ceil(count / limit),
      page,
      limit,
    };
  }

  async findInductors(schoolId: string, page: number, limit: number) {
    const [list, count] = await this.inductorRepository.findAndCount({
      where: { school: { id: schoolId } },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      list,
      totalPage: Math.ceil(count / limit),
      page,
      limit,
    };
  }

  //   Write a method to that takes the id of a prospective student and then moves them to another entity type, for example, from a recruiter to an accessor.

  async moveStudent(id: string, from: string, to: string): Promise<boolean> {
    const student = await this.prospectiveStudentRepository.findOne({
      where: { id },
    });

    if (!student) {
      return false;
    }

    if (from === 'recruiter' && to === 'bksd') {
      await this.bksdRepository.save(student);
      await this.recruiterRepository.delete({ id });
    }

    return true;
  }

  async moveStudentToAccessor(id: string): Promise<boolean> {
    const student = await this.bksdRepository.findOne({
      where: { id },
    });

    if (!student) {
      return false;
    }

    // Change application_status

    await this.accessorRepository.save(student);
    await this.bksdRepository.delete({ id });

    return true;
  }

  async moveStudentToInductor(id: string): Promise<boolean> {
    const student = await this.accessorRepository.findOne({
      where: { id },
    });

    if (!student) {
      return false;
    }

    await this.inductorRepository.save(student);
    await this.accessorRepository.delete({ id });

    return true;
  }

  async updateLearner(
    id: string,
    updateLearnerDto: UpdateLearnerDto
  ): Promise<boolean> {
    const student = await this.recruiterRepository.findOne({
      where: { id },
    });

    if (!student) {
      return false;
    }

    await this.inductorRepository.update({ id }, updateLearnerDto);

    return true;
  }

  async findRecruiter(id: string): Promise<RecruiterDashboard> {
    return await this.recruiterRepository.findOne({
      where: { id },
    });
  }

  async findBKSDD(id: string): Promise<BKSDDashboard> {
    return await this.bksdRepository.findOne({
      where: { id },
    });
  }

  async findAccessor(id: string): Promise<AccessorDashboard> {
    return await this.accessorRepository.findOne({
      where: { id },
    });
  }

  async findInductor(id: string): Promise<InductorDashboard> {
    return await this.inductorRepository.findOne({
      where: { id },
    });
  }
}
