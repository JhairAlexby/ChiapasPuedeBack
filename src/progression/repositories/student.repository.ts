import { Injectable, Logger } from '@nestjs/common';
import { Student } from '../../domain/models/student.model';
import { DifficultyLevel } from '../../domain/models/exercise.model';

@Injectable()
export class StudentRepository {
  private logger = new Logger(StudentRepository.name);
  
  // Simulación de base de datos en memoria
  private students: Map<string, Student> = new Map();

  constructor() {
    // Inicializar con algunos estudiantes de ejemplo
    this.initializeTestData();
  }

  private initializeTestData() {
    const testStudents: Student[] = [
      {
        id: 'student-1',
        name: 'María López',
        currentLevel: DifficultyLevel.BEGINNER,
        progress: {
          exercisesCompleted: 5,
          correctAnswers: 4,
          incorrectAnswers: 1,
          averageResponseTime: 2500,
        },
      },
      {
        id: 'student-2',
        name: 'Juan Pérez',
        currentLevel: DifficultyLevel.INTERMEDIATE,
        progress: {
          exercisesCompleted: 15,
          correctAnswers: 12,
          incorrectAnswers: 3,
          averageResponseTime: 3200,
        },
      },
    ];
    
    testStudents.forEach(student => {
      this.students.set(student.id, student);
    });
    
    this.logger.log(`Initialized ${this.students.size} test students`);
  }

  async getStudentById(id: string): Promise<Student | null> {
    // Simular latencia de base de datos
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const student = this.students.get(id);
    return student || null;
  }

  async updateStudent(student: Student): Promise<void> {
    // Simular latencia de base de datos
    await new Promise(resolve => setTimeout(resolve, 30));
    
    this.students.set(student.id, { ...student });
    this.logger.debug(`Updated student: ${student.id}`);
  }

  async getAllStudents(): Promise<Student[]> {
    // Simular latencia de base de datos
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return Array.from(this.students.values());
  }
}