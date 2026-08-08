'use client';

import { useState } from 'react';

interface ScreenshotPreviewProps {
  url: string;
  type: 'desktop' | 'mobile';
  websiteUrl: string;
}

export default function ScreenshotPreview({ url, type, websiteUrl }: ScreenshotPreviewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (type === 'mobile') {
    return (
      <div className="flex flex-col items-center">
        <h3 className="font-semibold text-navy-900 mb-4">Mobile View</h3>
        {/* iPhone Mockup */}
        <div className="relative w-[280px] h-[560px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            <iframe
              src={websiteUrl}
              className="w-full h-full border-0"
              style={{ 
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
                width: '200%',
                height: '200%'
              }}
              title={`Mobile preview of ${websiteUrl}`}
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-semibold text-navy-900 mb-4">Desktop View</h3>
      {/* Browser Mockup */}
      <div className="w-full bg-white rounded-lg shadow-2xl border border-navy-200 overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-gray-200 px-4 py-2 flex items-center gap-2 border-b border-gray-300">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-navy-600 truncate ml-2">
            {websiteUrl}
          </div>
        </div>
        {/* Screen */}
        <div className="bg-white overflow-hidden relative" style={{ minHeight: '500px' }}>
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}
          <iframe
            src={websiteUrl}
            className="w-full border-0"
            style={{ minHeight: '500px' }}
            title={`Desktop preview of ${websiteUrl}`}
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
