import { Injectable, Logger } from '@nestjs/common';
import { Student } from '../../domain/models/student.model';
import { DifficultyLevel } from '../../domain/models/exercise.model';
import { Mutex } from '../../shared/concurrency/mutex';

@Injectable()
export class StudentRepository {
  private logger = new Logger(StudentRepository.name);
  private students: Map<string, Student> = new Map();
  private repositoryMutex = new Mutex(); // Mutex para operaciones en el mapa de estudiantes

  constructor() {
    this.initializeDemoStudents();
  }

  private async initializeDemoStudents() {
    const demoStudent = {
      id: 'demo-student-fallback',
      name: 'Estudiante Demo',
      currentLevel: DifficultyLevel.BEGINNER,
      progress: {
        exercisesCompleted: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageResponseTime: 0
      }
    };
    
    this.students.set(demoStudent.id, demoStudent);
  }

  async getStudentById(id: string): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 20)); 
    
    return this.repositoryMutex.withLock(async () => {
      const student = this.students.get(id);
      return student ? { ...student } : null; 
    });
  }

  async updateStudent(student: Student): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 30)); 
    
    await this.repositoryMutex.withLock(async () => {
      this.students.set(student.id, { ...student });
      this.logger.debug(`Estudiante actualizado: ${student.id}`);
    });
  }

  async getAllStudents(): Promise<Student[]> {
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    // Acceso atómico usando mutex
    return this.repositoryMutex.withLock(async () => {
      return Array.from(this.students.values()).map(student => ({ ...student }));
    });
  }
}