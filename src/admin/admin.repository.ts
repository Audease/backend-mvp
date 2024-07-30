import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Student } from '../students/entities/student.entity';
import { Users } from '../users/entities/user.entity';
import { Document } from '../shared/entities/document.entity';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { Roles } from '../shared/entities/role.entity';
import { Role } from '../utils/enum/role';
import { Permissions } from '../shared/entities/permission.entity';
import { School } from '../shared/entities/school.entity';
import { RolePermission } from '../shared/entities/rolepermission.entity';
import { RoleDto } from './dto/create-role.dto';
import { LogFolder } from '../shared/entities/folder.entity';
import { AppLogger } from '../shared/entities/logger.entity';

@Injectable()
export class AdminRepository {
  constructor(
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
    private readonly appLoggerRepository: Repository<AppLogger>
  ) {}
  //   Get a paginated list of students based on the school id
  // async getStudentsBySchoolId(schoolId: string, page: number, limit: number) {
  //   return this.studentRepository.find({
  //     where: { school: { id: schoolId } },
  //     take: limit,
  //     skip: (page - 1) * limit,
  //   });
  // }

  async getStudentsBySchoolId(
    schoolId: string,
    page: number,
    limit: number
  ): Promise<Student[]> {
    return this.studentRepository
      .createQueryBuilder('student')
      .select([
        'student.id',
        'student.first_name',
        'student.last_name',
        'student.date_of_birth',
        'student.address',
        'student.created_at',
        'student.updated_at',
        'student.user_id',
      ])
      .where('student.school_id = :schoolId', { schoolId })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
  //   Get a specific student based on the student id and join the user entity
  async getStudentById(studentId: string) {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .select([
        'student.id',
        'student.first_name',
        'student.last_name',
        'student.date_of_birth',
        'student.home_address',
        'student.created_at',
        'user.email',
        'user.username',
      ])
      .where('student.id = :studentId', { studentId })
      .getOne();

    if (!result) return null;

    // Flatten the structure
    return {
      id: result.id,
      first_name: result.first_name,
      last_name: result.last_name,
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
      .leftJoinAndSelect('student.user', 'user')
      .select([
        'student.id',
        'student.first_name',
        'student.last_name',
        'student.date_of_birth',
        'student.address',
        'student.created_at',
        'student.updated_at',
        'student.user_id',
        'user.email',
        'user.username',
      ])
      .where('student.school_id = :schoolId', { schoolId })
      .andWhere(
        'student.first_name ILIKE :search OR student.last_name ILIKE :search OR student.address ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search',
        {
          search: `%${search}%`,
        }
      )
      .getMany();

    if (!result) return null;
    // Flatten the structure
    return result.map(student => ({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      date_of_birth: student.date_of_birth,
      address: student.home_address,
      email: student.user?.email,
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

  // Get a paginated list of prospective students based on the school id
  async getProspectiveStudentsBySchoolId(
    schoolId: string,
    page: number,
    limit: number
  ): Promise<ProspectiveStudent[]> {
    return this.prospectiveStudentRepository
      .createQueryBuilder('prospective_student')
      .select([
        'prospective_student.id',
        'prospective_student.first_name',
        'prospective_student.last_name',
        'prospective_student.middle_name',
        'prospective_student.mobile_number',
        'prospective_student.email',
        'prospective_student.level',
        'prospective_student.date_of_birth',
        'prospective_student.created_at',
      ])
      .where('prospective_student.school_id = :schoolId', { schoolId })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  // Get a specific prospective student based on the student id
  async getProspectiveStudentById(studentId: string) {
    return this.prospectiveStudentRepository.findOne({
      where: { id: studentId },
    });
  }
  async getUsersBySchoolId(schoolId: string, page: number, limit: number) {
    const excludedRoles = ['student', 'school_admin'];

    const [users, total] = await this.userRepository
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
      .andWhere('role.role NOT IN (:...excludedRoles)', { excludedRoles })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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

  // Update a user's role based on the user id and the role passed into the argument
  async updateUserRole(userId: string, role: Role) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) return null;

    const newRole = await this.roleRepository.findOne({ where: { role } });

    if (!newRole) return null;

    user.role = newRole;

    return this.userRepository.save(user);
  }

  async getRoles(schoolId: string) {
    return this.roleRepository
      .createQueryBuilder('roles')
      .leftJoin('roles.school', 'school')
      .select(['roles.id', 'roles.role', 'roles.description'])
      .where('roles.school_id = :schoolId OR roles.school_id IS NULL', {
        schoolId,
      })
      .getMany();
  }

  // Get a list of permissions
  async getPermissions() {
    return this.permissionRepository.find();
  }

  // Create a user with none as the role and relate it to a school
  async createStaff(
    schoolId: string,
    user: Partial<Users>,
    role: Roles,
    username: string,
    password: string
  ) {
    const college = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    const newUsers = this.userRepository.create({
      ...user,
      password: password,
      username: username,
      role: role,
      school: college,
    });

    return await this.userRepository.save(newUsers);
  }

  async createRole(roleDto: RoleDto, schoolId: string) {
    const { description, role, permission_id } = roleDto;

    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    const roles = this.roleRepository.create({
      role,
      description,
      school: school,
    });

    const permissions = await this.permissionRepository.findOne({
      where: { id: permission_id },
    });

    if (!permissions) return null;

    const rolePermission = this.rolepermissionRepoistory.create({
      role: roles,
      permission: permissions,
    });

    await this.roleRepository.save(roles);

    return await this.rolepermissionRepoistory.save(rolePermission);
  }

  async moveToTrash(logId: string): Promise<AppLogger> {
    const log = await this.appLoggerRepository.findOne({
      where: { id: logId },
    });
    log.deletedAt = new Date();
    return this.appLoggerRepository.save(log);
  }

  async createFolder(name: string, userId: string): Promise<LogFolder> {
    const folder = this.logFolderRepoistory.create({
      name,
      userId,
    });
    return this.logFolderRepoistory.save(folder);
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
}
