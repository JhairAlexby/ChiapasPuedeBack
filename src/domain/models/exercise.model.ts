export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
  }
  
  export enum ExerciseType {
    LETTER_RECOGNITION = 'letter_recognition',
    SYLLABLE_FORMATION = 'syllable_formation',
    WORD_COMPLETION = 'word_completion',
    SENTENCE_FORMATION = 'sentence_formation',
    TEXT_COMPREHENSION = 'text_comprehension',
  }
  
  export interface Exercise {
    id: string;
    type: ExerciseType;
    difficultyLevel: DifficultyLevel;
    content: string;
    options?: string[];
    correctAnswer: string;
    timeLimit?: number;
  }
  