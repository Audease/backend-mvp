import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Student } from '../students/entities/student.entity';
import { Users } from '../users/entities/user.entity';
import { Document } from '../shared/entities/document.entity';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';

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
    private readonly prospectiveStudentRepository: Repository<ProspectiveStudent>
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
        'student.address',
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

  async saveDocument(document: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(document);
  }
}
