// Volume detection utility for mobile devices
// This is a workaround since there's no direct way to detect volume button presses

// Define callback type
type VolumeChangeCallback = () => void;

class VolumeDetector {
  private static instance: VolumeDetector;
  private callbacks: VolumeChangeCallback[] = [];
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isListening: boolean = false;

  private constructor() {
    // Initialize audio context when needed
    this.setupAudioContext = this.setupAudioContext.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
  }

  public static getInstance(): VolumeDetector {
    if (!VolumeDetector.instance) {
      VolumeDetector.instance = new VolumeDetector();
    }
    return VolumeDetector.instance;
  }

  // Start listening for volume changes
  public startListening(): void {
    if (this.isListening) return;
    
    // Set up audio context
    this.setupAudioContext();
    
    // Set up event listeners
    this.addEventListeners();
    
    this.isListening = true;
  }

  // Stop listening for volume changes
  public stopListening(): void {
    if (!this.isListening) return;
    
    // Remove event listeners
    this.removeEventListeners();
    
    // Clean up audio context
    this.cleanupAudioContext();
    
    this.isListening = false;
  }

  // Add a callback to be called when volume changes
  public onVolumeChange(callback: VolumeChangeCallback): void {
    this.callbacks.push(callback);
    
    // Start listening if not already
    if (!this.isListening) {
      this.startListening();
    }
  }

  // Remove a callback
  public removeCallback(callback: VolumeChangeCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
    
    // Stop listening if no callbacks left
    if (this.callbacks.length === 0) {
      this.stopListening();
    }
  }

  // Set up audio context
  private setupAudioContext(): void {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain node
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0; // Mute
      
      // Connect to destination
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error setting up audio context:', error);
    }
  }

  // Clean up audio context
  private cleanupAudioContext(): void {
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
      this.gainNode = null;
    }
  }

  // Add event listeners
  private addEventListeners(): void {
    // Listen for volume change events
    if (typeof window !== 'undefined') {
      // Media Session API (works on some mobile browsers)
      if (navigator.mediaSession) {
        try {
          navigator.mediaSession.setActionHandler('seekbackward', this.handleVolumeChange);
          navigator.mediaSession.setActionHandler('seekforward', this.handleVolumeChange);
        } catch (error) {
          console.log('Media Session API not fully supported');
        }
      }
      
      // Keyboard events (for desktop)
      window.addEventListener('keydown', this.handleKeyDown);
      
      // Custom event for volume change
      window.addEventListener('volumechange', this.handleVolumeChange);
    }
  }

  // Remove event listeners
  private removeEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Media Session API
      if (navigator.mediaSession) {
        try {
          navigator.mediaSession.setActionHandler('seekbackward', null);
          navigator.mediaSession.setActionHandler('seekforward', null);
        } catch (error) {
          // Ignore errors
        }
      }
      
      // Keyboard events
      window.removeEventListener('keydown', this.handleKeyDown);
      
      // Custom event
      window.removeEventListener('volumechange', this.handleVolumeChange);
    }
  }

  // Handle keyboard events
  private handleKeyDown = (e: KeyboardEvent): void => {
    // Volume up/down keys
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.handleVolumeChange();
    }
  };

  // Handle volume change
  private handleVolumeChange(): void {
    // Notify all callbacks
    this.callbacks.forEach(callback => callback());
  }
}

export default VolumeDetector;
