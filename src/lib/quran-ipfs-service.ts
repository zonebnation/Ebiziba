import { create } from 'ipfs-http-client';
import { CID } from 'multiformats/cid';
import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// IPFS gateway URLs for retrieving content
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const INFURA_GATEWAY = 'https://ebizimba.infura-ipfs.io/ipfs/';
const CLOUDFLARE_GATEWAY = 'https://cloudflare-ipfs.com/ipfs/';

// Local storage keys
const QURAN_IPFS_CACHE_KEY = 'quran-ipfs-cache';
const QURAN_IPFS_CACHE_TIMESTAMP_KEY = 'quran-ipfs-cache-timestamp';
const QURAN_IPFS_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Interface for IPFS content
interface QuranIPFSContent {
  cid: string;
  pageNumber: number;
  surahInfo?: {
    id: number;
    name: string;
    englishName: string;
  };
  createdAt: string;
}

// Interface for cached content
interface CachedContent {
  [cid: string]: {
    data: string;
    timestamp: number;
  };
}

class QuranIPFSService {
  private static instance: QuranIPFSService;
  private ipfs: any;
  private cache: CachedContent = {};
  private contentRegistry: { [pageNumber: number]: QuranIPFSContent } = {};
  private isInitialized = false;
  private cidToPageMap: { [cid: string]: number } = {};

