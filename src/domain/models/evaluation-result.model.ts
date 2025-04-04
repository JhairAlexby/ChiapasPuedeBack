import { ExerciseType } from './exercise.model';

/**
 * Modelo que representa el resultado de evaluar la respuesta de un estudiante
 */
export interface EvaluationResult {
  studentId: string;
  exerciseId: string;
  isCorrect: boolean;
  feedback: string;
  suggestedNextExerciseType?: ExerciseType;
}