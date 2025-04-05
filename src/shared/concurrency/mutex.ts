/**
 * Implementación de Mutex para control de concurrencia
 * Permite acceso exclusivo a recursos compartidos
 */
export class Mutex {
    private locked: boolean = false;
    private waitQueue: Array<(value: unknown) => void> = [];
  
    /**
     * Adquiere el lock del mutex
     * @returns Una función para liberar el lock
     */
    async acquire(): Promise<() => void> {
      // Si el mutex está bloqueado, esperar en la cola
      if (this.locked) {
        await new Promise(resolve => this.waitQueue.push(resolve));
      }
      
      // Marcar como bloqueado
      this.locked = true;
      
      // Devolver función de liberación
      return () => this.release();
    }
  
    /**
     * Libera el lock del mutex
     * Despierta al siguiente en la cola de espera si existe
     */
    private release(): void {
      if (!this.locked) {
        throw new Error('Mutex no está bloqueado');
      }
      
      // Si hay pendientes en la cola, despertar al siguiente
      if (this.waitQueue.length > 0) {
        const nextResolve = this.waitQueue.shift();
        if (nextResolve) {
          nextResolve(undefined);
        }
      } else {
        // Si no hay pendientes, liberar el lock
        this.locked = false;
      }
    }
  
    /**
     * Ejecuta una función con el mutex bloqueado y lo libera al terminar
     * @param fn Función a ejecutar con el mutex bloqueado
     * @returns Resultado de la función
     */
    async withLock<T>(fn: () => Promise<T> | T): Promise<T> {
      const release = await this.acquire();
      try {
        return await fn();
      } finally {
        release();
      }
    }
  }