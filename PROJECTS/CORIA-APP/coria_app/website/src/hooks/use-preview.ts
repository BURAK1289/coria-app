'use client';

import { useEffect, useState } from 'react';
import { isValidObject, isNonEmptyString } from '@/lib/type-guards';

interface PreviewData {
  [key: string]: unknown;
}

interface UsePreviewReturn {
  isPreview: boolean;
  previewData: PreviewData | null;
  exitPreview: () => Promise<void>;
}

export function usePreview(): UsePreviewReturn {
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  
  useEffect(() => {
    // Check if we're in preview mode by looking for preview cookies
    const checkPreviewMode = (): void => {
      if (typeof document !== 'undefined') {
        const previewCookie = document.cookie
          .split('; ')
          .find((row: string) => row.startsWith('__next_preview_data='));
        
        if (previewCookie) {
          setIsPreview(true);
          try {
            const cookieValue = previewCookie.split('=')[1];
            if (isNonEmptyString(cookieValue)) {
              const parsedData = JSON.parse(decodeURIComponent(cookieValue));
              if (isValidObject(parsedData)) {
                setPreviewData(parsedData as PreviewData);
              }
            }
          } catch (error) {
            console.error('Error parsing preview data:', error);
          }
        }
      }
    };
    
    checkPreviewMode();
  }, []);
  
  const exitPreview = async (): Promise<void> => {
    try {
      await fetch('/api/preview', { method: 'DELETE' });
      setIsPreview(false);
      setPreviewData(null);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error exiting preview mode:', error);
    }
  };
  
  return {
    isPreview,
    previewData,
    exitPreview,
  };
}