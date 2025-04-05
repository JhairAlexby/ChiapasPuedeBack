import { Injectable, Logger } from '@nestjs/common'; 
import { DifficultyLevel, ExerciseType, Exercise } from '../../domain/models/exercise.model';
import { v4 as uuidv4 } from 'uuid';

interface ExerciseTemplate {
  id: string;
  type: ExerciseType;
  content: string;
  options?: string[];
  correctAnswer: string;
}

@Injectable()
export class ExerciseTemplateRepository {
  private logger = new Logger(ExerciseTemplateRepository.name); 


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
    await new Promise(resolve => setTimeout(resolve, 50));

    const templatesForType = this.templates[level]?.[type] || [];

    if (templatesForType.length === 0) {
      throw new Error(`No templates found for level ${level} and type ${type}`);
    }

    const randomIndex = Math.floor(Math.random() * templatesForType.length);
    return templatesForType[randomIndex];
  }

  
  async getTemplatesForLevel(level: DifficultyLevel, count: number): Promise<ExerciseTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simular latencia

    const allTemplatesForLevel: ExerciseTemplate[] = [];
    const levelTemplates = this.templates[level];
    if (!levelTemplates) {
        return []; 
    }
    const typesForLevel = Object.keys(levelTemplates) as ExerciseType[];

    typesForLevel.forEach(type => {
      const templatesOfType = levelTemplates[type];
      if (templatesOfType) {
        allTemplatesForLevel.push(...templatesOfType);
      }
    });

    if (allTemplatesForLevel.length === 0) {
      return [];
    }

    const shuffledTemplates = [...allTemplatesForLevel];
    for (let i = shuffledTemplates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTemplates[i], shuffledTemplates[j]] = [shuffledTemplates[j], shuffledTemplates[i]];
    }

   
    return shuffledTemplates.slice(0, Math.min(count, shuffledTemplates.length));
  }

  
  async findTemplateById(templateId: string): Promise<{ template: ExerciseTemplate, level: DifficultyLevel } | null> {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simular latencia

    for (const level of Object.keys(this.templates) as DifficultyLevel[]) {
        const levelTemplates = this.templates[level];
        if (!levelTemplates) continue;

        for (const type of Object.keys(levelTemplates) as ExerciseType[]) {
            const templatesOfType = levelTemplates[type];
            if (templatesOfType) {
                const foundTemplate = templatesOfType.find(t => t.id === templateId);
                if (foundTemplate) {
                    if (foundTemplate.correctAnswer !== undefined) {
                      return { template: foundTemplate, level: level };
                    } else {
                      this.logger.warn(`Plantilla encontrada con ID ${templateId} pero sin correctAnswer definida.`);
                    }
                }
            }
        }
    }
    this.logger.warn(`No se encontró ninguna plantilla con ID ${templateId} y correctAnswer definida.`);
    return null; 
  }
}