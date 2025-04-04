import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExercisesModule } from './exercises/exercises.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { ProgressionModule } from './progression/progression.module';

@Module({
  imports: [
    ExercisesModule,
    EvaluationModule,
    ProgressionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}