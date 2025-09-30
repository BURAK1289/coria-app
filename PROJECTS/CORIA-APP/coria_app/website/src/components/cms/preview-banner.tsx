'use client';

import { usePreview } from '@/hooks/use-preview';

export default function PreviewBanner() {
  const { isPreview, exitPreview } = usePreview();
  
  if (!isPreview) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-sm font-medium">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>👁️</span>
          <span>Preview Mode Active - You are viewing draft content</span>
        </div>
        <button
          onClick={exitPreview}
          className="bg-black text-yellow-500 px-3 py-1 rounded text-xs font-medium hover:bg-gray-800 transition-colors"
        >
          Exit Preview
        </button>
      </div>
    </div>
  );
}