import { Injectable, Logger } from '@nestjs/common';
import { Student } from '../../domain/models/student.model';

@Injectable()
export class StudentRepository {
  private logger = new Logger(StudentRepository.name);
  private students: Map<string, Student> = new Map();

  constructor() {
    // No initialization needed anymore
  }

  async getStudentById(id: string): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 20));
    const student = this.students.get(id);
    return student || null;
  }

  async updateStudent(student: Student): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 30));
    this.students.set(student.id, { ...student });
    this.logger.debug(`Updated student: ${student.id}`);
  }

  async getAllStudents(): Promise<Student[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return Array.from(this.students.values());
  }
}