import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from "../../types";
import { CharacterContextType } from '../interfaces/CharacterContextType ';

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar personajes guardados al iniciar
  useEffect(() => {
    loadCharacters();
  }, []);

  // Cargar personajes desde AsyncStorage
  const loadCharacters = async (): Promise<void> => {
    try {
      const savedCharacters = await AsyncStorage.getItem('characters');
      if (savedCharacters) {
        setCharacters(JSON.parse(savedCharacters));
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar personajes en AsyncStorage
  const saveCharacters = async (newCharacters: Character[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('characters', JSON.stringify(newCharacters));
    } catch (error) {
      console.error('Error saving characters:', error);
    }
  };

  // Agregar un nuevo personaje
  const addCharacter = async (
    character: Omit<Character, 'id' | 'createdAt'>
  ): Promise<Character> => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      ...character,
      createdAt: new Date().toISOString(),
    };
    
    const updatedCharacters = [...characters, newCharacter];
    setCharacters(updatedCharacters);
    await saveCharacters(updatedCharacters);
    return newCharacter;
  };

  // Eliminar un personaje
  const deleteCharacter = async (id: string): Promise<void> => {
    const updatedCharacters = characters.filter(char => char.id !== id);
    setCharacters(updatedCharacters);
    await saveCharacters(updatedCharacters);
  };

  // Eliminar todos los personajes
  const deleteAllCharacters = async (): Promise<void> => {
    setCharacters([]);
    await AsyncStorage.removeItem('characters');
  };

  // Obtener un personaje por ID
  const getCharacterById = (id: string): Character | undefined => {
    return characters.find(char => char.id === id);
  };

  const value: CharacterContextType = {
    characters,
    loading,
    addCharacter,
    deleteCharacter,
    deleteAllCharacters,
    getCharacterById,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCharacters = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
};

export default CharacterContext;