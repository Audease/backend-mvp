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

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly authRepository: AuthRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService
  ) {}

  async getPaginatedStudents(userId: string, page: number, limit: number) {
    const getSchool = await this.authRepository.findSchoolByUserId(userId);

    if (!getSchool) {
      this.logger.error('School not found');
      throw new NotFoundException('School not found');
    }

    return this.adminRepository.getStudentsBySchoolId(
      getSchool.id,
      page,
      limit
    );
  }

  async getStudentById(studentId: string) {
    return this.adminRepository.getStudentById(studentId);
  }

  async uploadDocument(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const upload = await this.cloudinaryService.uploadImage(file.path);

      const document = await this.adminRepository.saveDocument({
        user,
        cloudinaryUrl: upload.secure_url,
        fileName: upload.original_filename,
        fileType: upload.format,
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
}
