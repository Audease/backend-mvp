import { AdminRepository } from './admin.repository';
import { AuthRepository } from '../auth/auth.repository';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { Logger } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { LogService } from '../shared/services/logger.service';
import { LogType } from '../utils/enum/log_type';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly authRepository: AuthRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
    private readonly logService: LogService
  ) {}

  async getPaginatedStudents(userId: string, page: number, limit: number) {
    const getSchool = await this.authRepository.findSchoolByUserId(userId);

    if (!getSchool) {
      this.logger.error('School not found');
      throw new NotFoundException('School not found');
    }

    await this.logService.createLog({
      userId,
      message: `Retrieved a paginated list of students for school `,
      type: 'GET_STUDENTS',
      method: 'GET',
      route: '/students',
      logType: LogType.ONE_TIME,
    });

    return this.adminRepository.getStudentsBySchoolId(
      getSchool.id,
      page,
      limit
    );
  }

  async getStudentById(userId: string, studentId: string) {
    try {
      const result = this.adminRepository.getStudentById(studentId);
      await this.logService.createLog({
        userId: userId, // Assuming student has a userId
        message: `Retrieved the details of student ${(await result).first_name}`,
        type: 'GET_STUDENT',
        method: 'GET',
        route: `/students/${studentId}`,
        logType: LogType.ONE_TIME,
      });
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async uploadDocument(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const upload = await this.cloudinaryService.uploadBuffer(file);
      const document = await this.adminRepository.saveDocument({
        user,
        cloudinaryUrl: upload.secure_url,
        fileName: file.originalname,
        fileType: file.mimetype,
      });

      await this.logService.createLog({
        userId,
        message: `Uploaded document ${file.originalname}`,
        type: 'UPLOAD_DOCUMENT',
        method: 'POST',
        route: '/documents',
        logType: LogType.REUSABLE,
      });

      return {
        message: 'Document uploaded successfully',
        document_link: document.cloudinaryUrl,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchStudent(userId: string, search: string) {
    try {
      const getSchool = await this.authRepository.findSchoolByUserId(userId);

      if (!getSchool) {
        this.logger.error('School not found');
        throw new NotFoundException('School not found');
      }

      return this.adminRepository.searchStudentBySchoolId(getSchool.id, search);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getLogs(userId: string, page: number, limit: number) {
    return this.logService.getPaginatedLogs(userId, page, limit);
  }
}
