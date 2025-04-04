import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { Exercise } from '../domain/models/exercise.model';
import { Semaphore } from '../shared/concurrency/semaphore';

@Injectable()
export class ExerciseQueueService {
  private logger = new Logger(ExerciseQueueService.name);
  private exerciseQueue: Subject<Exercise> = new Subject<Exercise>();
  private semaphore = new Semaphore(10); // Limitar a 10 ejercicios concurrentes en cola

  // Productor: Añade ejercicios a la cola
  async enqueueExercise(exercise: Exercise): Promise<void> {
    try {
      await this.semaphore.acquire();
      this.logger.debug(`Enqueueing exercise: ${exercise.id}`);
      this.exerciseQueue.next(exercise);
    } finally {
      this.semaphore.release();
    }
  }

  // Consumidor: Observable para que los servicios puedan suscribirse
  getExerciseStream(): Observable<Exercise> {
    return this.exerciseQueue.asObservable();
  }
}