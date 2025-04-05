import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { Exercise } from '../domain/models/exercise.model';
import { Semaphore } from '../shared/concurrency/semaphore';
import { Channel } from '../shared/concurrency/channel';

@Injectable()
export class ExerciseQueueService {
  private logger = new Logger(ExerciseQueueService.name);
  private exerciseSubject = new Subject<Exercise>();
  private exerciseChannel = new Channel<Exercise>(20); // Buffer para 20 ejercicios
  private semaphore = new Semaphore(10); // Limitar a 10 ejercicios concurrentes en cola

  constructor() {
    // Iniciar worker que consume del canal y publica en el Subject
    this.startChannelConsumer();
  }

  private async startChannelConsumer() {
    // Consumir del canal y publicar en el Subject de forma asíncrona
    (async () => {
      while (true) {
        try {
          const exercise = await this.exerciseChannel.receive();
          if (exercise) {
            this.exerciseSubject.next(exercise);
          } else {
            // Canal cerrado, finalizar
            break;
          }
        } catch (error) {
          this.logger.error(`Error consumiendo del canal: ${error.message}`);
          // Esperar un poco antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    })();
  }

  // Productor: Añade ejercicios a la cola
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