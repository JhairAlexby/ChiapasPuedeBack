import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ExerciseGeneratorService } from './exercise-generator.service';
import { ExerciseTemplateRepository } from './repositories/exercise-template.repository';
import { DifficultyLevel } from '../domain/models/exercise.model';

@Controller('exercises')
export class ExerciseController {
  private logger = new Logger(ExerciseController.name);

  constructor(
    private exerciseGeneratorService: ExerciseGeneratorService,
    private exerciseTemplateRepository: ExerciseTemplateRepository
  ) {}

  @Get('generate/:level')
  async generateExercises(
    @Param('level') level: DifficultyLevel,
    @Query('count') count: number = 10,
  ) {
    this.logger.log(`Request to generate ${count} exercises for level ${level}`);
    await this.exerciseGeneratorService.generateExerciseBatch(level, count);
    return { success: true, message: `Generated ${count} exercises for level ${level}` };
  }

  // Nuevo endpoint para obtener ejercicios por nivel
  @Get(':level')
  async getExercisesByLevel(@Param('level') level: DifficultyLevel) {
    this.logger.log(`Request for exercises at level ${level}`);
    
    // Generar algunos ejercicios para el nivel solicitado
    // Normalmente obtendríamos esto de una base de datos, pero para simplificar
    // generaremos algunos ejercicios de ejemplo
    
    const templates = await this.exerciseTemplateRepository.getTemplatesForLevel(level, 5);
    return templates.map(template => ({
      id: template.id,
      type: template.type,
      difficultyLevel: level,
      content: template.content,
      options: template.options || [],
      timeLimit: 30,
    }));
  }
}