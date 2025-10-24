// src/app/form.tsx
import { useCharacters } from '@/components/hooks/CharacterContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gender } from '../types';

export default function FormScreen() {
  const router = useRouter();
  const { addCharacter } = useCharacters();
  
  const [name, setName] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }
    
    if (!selectedGender) {
      Alert.alert('Error', 'Por favor selecciona un personaje');
      return;
    }

    setIsLoading(true);
    
    try {
      const imageIndex = Math.floor(Math.random() * 2);
      
      const newCharacter = await addCharacter({
        name: name.trim(),
        gender: selectedGender,
        imageIndex,
      });

      router.push({
        pathname: '/loading',
        params: {
          characterId: newCharacter.id,
          name: newCharacter.name,
          gender: newCharacter.gender,
          imageIndex: newCharacter.imageIndex.toString(),
        }
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el personaje');
      console.error('Error creating character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cuéntanos sobre ti</Text>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={() => router.push('/(tabs)/galery')}
              >
                <Ionicons name="images-outline" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tu nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu nombre aquí"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={handleNameChange}
                  maxLength={20}
                  autoCapitalize="words"
                  editable={!isLoading}
                  autoCorrect={false}
                />
                {name.length > 0 && (
                  <Text style={styles.characterCount}>
                    {name.length}/20
                  </Text>
                )}
              </View>

              <View style={styles.genderContainer}>
                <Text style={styles.label}>Selecciona tu personaje</Text>
                <View style={styles.genderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      selectedGender === 'catrin' && styles.genderButtonSelected,
                    ]}
                    onPress={() => handleGenderSelect('catrin')}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Text style={styles.genderEmoji}>🎩</Text>
                    <Text
                      style={[
                        styles.genderText,
                        selectedGender === 'catrin' && styles.genderTextSelected,
                      ]}
                    >
                      Catrín
                    </Text>
                    {selectedGender === 'catrin' && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      selectedGender === 'catrina' && styles.genderButtonSelected,
                    ]}
                    onPress={() => handleGenderSelect('catrina')}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Text style={styles.genderEmoji}>👗</Text>
                    <Text
                      style={[
                        styles.genderText,
                        selectedGender === 'catrina' && styles.genderTextSelected,
                      ]}
                    >
                      Catrina
                    </Text>
                    {selectedGender === 'catrina' && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>
                  Tu personaje será único y podrás compartirlo con tus amigos
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (!name.trim() || !selectedGender || isLoading) && styles.generateButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!name.trim() || !selectedGender || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Text style={styles.generateButtonText}>Creando...</Text>
                ) : (
                  <Text style={styles.generateButtonText}>Generar mi personaje</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  galleryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  characterCount: {
    position: 'absolute',
    right: 12,
    bottom: 16,
    fontSize: 12,
    color: '#9CA3AF',
  },
  genderContainer: {
    marginBottom: 32,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  genderButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  genderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  genderTextSelected: {
    color: '#8B5CF6',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 20,
  },
  generateButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});