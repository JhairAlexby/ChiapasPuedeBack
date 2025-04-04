import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { WorkerPoolService } from './worker-pool.service';
import { EvaluationController } from './evaluation.controller';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [ExercisesModule],
  controllers: [EvaluationController],
  providers: [EvaluationService, WorkerPoolService],
  exports: [EvaluationService],
})
export class EvaluationModule {}