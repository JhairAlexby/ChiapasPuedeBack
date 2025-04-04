import { Module } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { ProgressionController } from './progression.controller';
import { StudentController } from './student.controller';
import { StudentRepository } from './repositories/student.repository';

@Module({
  imports: [EvaluationModule],
  controllers: [ProgressionController, StudentController],
  providers: [ProgressionService, StudentRepository],
})
export class ProgressionModule {}