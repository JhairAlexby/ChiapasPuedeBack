import { Mutex } from './mutex';

/**
 * Implementación de Variable de Condición
 * Permite que los hilos esperen hasta que una condición se cumpla
 */
export class Condition {
  private mutex: Mutex;
  private waitQueue: Array<(value: unknown) => void> = [];

  constructor(mutex?: Mutex) {
    this.mutex = mutex || new Mutex();
  }

  /**
   * Espera a que la condición se cumpla
   * Libera el mutex mientras espera y lo vuelve a adquirir al despertar
   */
  async wait(): Promise<void> {
    // Crear promesa para la espera
    let resolver: (value: unknown) => void;
    const waiter = new Promise(resolve => {
      resolver = resolve;
    });
    
    // Añadir a la cola de espera
    this.waitQueue.push(resolver!);
    
    // Liberar mutex mientras espera
    const mutex = this.mutex;
    mutex['release']();
    
    // Esperar señal
    await waiter;
    
    // Reacquirir mutex al despertar
    await mutex.acquire();
  }

  /**
   * Despierta a un hilo que esté esperando
   */
  signal(): void {
    if (this.waitQueue.length > 0) {
      const nextResolve = this.waitQueue.shift();
      if (nextResolve) {
        nextResolve(undefined);
      }
    }
  }

  /**
   * Despierta a todos los hilos que estén esperando
   */
  broadcast(): void {
    for (const resolve of this.waitQueue) {
      resolve(undefined);
    }
    this.waitQueue = [];
  }
}