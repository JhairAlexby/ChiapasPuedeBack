export class Semaphore {
    private counter: number;
    private waiting: Array<(value: unknown) => void> = [];
  
    constructor(private count: number) {
      this.counter = count;
    }
  
    async acquire(): Promise<void> {
      if (this.counter > 0) {
        this.counter--;
        return Promise.resolve();
      }
      return new Promise(resolve => {
        this.waiting.push(resolve);
      });
    }
  
    release(): void {
      this.counter++;
      if (this.waiting.length > 0 && this.counter > 0) {
        this.counter--;
        const resolve = this.waiting.shift();
        if (resolve) {
          resolve(undefined);
        }
      }
    }
  
    getPermits(): number {
      return this.counter;
    }
  }