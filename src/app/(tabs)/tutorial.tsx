import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TutorialStep } from '../../types';

const { width } = Dimensions.get('window');

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    emoji: '✏️',
    title: 'Ingresa tu nombre',
    description: 'Escribe tu nombre y aparecerá en tu Catrín o Catrina personalizada',
  },
  {
    id: 2,
    emoji: '🎩👗',
    title: 'Elige tu personaje',
    description: 'Selecciona si quieres un Catrín o una Catrina. Cada uno tiene su estilo único',
  },
  {
    id: 3,
    emoji: '📤',
    title: 'Comparte tu creación',
    description: 'Descarga tu personaje o compártelo en redes sociales para celebrar el Día de Muertos',
  },
];

export default function TutorialScreen() {

  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const flatListRef = useRef<FlatList<TutorialStep>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentStep(index);
  };

  const goToNextStep = (): void => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
    } else {
      router.push("/form")
    }
  };

  const goToPreviousStep = (): void => {
    if (currentStep > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentStep - 1,
        animated: true,
      });
    } else {
      router.back();
    }
  };

  const skipTutorial = (): void => {
    router.push("/form")
  };

  const renderStep = ({ item }: { item: TutorialStep }) => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.stepTitle}>{item.title}</Text>
        <Text style={styles.stepDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousStep}
          >
            <Text style={styles.backText}>← Atrás</Text>
          </TouchableOpacity>

          {/* Indicadores de paso */}
          <View style={styles.indicators}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentStep === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipTutorial}
          >
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido del tutorial */}
        <FlatList
          ref={flatListRef}
          data={TUTORIAL_STEPS}
          renderItem={renderStep}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        />

        {/* Botón siguiente */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={goToNextStep}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === TUTORIAL_STEPS.length - 1 ? '¡Empecemos!' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  indicatorActive: {
    backgroundColor: '#F97316',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '600',
  },
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stepContent: {
    alignItems: 'center',
  },
  emojiContainer: {
    width: 192,
    height: 192,
    backgroundColor: '#F5F3FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 80,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  nextButton: {
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});