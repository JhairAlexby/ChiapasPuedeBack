// EN: src/evaluation/worker-pool.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { StudentResponse } from '../domain/models/student-response.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
// Importa el repositorio y modelos necesarios
import { ExerciseTemplateRepository } from '../exercises/repositories/exercise-template.repository';
import { DifficultyLevel } from '../domain/models/exercise.model'; // Asegúrate que esté importado

@Injectable()
export class WorkerPoolService {
  private logger = new Logger(WorkerPoolService.name);

  // Inyecta el repositorio de plantillas
  constructor(
    private exerciseTemplateRepository: ExerciseTemplateRepository,
  ) {}

  /**
   * Evalúa la respuesta de un estudiante buscando la plantilla correspondiente
   * y comparando la respuesta. Elimina la lógica aleatoria.
   * @param response La respuesta del estudiante.
   * @returns El resultado de la evaluación.
   */
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
      // Buscar la plantilla de ejercicio directamente por ID usando el nuevo método del repositorio
      const findResult = await this.exerciseTemplateRepository.findTemplateById(response.exerciseId);

      // Verificar si se encontró la plantilla y tiene respuesta correcta definida
      // La verificación de correctAnswer ahora está dentro de findTemplateById
      if (!findResult) {
        this.logger.error(`Plantilla de ejercicio con ID ${response.exerciseId} no encontrada o sin respuesta correcta.`);
        // Devolver consistentemente incorrecto si no se encuentran detalles
        return {
          studentId: response.studentId,
          exerciseId: response.exerciseId,
          isCorrect: false,
          feedback: 'Error: No se pudieron cargar los detalles del ejercicio para evaluar.',
        };
      }

      // Tenemos la plantilla encontrada
      const exerciseTemplate = findResult.template;

      // --- Realizar la comparación ---
      this.logger.debug(`Comparando respuesta: "${response.answer}" con correcta: "${exerciseTemplate.correctAnswer}"`);
      // Manejar posible respuesta nula/indefinida o vacía del frontend
      const userAnswerNormalized = response.answer?.trim().toLowerCase() ?? '';
      const correctAnswerNormalized = exerciseTemplate.correctAnswer.trim().toLowerCase();
      const isCorrect = userAnswerNormalized === correctAnswerNormalized;

      this.logger.debug(`Evaluación: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);

      // --- Devolver resultado ---
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
       // Devolver consistentemente incorrecto en caso de error interno
        return {
          studentId: response.studentId,
          exerciseId: response.exerciseId,
          isCorrect: false,
          feedback: 'Error interno durante la evaluación.',
        };
    }
  }
}