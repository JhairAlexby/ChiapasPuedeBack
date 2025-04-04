import { Controller, Get, Logger } from '@nestjs/common';
import { StudentRepository } from './repositories/student.repository';

@Controller('students')
export class StudentController {
  private logger = new Logger(StudentController.name);

  constructor(private studentRepository: StudentRepository) {}

  @Get()
  async getAllStudents() {
    this.logger.log('Request for all students');
    const students = await this.studentRepository.getAllStudents();
    return students;
  }
}