import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// CORIA Foundation Logo - Heart + Leaf kombinasyonu
export const CoriaFoundationIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
    <path
      d="M17 8c.5-2.5 2.5-4.5 5-5v2c-1.5.5-2.5 1.5-3 3-.5-1.5-1.5-2.5-3-3V3c2.5.5 4.5 2.5 5 5z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);

// Vegan & Alerjen Analizi
export const VeganAnalysisIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
      fill="currentColor"
    />
    <path
      d="M21 9V7L15 13L13.5 11.5C12.1 10.1 10.9 10.1 9.5 11.5L3 18V20H5L11.5 13.5C12.9 12.1 12.9 10.9 11.5 9.5L13 8L21 9Z"
      fill="currentColor"
    />
    <circle cx="17" cy="4" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="7" cy="6" r="1.5" fill="currentColor" opacity="0.6" />
    <path
      d="M6 14C6.83 14 7.5 14.67 7.5 15.5S6.83 17 6 17 4.5 16.33 4.5 15.5 5.17 14 6 14Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

// AI Asistan
export const AIAssistantIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2Z"
      fill="currentColor"
      opacity="0.1"
    />
    <path
      d="M12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6Z"
      fill="currentColor"
      opacity="0.2"
    />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path
      d="M12 16C13.66 16 15 14.66 15 13H9C9 14.66 10.34 16 12 16Z"
      fill="currentColor"
      opacity="0.7"
    />
    <path
      d="M12 1L13.09 3.26L15.18 2.17L15.83 4.83L18.49 4.18L17.74 6.91L20.74 7.4L19.26 9.91L21.91 11.09L19.83 13.18L21.83 15.17L19.09 16.26L20.17 18.83L17.83 19.09L18.83 21.83L16.26 20.91L15.18 22.83L13.09 20.74L12 22L10.91 20.74L8.82 22.83L7.74 20.91L5.17 21.83L6.17 19.09L3.83 18.83L5.91 16.26L3.09 15.17L4.17 13.18L2.09 11.09L4.74 9.91L3.26 7.4L6.26 6.91L5.51 4.18L8.17 4.83L7.82 2.17L9.91 3.26L12 1Z"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />
  </svg>
);

// Akıllı Kiler
export const SmartPantryIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" opacity="0.1" />
    <rect x="6" y="5" width="12" height="3" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="6" y="10" width="12" height="3" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="6" y="15" width="12" height="3" rx="1" fill="currentColor" opacity="0.3" />
    <circle cx="16" cy="6.5" r="1" fill="currentColor" />
    <circle cx="16" cy="11.5" r="1" fill="currentColor" />
    <circle cx="16" cy="16.5" r="1" fill="currentColor" />
    <path
      d="M8 6.5H14M8 11.5H14M8 16.5H14"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M20 9V7L22 9L20 11V9Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

// ESG Skorları
export const ESGScoreIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
    <path
      d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.3"
    />
    <path
      d="M12 6V12L16 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <rect x="6" y="18" width="2" height="4" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="9" y="16" width="2" height="6" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="12" y="14" width="2" height="8" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="15" y="12" width="2" height="10" rx="1" fill="currentColor" />
  </svg>
);

// Karbon/Su Takibi
export const CarbonWaterTrackingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
    <path
      d="M8 12C8 12 10 8 12 8C14 8 16 12 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M12 8C12 8 10 4 8 4C6 4 4 8 4 8C4 10.21 5.79 12 8 12C10.21 12 12 10.21 12 8Z"
      fill="currentColor"
      opacity="0.3"
    />
    <path
      d="M20 16C20 16 18 12 16 12C14 12 12 16 12 16C12 18.21 13.79 20 16 20C18.21 20 20 18.21 20 16Z"
      fill="currentColor"
      opacity="0.4"
    />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="20" cy="8" r="1" fill="currentColor" />
    <circle cx="4" cy="20" r="1" fill="currentColor" />
  </svg>
);

// Topluluk Önerileri
export const CommunityIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="9" cy="7" r="4" fill="currentColor" opacity="0.3" />
    <circle cx="15" cy="7" r="4" fill="currentColor" opacity="0.3" />
    <circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.4" />
    <path
      d="M9 13C6.33 13 1 14.34 1 17V20H17V17C17 14.34 11.67 13 9 13Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M15 13C14.67 13 14.29 13.02 13.9 13.05C15.23 13.78 16 14.85 16 17V20H23V17C23 14.34 17.67 13 15 13Z"
      fill="currentColor"
      opacity="0.2"
    />
    <circle cx="12" cy="2" r="1" fill="currentColor" />
    <circle cx="6" cy="4" r="1" fill="currentColor" />
    <circle cx="18" cy="4" r="1" fill="currentColor" />
    <circle cx="3" cy="9" r="1" fill="currentColor" />
    <circle cx="21" cy="9" r="1" fill="currentColor" />
  </svg>
);

// Token Ekonomisi
export const TokenEconomyIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
    <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.2" />
    <path
      d="M12 8V16M8 10H16M8 14H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.4" />
    <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.4" />
    <circle cx="6" cy="18" r="2" fill="currentColor" opacity="0.4" />
    <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.4" />
    <path
      d="M6 6L12 12M18 6L12 12M6 18L12 12M18 18L12 12"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />
  </svg>
);

// Şeffaflık
export const TransparencyIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
    <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.1" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path
      d="M12 2V6M12 18V22M22 12H18M6 12H2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.4"
    />
    <path
      d="M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

