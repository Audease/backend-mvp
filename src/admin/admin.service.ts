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
import { MailService } from '../shared/services/mail.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RoleDto } from './dto/create-role.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly authRepository: AuthRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
    private readonly logService: LogService,
    private readonly mailService: MailService
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

  async getAdminDetails(userId: string) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      return this.adminRepository.getAdminDetails(user.id);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async sendInvitation(userId: string, email: string) {
    const user = await this.userService.findOne(userId);

    const fullName = `${user.first_name} ${user.last_name}`;
    const invite_link = `${process.env.FRONTEND_URL}/signup`;
    try {
      this.mailService.sendTemplateMail(
        {
          to: email,
          subject: 'Discover Audease - Join Me on an Exciting Journey!',
        },
        'invite-friends',
        {
          invite_link,
          fullName,
        }
      );
      return { message: 'Invitation sent successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getLearners(userId: string, page: number, limit: number) {
    const getSchool = await this.authRepository.findSchoolByUserId(userId);

    if (!getSchool) {
      this.logger.error('School not found');
      throw new NotFoundException('School not found');
    }
    return this.adminRepository.getProspectiveStudentsBySchoolId(
      getSchool.id,
      page,
      limit
    );
  }

  async getLearnerById(userId: string, learnerId: string) {
    try {
      const result = this.adminRepository.getProspectiveStudentById(learnerId);
      return result;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getStaffs(userId: string, page: number, limit: number) {
    const getSchool = await this.authRepository.findSchoolByUserId(userId);

    if (!getSchool) {
      this.logger.error('School not found');
      throw new NotFoundException('School not found');
    }

    return this.adminRepository.getUsersBySchoolId(getSchool.id, page, limit);
  }

  // Assign a role to a user
  async assignRole(userId: string, role: string, staffIdToAssign: string) {
    try {
      const user = await this.adminRepository.getStaffById(staffIdToAssign);

      if (!user) {
        this.logger.error('Staff not found');
        throw new NotFoundException('Staff not found');
      }

      if (!role) {
        this.logger.error('Role not found');
        throw new NotFoundException('Role not found');
      }

      const data = await this.adminRepository.updateUserRole(user.id, role);

      const generated_password = crypto
        .randomBytes(12)
        .toString('hex')
        .slice(0, 7);

      const password = bcrypt.hashSync(generated_password, 10);

      // Trim the email and remove all special characters and also the domain name
      const email = user.email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

      const username =
        `${email}.${user.school.college_name}.${role}`.toLowerCase();

      await this.adminRepository.createStaff(
        user,
        data.role,
        username,
        password
      );

      const loginUrl = `${process.env.FRONTEND_URL}`;

      this.mailService.sendTemplateMail(
        {
          to: user.email,
          subject: 'Your School Has Invited you to Join Audease!',
        },
        'invite-staff',
        {
          generated_username: username,
          generated_password,
          loginUrl,
        }
      );

      await this.logService.createLog({
        userId,
        message: `Assigned role ${role} to user ${user.email}`,
        type: 'ASSIGN_ROLE',
        method: 'POST',
        route: '/roles',
        logType: LogType.REUSABLE,
      });

      return { message: 'Role assigned successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRoles(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.adminRepository.getRoles(user.school.id);
  }

  async getPermissions(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.adminRepository.getPermissions();
  }
  async createStaff(userId: string, createStaffDto: CreateStaffDto) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      await this.adminRepository.saveStaffEmails(
        createStaffDto.email,
        user.school.id
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRole(userId: string, roleDto: RoleDto) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const role = await this.adminRepository.createRole(
        roleDto,
        user.school.id
      );

      await this.logService.createLog({
        userId,
        message: `Created role ${role.role}`,
        type: 'CREATE_ROLE',
        method: 'POST',
        route: '/roles',
        logType: LogType.REUSABLE,
      });

      return { message: 'Role created successfully' };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async moveToTrash(userId: string, logId: string) {
    try {
      this.adminRepository.moveToTrash(logId);

      await this.logService.createLog({
        userId: userId,
        message: `Moved log to trash`,
        type: 'MOVE_TO_TRASH',
        method: 'POST',
        route: '/logs',
        logType: LogType.REUSABLE,
      });

      return { message: 'Log moved to trash successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createFolder(name: string, userId: string) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      await this.adminRepository.createFolder(name, userId);

      await this.logService.createLog({
        userId,
        message: `Created folder ${name}`,
        type: 'CREATE_FOLDER',
        method: 'POST',
        route: '/folders',
        logType: LogType.REUSABLE,
      });

      return { message: 'Folder created successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFolders(userId: string, page: number, limit: number) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.adminRepository.getFolders(userId, page, limit);
  }

  async getFolderLogs(
    userId: string,
    folderId: string,
    page: number,
    limit: number
  ) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }
      return this.adminRepository.getLogsByFolder(folderId, page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async moveFolder(userId: string, folderId: string, logId: string[]) {
    try {
      this.adminRepository.moveToFolder(logId, folderId);

      await this.logService.createLog({
        userId,
        message: `Moved log to folder`,
        type: 'MOVE_FOLDER',
        method: 'POST',
        route: '/folders',
        logType: LogType.REUSABLE,
      });

      return { message: 'Log moved to folder successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Duplicate log
  async duplicateLog(logId: string) {
    try {
      const log = await this.adminRepository.duplicateLog(logId);

      return { message: 'Log duplicated successfully', log };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Edit log
  async editLog(logId: string, message: string) {
    try {
      this.adminRepository.editLog(logId, message);

      return { message: 'Log edited successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saveSchoolDocument(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const upload = await this.cloudinaryService.uploadBuffer(file);
      const document = await this.adminRepository.saveDocumentWithSchoolId(
        {
          user,
          cloudinaryUrl: upload.secure_url,
          fileName: file.originalname,
          fileType: file.mimetype,
        },
        user.school.id
      );

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

  async getNewStaffs(userId: string, page: number, limit: number) {
    const getSchool = await this.authRepository.findSchoolByUserId(userId);

    if (!getSchool) {
      this.logger.error('School not found');
      throw new NotFoundException('School not found');
    }

    return this.adminRepository.getStaffBySchoolId(getSchool.id, page, limit);
  }
}
