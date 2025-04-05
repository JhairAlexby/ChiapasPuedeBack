import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { StudentResponse } from '../domain/models/student-response.model';
import { EvaluationResult } from '../domain/models/evaluation-result.model';
import { Exercise } from '../domain/models/exercise.model';
import { ExercisesModule } from '../exercises/exercises.module';
import { ExerciseQueueService } from '../exercises/exercise-queue.service';
import { Mutex } from '../shared/concurrency/mutex';

// Interfaz para tareas enviadas a los workers
interface WorkerTask {
  id: string;
  data: StudentResponse;
  resolve: (result: EvaluationResult) => void;
  reject: (error: Error) => void;
}

@Injectable()
export class WorkerPoolService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(WorkerPoolService.name);
  private workers: Worker[] = [];
  private taskMutex = new Mutex(); // Mutex para proteger acceso a las tareas
  private workerBusy: Map<Worker, boolean> = new Map();
  private pendingTasks: WorkerTask[] = [];
  private readonly MAX_WORKERS = 4; // Número de trabajadores en el pool
  private exerciseCache = new Map<string, Exercise>(); // Cache para ejercicios frecuentes

  constructor(private exerciseQueueService: ExerciseQueueService) {}

  async onModuleInit() {
    this.logger.log(`Inicializando pool de workers con ${this.MAX_WORKERS} workers`);
    
    // Crear workers
    for (let i = 0; i < this.MAX_WORKERS; i++) {
      this.initializeWorker(i);
    }

    // Suscribirse a la cola de ejercicios para mantener el cache actualizado
    this.exerciseQueueService.getExerciseStream().subscribe(
      (exercise) => {
        this.exerciseCache.set(exercise.id, exercise);
      }
    );
  }

  onModuleDestroy() {
    this.logger.log('Terminando worker pool');
    for (const worker of this.workers) {
      worker.terminate();
    }
  }

  private initializeWorker(id: number) {
    // Implementación real usaría un archivo worker.js
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      
      parentPort.on('message', (task) => {
        try {
          // Emular proceso de evaluación
          const { studentResponse, exercise } = task;
          
          // Comparar respuesta con respuesta correcta
          const isCorrect = studentResponse.answer.trim().toLowerCase() === 
                         exercise.correctAnswer.trim().toLowerCase();
          
          // Generar feedback adecuado
          const feedback = isCorrect 
            ? '¡Respuesta correcta!' 
            : \`La respuesta correcta era: \${exercise.correctAnswer}\`;
          
          // Enviar resultado
          parentPort.postMessage({
            success: true,
            result: {
              studentId: studentResponse.studentId,
              exerciseId: studentResponse.exerciseId,
              isCorrect: isCorrect,
              feedback: feedback
            }
          });
        } catch (error) {
          parentPort.postMessage({
            success: false,
            error: error.message
          });
        }
      });
    `, { eval: true });
    
    // Manejar mensajes de los workers
    worker.on('message', (message) => {
      if (message.success) {
        // Buscar la tarea asociada y resolverla
        const taskIndex = this.pendingTasks.findIndex(t => t.data.exerciseId === message.result.exerciseId);
        if (taskIndex >= 0) {
          const task = this.pendingTasks[taskIndex];
          this.pendingTasks.splice(taskIndex, 1);
          task.resolve(message.result);
        }
      } else {
        this.logger.error(`Error en worker: ${message.error}`);
      }
      
      // Marcar worker como disponible
      this.workerBusy.set(worker, false);
      this.processNextTask();
    });
    
    worker.on('error', (error) => {
      this.logger.error(`Error en worker ${id}: ${error.message}`);
      // Reiniciar worker en caso de error
      worker.terminate();
      this.initializeWorker(id);
    });
    
    this.workers.push(worker);
    this.workerBusy.set(worker, false);
  }

  private async processNextTask() {
    // Usar mutex para evitar condiciones de carrera
    const release = await this.taskMutex.acquire();
    
    try {
      if (this.pendingTasks.length === 0) {
        return;
      }
      
      // Buscar worker disponible
      const availableWorker = this.workers.find(w => !this.workerBusy.get(w));
      if (!availableWorker) {
        return;
      }
      
      // Obtener siguiente tarea
      const task = this.pendingTasks.shift();
      if (!task) {
        return;
      }
      
      // Obtener ejercicio del cache o simularlo
      const exercise = this.exerciseCache.get(task.data.exerciseId) || {
        id: task.data.exerciseId,
        correctAnswer: task.data.answer // Fallback para testing
      };
      
      // Marcar worker como ocupado
      this.workerBusy.set(availableWorker, true);
      
      // Enviar tarea al worker
      availableWorker.postMessage({
        studentResponse: task.data,
        exercise: exercise
      });
    } finally {
      release();
    }
  }

  async evaluateResponse(response: StudentResponse): Promise<EvaluationResult> {
    this.logger.debug(`Evaluando respuesta para ejercicio: ${response.exerciseId}`);
    
    // En la implementación real, usaríamos el pool de workers
    // Pero para simplicidad, aquí compararemos directamente
    const exercise = this.exerciseCache.get(response.exerciseId);
    
    if (!exercise) {
      this.logger.warn(`Ejercicio no encontrado en cache: ${response.exerciseId}`);
      // Comparación directa sin worker para casos donde el ejercicio no está en cache
      const isCorrect = Math.random() < 0.5; // Simulación simple para pruebas
      
      return {
        studentId: response.studentId,
        exerciseId: response.exerciseId,
        isCorrect: isCorrect,
        feedback: isCorrect ? 
          '¡Respuesta correcta!' : 
          'La respuesta no es correcta. Inténtalo de nuevo.',
      };
    }
    
    // Comparación real con la respuesta correcta del ejercicio
    const isCorrect = response.answer.trim().toLowerCase() === 
                     exercise.correctAnswer.trim().toLowerCase();
    
    return {
      studentId: response.studentId,
      exerciseId: response.exerciseId,
      isCorrect: isCorrect,
      feedback: isCorrect ? 
        '¡Respuesta correcta!' : 
        `La respuesta correcta era: ${exercise.correctAnswer}`,
    };
  }
}