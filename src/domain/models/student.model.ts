import { DifficultyLevel } from "./exercise.model";

export interface Student {
    id: string;
    name: string;
    currentLevel: DifficultyLevel;
    progress: {
      exercisesCompleted: number;
      correctAnswers: number;
      incorrectAnswers: number;
      averageResponseTime: number;
    };
  }