// Etki Odaklılık
export const ImpactFocusIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <path
      d="M12 1V5M12 19V23M23 12H19M5 12H1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3 3L7 7M17 17L21 21M21 3L17 7M7 17L3 21"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="12" cy="4" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="20" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="4" cy="12" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="12" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// Yeşil Enerji
export const GreenEnergyIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.3" />
    <path
      d="M8 12H16L14 16H10L8 12Z"
      fill="currentColor"
      opacity="0.6"
    />
    <rect x="11" y="16" width="2" height="6" fill="currentColor" opacity="0.4" />
    <path
      d="M12 4V2M16 6L17.5 4.5M18 10H20M16 14L17.5 15.5M8 6L6.5 4.5M6 10H4M8 14L6.5 15.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
);

// Sürdürülebilirlik
export const SustainabilityIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L13.09 8.26L20 4L15.74 10.91L22 12L15.74 13.09L20 20L13.09 15.74L12 22L10.91 15.74L4 20L8.26 13.09L2 12L8.26 10.91L4 4L10.91 8.26L12 2Z"
      fill="currentColor"
      opacity="0.2"
    />
    <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.1" />
    <path
      d="M12 8C10 8 8 10 8 12C8 14 10 16 12 16C14 16 16 14 16 12C16 10 14 8 12 8Z"
      fill="currentColor"
      opacity="0.3"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path
      d="M12 6V4M12 20V18M18 12H20M4 12H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ========== CUSTOM CORIA ICONS - yeni-tasarım.md v2.0 ==========

// Yaprak - Organic Minimalism Design
export const LeafIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7 21C10.5 18 12 15 12 12C12 8 10 4 6 2C4 4 2 8 2 12C2 15 3.5 18 7 21Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M17 21C20.5 18 22 15 22 12C22 8 20 4 16 2C14 4 12 8 12 12C12 15 13.5 18 17 21Z"
      fill="currentColor"
      opacity="0.3"
    />
    <path
      d="M6 2C8 6 10 8 12 12C14 8 16 6 18 2"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M6 8C8 10 10 11 12 12C14 11 16 10 18 8"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.4"
    />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

// Karbon - Carbon Footprint Tracking
export const CarbonIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.1" />
    <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.2" />
    <path
      d="M12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4Z"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
    />
    <path
      d="M8.5 8.5C9.5 7.5 10.7 7 12 7C15.3 7 18 9.7 18 13C18 14.3 17.5 15.5 16.5 16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M15.5 15.5C14.5 16.5 13.3 17 12 17C8.7 17 6 14.3 6 11C6 9.7 6.5 8.5 7.5 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.7" />
    <circle cx="16" cy="16" r="1" fill="currentColor" opacity="0.7" />
  </svg>
);

// Su - Water Footprint Tracking
export const WaterIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C8 6 6 10 6 14C6 18.4 8.7 22 12 22C15.3 22 18 18.4 18 14C18 10 16 6 12 2Z"
      fill="currentColor"
      opacity="0.4"
    />
    <path
      d="M12 4C9 7 8 10 8 13C8 16.3 9.8 19 12 19C14.2 19 16 16.3 16 13C16 10 15 7 12 4Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 6C10 8.5 9.5 10.5 9.5 12.5C9.5 15 10.7 17 12 17C13.3 17 14.5 15 14.5 12.5C14.5 10.5 14 8.5 12 6Z"
      fill="currentColor"
      opacity="0.6"
    />
    <ellipse cx="12" cy="13" rx="3" ry="4" fill="currentColor" opacity="0.1" />
    <circle cx="10" cy="11" r="0.5" fill="currentColor" opacity="0.8" />
    <circle cx="14" cy="12" r="0.5" fill="currentColor" opacity="0.8" />
    <circle cx="12" cy="15" r="1" fill="currentColor" opacity="0.9" />
  </svg>
);

// Kalp - Love for Planet & Animals
export const HeartIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M12 19.35l-1.2-1.1C6.5 14.2 4 11.5 4 8.5 4 6.5 5.5 5 7.5 5c1.1 0 2.2.5 3 1.3.3.3.5.7.5 1.2 0 .5-.2.9-.5 1.2C9.7 9.5 9 10.5 9 11.5c0 1 .7 2 1.5 2.7.8-.7 1.5-1.7 1.5-2.7 0-1-.7-2-1.5-2.7-.3-.3-.5-.7-.5-1.2 0-.5.2-.9.5-1.2.8-.8 1.9-1.3 3-1.3 2 0 3.5 1.5 3.5 3.5 0 3-2.5 5.7-6.8 9.8l-1.2 1.1z"
      fill="currentColor"
      opacity="0.3"
    />
    <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="16" cy="7" r="1" fill="currentColor" opacity="0.6" />
    <path
      d="M12 14C11 13 10 12 10 10.5C10 9.7 10.7 9 11.5 9S13 9.7 13 10.5C13 12 12 13 12 14Z"
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
);

// Döngü - Circular Economy & Sustainability Cycle
export const CycleIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.2"
    />
    <path
      d="M4 12C4 7.58 7.58 4 12 4C14.5 4 16.7 5.2 18 7.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M20 12C20 16.42 16.42 20 12 20C9.5 20 7.3 18.8 6 16.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.4"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.9" />

    {/* Direction arrows */}
    <path d="M16 7L18 7L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M8 17L6 17L7 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

    {/* Organic flow indicators */}
    <circle cx="6" cy="8" r="1" fill="currentColor" opacity="0.4" />
    <circle cx="18" cy="16" r="1" fill="currentColor" opacity="0.4" />
    <circle cx="8" cy="6" r="0.5" fill="currentColor" opacity="0.3" />
    <circle cx="16" cy="18" r="0.5" fill="currentColor" opacity="0.3" />
  </svg>
);