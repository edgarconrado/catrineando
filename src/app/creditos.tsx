// src/app/creditos.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginSheet from '../components/LoginSheet';
import { tieneCuentaPermanente } from '../services/authService';
import {
  comprar,
  comprasDisponibles,
  fueCancelacion,
  restaurarCompras,
} from '../services/comprasService';
import { obtenerSaldo, PAQUETES, Paquete } from '../services/creditosService';

export default function CreditosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Si llegamos aquí por un 402, el mensaje cambia de tono.
  const seAcabaron = params.motivo === 'sin_creditos';

  const [saldo, setSaldo] = useState<number | null>(null);
  const [comprando, setComprando] = useState<string | null>(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [tieneCuenta, setTieneCuenta] = useState(true);

  const refrescar = useCallback(async () => {
    setSaldo(await obtenerSaldo());
  }, []);

  useEffect(() => {
    refrescar();
    tieneCuentaPermanente().then(setTieneCuenta).catch(() => setTieneCuenta(true));
  }, [refrescar]);

  const manejarCompra = async (paquete: Paquete) => {
    // Sin cuenta permanente, comprar es un reembolso esperando a pasar:
    // si borra la app pierde lo pagado. Login primero, siempre.
    if (!tieneCuenta) {
      setMostrarLogin(true);
      return;
    }

    if (!comprasDisponibles) {
      Alert.alert(
        'Muy pronto',
        'Las compras estarán disponibles en unos días. Mientras tanto, tienes créditos gratis para probar.',
      );
      return;
    }

    setComprando(paquete.id);
    try {
      await comprar(paquete.id);

      // Los créditos llegan por webhook, que tarda un par de segundos.
      Alert.alert('¡Listo!', 'Tus créditos se están acreditando…');
      setTimeout(refrescar, 2500);
      setTimeout(refrescar, 6000);
    } catch (e: any) {
      if (!fueCancelacion(e)) {
        Alert.alert('No se pudo completar', e?.message ?? 'Intenta de nuevo');
      }
    } finally {
      setComprando(null);
    }
  };

  return (
    <LinearGradient colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créditos</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Saldo */}
          <View style={styles.saldoCard}>
            <Text style={styles.saldoEmoji}>💀</Text>
            {saldo === null ? (
              <ActivityIndicator color="#8B5CF6" />
            ) : (
              <>
                <Text style={styles.saldoNumero}>{saldo}</Text>
                <Text style={styles.saldoTexto}>
                  {saldo === 1 ? 'catrina disponible' : 'catrinas disponibles'}
                </Text>
              </>
            )}
          </View>

          <Text style={styles.titulo}>
            {seAcabaron ? 'Se te acabaron los créditos' : 'Consigue más catrinas'}
          </Text>
          <Text style={styles.subtitulo}>
            Cada crédito convierte una foto tuya en Catrín o Catrina.
          </Text>

          {/* Paquetes */}
          {PAQUETES.map(p => {
            const destacado = Boolean(p.etiqueta);
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.paquete, destacado && styles.paqueteDestacado]}
                onPress={() => manejarCompra(p)}
                disabled={comprando !== null}
                activeOpacity={0.85}
              >
                {destacado && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTexto}>{p.etiqueta}</Text>
                  </View>
                )}

                <View style={styles.paqueteIzq}>
                  <Text style={styles.paqueteCreditos}>{p.creditos} catrinas</Text>
                  {p.ahorro && <Text style={styles.paqueteAhorro}>{p.ahorro}</Text>}
                </View>

                {comprando === p.id ? (
                  <ActivityIndicator color="#8B5CF6" />
                ) : (
                  <Text style={[styles.paquetePrecio, destacado && styles.precioDestacado]}>
                    {p.precio}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {!tieneCuenta && (
            <View style={styles.aviso}>
              <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
              <Text style={styles.avisoTexto}>
                Necesitas una cuenta para que tus créditos no se pierdan si cambias
                de teléfono.
              </Text>
            </View>
          )}

          {comprasDisponibles && (
            <TouchableOpacity
              style={styles.restaurar}
              onPress={async () => {
                try {
                  await restaurarCompras();
                  await refrescar();
                  Alert.alert('Listo', 'Compras restauradas');
                } catch {
                  Alert.alert('Sin compras', 'No encontramos compras previas');
                }
              }}
            >
              <Text style={styles.restaurarTexto}>Restaurar compras</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.legal}>
            Los créditos no caducan y no son transferibles ni reembolsables una vez
            usados.
          </Text>
        </ScrollView>

        <LoginSheet
          visible={mostrarLogin}
          onClose={() => setMostrarLogin(false)}
          onSuccess={() => {
            setTieneCuenta(true);
            refrescar();
          }}
          motivo="Crea tu cuenta para comprar créditos y no perderlos nunca."
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  saldoCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 28,
  },
  saldoEmoji: { fontSize: 40, marginBottom: 4 },
  saldoNumero: { fontSize: 44, fontWeight: 'bold', color: '#8B5CF6' },
  saldoTexto: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  paquete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  paqueteDestacado: { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' },
  badge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  paqueteIzq: { flex: 1 },
  paqueteCreditos: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  paqueteAhorro: { fontSize: 12, color: '#059669', marginTop: 2, fontWeight: '600' },
  paquetePrecio: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  precioDestacado: { color: '#8B5CF6' },
  aviso: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18 },
  restaurar: { marginTop: 20, padding: 10, alignItems: 'center' },
  restaurarTexto: { fontSize: 13, color: '#8B5CF6', fontWeight: '600' },
  legal: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
