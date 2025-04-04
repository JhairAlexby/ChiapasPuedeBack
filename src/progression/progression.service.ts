import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Student } from '../domain/models/student.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
import { DifficultyLevel } from '../domain/models/exercise.model';
import { Semaphore } from '../shared/concurrency/semaphore';
import { EvaluationService } from '../evaluation/evaluation.service';
import { StudentRepository } from './repositories/student.repository';

@Injectable()
export class ProgressionService implements OnModuleInit {
  private logger = new Logger(ProgressionService.name);
  
  // Semáforo para controlar acceso concurrente al progreso de estudiantes
  private studentSemaphores: Map<string, Semaphore> = new Map();

  constructor(
    private evaluationService: EvaluationService,
    private studentRepository: StudentRepository,
  ) {}

  onModuleInit() {
    // Suscribirse a los resultados de evaluación para actualizar el progreso
    this.evaluationService.getEvaluationResults().subscribe(
      (result) => {
        this.handleEvaluationResult(result).catch(error => {
          this.logger.error(`Error handling evaluation result: ${error.message}`);
        });
      }
    );
  }

  private async handleEvaluationResult(result: EvaluationResult): Promise<void> {
    try {
      // Obtener semáforo para el estudiante o crear uno nuevo
      let semaphore = this.studentSemaphores.get(result.studentId);
      if (!semaphore) {
        semaphore = new Semaphore(1); // Solo una operación a la vez por estudiante
        this.studentSemaphores.set(result.studentId, semaphore);
      }

      // Utilizar el semáforo para evitar condiciones de carrera
      await semaphore.acquire();
      try {
        // Obtener datos del estudiante
        const student = await this.studentRepository.getStudentById(result.studentId);
        if (!student) {
          this.logger.warn(`Student not found: ${result.studentId}`);
          return;
        }

        // Actualizar progreso
        await this.updateStudentProgress(student, result);
      } finally {
        semaphore.release();
      }
    } catch (error) {
      this.logger.error(`Error processing evaluation result: ${error.message}`);
      throw error;
    }
  }

  private async updateStudentProgress(student: Student, result: EvaluationResult): Promise<void> {
    // Incrementar contador de ejercicios
    student.progress.exercisesCompleted++;
    
    // Actualizar respuestas correctas/incorrectas
    if (result.isCorrect) {
      student.progress.correctAnswers++;
    } else {
      student.progress.incorrectAnswers++;
    }
    
    // Guardar cambios
    await this.studentRepository.updateStudent(student);
    this.logger.debug(`Updated progress for student: ${student.id}`);
  }

  // Método público para consultar el progreso de un estudiante
  async getStudentProgress(studentId: string): Promise<Student | null> {
    return this.studentRepository.getStudentById(studentId);
  }
}