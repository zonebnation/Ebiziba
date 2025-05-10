import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Play, Lock, Heart, MessageCircle, Share2, Volume2, VolumeX, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { useNavigation } from '../context/NavigationContext';
import { Capacitor } from '@capacitor/core';
import { useDevice } from '../context/DeviceContext';
import { DeviceType } from '../lib/device-detection';

type Reel = Database['public']['Tables']['reels']['Row'];

export const Videos: React.FC = () => {
  const { user } = useAuth();
  const { goBack } = useNavigation();
  const { deviceInfo } = useDevice();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeVideos, setActiveVideos] = useState<Set<number>>(new Set());
  const [volumeChangeDetected, setVolumeChangeDetected] = useState(false);

  useEffect(() => {
    fetchReels();
    
    // Set up volume change detection
    if (navigator.mediaSession) {
      try {
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          // This is a hack to detect volume button presses on some devices
          handleVolumeButtonPress();
        });
        
        navigator.mediaSession.setActionHandler('seekforward', () => {
          // This is a hack to detect volume button press on some devices
          handleVolumeButtonPress();
        });
      } catch (error) {
        console.log('Media Session API not fully supported');
      }
    }
    
    // Listen for keyboard events (volume keys on desktop)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Volume up/down keys
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        handleVolumeButtonPress();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Set up custom event listener for Android volume buttons
    const handleAndroidVolumeChange = () => {
      handleVolumeButtonPress();
    };
    
    window.addEventListener('volumeButtonPressed', handleAndroidVolumeChange);
    
    // Set up a MutationObserver to detect changes to the video element's muted attribute
    // This can sometimes catch volume button presses
    const videos = document.querySelectorAll('video');
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'muted') {
          handleVolumeButtonPress();
        }
      });
    });
    
    videos.forEach(video => {
      mutationObserver.observe(video, { attributes: true });
    });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('volumeButtonPressed', handleAndroidVolumeChange);
      mutationObserver.disconnect();
      
      // Clean up media session handlers
      if (navigator.mediaSession) {
        try {
          navigator.mediaSession.setActionHandler('seekbackward', null);
          navigator.mediaSession.setActionHandler('seekforward', null);
        } catch (error) {
          // Ignore errors
        }
      }
      
      // Pause all videos when component unmounts
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
          video.src = ''; // Clear source to free memory
          video.load();
        }
      });
    };
  }, []);

  // Function to handle volume button press detection
  const handleVolumeButtonPress = () => {
    // User pressed a volume button, unmute videos
    if (isMuted) {
      setIsMuted(false);
      setVolumeChangeDetected(true);
      
      // Unmute current video
      const currentVideo = videoRefs.current[currentIndex];
      if (currentVideo) {
        currentVideo.muted = false;
      }
      
      // Visual feedback - flash the volume button
      if (volumeButtonRef.current) {
        volumeButtonRef.current.classList.add('animate-pulse');
        setTimeout(() => {
          if (volumeButtonRef.current) {
            volumeButtonRef.current.classList.remove('animate-pulse');
          }
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (!reels.length) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Initialize Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Get the index from the data attribute
            const index = parseInt(video.dataset.index || '0', 10);
            
            // Update current index
            setCurrentIndex(index);
            
            // Track active videos
            setActiveVideos(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            
            // Preload the next video
            const nextIndex = index + 1;
            if (nextIndex < reels.length) {
              const nextVideo = videoRefs.current[nextIndex];
              if (nextVideo) {
                nextVideo.preload = 'auto';
              }
            }

            // Play current video
            playVideo(video, index);
          } else {
            // Remove from active videos
            setActiveVideos(prev => {
              const newSet = new Set(prev);
              const index = parseInt(video.dataset.index || '0', 10);
              newSet.delete(index);
              
              // Pause and reset video if not active
              video.pause();
              
              // Only reset if it's not the current or adjacent videos
              // This helps with smoother scrolling
              const currentIdx = currentIndex;
              if (Math.abs(index - currentIdx) > 1) {
                video.currentTime = 0;
                
                // Reduce memory usage by removing source if far from current
                if (Math.abs(index - currentIdx) > 3) {
                  const originalSrc = video.src;
                  video.src = '';
                  video.load();
                  
                  // Store original source for later
                  video.dataset.originalSrc = originalSrc;
                }
              }
              
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.7,
        rootMargin: '50px 0px'
      }
    );

    // Observe all videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) observerRef.current?.observe(video);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [reels]);

  // Apply mute state to all videos when it changes
  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  // Memory management - unload videos that are far from view
  useEffect(() => {
    const unloadDistantVideos = () => {
      if (videoRefs.current) {
        Object.entries(videoRefs.current).forEach(([indexStr, video]) => {
          const index = parseInt(indexStr, 10);
          
          // If video is far from current view and has source
          if (Math.abs(index - currentIndex) > 5 && video.src && !activeVideos.has(index)) {
            // Save the source URL before clearing
            if (!video.dataset.originalSrc) {
              video.dataset.originalSrc = video.src;
            }
            
            // Clear the source to free memory
            video.pause();
            video.src = '';
            video.load();
          }
          
          // If video is coming back into potential view and has stored source
          if (Math.abs(index - currentIndex) <= 3 && !video.src && video.dataset.originalSrc) {
            // Restore source
            video.src = video.dataset.originalSrc;
            video.load();
            delete video.dataset.originalSrc;
          }
        });
      }
    };
    
    // Run unload every 5 seconds
    const interval = setInterval(unloadDistantVideos, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, activeVideos]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReels(data || []);
    } catch (err) {
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(false);
    }
  };

  const playVideo = async (video: HTMLVideoElement, index: number) => {
    try {
      // Check if video has source
      if (!video.src && video.dataset.originalSrc) {
        video.src = video.dataset.originalSrc;
        delete video.dataset.originalSrc;
        
        // Wait for source to load
        await new Promise(resolve => {
          video.onloadedmetadata = resolve;
          video.onerror = resolve; // Also resolve on error to prevent hanging
        });
      }
      
      // Apply current mute state
      video.muted = isMuted;
      
      await video.play();
      // Clear any previous error for this video
      setVideoErrors(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    } catch (err) {
      console.error('Error playing video:', err);
      setVideoErrors(prev => ({
        ...prev,
        [index]: 'Waliwo ekisobu mu kuzanya video. Gezaako nate.'
      }));
    }
  };

  const handleVideoRef = (element: HTMLVideoElement | null, index: number) => {
    if (element) {
      element.playsInline = true;
      element.preload = index <= 1 ? 'auto' : 'none';
      element.setAttribute('playsinline', 'true');
      element.setAttribute('webkit-playsinline', 'true');
      element.muted = isMuted; // Apply mute state
      videoRefs.current[index] = element;
    }
  };

  const handleVideoError = (index: number, error: any) => {
    console.error('Video error:', error);
    setVideoErrors(prev => ({
      ...prev,
      [index]: 'Waliwo ekisobu mu kulaba video. Kebera internet connection yo ozezeko nate.'
    }));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolumeChangeDetected(true);
    
    // Apply to current video immediately
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = !isMuted;
    }
  };

  const toggleLike = async (reelId: string) => {
    if (!user) return;

    try {
      setIsLiked(prev => ({ ...prev, [reelId]: !prev[reelId] }));
      
      const { error } = await supabase
        .from('reels')
        .update({ 
          likes: isLiked[reelId] ? reels[currentIndex].likes - 1 : reels[currentIndex].likes + 1 
        })
        .eq('id', reelId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating likes:', err);
      // Revert like state on error
      setIsLiked(prev => ({ ...prev, [reelId]: !prev[reelId] }));
    }
  };

  const handleShare = async (reel: Reel) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: reel.title,
          text: reel.description,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        alert('Sharing is not supported in this browser. You can copy the URL manually.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleBack = () => {
    // Pause all videos before navigating back
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
        video.src = ''; // Clear source to free memory
        video.load();
      }
    });
    
    goBack();
  };

  // Listen for volume changes on the device
  useEffect(() => {
    // Set up a listener for Android volume button events
    if (Capacitor.isNativePlatform()) {
      // Create a custom event that will be triggered from Java
      const volumeButtonEvent = new Event('volumeButtonPressed');
      
      // Add a method to the window object that can be called from Java
      window.handleVolumeButtonPress = () => {
        window.dispatchEvent(volumeButtonEvent);
      };
    }
    
    // Try to detect volume changes
    // This is a bit of a hack since there's no direct volume change event
    const handleVolumeChange = () => {
      // User changed volume, unmute videos
      if (isMuted) {
        setIsMuted(false);
        setVolumeChangeDetected(true);
        
        // Unmute current video
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
          currentVideo.muted = false;
        }
      }
    };
    
    // Try to detect volume changes
    document.addEventListener('volumechange', handleVolumeChange);
    
    return () => {
      document.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isMuted, currentIndex]);

  // Memory management - unload videos that are far from view
  useEffect(() => {
    const unloadDistantVideos = () => {
      Object.entries(videoRefs.current).forEach(([indexStr, video]) => {
        const index = parseInt(indexStr, 10);
        
        // If video is far from current view and has source
        if (Math.abs(index - currentIndex) > 3 && video.src && !activeVideos.has(index)) {
          // Save the source URL before clearing
          if (!video.dataset.originalSrc) {
            video.dataset.originalSrc = video.src;
          }
          
          // Clear the source to free memory
          video.pause();
          video.src = '';
          video.load();
        }
      });
    };
    
    // Run unload every 30 seconds
    const interval = setInterval(unloadDistantVideos, 30000);
    
    return () => clearInterval(interval);
  }, [currentIndex, activeVideos]);

  // Adjust video container height based on device
  const getVideoContainerStyle = () => {
    // For small screens, adjust the height to ensure controls are visible
    if (deviceInfo.type === DeviceType.MOBILE && deviceInfo.isSmallScreen) {
      return { height: `calc(100vh - 80px)` };
    }
    
    // For iPhone with notch, add extra bottom padding
    if (deviceInfo.platform === 'ios' && deviceInfo.viewportHeight > 800) {
      return { height: `calc(100vh - 100px)` };
    }
    
    return { height: '100vh' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black snap-y snap-mandatory overflow-y-auto scrollbar-hide touch-none"
    >
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={handleBack}
          className="p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
      </div>
      
      {reels.map((reel, index) => (
        <div 
          key={reel.id}
          className="relative w-full snap-start"
          style={getVideoContainerStyle()}
        >
          {/* Video Player */}
          <div className="absolute inset-0">
            <video
              ref={(el) => handleVideoRef(el, index)}
              data-index={index}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              playsInline
              muted={isMuted}
              poster={reel.thumbnail_url}
              controlsList="nodownload nofullscreen noremoteplayback"
              onError={(e) => handleVideoError(index, e)}
            >
              {/* Only set source for videos near the current view */}
              {Math.abs(index - currentIndex) <= 2 && (
                <source src={reel.video_url} type="video/mp4" />
              )}
              Browser yo tekkiriza kuzanya videos.
            </video>

            {/* Error Message */}
            {videoErrors[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center p-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-white">{videoErrors[index]}</p>
                  <button
                    onClick={() => {
                      const video = videoRefs.current[index];
                      if (video) {
                        // Restore source if needed
                        if (!video.src && video.dataset.originalSrc) {
                          video.src = video.dataset.originalSrc;
                          delete video.dataset.originalSrc;
                        }
                        playVideo(video, index);
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
                  >
                    Gezaako Nate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white">
              <h1 className="text-lg font-semibold ml-12">Videos</h1>
              <button 
                ref={volumeButtonRef}
                onClick={toggleMute}
                className="p-2 bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm transition-all"
              >
                {isMuted ? (
                  <VolumeX size={20} className="text-white" />
                ) : (
                  <Volume2 size={20} className="text-white" />
                )}
              </button>
            </div>

            {/* Volume Hint - Show briefly when a new video starts */}
            {isMuted && index === currentIndex && !volumeChangeDetected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-16 right-4 bg-black/60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm"
              >
                Tap volume or press volume buttons to unmute
              </motion.div>
            )}

            {/* Right Sidebar */}
            <div className={`absolute right-4 ${deviceInfo.isSmallScreen ? 'bottom-16' : 'bottom-24'} flex flex-col items-center space-y-6`}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleLike(reel.id)}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Heart 
                    size={24} 
                    className={isLiked[reel.id] ? 'fill-red-500 text-red-500' : 'text-white'} 
                  />
                </div>
                <span className="text-white text-sm mt-1">{reel.likes || 0}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <span className="text-white text-sm mt-1">{reel.comments || 0}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleShare(reel)}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Share2 size={24} className="text-white" />
                </div>
                <span className="text-white text-sm mt-1">{reel.shares || 0}</span>
              </motion.button>
            </div>

            {/* Bottom Info */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 text-white ${deviceInfo.isSmallScreen ? 'pb-16' : ''}`}>
              <h2 className="text-xl font-bold mb-2">{reel.title}</h2>
              <p className="text-sm text-white/80">{reel.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add type definitions for the global window object
declare global {
  interface Window {
    handleVolumeButtonPress: () => void;
  }
}
