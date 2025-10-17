import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

// Country to locale mapping based on geographic location
// Covers ~200 countries with sensible language defaults
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  // ========== TURKISH SPEAKING REGIONS ==========
  'TR': 'tr', // Turkey
  'CY': 'tr', // Cyprus (Northern Cyprus)

  // ========== GERMAN SPEAKING REGIONS ==========
  'DE': 'de', // Germany
  'AT': 'de', // Austria
  'CH': 'de', // Switzerland (German-speaking majority: 65%)
  'LI': 'de', // Liechtenstein

  // ========== FRENCH SPEAKING REGIONS ==========
  // Europe
  'FR': 'fr', // France
  'BE': 'fr', // Belgium (French-speaking: 40%)
  'MC': 'fr', // Monaco
  'LU': 'fr', // Luxembourg (French/German mix)

  // Americas
  'CA': 'fr', // Canada (Quebec - prioritize French speakers: 21%)

  // French-speaking Africa (Francophone)
  'SN': 'fr', // Senegal
  'CI': 'fr', // Ivory Coast (Côte d'Ivoire)
  'ML': 'fr', // Mali
  'BF': 'fr', // Burkina Faso
  'NE': 'fr', // Niger
  'TD': 'fr', // Chad
  'GN': 'fr', // Guinea
  'BJ': 'fr', // Benin
  'TG': 'fr', // Togo
  'CF': 'fr', // Central African Republic
  'CG': 'fr', // Republic of Congo
  'CD': 'fr', // Democratic Republic of Congo
  'GA': 'fr', // Gabon
  'CM': 'fr', // Cameroon
  'MG': 'fr', // Madagascar
  'RW': 'fr', // Rwanda
  'BI': 'fr', // Burundi
  'DJ': 'fr', // Djibouti
  'KM': 'fr', // Comoros
  'SC': 'fr', // Seychelles
  'MU': 'fr', // Mauritius

  // French territories
  'RE': 'fr', // Réunion
  'GP': 'fr', // Guadeloupe
  'MQ': 'fr', // Martinique
  'GF': 'fr', // French Guiana
  'YT': 'fr', // Mayotte
  'NC': 'fr', // New Caledonia
  'PF': 'fr', // French Polynesia

  // ========== ENGLISH SPEAKING REGIONS ==========
  // Europe
  'GB': 'en', // United Kingdom
  'IE': 'en', // Ireland
  'MT': 'en', // Malta
  'NL': 'en', // Netherlands
  'DK': 'en', // Denmark
  'SE': 'en', // Sweden
  'NO': 'en', // Norway
  'FI': 'en', // Finland
  'IS': 'en', // Iceland
  'IT': 'en', // Italy
  'ES': 'en', // Spain
  'PT': 'en', // Portugal
  'GR': 'en', // Greece
  'PL': 'en', // Poland
  'CZ': 'en', // Czech Republic
  'SK': 'en', // Slovakia
  'HU': 'en', // Hungary
  'RO': 'en', // Romania
  'BG': 'en', // Bulgaria
  'HR': 'en', // Croatia
  'SI': 'en', // Slovenia
  'EE': 'en', // Estonia
  'LV': 'en', // Latvia
  'LT': 'en', // Lithuania
  'AL': 'en', // Albania
  'MK': 'en', // North Macedonia
  'RS': 'en', // Serbia
  'BA': 'en', // Bosnia and Herzegovina
  'ME': 'en', // Montenegro
  'XK': 'en', // Kosovo
  'UA': 'en', // Ukraine
  'BY': 'en', // Belarus
  'MD': 'en', // Moldova

  // Americas
  'US': 'en', // United States
  'MX': 'en', // Mexico
  'BR': 'en', // Brazil
  'AR': 'en', // Argentina
  'CL': 'en', // Chile
  'CO': 'en', // Colombia
  'PE': 'en', // Peru
  'VE': 'en', // Venezuela
  'EC': 'en', // Ecuador
  'BO': 'en', // Bolivia
  'PY': 'en', // Paraguay
  'UY': 'en', // Uruguay
  'CR': 'en', // Costa Rica
  'PA': 'en', // Panama
  'GT': 'en', // Guatemala
  'HN': 'en', // Honduras
  'SV': 'en', // El Salvador
  'NI': 'en', // Nicaragua
  'DO': 'en', // Dominican Republic
  'CU': 'en', // Cuba
  'JM': 'en', // Jamaica
  'TT': 'en', // Trinidad and Tobago
  'BB': 'en', // Barbados
  'BS': 'en', // Bahamas
  'BZ': 'en', // Belize
  'GY': 'en', // Guyana
  'SR': 'en', // Suriname

  // Asia
  'IN': 'en', // India
  'PK': 'en', // Pakistan
  'BD': 'en', // Bangladesh
  'PH': 'en', // Philippines
  'SG': 'en', // Singapore
  'MY': 'en', // Malaysia
  'TH': 'en', // Thailand
  'VN': 'en', // Vietnam
  'ID': 'en', // Indonesia
  'JP': 'en', // Japan
  'KR': 'en', // South Korea
  'CN': 'en', // China
  'HK': 'en', // Hong Kong
  'TW': 'en', // Taiwan
  'MO': 'en', // Macau
  'KH': 'en', // Cambodia
  'LA': 'en', // Laos
  'MM': 'en', // Myanmar
  'NP': 'en', // Nepal
  'LK': 'en', // Sri Lanka
  'MV': 'en', // Maldives
  'BT': 'en', // Bhutan
  'MN': 'en', // Mongolia
  'KZ': 'en', // Kazakhstan
  'UZ': 'en', // Uzbekistan
  'TM': 'en', // Turkmenistan
  'KG': 'en', // Kyrgyzstan
  'TJ': 'en', // Tajikistan
  'AF': 'en', // Afghanistan

  // Africa (English-speaking & others)
  'ZA': 'en', // South Africa
  'NG': 'en', // Nigeria
  'KE': 'en', // Kenya
  'GH': 'en', // Ghana
  'UG': 'en', // Uganda
  'TZ': 'en', // Tanzania
  'ZW': 'en', // Zimbabwe
  'ZM': 'en', // Zambia
  'MW': 'en', // Malawi
  'BW': 'en', // Botswana
  'NA': 'en', // Namibia
  'LS': 'en', // Lesotho
  'SZ': 'en', // Eswatini
  'ET': 'en', // Ethiopia
  'SO': 'en', // Somalia
  'SD': 'en', // Sudan
  'SS': 'en', // South Sudan
  'ER': 'en', // Eritrea
  'EG': 'en', // Egypt
  'LY': 'en', // Libya
  'TN': 'en', // Tunisia
  'DZ': 'en', // Algeria
  'MA': 'en', // Morocco
  'MR': 'en', // Mauritania
  'GM': 'en', // Gambia
  'SL': 'en', // Sierra Leone
  'LR': 'en', // Liberia
  'GW': 'en', // Guinea-Bissau
  'CV': 'en', // Cape Verde
  'ST': 'en', // São Tomé and Príncipe
  'AO': 'en', // Angola
  'MZ': 'en', // Mozambique

  // Oceania
  'AU': 'en', // Australia
  'NZ': 'en', // New Zealand
  'FJ': 'en', // Fiji
  'PG': 'en', // Papua New Guinea
  'SB': 'en', // Solomon Islands
  'VU': 'en', // Vanuatu
  'WS': 'en', // Samoa
  'TO': 'en', // Tonga
  'KI': 'en', // Kiribati
  'TV': 'en', // Tuvalu
  'NR': 'en', // Nauru
  'PW': 'en', // Palau
  'FM': 'en', // Micronesia
  'MH': 'en', // Marshall Islands

  // Middle East
  'AE': 'en', // United Arab Emirates
  'SA': 'en', // Saudi Arabia
  'QA': 'en', // Qatar
  'KW': 'en', // Kuwait
  'BH': 'en', // Bahrain
  'OM': 'en', // Oman
  'JO': 'en', // Jordan
  'LB': 'en', // Lebanon
  'IL': 'en', // Israel
  'PS': 'en', // Palestine
  'SY': 'en', // Syria
  'IQ': 'en', // Iraq
  'IR': 'en', // Iran
  'YE': 'en', // Yemen
  'AM': 'en', // Armenia
  'AZ': 'en', // Azerbaijan
  'GE': 'en', // Georgia

  // Other regions
  'RU': 'en', // Russia
  'GE': 'en', // Georgia
};

