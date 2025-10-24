import React, { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gender } from '../types';
import { getImageByIndex } from '../utils/imageGenerator';


interface CharacterImageProps {
  name: string;
  gender: Gender;
  imageIndex: number;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
}


const CharacterImage = forwardRef<View, CharacterImageProps>(
  ({ name, gender, imageIndex, showName = true, size = 'large' }, ref) => {
    const imageSource = getImageByIndex(gender, imageIndex);
    const containerSize = {
      small: 150,
      medium: 200,
      large: 300,
    };
    const fontSize = {
      small: 16,
      medium: 24,
      large: 32,
    };
    return (
      <View ref={ref} style={styles.container}>
        <View
          style={[
            styles.imageContainer,
            {
              width: containerSize[size],
              height: containerSize[size]
            }
          ]}
        >
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
          {showName && (
            <View style={styles.nameOverlay}>
              <View style={styles.nameBadge}>
                <Text
                  style={[
                    styles.nameText,
                    { fontSize: fontSize[size] }
                  ]}
                >
                  {name}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
);

CharacterImage.displayName = 'CharacterImage';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
  },
  nameBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  nameText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});


export default CharacterImage;