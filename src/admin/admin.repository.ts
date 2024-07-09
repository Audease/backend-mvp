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
  async getStudentsBySchoolId(schoolId: string, page: number, limit: number) {
    return this.studentRepository.find({
      where: { school: { id: schoolId } },
      take: limit,
      skip: page * limit,
    });
  }
  //   Get a specific student based on the student id and join the user entity
  async getStudentById(studentId: string) {
    return this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['user'],
    });
  }

  async saveDocument(document: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(document);
  }
}
