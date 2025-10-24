import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {

  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>💀</Text>
            </View>
          </View>

          {/* Título */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              <Text style={styles.titleC}>C</Text>
              <Text style={styles.titleA}>a</Text>
              <Text style={styles.titleT}>t</Text>
              <Text style={styles.titleR}>r</Text>
              <Text style={styles.titleI}>i</Text>
              <Text style={styles.titleN}>n</Text>
              <Text style={styles.titleE}>e</Text>
              <Text style={styles.titleA2}>a</Text>
              <Text style={styles.titleN2}>n</Text>
              <Text style={styles.titleD}>d</Text>
              <Text style={styles.titleO}>o</Text>
            </Text>
            <View style={styles.decorativeElements}>
              <Text style={styles.decorativeFlower}>🌺</Text>
              <Text style={styles.decorativeSkull}>💀</Text>
              <Text style={styles.decorativeFlower}>🌺</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Crea tu Catrín o Catrina personalizada
          </Text>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/form")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Comenzar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/tutorial")}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle-outline" size={20} color="#F97316" />
              <Text style={styles.secondaryButtonText}>Ver Tutorial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={() => router.push("/galery")}
              activeOpacity={0.8}
            >
              <Ionicons name="images-outline" size={20} color="#8B5CF6" />
              <Text style={styles.tertiaryButtonText}>Mi Galería</Text>
            </TouchableOpacity>
          </View>

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconText: {
    fontSize: 60,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleC: {
    color: '#F97316',
    fontSize: 48,
  },
  titleA: {
    color: '#EF4444',
    fontSize: 42,
  },
  titleT: {
    color: '#8B5CF6',
    fontSize: 44,
  },
  titleR: {
    color: '#EC4899',
    fontSize: 42,
  },
  titleI: {
    color: '#F59E0B',
    fontSize: 46,
  },
  titleN: {
    color: '#10B981',
    fontSize: 42,
  },
  titleE: {
    color: '#F97316',
    fontSize: 44,
  },
  titleA2: {
    color: '#8B5CF6',
    fontSize: 42,
  },
  titleN2: {
    color: '#EF4444',
    fontSize: 46,
  },
  titleD: {
    color: '#EC4899',
    fontSize: 42,
  },
  titleO: {
    color: '#F59E0B',
    fontSize: 44,
  },
  decorativeElements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  decorativeFlower: {
    fontSize: 20,
  },
  decorativeSkull: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tertiaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});