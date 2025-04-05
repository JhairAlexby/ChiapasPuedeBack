import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationService } from './evaluation.service';
import { WorkerPoolService } from './worker-pool.service';
import { StudentResponse } from '../domain/models/student-response.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
import { ExerciseQueueService } from '../exercises/exercise-queue.service';
import { of } from 'rxjs';

const mockWorkerPoolService = {
  evaluateResponse: jest.fn()
};

const mockExerciseQueueService = {
  getExerciseStream: jest.fn()
};

describe('EvaluationService - Pruebas concurrentes', () => {
  let service: EvaluationService;
  let workerPoolService: WorkerPoolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        { provide: WorkerPoolService, useValue: mockWorkerPoolService },
        { provide: ExerciseQueueService, useValue: mockExerciseQueueService }
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
    workerPoolService = module.get<WorkerPoolService>(WorkerPoolService);
    
    jest.clearAllMocks();
  });

  it('debe procesar correctamente respuestas concurrentes', async () => {
    const mockResult: EvaluationResult = {
      studentId: 'student1',
      exerciseId: 'exercise1',
      isCorrect: true,
      feedback: 'Respuesta correcta'
    };
    
    mockWorkerPoolService.evaluateResponse.mockResolvedValue(mockResult);
    
    const responses: StudentResponse[] = Array(10).fill(null).map((_, index) => ({
      studentId: `student${index % 3 + 1}`,
      exerciseId: `exercise${index % 5 + 1}`,
      answer: 'test answer',
      responseTimeMs: 1000,
      timestamp: new Date()
    }));
    
    const promises = responses.map(response => service.processStudentResponse(response));
    const results = await Promise.all(promises);
    
    expect(results.length).toBe(responses.length);
    expect(mockWorkerPoolService.evaluateResponse).toHaveBeenCalledTimes(responses.length);
    
    results.forEach(result => {
      expect(result).toEqual(mockResult);
    });
  });

  it('debe manejar errores en el procesamiento concurrente', async () => {
    mockWorkerPoolService.evaluateResponse
      .mockImplementation((response: StudentResponse) => {
        if (response.studentId === 'student1') {
          return Promise.reject(new Error('Error simulado'));
        }
        return Promise.resolve({
          studentId: response.studentId,
          exerciseId: response.exerciseId,
          isCorrect: true,
          feedback: 'Ok'
        });
      });
    
    const responses: StudentResponse[] = Array(10).fill(null).map((_, index) => ({
      studentId: `student${index % 2 + 1}`,
      exerciseId: `exercise${index + 1}`,
      answer: 'test answer',
      responseTimeMs: 1000,
      timestamp: new Date()
    }));
    
    const promises = responses.map(response => 
      service.processStudentResponse(response)
        .catch(err => ({ error: err.message }))
    );
    
    const results = await Promise.all(promises);
    
    expect(results.filter(r => 'error' in r).length).toBe(5);  
    expect(results.filter(r => !('error' in r)).length).toBe(5);  
  });
});