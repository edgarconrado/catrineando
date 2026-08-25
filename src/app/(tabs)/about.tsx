import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function About() {
const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header con logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>💀</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>
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
            </View>
            <Text style={styles.version}>Versión 2.0.0</Text>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#F97316" />
              <Text style={styles.sectionTitle}>¿Qué es Catrineando?</Text>
            </View>
            <Text style={styles.description}>
              Catrineando es una aplicación para celebrar el Día de Muertos de manera creativa y divertida. 
              Crea tu propio Catrín o Catrina personalizada con tu nombre y compártela con tus amigos y familia.
            </Text>
          </View>

          {/* Características */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Características</Text>
            </View>
            <View style={styles.featureList}>
              <FeatureItem icon="create" text="Crea personajes únicos con tu nombre" />
              <FeatureItem icon="images" text="Galería para guardar tus creaciones" />
              <FeatureItem icon="share-social" text="Comparte en redes sociales" />
              <FeatureItem icon="color-palette" text="Diseños coloridos y festivos" />
            </View>
          </View>

          {/* Tradición */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={24} color="#EC4899" />
              <Text style={styles.sectionTitle}>Día de Muertos</Text>
            </View>
            <Text style={styles.description}>
              El Día de Muertos es una celebración mexicana que honra a los seres queridos que han fallecido. 
              Los Catrines y Catrinas son personajes icónicos creados por José Guadalupe Posada, 
              representando que la muerte nos llega a todos por igual.
            </Text>
          </View>

          {/* Créditos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Desarrollado por</Text>
            </View>
            <Text style={styles.description}>
              Esta aplicación fue creada con 💀 para celebrar una de las tradiciones más hermosas de México.
            </Text>
          </View>

          {/* Redes sociales / Enlaces */}
{/*           <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="link" size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Síguenos</Text>
            </View>
            <View style={styles.socialLinks}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink('https://facebook.com')}
              >
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink('https://instagram.com')}
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink('https://twitter.com')}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                <Text style={styles.socialText}>Twitter</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Hecho con ❤️ en México 🇲🇽
            </Text>
            <Text style={styles.footerCopyright}>
              © 2025 Catrineando. Todos los derechos reservados.
            </Text>
            <View style={styles.decorativeFlowers}>
              <Text style={styles.flower}>🌺</Text>
              <Text style={styles.flower}>🌼</Text>
              <Text style={styles.flower}>🌺</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Componente para items de características
const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon as any} size={20} color="#F97316" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 50,
  },
  titleContainer: {
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleC: { color: '#F97316', fontSize: 40 },
  titleA: { color: '#EF4444', fontSize: 36 },
  titleT: { color: '#8B5CF6', fontSize: 38 },
  titleR: { color: '#EC4899', fontSize: 36 },
  titleI: { color: '#F59E0B', fontSize: 40 },
  titleN: { color: '#10B981', fontSize: 36 },
  titleE: { color: '#F97316', fontSize: 38 },
  titleA2: { color: '#8B5CF6', fontSize: 36 },
  titleN2: { color: '#EF4444', fontSize: 40 },
  titleD: { color: '#EC4899', fontSize: 36 },
  titleO: { color: '#F59E0B', fontSize: 38 },
  version: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
  },
  socialLinks: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  socialText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  decorativeFlowers: {
    flexDirection: 'row',
    gap: 12,
  },
  flower: {
    fontSize: 24,
  },
});