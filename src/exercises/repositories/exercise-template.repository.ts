import { Injectable, Logger } from '@nestjs/common'; // <-- CORREGIDO: Logger importado aquí
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
  // Agregamos un logger para el método findTemplateById si es necesario
  private logger = new Logger(ExerciseTemplateRepository.name); // Ahora Logger es reconocido

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

  /**
   * Obtiene una lista de plantillas únicas para un nivel dado.
   * Recopila todas las plantillas del nivel, las mezcla y devuelve la cantidad solicitada.
   * @param level Nivel de dificultad
   * @param count Número máximo de plantillas a devolver
   * @returns Promesa con un array de plantillas únicas
   */
  async getTemplatesForLevel(level: DifficultyLevel, count: number): Promise<ExerciseTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simular latencia

    const allTemplatesForLevel: ExerciseTemplate[] = [];
    // Asegurarse de que this.templates[level] exista antes de intentar obtener sus claves
    const levelTemplates = this.templates[level];
    if (!levelTemplates) {
        return []; // Si no hay plantillas para el nivel, devolver array vacío
    }
    const typesForLevel = Object.keys(levelTemplates) as ExerciseType[];

    // Recopilar todas las plantillas disponibles para el nivel
    typesForLevel.forEach(type => {
      // Acceder de forma segura a las plantillas por tipo
      const templatesOfType = levelTemplates[type];
      if (templatesOfType) {
        allTemplatesForLevel.push(...templatesOfType);
      }
    });

    // Si no se encontraron plantillas, devolver array vacío
    if (allTemplatesForLevel.length === 0) {
      return [];
    }

    // Mezclar las plantillas para aleatoriedad (Fisher-Yates shuffle)
    const shuffledTemplates = [...allTemplatesForLevel];
    for (let i = shuffledTemplates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTemplates[i], shuffledTemplates[j]] = [shuffledTemplates[j], shuffledTemplates[i]];
    }

    // Devolver la cantidad solicitada, asegurándose de no exceder las disponibles
    // y sin duplicados (ya que partimos de la lista completa sin repetir)
    return shuffledTemplates.slice(0, Math.min(count, shuffledTemplates.length));
  }

  /**
   * Busca una plantilla de ejercicio por su ID en todos los niveles y tipos.
   * @param templateId El ID de la plantilla a buscar.
   * @returns La plantilla encontrada y su nivel, o null si no se encuentra.
   */
  async findTemplateById(templateId: string): Promise<{ template: ExerciseTemplate, level: DifficultyLevel } | null> {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simular latencia

    for (const level of Object.keys(this.templates) as DifficultyLevel[]) {
        const levelTemplates = this.templates[level];
        if (!levelTemplates) continue;

        for (const type of Object.keys(levelTemplates) as ExerciseType[]) {
            // Acceder de forma segura a las plantillas por tipo
            const templatesOfType = levelTemplates[type];
            if (templatesOfType) {
                const foundTemplate = templatesOfType.find(t => t.id === templateId);
                if (foundTemplate) {
                    // Asegurarse que la plantilla encontrada tenga una respuesta correcta definida
                    if (foundTemplate.correctAnswer !== undefined) {
                      return { template: foundTemplate, level: level };
                    } else {
                      // Si se encuentra la plantilla pero no tiene respuesta correcta, loguear y continuar buscando (o manejar como error)
                      this.logger.warn(`Plantilla encontrada con ID ${templateId} pero sin correctAnswer definida.`);
                    }
                }
            }
        }
    }
    this.logger.warn(`No se encontró ninguna plantilla con ID ${templateId} y correctAnswer definida.`);
    return null; // No encontrado o sin respuesta correcta
  }
}