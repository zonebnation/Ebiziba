import React from 'react';

// Lazy load the Quran components
export const lazyLoadQuranComponents = () => {
  return {
    SwipeableQuranReader: React.lazy(() => import('../components/quran/SwipeableQuranReader').then(module => ({ default: module.default }))),
    QuranSettings: React.lazy(() => import('../components/quran/QuranSettings').then(module => ({ default: module.QuranSettings }))),
    BookmarksManager: React.lazy(() => import('../components/quran/BookmarksManager').then(module => ({ default: module.BookmarksManager }))),
    QuranLanguageSelector: React.lazy(() => import('../components/quran/QuranLanguageSelector').then(module => ({ default: module.QuranLanguageSelector }))),
    OfflineDownloadManager: React.lazy(() => import('../components/quran/OfflineDownloadManager').then(module => ({ default: module.default })))
  };
};

// Lazy load the admin components
export const lazyLoadAdminComponents = () => {
  return {
    AdminConsole: React.lazy(() => import('../components/admin/AdminConsole').then(module => ({ default: module.AdminConsole }))),
    IPFSContentManager: React.lazy(() => import('../components/admin/IPFSContentManager').then(module => ({ default: module.IPFSContentManager }))),
    QuranPageManager: React.lazy(() => import('../components/admin/QuranPageManager').then(module => ({ default: module.QuranPageManager }))),
    VideoList: React.lazy(() => import('../components/admin/VideoList').then(module => ({ default: module.VideoList }))),
    BookList: React.lazy(() => import('../components/admin/BookList').then(module => ({ default: module.BookList })))
  };
};

// Lazy load the video components
export const lazyLoadVideoComponents = () => {
  return {
    VideoUpload: React.lazy(() => import('../components/VideoUpload').then(module => ({ default: module.VideoUpload }))),
    VideoEditor: React.lazy(() => import('../components/admin/VideoEditor').then(module => ({ default: module.VideoEditor })))
  };
};

// Lazy load the book components
export const lazyLoadBookComponents = () => {
  return {
    BookUpload: React.lazy(() => import('../components/admin/BookUpload').then(module => ({ default: module.BookUpload }))),
    BookEditor: React.lazy(() => import('../components/admin/BookEditor').then(module => ({ default: module.BookEditor }))),
    BookViewer: React.lazy(() => import('../components/BookViewer').then(module => ({ default: module.default })))
  };
};
