/**
 * Utility for uploading Quran pages to IPFS
 * This is a mock implementation since we can't directly interact with IPFS in the browser
 */

import { supabase } from '../lib/supabase';
import { findSurahByPage } from '../lib/quran-api';

// IPFS CID for Quran pages
const QURAN_IPFS_CID = 'bafybeiew2vzukjtjlrx5ofgftuesvzm3pvsqajiupxv2cgnyoagfuhrkyi';

/**
 * Check which Quran pages are available in IPFS
 * @returns Object with available and missing page numbers
 */
export async function checkQuranPagesAvailability(): Promise<{
  total: number;
  available: number[];
  missing: number[];
}> {
  try {
    const { data, error } = await supabase
      .from('ipfs_content')
      .select('title')
      .eq('type', 'quran_page');
    
    if (error) throw error;
    
    // Extract page numbers from titles
    const availablePages = data
      .map(item => {
        const match = item.title.match(/Page\s*(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((page): page is number => page !== null && !isNaN(page));
    
    // Find missing pages
    const missingPages = [];
    for (let i = 1; i <= 604; i++) {
      if (!availablePages.includes(i)) {
        missingPages.push(i);
      }
    }
    
    return {
      total: 604,
      available: availablePages,
      missing: missingPages
    };
  } catch (error) {
    console.error('Error checking Quran pages availability:', error);
    return {
      total: 604,
      available: [],
      missing: Array.from({ length: 604 }, (_, i) => i + 1)
    };
  }
}

/**
 * Upload a batch of Quran pages to IPFS
 * @param startPage First page to upload
 * @param endPage Last page to upload
 * @param progressCallback Callback for progress updates
 * @returns Results of the upload operation
 */
export async function uploadQuranPageBatch(
  startPage: number,
  endPage: number,
  progressCallback?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; pages: number[] }> {
  // Validate input
  if (startPage < 1 || startPage > 604 || endPage < 1 || endPage > 604 || startPage > endPage) {
    throw new Error('Invalid page range');
  }
  
  const results = {
    success: 0,
    failed: 0,
    pages: [] as number[]
  };
  
  const total = endPage - startPage + 1;
  
  for (let page = startPage; page <= endPage; page++) {
    try {
      // Get surah info for this page
      const surah = findSurahByPage(page);
      const surahInfo = surah ? {
        id: surah.id,
        name: surah.surahNameArabic,
        englishName: surah.surahName
      } : undefined;
      
      // Register in Supabase
      const { error } = await supabase
        .from('ipfs_content')
        .insert({
          cid: `${QURAN_IPFS_CID}/${page.toString().padStart(3, '0')}.png`,
          title: `Quran Page ${page}`,
          type: 'quran_page',
          metadata: surahInfo ? { surahInfo } : null,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      results.success++;
      results.pages.push(page);
      
      if (progressCallback) {
        progressCallback(page - startPage + 1, total);
      }
    } catch (error) {
      console.error(`Failed to upload page ${page}:`, error);
      results.failed++;
      
      if (progressCallback) {
        progressCallback(page - startPage + 1, total);
      }
    }
  }
  
  return results;
}

/**
 * Register a single Quran page in the database
 * @param pageNumber The page number to register
 * @returns The CID of the registered page
 */
export async function registerQuranPage(pageNumber: number): Promise<string> {
  try {
    // Get surah info for this page
    const surah = findSurahByPage(pageNumber);
    const surahInfo = surah ? {
      id: surah.id,
      name: surah.surahNameArabic,
      englishName: surah.surahName
    } : undefined;
    
    // Format page number with leading zeros
    const formattedPage = pageNumber.toString().padStart(3, '0');
    const pageCid = `${QURAN_IPFS_CID}/${formattedPage}.png`;
    
    // Register in Supabase
    const { error } = await supabase
      .from('ipfs_content')
      .insert({
        cid: pageCid,
        title: `Quran Page ${pageNumber}`,
        type: 'quran_page',
        metadata: surahInfo ? { surahInfo } : null,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return pageCid;
  } catch (error) {
    console.error(`Failed to register page ${pageNumber}:`, error);
    throw error;
  }
}
