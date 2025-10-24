import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import CharacterImage from '../components/CharacterImage';
import { useCharacters } from '../components/hooks/CharacterContext';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getCharacterById } = useCharacters();
  const imageRef = useRef<View>(null);

  // Obtener parámetros
  const characterId = params.characterId as string;
  const name = params.name as string;
  const gender = params.gender as 'catrin' | 'catrina';
  const imageIndex = parseInt(params.imageIndex as string) || 0;
  // Obtener personaje del contexto si es necesario
  const character = characterId ? getCharacterById(characterId) : null;

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      if (!imageRef.current) {
        Alert.alert('Error', 'No se pudo capturar la imagen');
        return;
      }

      // Capturar la imagen
      const uri = await captureRef(imageRef, {
        format: 'png',
        quality: 1,
      });

      console.log('Imagen capturada:', uri);

      // Verificar si Sharing está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Compartir la imagen
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `${name} ${gender === 'catrin' ? 'el Catrín' : 'la Catrina'}`,
        });
      } else {
        // Fallback a Share nativo
        await Share.share({
          message: `¡Mira mi ${gender === 'catrin' ? 'Catrín' : 'Catrina'} para el Día de Muertos! 💀🌺 Mi nombre es ${name}. ¡Crea el tuyo en Catrineando!`,
          title: `${name} ${gender === 'catrin' ? 'el Catrín' : 'la Catrina'}`,
        });
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir el personaje');
    }
  };

  const handleDownload = async () => {
    try {
      if (!imageRef.current) {
        Alert.alert('Error', 'No se pudo capturar la imagen');
        return;
      }

      // Capturar la imagen
      const uri = await captureRef(imageRef, {
        format: 'png',
        quality: 1,
      });

      console.log('Imagen capturada para descargar:', uri);

      // En iOS/Android, guardar en la galería requiere permisos
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // Por ahora solo compartir, ya que guardar en galería requiere permisos adicionales
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Guardar imagen',
          });
        } else {
          Alert.alert('Éxito', 'Imagen lista para guardar');
        }
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      Alert.alert('Error', 'No se pudo descargar la imagen');
    }
  };

  const handleCreateAnother = () => {
    router.push('/form');
  };

  const handleViewGallery = () => {
    router.push('/(tabs)/galery');
  };

  const displayName = character?.name || name || 'Tu personaje';
  const displayGender = character?.gender || gender || 'catrin';

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Título con animación */}
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>
              ¡Tu {displayGender === 'catrin' ? 'Catrín' : 'Catrina'} está listo!
            </Text>
          </Animated.View>

          {/* Tarjeta del personaje con animación */}
          <Animated.View
            style={[
              styles.characterCardContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={
                displayGender === 'catrin'
                  ? ['#E9D5FF', '#FED7AA']
                  : ['#FBCFE8', '#FED7AA']
              }
              style={styles.characterCard}
            >
              <View style={styles.characterContent} ref={imageRef} collapsable={false}>
                {/* Imagen del personaje */}
                <CharacterImage
                  name={displayName}
                  gender={displayGender}
                  imageIndex={imageIndex}
                  showName={true}
                  size="large"
                />

                {/* Tipo de personaje */}
                <Text style={styles.characterType}>
                  {displayGender === 'catrin' ? 'El Catrín' : 'La Catrina'}
                </Text>

                {/* Elementos decorativos */}
                <View style={styles.decorativeElements}>
                  <Text style={styles.decorativeFlower}>🌺</Text>
                  <Text style={styles.decorativeStar}>✨</Text>
                  <Text style={styles.decorativeFlower}>🌼</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Mensaje de éxito */}
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.successText}>
              Tu personaje ha sido guardado en tu galería
            </Text>
          </View>

          {/* Botones de acción */}
          <Animated.View 
            style={[
              styles.actionButtons,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.primaryButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social" size={20} color="#F97316" />
                <Text style={styles.shareButtonText}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                <Ionicons name="download" size={20} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>Descargar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.createAnotherButton}
              onPress={handleCreateAnother}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" />
              <Text style={styles.createAnotherText}>Crear otro personaje</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handleViewGallery}
              activeOpacity={0.8}
            >
              <Text style={styles.galleryButtonText}>Ver mi galería</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  characterCardContainer: {
    marginBottom: 24,
  },
  characterCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  characterContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  characterType: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 16,
  },
  decorativeElements: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  decorativeFlower: {
    fontSize: 24,
  },
  decorativeStar: {
    fontSize: 20,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F97316',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F97316',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    gap: 8,
  },
  createAnotherText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  galleryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});