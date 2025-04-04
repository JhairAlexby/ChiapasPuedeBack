import { Injectable, Logger } from '@nestjs/common';
import { WorkerPoolService } from './worker-pool.service';
import { StudentResponse } from '../domain/models/student-response.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class EvaluationService {
  private logger = new Logger(EvaluationService.name);
  private evaluationResults = new Subject<EvaluationResult>();

  constructor(private workerPoolService: WorkerPoolService) {
    this.logger.log('EvaluationService initialized');
  }

  // Método para procesar concurrentemente las respuestas de los estudiantes
  async processStudentResponse(response: StudentResponse): Promise<EvaluationResult> {
    try {
      this.logger.debug(`Processing response for exercise: ${response.exerciseId}`);
      
      // Utilizar el worker pool para evaluar concurrentemente
      const result = await this.workerPoolService.evaluateResponse(response);
      
      // Emitir el resultado para que otros servicios puedan reaccionar
      this.evaluationResults.next(result);
      
      return result;
    } catch (error) {
      this.logger.error(`Error processing response: ${error.message}`);
      throw error;
    }
  }

  // Observable de resultados de evaluación
  getEvaluationResults(): Observable<EvaluationResult> {
    return this.evaluationResults.asObservable();
  }
}