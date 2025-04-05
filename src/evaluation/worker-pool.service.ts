import { Injectable, Logger } from '@nestjs/common';
import { StudentResponse } from '../domain/models/student-response.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
import { ExerciseTemplateRepository } from '../exercises/repositories/exercise-template.repository';
import { DifficultyLevel } from '../domain/models/exercise.model'; 

@Injectable()
export class WorkerPoolService {
  private logger = new Logger(WorkerPoolService.name);

  constructor(
    private exerciseTemplateRepository: ExerciseTemplateRepository,
  ) {}


  async evaluateResponse(response: StudentResponse): Promise<EvaluationResult> {
    this.logger.debug(`Evaluando respuesta para ejercicio ID: ${response.exerciseId}`);

    if (!response || !response.exerciseId) {
        this.logger.error('Respuesta inválida recibida (sin response o exerciseId).');
        return {
            studentId: response?.studentId ?? 'unknown',
            exerciseId: response?.exerciseId ?? 'unknown',
            isCorrect: false,
            feedback: 'Error: Datos de respuesta inválidos.',
        };
    }

    try {
      const findResult = await this.exerciseTemplateRepository.findTemplateById(response.exerciseId);

      
      if (!findResult) {
        this.logger.error(`Plantilla de ejercicio con ID ${response.exerciseId} no encontrada o sin respuesta correcta.`);
        return {
          studentId: response.studentId,
          exerciseId: response.exerciseId,
          isCorrect: false,
          feedback: 'Error: No se pudieron cargar los detalles del ejercicio para evaluar.',
        };
      }

      const exerciseTemplate = findResult.template;

      this.logger.debug(`Comparando respuesta: "${response.answer}" con correcta: "${exerciseTemplate.correctAnswer}"`);
      const userAnswerNormalized = response.answer?.trim().toLowerCase() ?? '';
      const correctAnswerNormalized = exerciseTemplate.correctAnswer.trim().toLowerCase();
      const isCorrect = userAnswerNormalized === correctAnswerNormalized;

      this.logger.debug(`Evaluación: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);

      return {
        studentId: response.studentId,
        exerciseId: response.exerciseId,
        isCorrect: isCorrect,
        feedback: isCorrect
          ? '¡Respuesta correcta!'
          : `La respuesta correcta era: ${exerciseTemplate.correctAnswer}`,
      };

    } catch (error) {
       this.logger.error(`Error durante la evaluación del ejercicio ${response.exerciseId}: ${error.message}`, error.stack);
        return {
          studentId: response.studentId,
          exerciseId: response.exerciseId,
          isCorrect: false,
          feedback: 'Error interno durante la evaluación.',
        };
    }
  }
}