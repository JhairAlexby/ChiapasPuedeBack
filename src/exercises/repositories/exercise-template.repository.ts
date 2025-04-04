import { Injectable } from '@nestjs/common';
import { DifficultyLevel, ExerciseType, Exercise } from '../../domain/models/exercise.model';
import { v4 as uuidv4 } from 'uuid';

// Interfaz para las plantillas de ejercicios
interface ExerciseTemplate {
  id: string;
  type: ExerciseType;
  content: string;
  options?: string[];
  correctAnswer: string;
}

@Injectable()
export class ExerciseTemplateRepository {
  // Simulación de base de datos de plantillas
  // Usando Partial para indicar que puede tener solo algunos tipos de ejercicios
  private templates: Record<DifficultyLevel, Partial<Record<ExerciseType, ExerciseTemplate[]>>> = {
    [DifficultyLevel.BEGINNER]: {
      [ExerciseType.LETTER_RECOGNITION]: [
        {
          id: uuidv4(),
          type: ExerciseType.LETTER_RECOGNITION,
          content: '¿Qué letra es esta? A',
          options: ['A', 'E', 'I', 'O'],
          correctAnswer: 'A',
        },
        {
          id: uuidv4(),
          type: ExerciseType.LETTER_RECOGNITION,
          content: '¿Qué letra es esta? M',
          options: ['M', 'N', 'P', 'R'],
          correctAnswer: 'M',
        },
      ],
      [ExerciseType.SYLLABLE_FORMATION]: [
        {
          id: uuidv4(),
          type: ExerciseType.SYLLABLE_FORMATION,
          content: 'Forma una sílaba con la letra M y una vocal',
          options: ['MA', 'LA', 'TA', 'PA'],
          correctAnswer: 'MA',
        },
        {
          id: uuidv4(),
          type: ExerciseType.SYLLABLE_FORMATION,
          content: 'Forma una sílaba con la letra P y una vocal',
          options: ['PE', 'DE', 'BE', 'FE'],
          correctAnswer: 'PE',
        },
      ],
    },
    [DifficultyLevel.INTERMEDIATE]: {
      [ExerciseType.WORD_COMPLETION]: [
        {
          id: uuidv4(),
          type: ExerciseType.WORD_COMPLETION,
          content: 'Completa la palabra: CA_A',
          options: ['S', 'M', 'R', 'L'],
          correctAnswer: 'S',
        },
        {
          id: uuidv4(),
          type: ExerciseType.WORD_COMPLETION,
          content: 'Completa la palabra: PE_RO',
          options: ['R', 'S', 'D', 'L'],
          correctAnswer: 'R',
        },
      ],
      [ExerciseType.SYLLABLE_FORMATION]: [
        {
          id: uuidv4(),
          type: ExerciseType.SYLLABLE_FORMATION,
          content: 'Forma una sílaba con las letras TR y una vocal',
          options: ['TRA', 'BRA', 'FRA', 'GRA'],
          correctAnswer: 'TRA',
        },
      ],
    },
    [DifficultyLevel.ADVANCED]: {
      [ExerciseType.SENTENCE_FORMATION]: [
        {
          id: uuidv4(),
          type: ExerciseType.SENTENCE_FORMATION,
          content: 'Ordena las palabras para formar una oración: gato el duerme sofá en el',
          correctAnswer: 'El gato duerme en el sofá',
        },
        {
          id: uuidv4(),
          type: ExerciseType.SENTENCE_FORMATION,
          content: 'Ordena las palabras para formar una oración: escuela voy a la yo',
          correctAnswer: 'Yo voy a la escuela',
        },
      ],
      [ExerciseType.TEXT_COMPREHENSION]: [
        {
          id: uuidv4(),
          type: ExerciseType.TEXT_COMPREHENSION,
          content: 'Lee el siguiente texto y responde: "María juega en el parque con su pelota roja". ¿De qué color es la pelota de María?',
          options: ['Roja', 'Azul', 'Verde', 'Amarilla'],
          correctAnswer: 'Roja',
        },
      ],
    },
  };

  async getRandomTemplate(
    level: DifficultyLevel,
    type: ExerciseType,
  ): Promise<ExerciseTemplate> {
    // Simular latencia de base de datos
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const templatesForType = this.templates[level]?.[type] || [];
    
    if (templatesForType.length === 0) {
      throw new Error(`No templates found for level ${level} and type ${type}`);
    }
    
    // Seleccionar aleatoriamente
    const randomIndex = Math.floor(Math.random() * templatesForType.length);
    return templatesForType[randomIndex];
  }

  async getTemplatesForLevel(level: DifficultyLevel, count: number): Promise<ExerciseTemplate[]> {
    // Simular latencia de base de datos
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const result: ExerciseTemplate[] = [];
    const typesForLevel = Object.keys(this.templates[level] || {}) as ExerciseType[];
    
    if (typesForLevel.length === 0) {
      return [];
    }
    
    // Obtener ejercicios distribuidos entre los tipos disponibles
    for (let i = 0; i < count; i++) {
      const type = typesForLevel[i % typesForLevel.length];
      const templates = this.templates[level][type];
      if (templates && templates.length > 0) {
        const index = i % templates.length;
        result.push(templates[index]);
      }
    }
    
    return result;
  }
}