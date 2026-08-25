import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacters } from '../components/hooks/CharacterContext';
import { generarCatrinaDesdeFoto } from '../services/catrinaService';

const MENSAJES_IA = [
  '✨ Mezclando colores tradicionales...',
  '🎨 Pintando el maquillaje de calavera...',
  '🌼 Bordando el cempasúchil...',
  '💀 Ajustando el sombrero...',
  '💫 Dándole personalidad...',
];

const MENSAJES_CLASICO = [
  '✨ Mezclando colores tradicionales...',
  '🎨 Agregando detalles únicos...',
  '💫 Dándole personalidad...',
];

export default function LoadingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateCharacter } = useCharacters();

  const characterId = params.characterId as string;
  const name = params.name as string;
  const gender = params.gender as 'catrin' | 'catrina';
  const imageIndex = (params.imageIndex as string) ?? '0';
  const fotoUri = params.fotoUri as string | undefined;

  const conIA = Boolean(fotoUri);
  const mensajes = conIA ? MENSAJES_IA : MENSAJES_CLASICO;

  const [mensajeIdx, setMensajeIdx] = useState(0);

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- Animaciones decorativas ------------------------------------------
  useEffect(() => {
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
      ]),
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // La barra llega al 90 % y ahí se queda: el último 10 % lo completa la
    // respuesta real. Nada peor que una barra llena y la app esperando.
    Animated.timing(progressAnim, {
      toValue: 0.9,
      duration: conIA ? 20000 : 2600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const rotador = setInterval(
      () => setMensajeIdx(v => (v + 1) % mensajes.length),
      conIA ? 3500 : 1000,
    );
    return () => clearInterval(rotador);
  }, []);

  // --- Generación real ---------------------------------------------------
  useEffect(() => {
    let cancelado = false;

    const terminar = (imageUri?: string) => {
      if (cancelado) return;

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start(() => {
        if (cancelado) return;
        router.replace({
          pathname: '/result',
          params: {
            characterId,
            name,
            gender,
            imageIndex,
            ...(imageUri ? { imageUri } : {}),
          },
        });
      });
    };

    (async () => {
      if (!conIA) {
        // Flujo clásico: la espera es puro teatro, la dejamos corta.
        setTimeout(() => terminar(), 3000);
        return;
      }

      try {
        const imageUri = await generarCatrinaDesdeFoto(fotoUri!, gender, name);
        if (cancelado) return;
        await updateCharacter(characterId, { imageUri });
        terminar(imageUri);
      } catch (e: any) {
        // Fallback silencioso: la app nunca falla, solo cae al personaje clásico.
        if (e?.context) {
          try {
            console.warn('STATUS:', e.context.status);
            console.warn('BODY:', await e.context.text());
          } catch {}
        }
        console.warn('Falló la generación con IA, uso imagen prediseñada:', e);
        if (cancelado) return;
        await updateCharacter(characterId, { fromPhoto: false });
        terminar();
      }
    })();

    return () => {
      cancelado = true;
    };
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
              { transform: [{ scale: scaleAnim }, { rotate: spin }] },
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
          <View style={styles.floatingElements} pointerEvents="none">
            <Animated.Text style={[styles.floatingEmoji, { opacity: fadeAnim }]}>
              🌺
            </Animated.Text>
            <Animated.Text
              style={[styles.floatingEmoji, styles.floatingEmoji2, { opacity: fadeAnim }]}
            >
              🌼
            </Animated.Text>
            <Animated.Text
              style={[styles.floatingEmoji, styles.floatingEmoji3, { opacity: fadeAnim }]}
            >
              🌺
            </Animated.Text>
          </View>

          {/* Textos */}
          <Text style={styles.title}>
            {conIA ? 'Pintando tu catrina...' : 'Creando tu personaje...'}
          </Text>
          <Text style={styles.subtitle}>
            Dándole vida a {name} {gender === 'catrin' ? 'el Catrín' : 'la Catrina'}
          </Text>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                <LinearGradient
                  colors={['#F97316', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          {/* Mensaje rotativo */}
          <View style={styles.messagesContainer}>
            <Text style={styles.message}>{mensajes[mensajeIdx]}</Text>
            {conIA && (
              <Text style={styles.hint}>
                Esto puede tardar unos segundos. No cierres la app.
              </Text>
            )}
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
    marginBottom: 32,
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
    alignItems: 'center',
    width: '100%',
    gap: 12,
    minHeight: 60,
  },
  message: {
    fontSize: 15,
    color: '#8B5CF6',
    fontWeight: '500',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
