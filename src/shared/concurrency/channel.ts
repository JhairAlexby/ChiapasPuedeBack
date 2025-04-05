import { Mutex } from './mutex';
import { Condition } from './condition';


export class Channel<T> {
  private buffer: T[] = [];
  private mutex = new Mutex();
  private notEmpty = new Condition(this.mutex);
  private notFull = new Condition(this.mutex);
  private closed = false;

  constructor(private capacity: number = Infinity) {}

  
  async send(value: T): Promise<void> {
    const release = await this.mutex.acquire();
    
    try {
      if (this.closed) {
        throw new Error('No se puede enviar a un canal cerrado');
      }
      
      // Esperar si el buffer está lleno
      while (this.buffer.length >= this.capacity) {
        await this.notFull.wait();
        
        // Re-verificar si el canal fue cerrado mientras esperaba
        if (this.closed) {
          throw new Error('No se puede enviar a un canal cerrado');
        }
      }
      
      this.buffer.push(value);
      
      this.notEmpty.signal();
    } finally {
      release();
    }
  }

  /**
   * Recibe un valor del canal
   * Bloquea si el canal está vacío hasta que haya datos
   * @returns El valor recibido o undefined si el canal está cerrado y vacío
   */
  async receive(): Promise<T | undefined> {
    const release = await this.mutex.acquire();
    
    try {
      // Esperar si el buffer está vacío y el canal no está cerrado
      while (this.buffer.length === 0) {
        if (this.closed) {
          return undefined;
        }
        await this.notEmpty.wait();
      }
      
      // Obtener valor del buffer
      const value = this.buffer.shift();
      
      // Señalar que el canal ya no está lleno
      this.notFull.signal();
      
      return value;
    } finally {
      release();
    }
  }

  /**
   * Cierra el canal
   * No se podrán enviar más valores, pero se pueden recibir los pendientes
   */
  async close(): Promise<void> {
    const release = await this.mutex.acquire();
    
    try {
      if (!this.closed) {
        this.closed = true;
        // Despertar a todos los receptores para que sepan que el canal está cerrado
        this.notEmpty.broadcast();
        // Despertar a todos los emisores para que reciban el error
        this.notFull.broadcast();
      }
    } finally {
      release();
    }
  }

  /**
   * Verifica si el canal está cerrado
   */
  isClosed(): boolean {
    return this.closed;
  }

  /**
   * Retorna el número de elementos en el buffer
   */
  size(): number {
    // No necesitamos mutex aquí porque solo es informativo
    return this.buffer.length;
  }
}