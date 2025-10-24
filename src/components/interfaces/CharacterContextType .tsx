import { Character } from "../../types";

export interface CharacterContextType {
  characters: Character[];
  loading: boolean;
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
  deleteAllCharacters: () => Promise<void>;
  getCharacterById: (id: string) => Character | undefined;
}