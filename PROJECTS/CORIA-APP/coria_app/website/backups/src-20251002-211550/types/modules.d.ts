/**
 * Module resolution and asset import type declarations
 */

// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

// Image assets
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.avif' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

// SVG assets
declare module '*.svg' {
  import { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module '*.svg?inline' {
  import { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

// Font assets
declare module '*.woff' {
  const content: string;
  export default content;
}

declare module '*.woff2' {
  const content: string;
  export default content;
}

declare module '*.eot' {
  const content: string;
  export default content;
}

declare module '*.ttf' {
  const content: string;
  export default content;
}

declare module '*.otf' {
  const content: string;
  export default content;
}

// Video assets
declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

declare module '*.ogg' {
  const content: string;
  export default content;
}

declare module '*.avi' {
  const content: string;
  export default content;
}

declare module '*.mov' {
  const content: string;
  export default content;
}

// Audio assets
declare module '*.mp3' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}

declare module '*.flac' {
  const content: string;
  export default content;
}

declare module '*.aac' {
  const content: string;
  export default content;
}

// Document assets
declare module '*.pdf' {
  const content: string;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.md' {
  const content: string;
  export default content;
}

// Data files
declare module '*.json' {
  const content: any;
  export default content;
}

declare module '*.yaml' {
  const content: any;
  export default content;
}

declare module '*.yml' {
  const content: any;
  export default content;
}

declare module '*.toml' {
  const content: any;
  export default content;
}

declare module '*.xml' {
  const content: string;
  export default content;
}

// Web Workers
declare module '*.worker.ts' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

declare module '*.worker.js' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

// Service Workers
declare module '*.sw.ts' {
  const content: string;
  export default content;
}

declare module '*.sw.js' {
  const content: string;
  export default content;
}

// WebAssembly
declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}

// Shader files
declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}

declare module '*.frag' {
  const content: string;
  export default content;
}

// 3D model files
declare module '*.gltf' {
  const content: string;
  export default content;
}

declare module '*.glb' {
  const content: string;
  export default content;
}

declare module '*.obj' {
  const content: string;
  export default content;
}

declare module '*.fbx' {
  const content: string;
  export default content;
}

// Lottie animations
declare module '*.lottie' {
  const content: any;
  export default content;
}

// Custom file extensions for specific use cases
declare module '*.inline.svg' {
  import { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.component.svg' {
  import { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

// Next.js specific modules
declare module 'next/config' {
  export default function getConfig(): {
    publicRuntimeConfig: Record<string, any>;
    serverRuntimeConfig: Record<string, any>;
  };
}

declare module 'next/constants' {
  export const PHASE_DEVELOPMENT_SERVER: string;
  export const PHASE_PRODUCTION_BUILD: string;
  export const PHASE_PRODUCTION_SERVER: string;
  export const PHASE_EXPORT: string;
}

// Webpack specific
declare module '__webpack_public_path__' {
  const content: string;
  export default content;
}

declare module '__webpack_require__' {
  const content: any;
  export default content;
}

// Node.js specific modules for build-time usage
declare module 'fs' {
  export * from 'node:fs';
}

declare module 'path' {
  export * from 'node:path';
}

declare module 'url' {
  export * from 'node:url';
}

declare module 'crypto' {
  export * from 'node:crypto';
}

declare module 'os' {
  export * from 'node:os';
}

declare module 'util' {
  export * from 'node:util';
}

// Environment-specific module declarations
declare module 'process' {
  export = NodeJS.Process;
}

// Global module augmentations for better IDE support
declare global {
  // Webpack hot module replacement
  interface NodeModule {
    hot?: {
      accept(path?: string, callback?: () => void): void;
      decline(path?: string): void;
      dispose(callback: (data: any) => void): void;
      addDisposeHandler(callback: (data: any) => void): void;
      removeDisposeHandler(callback: (data: any) => void): void;
      check(autoApply?: boolean): Promise<string[] | null>;
      apply(options?: any): Promise<string[] | null>;
      status(): string;
      addStatusHandler(callback: (status: string) => void): void;
      removeStatusHandler(callback: (status: string) => void): void;
    };
  }

  // Parcel hot module replacement
  interface ParcelModule {
    hot?: {
      accept(callback: () => void): void;
      dispose(callback: () => void): void;
    };
  }

  // Vite hot module replacement
  interface ImportMeta {
    hot?: {
      accept(): void;
      accept(cb: (mod: any) => void): void;
      accept(dep: string, cb: (mod: any) => void): void;
      accept(deps: string[], cb: (mods: any[]) => void): void;
      dispose(cb: () => void): void;
      decline(): void;
      invalidate(): void;
      on(event: string, cb: (...args: any[]) => void): void;
      send(event: string, data?: any): void;
    };
    env: Record<string, string>;
    glob: (pattern: string) => Record<string, () => Promise<any>>;
    globEager: (pattern: string) => Record<string, any>;
  }
}

export {};