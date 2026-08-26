// src/components/LoginSheet.tsx
//
// Hoja de inicio de sesión. Se muestra cuando el usuario va a comprar créditos
// o desde ajustes. NO se muestra al abrir la app: obligar a registrarse antes
// de ver el producto mata la conversión.

import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  appleDisponible,
  entrarConApple,
  entrarConGoogle,
  mensajeDeError,
} from '../services/authService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  motivo?: string;
}

export default function LoginSheet({ visible, onClose, onSuccess, motivo }: Props) {
  const [cargando, setCargando] = useState<'apple' | 'google' | null>(null);
  const [hayApple, setHayApple] = useState(false);

  useEffect(() => {
    appleDisponible()
      .then(setHayApple)
      .catch(() => setHayApple(false));
  }, []);

  const manejar = async (proveedor: 'apple' | 'google') => {
    setCargando(proveedor);
    try {
      if (proveedor === 'apple') await entrarConApple();
      else await entrarConGoogle();

      onSuccess?.();
      onClose();
    } catch (e: any) {
      const msg = mensajeDeError(e);
      if (msg) Alert.alert('No se pudo entrar', msg);
    } finally {
      setCargando(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.cerrar} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          <Text style={styles.emoji}>💀</Text>
          <Text style={styles.titulo}>Guarda tus catrinas</Text>
          <Text style={styles.subtitulo}>
            {motivo ??
              'Crea tu cuenta para que tus créditos y tus catrinas te sigan aunque cambies de teléfono.'}
          </Text>

          {hayApple && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.botonApple}
              onPress={() => manejar('apple')}
            />
          )}

          <TouchableOpacity
            style={styles.botonGoogle}
            onPress={() => manejar('google')}
            disabled={cargando !== null}
            activeOpacity={0.8}
          >
            {cargando === 'google' ? (
              <ActivityIndicator color="#1F2937" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#1F2937" />
                <Text style={styles.textoGoogle}>Continuar con Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.despues}>
            <Text style={styles.textoDespues}>Ahora no</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Solo usamos tu cuenta para guardar tus créditos. No publicamos nada.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  cerrar: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  botonApple: {
    width: '100%',
    height: 52,
    marginBottom: 12,
  },
  botonGoogle: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  textoGoogle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  despues: {
    marginTop: 20,
    padding: 8,
  },
  textoDespues: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  legal: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
});