// Detect locale based on geographic location
function detectLocaleFromGeo(request: NextRequest): string | undefined {
  // Vercel automatically adds geo headers in Edge Runtime
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country');

  if (country) {
    return COUNTRY_LOCALE_MAP[country];
  }

  return undefined;
}

const intlMiddleware = createMiddleware({
  ...routing,

  // Custom locale detection function
  localeDetection: true,

  // Cookie name for locale persistence
  localeCookie: {
    name: 'NEXT_LOCALE',
    // Cookie expires in 1 year
    maxAge: 31536000,
    // Available across all paths
    path: '/',
    // Secure in production
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },

  // Set html lang attribute for SEO and accessibility
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect removed pages (Press, API, Help Center) to home with 308 (Permanent Redirect)
  const removedPagePattern = /^\/(tr|en|de|fr)\/(press|api|help-center)(\/.*)?$/;
  const match = pathname.match(removedPagePattern);

  if (match) {
    const locale = match[1];
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return Response.redirect(url, 308);
  }

  // Priority: Cookie > Geo-location > Accept-Language header > defaultLocale

  // If no locale cookie exists, try geo-location detection
  const localeCookie = request.cookies.get('NEXT_LOCALE');

  if (!localeCookie) {
    const geoLocale = detectLocaleFromGeo(request);

    if (geoLocale && routing.locales.includes(geoLocale as any)) {
      // Clone the request to add custom header for locale detection
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-detected-locale', geoLocale);

      const response = intlMiddleware(request);

      // Set the detected locale as default Accept-Language if not present
      if (response && !request.headers.get('accept-language')) {
        response.headers.set('accept-language', `${geoLocale},en;q=0.9`);
      }

      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|fr|tr)/:path*']
};