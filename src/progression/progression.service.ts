import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Student } from '../domain/models/student.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
import { DifficultyLevel } from '../domain/models/exercise.model';
import { Semaphore } from '../shared/concurrency/semaphore';
import { Mutex } from '../shared/concurrency/mutex';
import { EvaluationService } from '../evaluation/evaluation.service';
import { StudentRepository } from './repositories/student.repository';
import { concatMap, tap } from 'rxjs/operators';

@Injectable()
export class ProgressionService implements OnModuleInit {
  private logger = new Logger(ProgressionService.name);
  
  // Mutex para control de concurrencia por estudiante
  private studentMutexes: Map<string, Mutex> = new Map();

  constructor(
    private evaluationService: EvaluationService,
    private studentRepository: StudentRepository,
  ) {}

  onModuleInit() {
    // Suscribirse a los resultados de evaluación y procesar secuencialmente
    this.evaluationService.getEvaluationResults()
      .pipe(
        // Procesar resultados secuencialmente para evitar condiciones de carrera
        concatMap(result => this.handleEvaluationResult(result)),
        // Registrar errores pero continuar procesando resultados
        tap({
          error: (err) => this.logger.error(`Error handling evaluation: ${err.message}`)
        })
      )
      .subscribe();
  }

  private async handleEvaluationResult(result: EvaluationResult): Promise<void> {
    try {
      // Obtener o crear mutex para el estudiante
      let mutex = this.studentMutexes.get(result.studentId);
      if (!mutex) {
        mutex = new Mutex();
        this.studentMutexes.set(result.studentId, mutex);
      }

      // Usar el mutex para garantizar acceso exclusivo
      await mutex.withLock(async () => {
        // Obtener datos actuales del estudiante
        const student = await this.studentRepository.getStudentById(result.studentId);
        if (!student) {
          this.logger.warn(`Estudiante no encontrado: ${result.studentId}`);
          return;
        }

        await this.updateStudentProgress(student, result);
      });
    } catch (error) {
      this.logger.error(`Error procesando resultado: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateStudentProgress(student: Student, result: EvaluationResult): Promise<void> {
    this.logger.debug(`Actualizando progreso para estudiante: ${student.id}`);
    
    student.progress.exercisesCompleted++;
    
    if (result.isCorrect) {
      student.progress.correctAnswers++;
    } else {
      student.progress.incorrectAnswers++;
    }
    
    const totalResponses = student.progress.correctAnswers + student.progress.incorrectAnswers;
    
    await this.studentRepository.updateStudent(student);
    this.logger.debug(`Progreso actualizado para estudiante: ${student.id}`);
  }

  async getStudentProgress(studentId: string): Promise<Student | null> {
    return this.studentRepository.getStudentById(studentId);
  }
}