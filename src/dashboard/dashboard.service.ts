import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { UpdateLearnerDto } from './dto/update-learner.dto';
import { UserService } from '../users/users.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly userService: UserService
  ) {}

  // async findRecruiters(userId: string, page: number, limit: number) {
  //   const user = await this.userService.findOne(userId);
  //   return this.dashboardRepository.findRecruiters(user.school.id, page, limit);
  // }

  async findBKSDDs(userId: string, page: number, limit: number) {
    const user = await this.userService.findOne(userId);
    return this.dashboardRepository.findBKSDDs(user.school.id, page, limit);
  }

  async findAccessors(userId: string, page: number, limit: number) {
    const user = await this.userService.findOne(userId);
    return this.dashboardRepository.findAccessors(user.school.id, page, limit);
  }

  async findInductors(userId: string, page: number, limit: number) {
    const user = await this.userService.findOne(userId);
    return this.dashboardRepository.findInductors(user.school.id, page, limit);
  }

  async updateLearner(learnerId: string, updateLearnerDto: UpdateLearnerDto) {
    return this.dashboardRepository.updateLearner(learnerId, updateLearnerDto);
  }

  //   Move student
  async moveStudent(learnerId: string) {
    const from = 'recruiter';
    const to = 'bksd';
    return this.dashboardRepository.moveStudent(learnerId, from, to);
  }

  async moveStudentToAccessor(learnerId: string) {
    return this.dashboardRepository.moveStudentToAccessor(learnerId);
  }

  async moveStudentToInductor(learnerId: string) {
    return this.dashboardRepository.moveStudentToInductor(learnerId);
  }
}
