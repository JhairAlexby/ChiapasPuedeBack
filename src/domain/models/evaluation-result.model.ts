import { ExerciseType } from './exercise.model';

export interface EvaluationResult {
  studentId: string;
  exerciseId: string;
  isCorrect: boolean;
  feedback: string;
  suggestedNextExerciseType?: ExerciseType;
}