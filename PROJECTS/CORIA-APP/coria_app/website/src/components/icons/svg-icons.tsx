import React from 'react';

interface SvgIconProps {
  className?: string;
  size?: number;
}

// AI Assistant Icon - From public/ai-assistant.svg
export const AIAssistantSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <rect x="6" y="8" width="12" height="8" rx="2" stroke="currentColor"/>
    <circle cx="10" cy="12" r="1.2" fill="currentColor"/>
    <circle cx="14" cy="12" r="1.2" fill="currentColor"/>
    <path d="M12 6 V8" stroke="currentColor"/>
    <circle cx="12" cy="5" r="1" stroke="currentColor"/>
  </svg>
);

// Carbon Water Icon - From public/carbon-water.svg
export const CarbonWaterSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M9 17 C7 14 8 11 11 9 C14 8 16 9.5 17 12" stroke="currentColor"/>
    <path d="M13 7 C15 9.5 15 12.5 13.5 14.3 C12 16 9.5 16 8 14.5" stroke="currentColor"/>
  </svg>
);

// Community Icon - From public/community.svg
export const CommunitySvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <circle cx="12" cy="9" r="3" stroke="currentColor"/>
    <path d="M5 20 C5 16 9 14 12 14 C15 14 19 16 19 20" stroke="currentColor"/>
  </svg>
);

// ESG Score Icon - From public/esg-score.svg
export const ESGScoreSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M7 15 A5 5 0 0 1 17 15" stroke="currentColor"/>
    <path d="M12 15 V10" stroke="currentColor"/>
  </svg>
);

// Health Icon - From public/health.svg
export const HealthSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M8 14 C9.5 12.5 11 12 13 12 C15 12 16 10.5 17 9" stroke="currentColor"/>
    <path d="M17 9 C17.5 10.5 17.2 12.5 15.8 13.8 C14 15.5 11 15.8 9 14" stroke="currentColor"/>
  </svg>
);

// Parents Icon - From public/parents.svg
export const ParentsSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <circle cx="12" cy="13" r="2.5" stroke="currentColor"/>
    <circle cx="9.5" cy="11.5" r="1" fill="currentColor"/>
    <circle cx="14.5" cy="11.5" r="1" fill="currentColor"/>
    <circle cx="8" cy="8" r="2" stroke="currentColor"/>
    <circle cx="16" cy="8" r="2" stroke="currentColor"/>
  </svg>
);

// Smart Pantry Icon - From public/smart-pantry.svg
export const SmartPantrySvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor"/>
    <rect x="7" y="8" width="3" height="3" rx="0.75" stroke="currentColor"/>
    <line x1="11" y1="9.5" x2="17" y2="9.5" stroke="currentColor"/>
    <rect x="7" y="13" width="3" height="3" rx="0.75" stroke="currentColor"/>
    <line x1="11" y1="14.5" x2="17" y2="14.5" stroke="currentColor"/>
  </svg>
);

// Sustainability Icon - From public/sustainability.svg
export const SustainabilitySvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <circle cx="12" cy="12" r="7" stroke="currentColor"/>
    <path d="M4.5 12 H19.5" stroke="currentColor"/>
    <path d="M12 5 C14 7.5 15 10.5 15 12 C15 14 14 17 12 19.5 C10 17 9 14 9 12 C9 10.5 10 7.5 12 5 Z" stroke="currentColor"/>
  </svg>
);

// Testimonial Analytics Icon - From public/testimonial-analytics.svg
export const TestimonialAnalyticsSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <polyline points="6,15 11,10 14,13 18,9" stroke="currentColor"/>
    <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor"/>
  </svg>
);

// Testimonial Chat Icon - From public/testimonial-chat.svg
export const TestimonialChatSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <rect x="5" y="6" width="14" height="10" rx="2" stroke="currentColor"/>
    <circle cx="9" cy="11" r="1" fill="currentColor"/>
    <circle cx="12" cy="11" r="1" fill="currentColor"/>
    <circle cx="15" cy="11" r="1" fill="currentColor"/>
  </svg>
);

// Testimonial Foundation Icon - From public/testimonial-foundation.svg
export const TestimonialFoundationSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M12 18 V12" stroke="currentColor"/>
    <path d="M12 12 C9 12 7 11 6 9 C9 9 11 10 12 12 Z" stroke="currentColor"/>
    <path d="M12 12 C15 12 17 11 18 9 C15 9 13 10 12 12 Z" stroke="currentColor"/>
  </svg>
);

// Vegan Allergen Icon - From public/vegan-allergen.svg
export const VeganAllergenSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M7 17 L17 7" stroke="currentColor"/>
    <rect x="15.5" y="5.5" width="3" height="3" transform="rotate(45 17 7)" stroke="currentColor"/>
    <path d="M5 5 L5 3 M3.5 4 L6.5 4" stroke="currentColor"/>
  </svg>
);

// Vegan User Icon - From public/vegan-user.svg
export const VeganUserSvgIcon: React.FC<SvgIconProps> = ({ className = "", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M12 12 C11 10 9 9 7.5 9 C6 9 5 10.5 5 12 C5 13.5 6.5 15 8 15 C10 15 11 13 12 12 Z" stroke="currentColor"/>
    <path d="M12 12 C13 10 15 9 16.5 9 C18 9 19 10.5 19 12 C19 13.5 17.5 15 16 15 C14 15 13 13 12 12 Z" stroke="currentColor"/>
  </svg>
);