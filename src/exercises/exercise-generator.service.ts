import { Injectable, Logger } from '@nestjs/common';
import { DifficultyLevel, Exercise, ExerciseType } from '../domain/models/exercise.model';
import { ExerciseQueueService } from './exercise-queue.service';
import { ExerciseTemplateRepository } from './repositories/exercise-template.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExerciseGeneratorService {
  private logger = new Logger(ExerciseGeneratorService.name);

  constructor(
    private exerciseQueueService: ExerciseQueueService,
    private exerciseTemplateRepository: ExerciseTemplateRepository,
  ) {}

  // Genera ejercicios concurrentemente según nivel
  async generateExerciseBatch(
    level: DifficultyLevel,
    count: number = 10,
  ): Promise<void> {
    this.logger.log(`Generating ${count} exercises for level ${level}`);
    
    // Generamos ejercicios en paralelo
    const generationPromises: Promise<void>[] = [];
    
    for (let i = 0; i < count; i++) {
      generationPromises.push(this.generateAndEnqueueExercise(level));
    }
    
    // Esperamos a que todos los ejercicios se generen
    await Promise.all(generationPromises);
  }

  private async generateAndEnqueueExercise(level: DifficultyLevel): Promise<void> {
    try {
      // Determinar tipos de ejercicio apropiados para el nivel
      const exerciseTypes = this.getExerciseTypesForLevel(level);
      
      // Elegir aleatoriamente un tipo
      const selectedType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
      
      // Obtener plantilla y crear ejercicio
      const template = await this.exerciseTemplateRepository.getRandomTemplate(level, selectedType);
      
      const exercise: Exercise = {
        id: uuidv4(),
        type: selectedType,
        difficultyLevel: level,
        content: template.content,
        options: template.options,
        correctAnswer: template.correctAnswer,
        timeLimit: this.getTimeLimitByLevel(level),
      };
      
      // Enviar a la cola (patrón productor-consumidor)
      await this.exerciseQueueService.enqueueExercise(exercise);
    } catch (error) {
      this.logger.error(`Error generating exercise: ${error.message}`);
      throw error;
    }
  }

  private getExerciseTypesForLevel(level: DifficultyLevel): ExerciseType[] {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return [ExerciseType.LETTER_RECOGNITION, ExerciseType.SYLLABLE_FORMATION];
      case DifficultyLevel.INTERMEDIATE:
        return [ExerciseType.SYLLABLE_FORMATION, ExerciseType.WORD_COMPLETION];
      case DifficultyLevel.ADVANCED:
        return [ExerciseType.SENTENCE_FORMATION, ExerciseType.TEXT_COMPREHENSION];
      default:
        return [ExerciseType.LETTER_RECOGNITION];
    }
  }

  private getTimeLimitByLevel(level: DifficultyLevel): number {
    // Tiempo en segundos según nivel
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return 30;
      case DifficultyLevel.INTERMEDIATE:
        return 45;
      case DifficultyLevel.ADVANCED:
        return 60;
      default:
        return 30;
    }
  }
}