  private constructor() {
    // Load cache from localStorage
    this.loadCache();
    
    // Initialize IPFS client
    try {
      this.ipfs = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: 'Basic ' + btoa(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_API_SECRET)
        }
      });
    } catch (error) {
      console.error('Failed to initialize IPFS client:', error);
    }
  }

  public static getInstance(): QuranIPFSService {
    if (!QuranIPFSService.instance) {
      QuranIPFSService.instance = new QuranIPFSService();
    }
    return QuranIPFSService.instance;
  }

  // Initialize the service
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Load content registry from Supabase
      await this.loadContentRegistry();
      
      // Initialize cache directory if on native platform
      if (Capacitor.isNativePlatform()) {
        await this.initializeCache();
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Quran IPFS service:', error);
      return false;
    }
  }

  // Initialize cache directory
  private async initializeCache(): Promise<void> {
    try {
      await Filesystem.mkdir({
        path: 'quran-ipfs-cache',
        directory: Directory.Cache,
        recursive: true
      });
    } catch (error) {
      console.error('Failed to create Quran cache directory:', error);
    }
  }

  // Load content registry from Supabase
  private async loadContentRegistry(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ipfs_content')
        .select('*')
        .eq('type', 'quran_page');
      
      if (error) throw error;
      
      // Convert array to object with page number as key
      this.contentRegistry = {};
      this.cidToPageMap = {};
      
      if (data && data.length > 0) {
        data.forEach(item => {
          try {
            // Extract page number from title
            const pageMatch = item.title.match(/Page\s*(\d+)/i);
            if (pageMatch && pageMatch[1]) {
              const pageNumber = parseInt(pageMatch[1], 10);
              
              if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= 604) {
                // Parse surah info if available
                let surahInfo = undefined;
                try {
                  if (item.metadata && typeof item.metadata === 'object') {
                    surahInfo = item.metadata.surahInfo;
                  } else if (typeof item.metadata === 'string') {
                    const parsed = JSON.parse(item.metadata);
                    surahInfo = parsed.surahInfo;
                  }
                } catch (e) {
                  console.warn(`Failed to parse surah info for page ${pageNumber}:`, e);
                }
                
                // Add to registry
                this.contentRegistry[pageNumber] = {
                  cid: item.cid,
                  pageNumber,
                  surahInfo,
                  createdAt: item.created_at
                };
                
                // Add to CID to page map
                this.cidToPageMap[item.cid] = pageNumber;
              }
            }
          } catch (e) {
            console.error('Error processing IPFS content item:', e);
          }
        });
      }
      
      console.log(`Loaded ${Object.keys(this.contentRegistry).length} Quran pages from IPFS content registry`);
    } catch (error) {
      console.error('Failed to load Quran IPFS content registry:', error);
      throw error;
    }
  }

  // Load cache from localStorage
  private loadCache(): void {
    try {
      const cached = localStorage.getItem(QURAN_IPFS_CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
        
        // Clean up expired cache entries
        const now = Date.now();
        let hasExpired = false;
        
        Object.keys(this.cache).forEach(key => {
          if (now - this.cache[key].timestamp > QURAN_IPFS_CACHE_DURATION) {
            delete this.cache[key];
            hasExpired = true;
          }
        });
        
        if (hasExpired) {
          this.saveCache();
        }
      }
    } catch (error) {
      console.error('Failed to load Quran IPFS cache:', error);
      this.cache = {};
    }
  }

  // Save cache to localStorage
  private saveCache(): void {
    try {
      localStorage.setItem(QURAN_IPFS_CACHE_KEY, JSON.stringify(this.cache));
      localStorage.setItem(QURAN_IPFS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to save Quran IPFS cache:', error);
    }
  }

  // Get Quran page image from IPFS by page number
  public async getQuranPage(pageNumber: number): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Check if page exists in registry
      if (!this.contentRegistry[pageNumber]) {
        console.warn(`Page ${pageNumber} not found in IPFS registry`);
        return null;
      }
      
      const cid = this.contentRegistry[pageNumber].cid;
      
      // Check if content is in cache
      if (this.cache[cid]) {
        return this.cache[cid].data;
      }
      
      // Check if content is in filesystem cache (for native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          const { data } = await Filesystem.readFile({
            path: `quran-ipfs-cache/${cid}`,
            directory: Directory.Cache
          });
          
          // Add to memory cache
          this.cache[cid] = {
            data,
            timestamp: Date.now()
          };
          
          this.saveCache();
          return data;
        } catch (error) {
          // File not in cache, continue to fetch from gateway
        }
      }
      
      // Fetch from IPFS gateway
      const response = await fetch(`${IPFS_GATEWAY}${cid}`);
      
      if (!response.ok) {
        // Try alternate gateways
        const infuraResponse = await fetch(`${INFURA_GATEWAY}${cid}`);
        
        if (!infuraResponse.ok) {
          const cloudflareResponse = await fetch(`${CLOUDFLARE_GATEWAY}${cid}`);
          
          if (!cloudflareResponse.ok) {
            throw new Error(`Failed to fetch Quran page from IPFS: ${response.statusText}`);
          }
          
          const data = await cloudflareResponse.text();
          this.cacheContent(cid, data);
          return data;
        }
        
        const data = await infuraResponse.text();
        this.cacheContent(cid, data);
        return data;
      }
      
      const data = await response.text();
      this.cacheContent(cid, data);
      return data;
    } catch (error) {
      console.error(`Failed to get Quran page ${pageNumber} from IPFS:`, error);
      return null;
    }
  }

  // Get Quran page image URL from IPFS by page number
  public getQuranPageUrl(pageNumber: number): string | null {
    if (!this.isInitialized || !this.contentRegistry[pageNumber]) {
      return null;
    }
    
    const cid = this.contentRegistry[pageNumber].cid;
    return `${IPFS_GATEWAY}${cid}`;
  }

  // Cache content in memory and filesystem
  private async cacheContent(cid: string, data: string): Promise<void> {
    // Add to memory cache
    this.cache[cid] = {
      data,
      timestamp: Date.now()
    };
    
    this.saveCache();
    
    // Save to filesystem cache if on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: `quran-ipfs-cache/${cid}`,
          data,
          directory: Directory.Cache
        });
      } catch (error) {
        console.error(`Failed to cache Quran content to filesystem for CID ${cid}:`, error);
      }
    }
  }

  // Upload a Quran page to IPFS (admin only)
  public async uploadQuranPage(pageNumber: number, imageData: string, surahInfo?: any): Promise<string> {
    try {
      if (!this.ipfs) {
        throw new Error('IPFS client not initialized');
      }
      
      if (pageNumber < 1 || pageNumber > 604) {
        throw new Error('Invalid page number');
      }
      
      // Add content to IPFS
      const result = await this.ipfs.add(imageData);
      const cid = result.cid.toString();
      
      // Prepare metadata
      const metadata = surahInfo ? { surahInfo } : undefined;
      
      // Register content in Supabase
      const { error } = await supabase
        .from('ipfs_content')
        .insert({
          cid,
          title: `Quran Page ${pageNumber}`,
          type: 'quran_page',
          metadata,
          size: imageData.length,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Add to local registry
      this.contentRegistry[pageNumber] = {
        cid,
        pageNumber,
        surahInfo,
        createdAt: new Date().toISOString()
      };
      
      // Add to CID to page map
      this.cidToPageMap[cid] = pageNumber;
      
      return cid;
    } catch (error) {
      console.error(`Failed to upload Quran page ${pageNumber} to IPFS:`, error);
      throw error;
    }
  }

  // Check if a page is available in IPFS
  public isPageAvailable(pageNumber: number): boolean {
    return !!this.contentRegistry[pageNumber];
  }

  // Get all available page numbers
  public getAvailablePages(): number[] {
    return Object.keys(this.contentRegistry).map(page => parseInt(page, 10));
  }

  // Get content URL for a CID
  public getContentUrl(cid: string): string {
    return `${IPFS_GATEWAY}${cid}`;
  }

  // Check if a CID is valid
  public isValidCid(cid: string): boolean {
    try {
      CID.parse(cid);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default QuranIPFSService;
