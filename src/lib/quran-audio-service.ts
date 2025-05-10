import { getPageAudioUrl } from './quran-api';

// Audio player service for Quran recitation
class QuranAudioService {
  private static instance: QuranAudioService;
  private audio: HTMLAudioElement | null = null;
  private reciterId: string = "1";
  private currentPage: number = 1;
  private isPlaying: boolean = false;
  private isLoading: boolean = false;
  private autoAdvance: boolean = true;
  private onPageCompleteCallback: ((nextPage: number) => void) | null = null;
  private onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;
  private onLoadingStateChangeCallback: ((isLoading: boolean) => void) | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private loadTimeout: number | null = null;

  private constructor() {
    // Create audio element
    this.audio = new Audio();
    
    // Set up event listeners
    this.audio.addEventListener('ended', this.handleAudioEnded.bind(this));
    this.audio.addEventListener('error', this.handleAudioError.bind(this));
    this.audio.addEventListener('play', () => this.notifyPlayStateChange(true));
    this.audio.addEventListener('pause', () => this.notifyPlayStateChange(false));
    this.audio.addEventListener('loadstart', () => this.notifyLoadingStateChange(true));
    this.audio.addEventListener('canplaythrough', () => this.notifyLoadingStateChange(false));
    this.audio.addEventListener('abort', () => this.notifyLoadingStateChange(false));
  }

  public static getInstance(): QuranAudioService {
    if (!QuranAudioService.instance) {
      QuranAudioService.instance = new QuranAudioService();
    }
    return QuranAudioService.instance;
  }

  // Set the reciter ID
  public setReciter(reciterId: string): void {
    this.reciterId = reciterId;
    // If currently playing, restart with new reciter
    if (this.isPlaying) {
      this.playPage(this.currentPage);
    }
  }

  // Set auto-advance option
  public setAutoAdvance(autoAdvance: boolean): void {
    this.autoAdvance = autoAdvance;
    // Save preference
    localStorage.setItem('quran-auto-advance', autoAdvance.toString());
  }

  // Get auto-advance setting
  public getAutoAdvance(): boolean {
    return this.autoAdvance;
  }

