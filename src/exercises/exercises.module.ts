// src/exercises/exercises.module.ts
import { Module } from '@nestjs/common';
import { ExerciseGeneratorService } from './exercise-generator.service';
import { ExerciseQueueService } from './exercise-queue.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseTemplateRepository } from './repositories/exercise-template.repository';

@Module({
  controllers: [ExerciseController],
  providers: [
    ExerciseGeneratorService,
    ExerciseQueueService,
    ExerciseTemplateRepository, // Proveedor
  ],
  // Añadir ExerciseTemplateRepository a los exports
  exports: [
    ExerciseGeneratorService,
    ExerciseQueueService,
    ExerciseTemplateRepository, 
  ],
})
export class ExercisesModule {}