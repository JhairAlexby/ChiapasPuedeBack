/**
 * Modelo que representa la respuesta de un estudiante a un ejercicio
 */
export interface StudentResponse {
    studentId: string;
    exerciseId: string;
    answer: string;
    responseTimeMs: number;
    timestamp: Date;
  }