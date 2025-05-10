import { useState, useEffect } from 'react';
import { surahs } from '../data/surahs';

// Types for the Quran API response
export interface Surah {
  id: number;
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: 'Mecca' | 'Madina';
  totalAyah: number;
  startPage?: number;
  ayahs?: Ayah[];
}

export interface Ayah {
  surahNo: number;
  ayahNo: number;
  text?: string;
  english?: string;
  arabic1?: string;
  arabic2?: string;
  numberInSurah?: number;
  juz?: number;
  page?: number;
  audio?: {
    [key: string]: {
      reciter: string;
      url: string;
      originalUrl?: string;
    }
  };
}

export interface Page {
  pageNumber: number;
  imageUrl: string;
  surahInfo?: {
    id: number;
    name: string;
    englishName: string;
  };
}

export interface Reciter {
  id: string;
  name: string;
  style?: string;
}

// Function to get page image URL - simplified to use local assets
export function getPageImageUrl(pageNumber: number): string {
  // Format page number with leading zeros
  const formattedPage = pageNumber.toString().padStart(3, '0');
  
  // Return local URL
  return `/assets/quran-pages/${formattedPage}.png`;
}

// Function to get page audio URL
export function getPageAudioUrl(reciterId: string, pageNumber: number): string {
  // Format page number with leading zeros
  const formattedPage = pageNumber.toString().padStart(3, '0');
  
  // Map reciter IDs to their paths
  const reciterPaths: { [key: string]: string } = {
    "1": "Alafasy_128kbps",
    "2": "Abu_Bakr_Ash-Shaatree_128kbps",
    "3": "Nasser_Alqatami_128kbps",
    "4": "Yasser_Ad-Dussary_128kbps",
    "5": "Abdul_Basit_Mujawwad_128kbps",
    "6": "Abdul_Basit_Murattal_192kbps"
  };
  
  const reciterPath = reciterPaths[reciterId] || reciterPaths["1"];
  
  return `https://everyayah.com/data/${reciterPath}/PageMp3s/Page${formattedPage}.mp3`;
}

// Function to find which surah a page belongs to
export function findSurahByPage(pageNumber: number): Surah | null {
  if (!pageNumber || pageNumber < 1 || pageNumber > 604) return null;
  
  // Find the surah that contains this page
  for (let i = 0; i < surahs.length; i++) {
    const currentSurah = surahs[i];
    const nextSurah = surahs[i + 1];
    
    // If this is the last surah or the page is before the next surah starts
    if (!nextSurah || (currentSurah.startPage && nextSurah.startPage && 
        pageNumber >= currentSurah.startPage && pageNumber < nextSurah.startPage)) {
      return currentSurah;
    }
  }
  
  return null;
}

// Function to fetch a specific page
export async function fetchPage(pageNumber: number): Promise<Page | null> {
  if (!pageNumber || isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
    throw new Error(`Invalid page number: ${pageNumber}`);
  }

  // Find which surah this page belongs to
  const surah = findSurahByPage(pageNumber);
  
  return {
    pageNumber,
    imageUrl: getPageImageUrl(pageNumber),
    surahInfo: surah ? {
      id: surah.id,
      name: surah.surahNameArabic,
      englishName: surah.surahName
    } : undefined
  };
}

// Function to fetch all Surahs
export async function fetchSurahs(): Promise<Surah[]> {
  return surahs;
}

// Function to fetch available reciters
export async function fetchReciters(): Promise<Reciter[]> {
  return [
    { id: "1", name: "Mishary Rashid Al-Afasy" },
    { id: "5", name: "Abdul Basit Abdus Samad", style: "Mujawwad" },
    { id: "6", name: "Abdul Basit Abdus Samad", style: "Murattal" },
    { id: "2", name: "Abu Bakr Al-Shatri" },
    { id: "3", name: "Nasser Al-Qatami" },
    { id: "4", name: "Yasser Al-Dosari" }
  ];
}

// Custom hook for storing user's Quran preferences
export function useQuranPreferences() {
  const [language, setLanguage] = useState<'english' | 'luganda'>(() => {
    const stored = localStorage.getItem('quran-language');
    return (stored as 'english' | 'luganda') || 'english';
  });
  
  const [reciterId, setReciterId] = useState<string>(() => {
    const stored = localStorage.getItem('quran-reciter');
    return stored || "1"; // Default to Mishary Rashid Al-Afasy
  });
  
  const [lastReadPage, setLastReadPage] = useState<number>(() => {
    const stored = localStorage.getItem('last-read-page');
    return stored ? parseInt(stored, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('quran-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('quran-reciter', reciterId);
  }, [reciterId]);

  useEffect(() => {
    localStorage.setItem('last-read-page', lastReadPage.toString());
  }, [lastReadPage]);

  return {
    language,
    setLanguage,
    reciterId,
    setReciterId,
    lastReadPage,
    setLastReadPage
  };
}
