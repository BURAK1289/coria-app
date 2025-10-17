import fs from 'fs';
import path from 'path';

// Return CORIA logo SVG with circular mask as favicon
export default function Icon() {
  // Read the original CORIA logo
  const logoPath = path.join(process.cwd(), 'public', 'coria-logo.svg');
  const logoSvg = fs.readFileSync(logoPath, 'utf-8');

  // Wrap it in a circular SVG with white background
  const circularIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="circle-clip">
          <circle cx="256" cy="256" r="256"/>
        </clipPath>
      </defs>

      <!-- White circular background -->
      <circle cx="256" cy="256" r="256" fill="white"/>

      <!-- CORIA logo clipped to circle -->
      <g clip-path="url(#circle-clip)">
        <image href="/coria-logo.svg" width="512" height="512"/>
      </g>
    </svg>
  `.trim();

  return new Response(circularIcon, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0',
    },
  });
}
