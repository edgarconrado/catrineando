export type Gender = 'catrin' | 'catrina';

export interface Character {
  id: string;
  name: string;
  gender: Gender;
  imageIndex: number;
  imageUri?: string;
  createdAt: string;
}

export interface CharacterContextType {
  characters: Character[];
  loading: boolean;
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => Promise<Character>;
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