  // Play a specific page
  public async playPage(pageNumber: number): Promise<void> {
    if (!this.audio) return;
    
    try {
      // Update current page
      this.currentPage = pageNumber;
      
      // Stop current playback
      this.audio.pause();
      
      // Set loading state
      this.isLoading = true;
      this.notifyLoadingStateChange(true);
      
      // Reset retry count
      this.retryCount = 0;
      
      // Clear any existing timeout
      if (this.loadTimeout !== null) {
        window.clearTimeout(this.loadTimeout);
      }
      
      // Set a timeout to prevent infinite loading
      this.loadTimeout = window.setTimeout(() => {
        if (this.isLoading) {
          this.isLoading = false;
          this.notifyLoadingStateChange(false);
          console.error('Audio loading timeout for page', pageNumber);
        }
      }, 10000); // 10 second timeout
      
      // Set new source
      const audioUrl = getPageAudioUrl(this.reciterId, pageNumber);
      this.audio.src = audioUrl;
      
      // Preload audio
      this.audio.load();
      
      // Play audio
      await this.audio.play();
      this.isPlaying = true;
      
      // Notify state change
      this.notifyPlayStateChange(true);
    } catch (error) {
      console.error('Error playing Quran audio:', error);
      
      // Retry a few times before giving up
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying playback (attempt ${this.retryCount})`);
        
        // Wait a moment before retrying
        setTimeout(() => {
          this.playPage(pageNumber);
        }, 1000);
      } else {
        this.isPlaying = false;
        this.isLoading = false;
        this.notifyPlayStateChange(false);
        this.notifyLoadingStateChange(false);
      }
    }
  }

  // Pause playback
  public pause(): void {
    if (!this.audio) return;
    
    this.audio.pause();
    this.isPlaying = false;
    this.notifyPlayStateChange(false);
  }

  // Resume playback
  public async resume(): Promise<void> {
    if (!this.audio) return;
    
    try {
      this.isLoading = true;
      this.notifyLoadingStateChange(true);
      
      await this.audio.play();
      this.isPlaying = true;
      this.notifyPlayStateChange(true);
    } catch (error) {
      console.error('Error resuming Quran audio:', error);
      this.isPlaying = false;
      this.isLoading = false;
      this.notifyPlayStateChange(false);
      this.notifyLoadingStateChange(false);
    }
  }

  // Toggle play/pause
  public async togglePlayback(): Promise<void> {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.audio?.src) {
        await this.resume();
      } else {
        await this.playPage(this.currentPage);
      }
    }
  }

  // Stop playback completely
  public stop(): void {
    if (!this.audio) return;
    
    // Clear any existing timeout
    if (this.loadTimeout !== null) {
      window.clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
    
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.isLoading = false;
    this.notifyPlayStateChange(false);
    this.notifyLoadingStateChange(false);
  }

  // Check if audio is playing
  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }
  
  // Check if audio is loading
  public isAudioLoading(): boolean {
    return this.isLoading;
  }

  // Get current page
  public getCurrentPage(): number {
    return this.currentPage;
  }

  // Set callback for when a page completes
  public onPageComplete(callback: ((nextPage: number) => void) | null): void {
    this.onPageCompleteCallback = callback;
  }

  // Set callback for play state changes
  public onPlayStateChange(callback: ((isPlaying: boolean) => void) | null): void {
    this.onPlayStateChangeCallback = callback;
  }
  
  // Set callback for loading state changes
  public onLoadingStateChange(callback: ((isLoading: boolean) => void) | null): void {
    this.onLoadingStateChangeCallback = callback;
  }

  // Handle audio ended event
  private handleAudioEnded(): void {
    this.isPlaying = false;
    this.isLoading = false;
    this.notifyPlayStateChange(false);
    this.notifyLoadingStateChange(false);
    
    // Auto-advance to next page if enabled
    if (this.autoAdvance && this.currentPage < 604) {
      const nextPage = this.currentPage + 1;
      
      // Notify that page is complete and next page should be loaded
      if (this.onPageCompleteCallback) {
        this.onPageCompleteCallback(nextPage);
      }
    }
  }

  // Handle audio error
  private handleAudioError(error: Event): void {
    console.error('Quran audio error:', error);
    
    // Retry a few times before giving up
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying after error (attempt ${this.retryCount})`);
      
      // Wait a moment before retrying
      setTimeout(() => {
        if (this.audio) {
          this.audio.load();
          this.audio.play().catch(err => {
            console.error('Error retrying playback:', err);
            this.isPlaying = false;
            this.isLoading = false;
            this.notifyPlayStateChange(false);
            this.notifyLoadingStateChange(false);
          });
        }
      }, 1000);
    } else {
      this.isPlaying = false;
      this.isLoading = false;
      this.notifyPlayStateChange(false);
      this.notifyLoadingStateChange(false);
    }
  }

  // Notify play state change
  private notifyPlayStateChange(isPlaying: boolean): void {
    if (this.onPlayStateChangeCallback) {
      this.onPlayStateChangeCallback(isPlaying);
    }
  }
  
  // Notify loading state change
  private notifyLoadingStateChange(isLoading: boolean): void {
    this.isLoading = isLoading;
    if (this.onLoadingStateChangeCallback) {
      this.onLoadingStateChangeCallback(isLoading);
    }
  }

  // Clean up resources
  public destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('ended', this.handleAudioEnded.bind(this));
      this.audio.removeEventListener('error', this.handleAudioError.bind(this));
      this.audio.removeEventListener('loadstart', () => this.notifyLoadingStateChange(true));
      this.audio.removeEventListener('canplaythrough', () => this.notifyLoadingStateChange(false));
      this.audio.removeEventListener('abort', () => this.notifyLoadingStateChange(false));
      this.audio = null;
    }
    
    this.onPageCompleteCallback = null;
    this.onPlayStateChangeCallback = null;
    this.onLoadingStateChangeCallback = null;
    
    // Clear any existing timeout
    if (this.loadTimeout !== null) {
      window.clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
  }
}

export default QuranAudioService;
