import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// IPFS gateway URLs for retrieving content
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const CLOUDFLARE_GATEWAY = 'https://cloudflare-ipfs.com/ipfs/';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// The CID of the Quran pages folder
const QURAN_FOLDER_CID = 'bafybeiew2vzukjtjlrx5ofgftuesvzm3pvsqajiupxv2cgnyoagfuhrkyi';

// Local storage keys
const QURAN_IPFS_CACHE_KEY = 'quran-ipfs-cache';
const QURAN_IPFS_TIMESTAMP_KEY = 'quran-ipfs-timestamp';
const QURAN_IPFS_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Interface for cached content
interface CachedContent {
  [pageNumber: string]: {
    data: string;
    timestamp: number;
  };
}

class IPFSQuranService {
  private static instance: IPFSQuranService;
  private cache: CachedContent = {};
  private isInitialized = false;
  private availablePages: Set<number> = new Set();

  private constructor() {
    // Load cache from localStorage
    this.loadCache();
  }

  public static getInstance(): IPFSQuranService {
    if (!IPFSQuranService.instance) {
      IPFSQuranService.instance = new IPFSQuranService();
    }
    return IPFSQuranService.instance;
  }

  // Initialize the service
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Initialize cache directory if on native platform
      if (Capacitor.isNativePlatform()) {
        await this.initializeCache();
      }
      
      // Check if the IPFS folder is accessible
      await this.checkFolderAccess();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize IPFS Quran service:', error);
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

  // Check if the IPFS folder is accessible
  private async checkFolderAccess(): Promise<void> {
    try {
      // Try to fetch the folder listing
      const response = await fetch(`${IPFS_GATEWAY}${QURAN_FOLDER_CID}`);
      
      if (!response.ok) {
        // Try alternate gateways
        const cloudflareResponse = await fetch(`${CLOUDFLARE_GATEWAY}${QURAN_FOLDER_CID}`);
        
        if (!cloudflareResponse.ok) {
          const pinataResponse = await fetch(`${PINATA_GATEWAY}${QURAN_FOLDER_CID}`);
          
          if (!pinataResponse.ok) {
            throw new Error('Failed to access IPFS Quran folder');
          }
        }
      }
      
      console.log('Successfully accessed IPFS Quran folder');
    } catch (error) {
      console.error('Failed to access IPFS Quran folder:', error);
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
      localStorage.setItem(QURAN_IPFS_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to save Quran IPFS cache:', error);
    }
  }

  // Get Quran page image URL from IPFS
  public getQuranPageUrl(pageNumber: number): string {
    // Format page number with leading zeros
    const formattedPage = pageNumber.toString().padStart(3, '0');
    
    // Return IPFS URL
    return `${IPFS_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`;
  }

  // Get Quran page image as base64 from IPFS
  public async getQuranPageBase64(pageNumber: number): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const pageKey = pageNumber.toString();
      
      // Check if page is in cache
      if (this.cache[pageKey]) {
        return this.cache[pageKey].data;
      }
      
      // Check if page is in filesystem cache (for native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          const { data } = await Filesystem.readFile({
            path: `quran-ipfs-cache/${pageNumber}`,
            directory: Directory.Cache
          });
          
          // Add to memory cache
          this.cache[pageKey] = {
            data,
            timestamp: Date.now()
          };
          
          this.saveCache();
          return data;
        } catch (error) {
          // File not in cache, continue to fetch from IPFS
        }
      }
      
      // Format page number with leading zeros
      const formattedPage = pageNumber.toString().padStart(3, '0');
      
      // Fetch from IPFS gateway
      const response = await fetch(`${IPFS_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`);
      
      if (!response.ok) {
        // Try alternate gateways
        const cloudflareResponse = await fetch(`${CLOUDFLARE_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`);
        
        if (!cloudflareResponse.ok) {
          const pinataResponse = await fetch(`${PINATA_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`);
          
          if (!pinataResponse.ok) {
            throw new Error(`Failed to fetch Quran page ${pageNumber} from IPFS`);
          }
          
          return await this.processImageResponse(pinataResponse, pageKey);
        }
        
        return await this.processImageResponse(cloudflareResponse, pageKey);
      }
      
      return await this.processImageResponse(response, pageKey);
    } catch (error) {
      console.error(`Failed to get Quran page ${pageNumber} from IPFS:`, error);
      return null;
    }
  }

  // Process image response and convert to base64
  private async processImageResponse(response: Response, pageKey: string): Promise<string> {
    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);
    
    // Add to memory cache
    this.cache[pageKey] = {
      data: base64,
      timestamp: Date.now()
    };
    
    this.saveCache();
    
    // Save to filesystem cache if on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: `quran-ipfs-cache/${pageKey}`,
          data: base64,
          directory: Directory.Cache
        });
      } catch (error) {
        console.error(`Failed to cache Quran page to filesystem:`, error);
      }
    }
    
    return base64;
  }

  // Convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Check if a page exists in IPFS
  public async checkPageExists(pageNumber: number): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Format page number with leading zeros
      const formattedPage = pageNumber.toString().padStart(3, '0');
      
      // Try to fetch the page
      const response = await fetch(`${IPFS_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`, {
        method: 'HEAD'
      });
      
      if (response.ok) {
        this.availablePages.add(pageNumber);
        return true;
      }
      
      // Try alternate gateways
      const cloudflareResponse = await fetch(`${CLOUDFLARE_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`, {
        method: 'HEAD'
      });
      
      if (cloudflareResponse.ok) {
        this.availablePages.add(pageNumber);
        return true;
      }
      
      const pinataResponse = await fetch(`${PINATA_GATEWAY}${QURAN_FOLDER_CID}/${formattedPage}.png`, {
        method: 'HEAD'
      });
      
      if (pinataResponse.ok) {
        this.availablePages.add(pageNumber);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to check if page ${pageNumber} exists:`, error);
      return false;
    }
  }

  // Get all available pages
  public getAvailablePages(): number[] {
    return Array.from(this.availablePages);
  }
}

export default IPFSQuranService;
