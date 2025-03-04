import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from '../shared/entities/document.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>
  ) {}

  //   Use a query builder to get a specific student by ID
  async getStudentById(id: string): Promise<Student> {
    return this.studentRepository
      .createQueryBuilder('student')
      .where('student.id = :id', { id })
      .getOne();
  }

  // Fetch documents for a particular student
  async getDocumentsByStudentId(studentId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { student: { id: studentId } },
    });
  }

  //   Update student's details by ID
  async updateStudentById(id: string, student: Student): Promise<Student> {
    await this.studentRepository.update(id, student);
    return this.getStudentById(id);
  }

  //   Save a student's document with their user ID and school ID
  async saveDocument(document: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(document);
  }
}
