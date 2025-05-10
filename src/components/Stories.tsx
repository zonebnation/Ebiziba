import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, Clock, ArrowLeft, Loader } from 'lucide-react';
import { useStories } from '../hooks/useStories';
import { useNavigation } from '../context/NavigationContext';
import { scheduleStoryNotification } from '../lib/notifications';

// Lazy load StoryViewer
const StoryViewer = React.lazy(() => import('./StoryViewer').then(module => ({ default: module.default })));

interface StoriesProps {
  notificationStoryId?: string | null;
}

export const Stories: React.FC<StoriesProps> = ({ notificationStoryId }) => {
  const { stories, loading, error } = useStories();
  const [selectedStory, setSelectedStory] = useState<typeof stories[0] | null>(null);
  const { goBack } = useNavigation();

  // If a notification story ID is provided, open that story
  useEffect(() => {
    if (notificationStoryId && stories.length > 0) {
      const story = stories.find(s => s.id === notificationStoryId);
      if (story) {
        setSelectedStory(story);
      }
    }
  }, [notificationStoryId, stories]);

  // Schedule a notification for a random story when the user views stories
  useEffect(() => {
    if (stories.length > 0) {
      // Get a random story that's not the currently selected one
      const availableStories = selectedStory 
        ? stories.filter(s => s.id !== selectedStory.id) 
        : stories;
      
      if (availableStories.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableStories.length);
        const randomStory = availableStories[randomIndex];
        
        // Schedule a notification for this story
        scheduleStoryNotification({
          id: randomStory.id,
          title: randomStory.title,
          excerpt: randomStory.excerpt
        }).catch(console.error);
      }
    }
  }, [stories, selectedStory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const featuredStory = stories[0];

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-primary-500 text-white p-6 rounded-b-[2rem]">
          <div className="flex items-center mb-2">
            <button
              onClick={goBack}
              className="mr-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Emboozi z'Eddiini</h1>
          </div>
          <p className="text-white/80">Okuyiga nga tuyita mu mboozi</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Featured Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            <div className="relative h-48">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {featuredStory.title}
                </h2>
                <div className="flex items-center text-white/80 space-x-4">
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {featuredStory.readTime} min read
                  </span>
                  <span className="flex items-center">
                    <BookOpen size={16} className="mr-1" />
                    Moral Story
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {featuredStory.excerpt}
              </p>
              <button 
                onClick={() => setSelectedStory(featuredStory)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Soma Emboozi Yonna</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* More Stories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Emboozi Endala
              </h3>
              <button className="text-primary-500 hover:text-primary-600 font-medium">
                View All
              </button>
            </div>

            {stories.slice(1).map((story) => (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedStory(story)}
                className="w-full card p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {story.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {story.excerpt}
                </p>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock size={14} className="mr-1" />
                  <span>{story.readTime} min read</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Loader className="w-10 h-10 text-white animate-spin" />
        </div>
      }>
        <AnimatePresence>
          {selectedStory && (
            <StoryViewer 
              story={selectedStory} 
              onClose={() => setSelectedStory(null)} 
            />
          )}
        </AnimatePresence>
      </Suspense>
    </>
  );
};
