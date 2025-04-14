import { EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Student } from '../students/entities/student.entity';
import { Users } from '../users/entities/user.entity';
import { Document } from '../shared/entities/document.entity';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { Roles } from '../shared/entities/role.entity';
import { Permissions } from '../shared/entities/permission.entity';
import { School } from '../shared/entities/school.entity';
import { RolePermission } from '../shared/entities/rolepermission.entity';
import { LogFolder } from '../shared/entities/folder.entity';
import { AppLogger } from '../shared/entities/logger.entity';
import { Staff } from '../shared/entities/staff.entity';
import { DataSource } from 'typeorm';
import { Workflow } from '../shared/entities/workflow.entity';
import { Folder } from '../shared/entities/file-folder.entity';

@Injectable()
export class AdminRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(ProspectiveStudent)
    private readonly prospectiveStudentRepository: Repository<ProspectiveStudent>,
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,
    @InjectRepository(Permissions)
    private readonly permissionRepository: Repository<Permissions>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(RolePermission)
    private readonly rolepermissionRepoistory: Repository<RolePermission>,
    @InjectRepository(LogFolder)
    private readonly logFolderRepoistory: Repository<LogFolder>,
    @InjectRepository(AppLogger)
    private readonly appLoggerRepository: Repository<AppLogger>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>
  ) {}
  //   Get a paginated list of students based on the school id
  // async getStudentsBySchoolId(schoolId: string, page: number, limit: number) {
  //   return this.studentRepository.find({
  //     where: { school: { id: schoolId } },
  //     take: limit,
  //     skip: (page - 1) * limit,
  //   });
  // }

  // Get a paginated list of students based on the school id using query builder and join the user entity to get their username and email
  async getStudentsBySchoolId(schoolId: string, page: number, limit: number) {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('prospective_studentuser', 'user')
      .select([
        'prospective_studentid',
        'prospective_studentfirst_name',
        'prospective_studentlast_name',
        'prospective_studentdate_of_birth',
        'prospective_studenthome_address',
        'prospective_studentcreated_at',
        'prospective_studentfunding',
        'prospective_studentchosen_course',
        'user.email',
        'user.username',
      ])
      .where('prospective_studentschool_id = :schoolId', { schoolId })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      result,
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
    };
  }
  //   Get a specific student based on the student id and join the user entity
  async getStudentById(studentId: string) {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('prospective_studentuser', 'user')
      .select([
        'prospective_studentid',
        'prospective_studentfirst_name',
        'prospective_studentlast_name',
        'prospective_studentdate_of_birth',
        'prospective_studenthome_address',
        'prospective_studentcreated_at',
        'user.email',
        'user.username',
      ])
      .where('prospective_studentid = :studentId', { studentId })
      .getOne();

    if (!result) return null;

    // Flatten the structure
    return {
      id: result.id,
      name: result.name,
      date_of_birth: result.date_of_birth,
      address: result.home_address,
      email: result.user?.email,
      username: result.user?.username,
      created_at: result.created_at,
    };
  }

  // Search student by school id using query builder and like operator without pagination
  async searchStudentBySchoolId(schoolId: string, search: string) {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('prospective_studentuser', 'user')
      .select([
        'prospective_studentid',
        'prospective_studentfirst_name',
        'prospective_studentlast_name',
        'prospective_studentdate_of_birth',
        'prospective_studentaddress',
        'prospective_studentcreated_at',
        'prospective_studentupdated_at',
        'prospective_studentuser_id',
        'user.email',
        'user.username',
      ])
      .where('prospective_studentschool_id = :schoolId', { schoolId })
      .andWhere(
        'prospective_studentfirst_name ILIKE :search OR prospective_studentlast_name ILIKE :search OR prospective_studentaddress ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search',
        {
          search: `%${search}%`,
        }
      )
      .getMany();

    if (!result) return null;
    // Flatten the structure
    return result.map(student => ({
      id: student.id,
      name: student.name,
      date_of_birth: student.date_of_birth,
      address: student.home_address,
      email: student?.email,
      username: student.user?.username,
      created_at: student.created_at,
    }));
  }
  async getAdminDetails(userId: string) {
    const result = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });

    if (!result) return null;

    return {
      first_name: result.first_name,
      last_name: result.last_name,
      email: result.email,
      username: result.username,
      phone: result.phone,
      two_factor_required: result['2fa_required'],
      school_name: result.school.college_name,
      no_of_employee: result.school.no_of_employee,
    };
  }

  // New
  async getStaffBySchoolId(schoolId: string, page: number, limit: number) {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .select([
        'staff.id',
        'staff.username',
        'staff.email',
        'staff.status',
        'staff.onboarding_status',
        'staff.created_at',
        'staff.updated_at',
      ])
      .where('staff.school_id = :schoolId', { schoolId });

    const [result, totalCount] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);
    return {
      result,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // New 2
  async getStaffsBySchoolId(schoolId: string, page: number, limit: number) {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .select([
        'staff.id',
        'staff.email',
        'staff.status',
        'staff.created_at',
        'staff.updated_at',
      ])
      .where('staff.school_id = :school_id', { schoolId });

    const [result, total] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProspectiveStudentById(studentId: string) {
    return this.prospectiveStudentRepository.findOne({
      where: { id: studentId },
    });
  }

  // Get a specific prospective student based on the student id

  async getUsersBySchoolId(schoolId: string, page: number, limit: number) {
    const excludedRoles = ['student', 'school_admin'];

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select([
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.username',
        'role.role',
      ])
      .where('user.school_id = :schoolId', { schoolId })
      .andWhere('role.role NOT IN (:...excludedRoles)', { excludedRoles });

    const [users, total] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);

    const flattenedUsers = users.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      role: user.role.role,
    }));

    return {
      data: flattenedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update prospective student
  async updateProspectiveStudent(
    studentId: string,
    prospectiveStudent: Partial<ProspectiveStudent>
  ) {
    return this.prospectiveStudentRepository.update(
      studentId,
      prospectiveStudent
    );
  }

  async getProspectiveStudentsBySchoolId(
    schoolId: string,
    page: number,
    limit: number
  ) {
    const queryBuilder = this.prospectiveStudentRepository
      .createQueryBuilder('prospective_student')
      .select([
        'prospective_student.id',
        'prospective_student.name',
        'prospective_student.mobile_number',
        'prospective_student.email',
        'prospective_student.level',
        'prospective_student.date_of_birth',
        'prospective_student.home_address',
        'prospective_student.funding',
        'prospective_student.chosen_course',
        'prospective_student.passport_number',
        'prospective_student.NI_number',
        'prospective_student.awarding',
        'prospective_student.created_at',
      ])
      .where('prospective_student.school_id = :schoolId', { schoolId });

    const [result, total] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update a user's role based on the user id and the role passed into the argument
  async updateUserRole(
    transactionalEntityManager: EntityManager,
    userId: string,
    role: string,
    school: School
  ) {
    const staff = await transactionalEntityManager.findOne(Staff, {
      where: { id: userId },
    });
    if (!staff) {
      return null;
    }

    const roleData = await transactionalEntityManager.findOne(Roles, {
      where: { id: role },
    });
    if (!roleData) {
      return null;
    }

    const user = this.userRepository.create({
      ...staff,
      role: roleData,
      school: school,
    });

    return await transactionalEntityManager.save(Users, user);
  }

  // Create a method getRoles that uses a query builder to return the role and the permission name assigned to the role based on the school id from the role-permission table which has a relationship with the role and permission table

  async getRoles(schoolId: string) {
    const roles = await this.roleRepository.find({
      where: { school: { id: schoolId } },
      relations: ['rolePermission', 'rolePermission.permission'],
    });

    // Utility function to extract the date from a timestamp string
    function extractDate(timestamp: string): string {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Get permissions for each role
    return roles.map(role => ({
      id: role.id,
      role: role.role,
      permissions: role.rolePermission.map(rp => rp.permission.name),
      createdDate: role.created_at
        ? extractDate(role.created_at.toISOString())
        : null,
    }));
  }

  // Get a list of permissions
  async getPermissions() {
    return this.permissionRepository.find();
  }

  async createStaff(
    transactionalEntityManager: EntityManager,
    user: Partial<Users>,
    role: Roles,
    username: string,
    password: string
  ) {
    const newUser = this.userRepository.create({
      ...user,
      username,
      password,
      role,
    });

    return await transactionalEntityManager.save(Users, newUser);
  }

  async inviteStaff(schooldId: string, email: string, role: Roles) {
    const school = await this.schoolRepository.findOne({
      where: { id: schooldId },
    });

    const user = this.userRepository.create({
      email,
      school,
      role,
    });

    if (!user) {
      throw new ConflictException('User credentials already exist');
    }

    return this.userRepository.save(user);
  }

  // Write a method that uses a query builder to query the database to get the onboarding status of a staff, prospective student and role based on the school id in which the status that is most common is returned
  async getOnboardingStatus(schoolId: string) {
    const staffStatus = await this.staffRepository
      .createQueryBuilder('staff')
      .select(['staff.onboarding_status'])
      .where('staff.school_id = :schoolId', { schoolId })
      .groupBy('staff.onboarding_status')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    const prospectiveStudentStatus = await this.prospectiveStudentRepository
      .createQueryBuilder('prospective_student')
      .select(['prospective_student.onboarding_status'])
      .where('prospective_student.school_id = :schoolId', { schoolId })
      .groupBy('prospective_student.onboarding_status')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    const roleStatus = await this.roleRepository
      .createQueryBuilder('roles')
      .select(['roles.onboarding_status'])
      .where('roles.school_id = :schoolId', { schoolId })
      .groupBy('roles.onboarding_status')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    const workflowStatus = await this.workflowRepository // Changed from roleRepository to workflowRepository
      .createQueryBuilder('workflow')
      .select(['workflow.onboarding_status'])
      .where('workflow.school_id = :schoolId', { schoolId })
      .groupBy('workflow.onboarding_status')
      .orderBy('COUNT(*)', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      staff: staffStatus?.staff_onboarding_status || null,
      prospective_student:
        prospectiveStudentStatus?.prospective_student_onboarding_status || null,
      role: roleStatus?.roles_onboarding_status || null,
      workflow: workflowStatus?.workflow_onboarding_status || null,
    };
  }

  // async createRole(roleDto: RoleDto, schoolId: string) {
  //   const { role, permission_id } = roleDto;
  //   const school = await this.schoolRepository.findOne({
  //     where: { id: schoolId },
  //   });
  //   const roles = this.roleRepository.create({ role, school });

  //   // Find the permissions
  //   const permissions = await this.permissionRepository.findOne({
  //     where: { id: permission_id },
  //   });

  //   // Create the role-permission associations
  //   const rolePermissions = this.rolepermissionRepoistory.create({
  //     role: roles,
  //     permission: permissions,
  //   });

  //   // Save the role
  //   const result = await this.roleRepository.save(roles);

  //   // Save the role-permission associations
  //   await this.rolepermissionRepoistory.save(rolePermissions);

  //   return result;
  // }

  async findRole(roleName: string, schoolId: string): Promise<Roles | null> {
    return this.roleRepository.findOne({
      where: {
        role: roleName,
        school: {
          id: schoolId,
        },
      },
    });
  }

  async moveToTrash(logId: string): Promise<AppLogger> {
    const log = await this.appLoggerRepository.findOne({
      where: { id: logId },
    });
    log.deletedAt = new Date();
    return this.appLoggerRepository.save(log);
  }

  async createFolder(
    name: string,
    userId: string,
    parentFolderId: string
  ): Promise<Folder> {
    const folder = this.folderRepository.create({
      name,
      userId,
      parentFolderId,
    });
    return this.folderRepository.save(folder);
  }

  // Find folder by id
  async findFolderById(folderId: string): Promise<Folder> {
    return this.folderRepository.findOne({
      where: { id: folderId },
    });
  }

  // Get folder contents using pagination
  async getFolderContents(folderId: string, page: number, limit: number) {
    const [folders, total] = await this.folderRepository.findAndCount({
      where: { id: folderId },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      folders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllFolders(
    userId: string,
    page: number,
    limit: number
  ): Promise<[Folder[], number]> {
    const skip = (page - 1) * limit;

    const [folders, total] = await this.folderRepository
      .createQueryBuilder('folder')
      .leftJoinAndSelect('folder.subFolders', 'subFolders')
      .leftJoinAndSelect('folder.documents', 'documents')
      .where('folder.userId = :userId', { userId })
      .andWhere('folder.parentFolderId IS NULL') // Get only root folders
      .orderBy('folder.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return [folders, total];
  }

  async moveToFolder(logId: string[], folderId: string): Promise<AppLogger> {
    const folder = await this.logFolderRepoistory.findOne({
      where: { id: folderId },
    });

    logId.forEach(async id => {
      const log = await this.appLoggerRepository.findOne({
        where: { id },
      });
      log.folder = folder;
      await this.appLoggerRepository.save(log);
    });

    return this.appLoggerRepository.findOne({
      where: { id: logId[0] },
    });
  }

  async getFolders(
    userId: string,
    page: number,
    limit: number
  ): Promise<LogFolder[]> {
    return this.logFolderRepoistory
      .createQueryBuilder('folder')
      .select(['folder.id', 'folder.name', 'folder.createdAt'])
      .where('folder.userId = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  // Delete a folder by id
  async deleteFolder(folderId: string) {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return await this.folderRepository.delete({ id: folderId });
  }

  // Delete documents by id
  async deleteDocument(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return await this.documentRepository.delete({ id: documentId });
  }

  async getLogsByFolder(folderId: string, page: number, limit: number) {
    // Use query builder to get logs by folder id
    return this.appLoggerRepository
      .createQueryBuilder('app_logger')
      .select([
        'app_logger.id',
        'app_logger.message',
        'app_logger.type',
        'app_logger.method',
        'app_logger.route',
        'app_logger.logType',
        'app_logger.createdAt',
      ])
      .where('app_logger.folder_id = :folderId', { folderId })
      .andWhere('app_logger.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('app_logger.createdAt', 'DESC')
      .getMany();
  }

  async getNewStaffs(
    schoolId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<any> {
    // Create the base query builder
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .select([
        'staff.id',
        'staff.username',
        'staff.email',
        'staff.status',
        'staff.onboarding_status',
        'staff.created_at',
        'staff.updated_at',
      ])
      .where('staff.school_id = :schoolId', { schoolId });

    // Add search functionality if provided
    if (search) {
      queryBuilder.andWhere(
        '(staff.email ILIKE :search OR staff.username ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add status filter if provided
    if (status) {
      queryBuilder.andWhere('staff.status = :status', { status });
    }

    // Execute the query with pagination
    const [result, totalCount] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('staff.created_at', 'DESC')
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      result,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // Write a method to search for students using like operator and query builder
  async searchStudents(schoolId: string, search: string) {
    return this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('prospective_studentuser', 'user')
      .select([
        'prospective_studentid',
        'prospective_studentfirst_name',
        'prospective_studentlast_name',
        'prospective_studentdate_of_birth',
        'prospective_studenthome_address',
        'prospective_studentcreated_at',
        'user.email',
        'user.username',
      ])
      .where('prospective_studentschool_id = :schoolId', { schoolId })
      .andWhere(
        'prospective_studentfirst_name ILIKE :search OR prospective_studentlast_name ILIKE :search OR prospective_studenthome_address ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search',
        {
          search: `%${search}%`,
        }
      )
      .getMany();
  }

  // Add document to a student profile
  async assignDocumentToStudents(documentId: string, studentIds: string[]) {
    try {
      console.log(
        `Starting document assignment: documentId=${documentId}, students=${studentIds.join(',')}`
      );

      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }
      console.log(`Found document: ${document.id}, ${document.fileName}`);

      const students = await this.prospectiveStudentRepository.find({
        where: { id: In(studentIds) },
      });
      console.log(`Found ${students.length} students`);

      if (students.length !== studentIds.length) {
        const foundIds = students.map(student => student.id);
        const missingIds = studentIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(
          `Students not found: ${missingIds.join(', ')}`
        );
      }

      // Save documents directly using DocumentRepository
      const savedDocuments = [];
      for (const student of students) {
        try {
          console.log(`Processing student: ${student.id} (${student.name})`);

          // Create a new document - don't copy the ID from the original
          const newDocument = {
            fileName: document.fileName,
            fileType: document.fileType,
            publicUrl: document.publicUrl,
            folderId: document.folderId,
            onboarding_status: document.onboarding_status || 'pending',
            uploadedAt: new Date(),
            student: student,
          };

          console.log(
            `Attempting to save new document: ${JSON.stringify(newDocument, null, 2)}`
          );

          // Save using entity manager to avoid any potential repository issues
          const savedDoc = await this.documentRepository.save(newDocument);
          console.log(`Success! Document saved with ID: ${savedDoc.id}`);

          savedDocuments.push(savedDoc);
        } catch (e) {
          console.error(`Error saving document for student ${student.id}:`, e);
        }
      }

      console.log(`Total documents saved: ${savedDocuments.length}`);
      return {
        message: 'Document assigned to students successfully',
        count: savedDocuments.length,
      };
    } catch (error) {
      console.error('Error in assignDocumentToStudents:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error assigning document to students'
      );
    }
  }
  // Duplicate log using the log id and a query builder
  async duplicateLog(logId: string): Promise<AppLogger> {
    const log = await this.appLoggerRepository.findOne({
      where: { id: logId },
    });

    const newLog = this.appLoggerRepository.create({
      ...log,
      id: undefined,
      createdAt: new Date(),
    });

    return this.appLoggerRepository.save(newLog);
  }

  // Edit log using the log id and a query builder
  async editLog(logId: string, message: string): Promise<AppLogger> {
    const log = await this.appLoggerRepository.findOne({
      where: { id: logId },
    });

    log.message = message;

    return this.appLoggerRepository.save(log);
  }

  async saveDocument(document: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(document);
  }

  async saveStaffEmails(emails: string[], schoolId: string) {
    return this.dataSource.transaction(async transactionalEntityManager => {
      const school = await transactionalEntityManager.findOne(School, {
        where: { id: schoolId },
      });

      if (!school) {
        throw new NotFoundException('School not found');
      }

      const staffEntities = emails.map(email =>
        transactionalEntityManager.create(Staff, {
          email,
          school,
          onboarding_status: 'completed',
        })
      );

      return transactionalEntityManager.save(Staff, staffEntities);
    });
  }
  // Get a specific staff based on the staff id
  async getStaffById(staffId: string) {
    return this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['school'],
    });
  }

  // Update staffs
  async updateStaff(staffId: string, staff: Partial<Staff>) {
    return this.staffRepository.update(staffId, staff);
  }

  // Save document with the school id
  async saveDocumentWithSchoolId(
    document: Partial<Document>,
    schoolId: string
  ): Promise<Document> {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    const newDocument = this.documentRepository.create({
      ...document,
      school,
    });

    return this.documentRepository.save(newDocument);
  }

  // Create a workflow
  async createWorkflow(name: string, roles: Roles[], school: School) {
    const workflow = this.dataSource.manager.create(Workflow, {
      name,
      roles,
      school,
      onboarding_status: 'completed',
    });

    return this.dataSource.manager.save(workflow);
  }

  // Get a list of workflows based on the school id using query builder in order of creation
  async getWorkflowsBySchoolId(schoolId: string) {
    return this.dataSource.manager
      .createQueryBuilder(Workflow, 'workflow')
      .select(['workflow.id', 'workflow.name', 'workflow.description'])
      .where('workflow.school_id = :schoolId', { schoolId })
      .orderBy('workflow.created_at', 'ASC')
      .getMany();
  }

  async deleteUser(userId: string) {
    return this.dataSource.manager.transaction(
      async transactionalEntityManager => {
        const user = await transactionalEntityManager.findOne(Users, {
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const staff = await transactionalEntityManager.findOne(Staff, {
          where: { email: user.email },
        });

        // Change status to unassigned
        if (staff) {
          staff.status = 'unassigned';
          await transactionalEntityManager.save(Staff, staff);
        }

        return transactionalEntityManager.remove(user);
      }
    );
  }

  // Get users based on the permission id from the role-permission table which have have a relationship with the role and permission table and the role table has a relationship with the user table

  async getUsersByPermissionId(
    permission_name: string,
    page: number,
    pageSize: number
  ) {
    const skip = (page - 1) * pageSize;

    const [users, total] = await this.dataSource.manager
      .createQueryBuilder(Users, 'user')
      .innerJoinAndSelect('user.role', 'role')
      .innerJoinAndSelect('role.rolePermission', 'rolePermission')
      .innerJoinAndSelect('rolePermission.permission', 'permission')
      .where('permission.name = :permission_name', { permission_name })
      .select([
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.username',
      ])
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const flattenedUsers = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      username: user.username,
    }));

    return {
      data: flattenedUsers,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Get permissions based on the role id from the role-permission table which have a relationship with the role and permission table
  async getPermissionsByRoleId(roleId: string) {
    return this.dataSource.manager
      .createQueryBuilder(Permissions, 'permission')
      .innerJoinAndSelect('permission.rolePermission', 'rolePermission')
      .innerJoinAndSelect('rolePermission.role', 'role')
      .where('role.id = :roleId', { roleId })
      .getOne();
  }
}
