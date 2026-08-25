export type Gender = 'catrin' | 'catrina';

export interface Character {
  id: string;
  name: string;
  gender: Gender;
  imageIndex: number;      // Índice de la imagen prediseñada (fallback)
  imageUri?: string;       // Ruta local de la catrina generada con IA
  fromPhoto?: boolean;     // true si nació de una selfie
  createdAt: string;
}

export interface CharacterContextType {
  characters: Character[];
  loading: boolean;
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => Promise<Character>;
  updateCharacter: (id: string, patch: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  deleteAllCharacters: () => Promise<void>;
  getCharacterById: (id: string) => Character | undefined;
}

export interface TutorialStep {
  id: number;
  emoji: string;
  title: string;
  description: string;
}
