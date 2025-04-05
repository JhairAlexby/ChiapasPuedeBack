import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { Exercise } from '../domain/models/exercise.model';
import { Semaphore } from '../shared/concurrency/semaphore';
import { Channel } from '../shared/concurrency/channel';

@Injectable()
export class ExerciseQueueService {
  private logger = new Logger(ExerciseQueueService.name);
  private exerciseSubject = new Subject<Exercise>();
  private exerciseChannel = new Channel<Exercise>(20); 
  private semaphore = new Semaphore(10); 

  constructor() {
    this.startChannelConsumer();
  }

  private async startChannelConsumer() {
    (async () => {
      while (true) {
        try {
          const exercise = await this.exerciseChannel.receive();
          if (exercise) {
            this.exerciseSubject.next(exercise);
          } else {
            break;
          }
        } catch (error) {
          this.logger.error(`Error consumiendo del canal: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    })();
  }

  async enqueueExercise(exercise: Exercise): Promise<void> {
    try {
      await this.semaphore.acquire();
      this.logger.debug(`Encolando ejercicio: ${exercise.id}`);
      
      // Usar el canal para envío con backpressure
      await this.exerciseChannel.send(exercise);
    } finally {
      this.semaphore.release();
    }
  }

  // Consumidor: Observable para que los servicios puedan suscribirse
  getExerciseStream(): Observable<Exercise> {
    return this.exerciseSubject.asObservable();
  }

  // Cierra la cola y libera recursos al detener la aplicación
  onModuleDestroy() {
    this.exerciseChannel.close();
  }
}