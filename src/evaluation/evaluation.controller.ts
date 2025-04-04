import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { StudentResponse } from '../domain/models/student-response.model';

@Controller('evaluation')
export class EvaluationController {
  private logger = new Logger(EvaluationController.name);

  constructor(private evaluationService: EvaluationService) {}

  @Post()
  async evaluateResponse(@Body() response: StudentResponse) {
    this.logger.log(`Received response from student: ${response.studentId}`);
    const result = await this.evaluationService.processStudentResponse(response);
    return result;
  }
}