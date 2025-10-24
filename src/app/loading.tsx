import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCharacters } from '../components/hooks/CharacterContext';


export default function LoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getCharacterById } = useCharacters();
  
  // Obtener parámetros
  const characterId = params.characterId as string;
  const name = params.name as string;
  const gender = params.gender as 'catrin' | 'catrina';

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de escala (pulso)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de rotación
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animación de fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animación de barra de progreso
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Simular tiempo de "generación" y navegar al resultado
    const timer = setTimeout(() => {
      router.replace({
        pathname: '/result',
        params: {
          characterId,
          name,
          gender,
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icono animado */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#F97316', '#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Text style={styles.iconText}>💀</Text>
            </LinearGradient>
          </Animated.View>

          {/* Elementos decorativos flotantes */}
          <View style={styles.floatingElements}>
            <Animated.Text style={[styles.floatingEmoji, { opacity: fadeAnim }]}>
              🌺
            </Animated.Text>
            <Animated.Text style={[styles.floatingEmoji, styles.floatingEmoji2, { opacity: fadeAnim }]}>
              🌼
            </Animated.Text>
            <Animated.Text style={[styles.floatingEmoji, styles.floatingEmoji3, { opacity: fadeAnim }]}>
              🌺
            </Animated.Text>
          </View>

          {/* Textos */}
          <Text style={styles.title}>Creando tu personaje...</Text>
          <Text style={styles.subtitle}>
            Dándole vida a {name} {gender === 'catrin' ? 'el Catrín' : 'la Catrina'}
          </Text>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#F97316', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          {/* Mensajes motivacionales */}
          <View style={styles.messagesContainer}>
            <Text style={styles.message}>✨ Mezclando colores tradicionales...</Text>
            <Text style={styles.message}>🎨 Agregando detalles únicos...</Text>
            <Text style={styles.message}>💫 Dándole personalidad...</Text>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconText: {
    fontSize: 80,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 32,
    top: '20%',
    left: '10%',
  },
  floatingEmoji2: {
    top: '15%',
    right: '15%',
    left: 'auto',
  },
  floatingEmoji3: {
    top: '70%',
    right: '20%',
    left: 'auto',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  messagesContainer: {
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});