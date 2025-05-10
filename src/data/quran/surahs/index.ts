import { Surah } from '../../../lib/quran-api';
import { surahs } from '../../surahs';
import { AlFatiha } from './al-fatiha';
import { AlBaqarah } from './al-baqarah';

// Create a mapping of surah metadata
export const SURAH_METADATA = surahs.reduce((acc, surah, index) => {
  acc[index + 1] = surah;
  return acc;
}, {} as { [key: number]: Surah });

// Export all surahs in an object keyed by surah number
export const QURAN_DATA: { [key: string]: Surah } = {
  "1": AlFatiha,
  "2": AlBaqarah,
  // Additional surahs will be loaded dynamically
};

// Function to get surah metadata
export function getSurahMetadata(surahNumber: number): Surah | null {
  return SURAH_METADATA[surahNumber] || null;
}

// Function to get audio URL for a specific ayah
export function getAudioUrl(surahNumber: number, ayahNumber: number, reciterId: string = "1"): string {
  // Format surah and ayah numbers with leading zeros
  const formattedSurah = surahNumber.toString().padStart(3, '0');
  const formattedAyah = ayahNumber.toString().padStart(3, '0');
  
  // Map reciter IDs to their paths
  const reciterPaths: { [key: string]: string } = {
    "1": "Alafasy_128kbps",
    "2": "Abu_Bakr_Ash-Shaatree_128kbps",
    "3": "Nasser_Alqatami_128kbps",
    "4": "Yasser_Ad-Dussary_128kbps"
  };
  
  const reciterPath = reciterPaths[reciterId] || reciterPaths["1"];
  
  return `https://everyayah.com/data/${reciterPath}/${formattedSurah}${formattedAyah}.mp3`;
}

// Export individual surahs
export {
  AlFatiha,
  AlBaqarah,
};
