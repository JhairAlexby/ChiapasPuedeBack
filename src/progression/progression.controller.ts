import { Controller, Get, Param, Logger } from '@nestjs/common';
import { ProgressionService } from './progression.service';

@Controller('progression')
export class ProgressionController {
  private logger = new Logger(ProgressionController.name);

  constructor(private progressionService: ProgressionService) {}

  @Get(':studentId')
  async getStudentProgress(@Param('studentId') studentId: string) {
    this.logger.log(`Request for student progress: ${studentId}`);
    const progress = await this.progressionService.getStudentProgress(studentId);
    if (!progress) {
      return { message: 'Student not found' };
    }
    return progress;
  }
}