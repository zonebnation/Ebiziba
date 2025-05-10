// IPFS Service implementation for book content storage
// Using mock implementation instead of actual IPFS client
import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// IPFS gateway URLs for retrieving content
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const INFURA_GATEWAY = 'https://ebizimba.infura-ipfs.io/ipfs/';
const CLOUDFLARE_GATEWAY = 'https://cloudflare-ipfs.com/ipfs/';

// Local storage keys
const IPFS_CACHE_KEY = 'ipfs-content-cache';
const IPFS_CACHE_TIMESTAMP_KEY = 'ipfs-cache-timestamp';
const IPFS_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class IPFSService {
  static instance;
  cache = {};
  contentRegistry = {};
  isInitialized = false;
  bookCidMap = {};

  constructor() {
    // Load cache from localStorage
    this.loadCache();
  }

  static getInstance() {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  // Initialize the service
  async initialize() {
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
      console.error('Failed to initialize IPFS service:', error);
      return false;
    }
  }

  // Initialize cache directory
  async initializeCache() {
    try {
      await Filesystem.mkdir({
        path: 'ipfs-cache',
        directory: Directory.Cache,
        recursive: true
      });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  // Load content registry from Supabase
  async loadContentRegistry() {
    try {
      const { data, error } = await supabase
        .from('ipfs_content')
        .select('*');
      
      if (error) throw error;
      
      // Convert array to object with CID as key
      this.contentRegistry = data.reduce((acc, item) => {
        acc[item.cid] = item;
        return acc;
      }, {});
      
      // Create book ID to CID mapping
      this.bookCidMap = data.reduce((acc, item) => {
        if (item.type === 'book' && item.title) {
          // Extract book ID from title if possible
          const bookIdMatch = item.title.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
          if (bookIdMatch) {
            acc[bookIdMatch[1]] = item.cid;
          }
        }
        return acc;
      }, {});
      
      console.log(`Loaded ${data.length} items from IPFS content registry`);
    } catch (error) {
      console.error('Failed to load IPFS content registry:', error);
      throw error;
    }
  }

  // Load cache from localStorage
  loadCache() {
    try {
      const cached = localStorage.getItem(IPFS_CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
        
        // Clean up expired cache entries
        const now = Date.now();
        let hasExpired = false;
        
        Object.keys(this.cache).forEach(key => {
          if (now - this.cache[key].timestamp > IPFS_CACHE_DURATION) {
            delete this.cache[key];
            hasExpired = true;
          }
        });
        
        if (hasExpired) {
          this.saveCache();
        }
      }
    } catch (error) {
      console.error('Failed to load IPFS cache:', error);
      this.cache = {};
    }
  }

  // Save cache to localStorage
  saveCache() {
    try {
      localStorage.setItem(IPFS_CACHE_KEY, JSON.stringify(this.cache));
      localStorage.setItem(IPFS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to save IPFS cache:', error);
    }
  }

  // Get content from IPFS by CID
  async getContent(cid) {
    try {
      // Check if content is in cache
      if (this.cache[cid]) {
        return this.cache[cid].data;
      }
      
      // Check if content is in filesystem cache (for native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          const { data } = await Filesystem.readFile({
            path: `ipfs-cache/${cid}`,
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
            throw new Error(`Failed to fetch content from IPFS: ${response.statusText}`);
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
      console.error(`Failed to get content for CID ${cid}:`, error);
      throw error;
    }
  }

  // Cache content in memory and filesystem
  async cacheContent(cid, data) {
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
          path: `ipfs-cache/${cid}`,
          data,
          directory: Directory.Cache
        });
      } catch (error) {
        console.error(`Failed to cache content to filesystem for CID ${cid}:`, error);
      }
    }
  }

  // Get book content by ID
  async getBookContent(bookId) {
    try {
      // Check if book ID is in CID map
      const cid = this.getBookCid(bookId);
      
      if (!cid) {
        throw new Error(`Book with ID ${bookId} not found in IPFS registry`);
      }
      
      return await this.getContent(cid);
    } catch (error) {
      console.error(`Failed to get book content for ID ${bookId}:`, error);
      throw error;
    }
  }

  // Get book CID by ID
  getBookCid(bookId) {
    return this.bookCidMap[bookId];
  }

  // Get all books from registry
  async getBooks() {
    return Object.values(this.contentRegistry).filter(item => item.type === 'book');
  }

  // Get content URL for a CID
  getContentUrl(cid) {
    return `${IPFS_GATEWAY}${cid}`;
  }

  // Check if a CID is valid
  isValidCid(cid) {
    // Simple regex check for valid CID format
    return /^[a-zA-Z0-9]{46,59}$/.test(cid);
  }

  // Upload content to IPFS (mock implementation)
  async uploadContent(content, title, type, mimeType) {
    try {
      // Generate a mock CID
      const mockCid = `mock-cid-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Register in Supabase
      const { error } = await supabase
        .from('ipfs_content')
        .insert({
          cid: mockCid,
          title,
          type,
          mime_type: mimeType,
          size: content.length,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Add to local registry
      this.contentRegistry[mockCid] = {
        cid: mockCid,
        title,
        type,
        mimeType,
        size: content.length,
        createdAt: new Date().toISOString()
      };
      
      return mockCid;
    } catch (error) {
      console.error('Failed to upload content to IPFS:', error);
      throw error;
    }
  }

  // Upload large content in chunks (mock implementation)
  async uploadLargeContent(content, title, type, chunkSize = 1024 * 1024) {
    try {
      // Split content into chunks
      const chunks = [];
      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize));
      }
      
      // Generate a mock CID
      const mockCid = `mock-chunked-cid-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const chunkCids = chunks.map((_, index) => `mock-chunk-${mockCid}-${index}`);
      
      // Register in Supabase
      const { error } = await supabase
        .from('ipfs_content')
        .insert({
          cid: mockCid,
          title,
          type,
          chunks: chunkCids,
          size: content.length,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Add to local registry
      this.contentRegistry[mockCid] = {
        cid: mockCid,
        title,
        type,
        chunks: chunkCids,
        size: content.length,
        createdAt: new Date().toISOString()
      };
      
      return mockCid;
    } catch (error) {
      console.error('Failed to upload large content to IPFS:', error);
      throw error;
    }
  }
}

export default IPFSService;
