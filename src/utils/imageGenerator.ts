import { Gender } from '../types';

// Importar las imágenes prediseñadas
const CATRIN_IMAGES = [
  require('../../assets/images/catrines/catrin-1.jpg'),
  require('../../assets/images/catrines/catrin-2.jpg'),
];

const CATRINA_IMAGES = [
  require('../../assets/images/catrinas/catrina-1.jpg'),
  require('../../assets/images/catrinas/catrina-2.jpg'),
];

/**
 * Selecciona una imagen aleatoria según el género
 */
export const getRandomImage = (gender: Gender): any => {
  const images = gender === 'catrin' ? CATRIN_IMAGES : CATRINA_IMAGES;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

/**
 * Obtiene el índice de la imagen seleccionada
 */
export const getImageIndex = (gender: Gender): number => {
  const maxImages = gender === 'catrin' ? CATRIN_IMAGES.length : CATRINA_IMAGES.length;
  return Math.floor(Math.random() * maxImages);
};

/**
 * Obtiene una imagen específica por género e índice
 */
export const getImageByIndex = (gender: Gender, index: number): any => {
  const images = gender === 'catrin' ? CATRIN_IMAGES : CATRINA_IMAGES;
  return images[index % images.length];
};