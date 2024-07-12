import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Student } from '../students/entities/student.entity';
import { Users } from '../users/entities/user.entity';
import { Document } from '../shared/entities/document.entity';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>
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
      address: result.address,
      email: result.user?.email,
      username: result.user?.username,
      created_at: result.created_at,
    };
  }

  // Search student by school id using query builder and like operator without pagination
  async searchStudentBySchoolId(
    schoolId: string,
    search: string
  ): Promise<Student[]> {
    return this.studentRepository
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
  }

  async saveDocument(document: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(document);
  }
}
