import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import CharacterImage from '../../components/CharacterImage';
import { useCharacters } from '../../components/hooks/CharacterContext';
import { Character } from '../../types';
type GalleryItem = Character | { id: 'add-new' };

// Mapa de refs para cada tarjeta
const cardRefs = new Map<string, React.RefObject<View>>();

export default function GaleryScreen() {
  const router = useRouter();
  const { characters, deleteCharacter, deleteAllCharacters } = useCharacters();

  console.log('GalleryScreen: Personajes actuales:', characters);
  console.log('GalleryScreen: Total:', characters.length);

  // Crear refs para cada personaje
  const getCardRef = (id: string) => {
    if (!cardRefs.has(id)) {
      cardRefs.set(id, React.createRef<View>());
    }
    return cardRefs.get(id)!;
  };

  const handleDelete = (id: string, name: string): void => {
    Alert.alert(
      'Eliminar personaje',
      `¿Estás seguro de eliminar a ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCharacter(id),
        },
      ]
    );
  };

  const handleDeleteAll = (): void => {
    if (characters.length === 0) return;
    
    Alert.alert(
      'Eliminar todos',
      '¿Estás seguro de eliminar todos los personajes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todos',
          style: 'destructive',
          onPress: () => deleteAllCharacters(),
        },
      ]
    );
  };

  const handleShare = async (item: Character) => {
    try {
      const cardRef = getCardRef(item.id);
      
      if (!cardRef.current) {
        Alert.alert('Error', 'No se pudo capturar la imagen');
        return;
      }

      // Capturar la tarjeta completa
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      console.log('Imagen capturada:', uri);

      // Verificar si Sharing está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `${item.name} ${item.gender === 'catrin' ? 'el Catrín' : 'la Catrina'}`,
        });
      } else {
        Alert.alert('Error', 'No se puede compartir en este dispositivo');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir el personaje');
    }
  };

  const renderCharacterCard = (item: Character, index: number) => {
    const gradients: [string, string][] = [
      ['#E9D5FF', '#FED7AA'],
      ['#FBCFE8', '#FED7AA'],
      ['#BFDBFE', '#E9D5FF'],
    ];
    const gradient = gradients[index % gradients.length];

    return (
      <View style={styles.cardWrapper}>
        <LinearGradient colors={gradient} style={styles.card}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.characterContainer}>
            <CharacterImage
              name={item.name}
              gender={item.gender}
              imageIndex={(item as any).imageIndex || 0}
              showName={false}
              size="small"
            />
            <Text style={styles.characterName}>{item.name}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push({
                pathname: '/result',
                params: {
                  characterId: item.id,
                  name: item.name,
                  gender: item.gender,
                  imageIndex: item.imageIndex?.toString() || '0',
                }
              })}
            >
              <Text style={styles.viewButtonText}>Ver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => router.push({
                pathname: '/share',
                params: {
                  characterId: item.id,
                  name: item.name,
                  gender: item.gender,
                }
              })}
            >
              <Ionicons name="share-outline" size={18} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎨</Text>
      <Text style={styles.emptyTitle}>No hay personajes</Text>
      <Text style={styles.emptyText}>
        Crea tu primer Catrín o Catrina para comenzar tu colección
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/form')}
      >
        <Text style={styles.createButtonText}>Crear personaje</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddCard = () => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.addCard}
        onPress={() => router.push('/form')}
      >
        <Ionicons name="add" size={48} color="#D1D5DB" />
        <Text style={styles.addCardText}>Crear nuevo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem: ListRenderItem<GalleryItem> = ({ item, index }) => {
    if ('gender' in item) {
      const characterIndex = characters.findIndex(char => char.id === item.id);
      return renderCharacterCard(item, characterIndex);
    }
    return renderAddCard();
  };

  const data: GalleryItem[] = characters.length > 0 
    ? [...characters, { id: 'add-new' }] 
    : [];

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FAE8FF', '#EDE9FE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Galería</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/form')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {characters.length > 0 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {characters.length} {characters.length === 1 ? 'personaje creado' : 'personajes creados'}
            </Text>
          </View>
        )}

        {characters.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {characters.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
            >
              <Text style={styles.deleteAllText}>Eliminar todos</Text>
            </TouchableOpacity>
          </View>
        )}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  counterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: '50%',
    padding: 8,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  characterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  characterType: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    aspectRatio: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F97316',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});