import { AdminRepository } from './admin.repository';
import { AuthRepository } from '../auth/auth.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../shared/services/cloud-storage.service';
import { Logger } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { MailService } from '../shared/services/mail.service';
import { RoleDto } from './dto/create-role.dto';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { QueryRunner } from 'typeorm';
import { Staff } from '../shared/entities/staff.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Roles } from '../shared/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from '../shared/entities/rolepermission.entity';
import { Permissions } from '../shared/entities/permission.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateWorflowDto } from './dto/workflow.dto';
import { AssignRoleStaffDto } from './dto/misc-dto';
import { Document } from '../shared/entities/document.entity';
import { Folder } from '../shared/entities/file-folder.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly authRepository: AuthRepository,
    private readonly storageService: StorageService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,
    @InjectRepository(Permissions)
    private readonly permissionRepository: Repository<Permissions>,
    @InjectRepository(RolePermission)
    private readonly rolepermissionRepoistory: Repository<RolePermission>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>
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

  async uploadDocument(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const upload = await this.storageService.uploadBuffer(file);
      const document = await this.adminRepository.saveDocument({
        user,
        publicUrl: upload,
        fileName: file.originalname,
        fileType: file.mimetype,
        onboarding_status: 'completed',
      });
      return {
        message: 'Document uploaded successfully',
        document_link: document.publicUrl,
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
  async assignRoles(userId: string, assignments: AssignRoleStaffDto[]) {
    return await this.dataSource.transaction(
      async transactionalEntityManager => {
        if (!assignments || assignments.length === 0) {
          this.logger.error('No assignments provided');
          throw new BadRequestException('No assignments provided');
        }

        for (const assignment of assignments) {
          const { staffId, roleId } = assignment;

          const roleData = await transactionalEntityManager.findOne(Roles, {
            where: { id: roleId },
          });
          if (!roleData) {
            this.logger.error(`Role with ID ${roleId} not found`);
            continue; // Skip this assignment and proceed with others
          }

          const staff = await transactionalEntityManager.findOne(Staff, {
            where: { id: staffId },
            relations: ['school'],
          });
          if (!staff) {
            this.logger.error(`Staff with ID ${staffId} not found`);
            continue; // Skip this assignment and proceed with others
          }

          const data = await this.adminRepository.updateUserRole(
            transactionalEntityManager,
            staff.id,
            roleId,
            staff.school
          );

          if (!data) {
            this.logger.error(`Error updating role for staff ID ${staffId}`);
            continue; // Skip this assignment and proceed with others
          }

          const generated_password = crypto
            .randomBytes(12)
            .toString('hex')
            .slice(0, 7);
          const password = bcrypt.hashSync(generated_password, 10);
          const email = staff.email
            .split('@')[0]
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();
          const collegeName = staff.school.college_name
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();
          const username =
            `${email}.${collegeName}.${data.role.role}`.toLowerCase();

          await this.adminRepository.createStaff(
            transactionalEntityManager,
            staff,
            data.role,
            username,
            password
          );

          const loginUrl = `${process.env.FRONTEND_URL}`;

          await this.mailService.sendTemplateMail(
            {
              to: staff.email,
              subject: 'Your School Has Invited you to Join Audease!',
            },
            'invite-staff',
            {
              generated_username: username,
              generated_password,
              loginUrl,
            }
          );

          await transactionalEntityManager.update(Staff, staff.id, {
            status: 'assigned',
            username: username,
          });
        }

        return { message: 'Roles assigned successfully' };
      }
    );
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
      return {
        message: 'Staff created successfully',
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRole(userId: string, roleDto: RoleDto) {
    let queryRunner: QueryRunner | null = null;

    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      // Check if the role already exists for the given school
      const existingRole = await this.roleRepository.findOne({
        where: {
          role: roleDto.role,
          school: {
            id: user.school.id,
          },
        },
      });

      if (existingRole) {
        this.logger.error('Role already exists');
        throw new ConflictException('Role already exists');
      }

      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const role = await queryRunner.manager.save(
        this.roleRepository.create({
          role: roleDto.role,
          school: user.school,
          onboarding_status: 'completed',
        })
      );

      // Fetch all permissions based on the provided permission_ids
      const permissions = await this.permissionRepository.findByIds(
        roleDto.permission_ids
      );

      // Create and save role permissions
      const rolePermissions = permissions.map(permission =>
        this.rolepermissionRepoistory.create({
          role: role,
          permission: permission,
        })
      );

      await queryRunner.manager.save(rolePermissions);

      // Log creation (commented out in the original code)
      // await this.logService.createLog({
      //   userId,
      //   message: `Created role ${role.role}`,
      //   type: 'CREATE_ROLE',
      //   method: 'POST',
      //   route: '/roles',
      //   logType: LogType.REUSABLE,
      // });

      await queryRunner.commitTransaction();
      return { message: 'Role created successfully' };
    } catch (error) {
      if (queryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  async getOnboardingStatus(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.adminRepository.getOnboardingStatus(user.school.id);
  }

  async moveToTrash(userId: string, logId: string) {
    try {
      this.adminRepository.moveToTrash(logId);

      return { message: 'Log moved to trash successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createDocument(
    userId: string,
    folderId: string,
    documentData: CreateDocumentDto
  ): Promise<Document> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const folder = await this.folderRepository.findOne({
        where: { id: folderId },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      const document = await this.documentRepository.save({
        user,
        folder,
        fileName: documentData.fileName,
        fileType: documentData.fileType,
        publicUrl: documentData.publicUrl,
        onboarding_status: 'completed',
      });

      return document;
    } catch (error) {
      this.logger.error(`Error creating document: ${error.message}`);
      throw error;
    }
  }

  async createFolder(
    name: string,
    userId: string,
    parentFolderId?: string
  ): Promise<Folder> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (parentFolderId) {
        const parentFolder = await this.folderRepository.findOne({
          where: { id: parentFolderId },
        });

        if (!parentFolder) {
          throw new NotFoundException('Parent folder not found');
        }
      }

      const folder = await this.folderRepository.save({
        name,
        userId,
        parentFolderId,
      });

      return folder;
    } catch (error) {
      this.logger.error(`Error creating folder: ${error.message}`);
      throw error;
    }
  }

  async uploadDocumentToFolder(
    userId: string,
    folderId: string,
    file: Express.Multer.File
  ): Promise<{ message: string; document: Document }> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const folder = await this.folderRepository.findOne({
        where: { id: folderId, userId },
        relations: ['documents'],
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      const uploadedFileUrl = await this.storageService.uploadBuffer(file);

      const document = await this.documentRepository.save({
        user,
        folder,
        fileName: file.originalname,
        fileType: file.mimetype,
        publicUrl: uploadedFileUrl,
        onboarding_status: 'completed',
      });

      return {
        message: 'Document uploaded successfully',
        document,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading document: ${error.message}`,
        error.stack
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error uploading document');
    }
  }

  // Add document to a student profile
  async addDocumentToStudent(documentId: string, studentIds: string[]) {
    try {
      const document = await this.adminRepository.assignDocumentToStudents(
        documentId,
        studentIds
      );
      console.log(document);
      return { message: 'Document added to student successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error adding document to student'
      );
    }
  }

  async getFolderWithContents(folderId: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['documents'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Get child folders
    const childFolders = await this.folderRepository.find({
      where: { parentFolderId: folder.id },
    });

    // Recursively get contents of child folders
    folder.childFolders = await Promise.all(
      childFolders.map(async childFolder => {
        return this.getFolderWithContents(childFolder.id);
      })
    );

    return folder;
  }

  async getAllFolders(userId: string, page = 1, limit = 10) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const skip = (page - 1) * limit;

      // Get root folders (those without parents)
      const [rootFolders, total] = await this.folderRepository.findAndCount({
        where: {
          userId,
          parentFolderId: IsNull(),
        },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      // Load the full tree for each root folder
      const foldersWithTree = await Promise.all(
        rootFolders.map(async folder => {
          return this.getFolderWithContents(folder.id);
        })
      );

      return {
        data: foldersWithTree,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting folders: ${error.message}`);
      throw error;
    }
  }

  async getFolderContents(
    userId: string,
    folderId: string,
    page: number,
    limit: number
  ) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const folder = await this.adminRepository.findFolderById(folderId);
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      return this.adminRepository.getFolderContents(folderId, page, limit);
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

  async saveSchoolDocument(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const upload = await this.storageService.uploadBuffer(file);
      const document = await this.adminRepository.saveDocumentWithSchoolId(
        {
          user,
          publicUrl: upload,
          fileName: file.originalname,
          fileType: file.mimetype,
        },
        user.school.id
      );

      return {
        message: 'Document uploaded successfully',
        document_link: document.publicUrl,
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

  async createWorkflow(userId: string, data: CreateWorflowDto) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const { name, role } = data;
    try {
      const foundRoles = await this.roleRepository.findBy({
        role: In(role),
      });

      if (foundRoles.length !== role.length) {
        this.logger.error('One or more roles not found');
        throw new NotFoundException('One or more roles not found');
      }

      await this.adminRepository.createWorkflow(name, foundRoles, user.school);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getWorkflows(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    return this.adminRepository.getWorkflowsBySchoolId(user.school.id);
  }

  async deleteUser(userId: string, staffId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    try {
      await this.adminRepository.deleteUser(staffId);
      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Get all staffs
  async getStaffsByPermission(
    userId: string,
    permission: string,
    page: number,
    limit: number
  ) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    // This method should now directly use the permission string
    return this.adminRepository.getUsersByPermissionId(permission, page, limit);
  }
}
