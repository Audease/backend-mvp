import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { UserService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
    private readonly logger: Logger
  ) {}

  async getStudentById(id: string) {
    try {
      return this.studentRepository.getStudentById(id);
    } catch (error) {
      this.logger.error(error.message);
      throw new NotFoundException('Student not found');
    }
  }

  async updateStudentById(id: string, student: any) {
    return this.studentRepository.updateStudentById(id, student);
  }

  async saveDocument(userId: string, file: Express.Multer.File) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const document = await this.cloudinaryService.uploadBuffer(file);

    return this.studentRepository.saveDocument({
      user,
      cloudinaryUrl: document.secure_url,
      fileName: file.originalname,
      fileType: file.mimetype,
      school: user.school,
    });
  }
}
