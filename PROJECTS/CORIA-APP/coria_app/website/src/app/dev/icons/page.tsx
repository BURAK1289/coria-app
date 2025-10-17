'use client';

import { useState, useMemo } from 'react';
import { Icon, IconName } from '@/components/icons/Icon';
import { getAvailableIcons } from '@/components/icons/icons-map';

// Icon categories with Turkish labels
const iconCategories = {
  'Tümü': 'all',
  'Temel İşlevler': 'core',
  'CORIA Markası': 'brand',
  'Sosyal Medya': 'social',
  'Navigasyon': 'navigation',
  'Aksiyonlar': 'actions',
  'Durum & Veri': 'status',
} as const;

const categoryMap: Record<string, IconName[]> = {
  core: ['apple', 'google-play', 'play', 'check', 'close', 'x', 'refresh', 'shield-check', 'arrow-up', 'chevron-down', 'envelope', 'chat', 'question', 'star'],
  brand: ['coria-foundation', 'heart', 'leaf', 'vegan-analysis', 'ai-assistant', 'smart-pantry', 'community', 'esg-score', 'carbon-water', 'carbon', 'water', 'sustainability', 'green-energy', 'cycle', 'token-economy', 'transparency', 'impact-focus'],
  social: ['twitter', 'linkedin', 'instagram', 'youtube', 'facebook'],
  navigation: ['home', 'menu', 'search', 'user', 'settings', 'filter', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-left', 'chevron-right'],
  actions: ['bell', 'download', 'upload', 'share', 'plus', 'minus', 'sort', 'cart', 'external-link', 'globe', 'language', 'wallet'],
  status: ['alert-triangle', 'bug', 'info', 'bar-chart', 'trending-up', 'file-text', 'flask', 'smartphone', 'book-open'],
};

// Standard icon sizes
const iconSizes = [
  { value: 16, label: '16px (Küçük)' },
  { value: 20, label: '20px (Orta)' },
  { value: 24, label: '24px (Varsayılan)' },
  { value: 32, label: '32px (Büyük)' },
  { value: 48, label: '48px (Çok Büyük)' },
  { value: 64, label: '64px (Hero)' },
];

// Brand color tokens from Color_Migration_Guide
const brandColors = [
  { name: 'Varsayılan', class: '', variable: 'currentColor' },
  { name: 'Primary', class: 'text-coria-primary', variable: 'var(--coria-primary)' },
  { name: 'Primary Dark', class: 'text-coria-primary-dark', variable: 'var(--coria-primary-dark)' },
  { name: 'Primary Light', class: 'text-coria-primary-light', variable: 'var(--coria-primary-light)' },
  { name: 'Açık Yeşil', class: 'text-acik-yesil', variable: 'var(--acik-yesil)' },
  { name: 'Su Yeşili', class: 'text-su-yesili', variable: 'var(--su-yesili)' },
  { name: 'Mercan', class: 'text-mercan', variable: 'var(--mercan)' },
  { name: 'Toprak', class: 'text-toprak', variable: 'var(--toprak)' },
  { name: 'Lime', class: 'text-lime', variable: 'var(--lime)' },
  { name: 'Sky', class: 'text-sky', variable: 'var(--sky)' },
  { name: 'Gold', class: 'text-gold', variable: 'var(--gold)' },
  { name: 'Başarı', class: 'text-coria-success', variable: 'var(--coria-success)' },
  { name: 'Uyarı', class: 'text-coria-warning', variable: 'var(--coria-warning)' },
  { name: 'Hata', class: 'text-coria-error', variable: 'var(--coria-error)' },
  { name: 'Bilgi', class: 'text-coria-info', variable: 'var(--coria-info)' },
];

export default function IconPlaygroundPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState(24);
  const [selectedColor, setSelectedColor] = useState('');
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  const allIcons = useMemo(() => getAvailableIcons(), []);

  const filteredIcons = useMemo(() => {
    let icons = allIcons;

    // Filter by category
    if (selectedCategory !== 'all') {
      icons = categoryMap[selectedCategory] || [];
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      icons = icons.filter(name => name.toLowerCase().includes(query));
    }

    return icons;
  }, [allIcons, selectedCategory, searchQuery]);

  const copyIconCode = (iconName: IconName, variant: 'tsx' | 'decorative' | 'interactive' | 'informational') => {
    const sizeCode = selectedSize !== 24 ? ` size={${selectedSize}}` : '';
    const colorCode = selectedColor ? ` className="${selectedColor}"` : '';

    let code = '';
    switch (variant) {
      case 'tsx':
        code = `<Icon name="${iconName}"${sizeCode}${colorCode} />`;
        break;
      case 'decorative':
        code = `<Icon name="${iconName}"${sizeCode}${colorCode} aria-hidden="true" />`;
        break;
      case 'interactive':
        code = `<button aria-label="Action description">\n  <Icon name="${iconName}"${sizeCode}${colorCode} aria-hidden="true" />\n</button>`;
        break;
      case 'informational':
        code = `<Icon name="${iconName}"${sizeCode}${colorCode} aria-label="Status description" />`;
        break;
    }

    navigator.clipboard.writeText(code);
    setCopiedIcon(`${iconName}-${variant}`);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-acik-gri to-coria-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-coria-gray-900 mb-4">
            Icon Playground
          </h1>
          <p className="text-lg text-coria-gray-600">
            CORIA İkon Sistemini Keşfedin - {allIcons.length} İkon, 6 Kategori
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-coria-gray-500">
            <span className="flex items-center gap-1">
              <Icon name="check" size={16} className="text-coria-success" aria-hidden="true" />
              Erişilebilir
            </span>
            <span className="flex items-center gap-1">
              <Icon name="check" size={16} className="text-coria-success" aria-hidden="true" />
              Tip Güvenli
            </span>
            <span className="flex items-center gap-1">
              <Icon name="check" size={16} className="text-coria-success" aria-hidden="true" />
              Tree-Shakeable
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-coria-gray-200">
          {/* Search */}
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-coria-gray-700 mb-2">
              İkon Ara
            </label>
            <div className="relative">
              <Icon
                name="search"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-coria-gray-400"
                aria-hidden="true"
              />
              <input
                id="search"
                type="text"
                placeholder="İkon adı ara... (örn: heart, search, download)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-coria-gray-300 rounded-lg focus:ring-2 focus:ring-coria-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-coria-gray-700 mb-2">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(iconCategories).map(([label, value]) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === value
                      ? 'bg-coria-primary text-white'
                      : 'bg-coria-gray-100 text-coria-gray-700 hover:bg-coria-gray-200'
                  }`}
                >
                  {label}
                  {value !== 'all' && ` (${categoryMap[value]?.length || 0})`}
                </button>
              ))}
            </div>
          </div>

          {/* Size Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-coria-gray-700 mb-2">
              Boyut: {selectedSize}px
            </label>
            <div className="flex flex-wrap gap-2">
              {iconSizes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedSize(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSize === value
                      ? 'bg-coria-primary text-white'
                      : 'bg-coria-gray-100 text-coria-gray-700 hover:bg-coria-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Control */}
          <div>
            <label className="block text-sm font-medium text-coria-gray-700 mb-2">
              Renk (Marka Tokenları)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {brandColors.map(({ name, class: colorClass, variable }) => (
                <button
                  key={name}
                  onClick={() => setSelectedColor(colorClass)}
                  className={`group relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedColor === colorClass
                      ? 'bg-coria-primary text-white ring-2 ring-coria-primary ring-offset-2'
                      : 'bg-coria-gray-100 text-coria-gray-700 hover:bg-coria-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-coria-gray-300 ${colorClass || 'bg-current'}`}
                      style={{ color: colorClass ? undefined : 'currentColor' }}
                    />
                    <span className="truncate">{name}</span>
                  </div>
                  <div className="absolute left-0 right-0 bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-coria-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {variable}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-coria-gray-600">
          {filteredIcons.length} ikon bulundu
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredIcons.map((iconName) => (
            <div
              key={iconName}
              className="bg-white rounded-xl shadow-sm border border-coria-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
            >
              {/* Icon Display */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-br from-coria-gray-50 to-white">
                <Icon
                  name={iconName}
                  size={selectedSize}
                  className={selectedColor || 'text-coria-gray-700'}
                  aria-label={iconName}
                />
              </div>

              {/* Icon Info */}
              <div className="p-4 border-t border-coria-gray-100">
                <div className="text-sm font-medium text-coria-gray-900 truncate mb-3">
                  {iconName}
                </div>

                {/* Copy Buttons */}
                <div className="space-y-1">
                  {/* Basic TSX */}
                  <button
                    onClick={() => copyIconCode(iconName, 'tsx')}
                    className="w-full text-xs px-2 py-1.5 bg-coria-gray-100 hover:bg-coria-primary hover:text-white rounded transition-colors text-left flex items-center justify-between group/btn"
                    aria-label={`Copy basic TSX code for ${iconName}`}
                  >
                    <span>TSX</span>
                    <Icon
                      name={copiedIcon === `${iconName}-tsx` ? 'check' : 'download'}
                      size={12}
                      className={copiedIcon === `${iconName}-tsx` ? 'text-coria-success' : ''}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Decorative */}
                  <button
                    onClick={() => copyIconCode(iconName, 'decorative')}
                    className="w-full text-xs px-2 py-1.5 bg-coria-gray-100 hover:bg-coria-primary hover:text-white rounded transition-colors text-left flex items-center justify-between group/btn"
                    aria-label={`Copy decorative pattern for ${iconName}`}
                  >
                    <span>Dekoratif</span>
                    <Icon
                      name={copiedIcon === `${iconName}-decorative` ? 'check' : 'download'}
                      size={12}
                      className={copiedIcon === `${iconName}-decorative` ? 'text-coria-success' : ''}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Interactive */}
                  <button
                    onClick={() => copyIconCode(iconName, 'interactive')}
                    className="w-full text-xs px-2 py-1.5 bg-coria-gray-100 hover:bg-coria-primary hover:text-white rounded transition-colors text-left flex items-center justify-between group/btn"
                    aria-label={`Copy interactive pattern for ${iconName}`}
                  >
                    <span>İnteraktif</span>
                    <Icon
                      name={copiedIcon === `${iconName}-interactive` ? 'check' : 'download'}
                      size={12}
                      className={copiedIcon === `${iconName}-interactive` ? 'text-coria-success' : ''}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Informational */}
                  <button
                    onClick={() => copyIconCode(iconName, 'informational')}
                    className="w-full text-xs px-2 py-1.5 bg-coria-gray-100 hover:bg-coria-primary hover:text-white rounded transition-colors text-left flex items-center justify-between group/btn"
                    aria-label={`Copy informational pattern for ${iconName}`}
                  >
                    <span>Bilgilendirici</span>
                    <Icon
                      name={copiedIcon === `${iconName}-informational` ? 'check' : 'download'}
                      size={12}
                      className={copiedIcon === `${iconName}-informational` ? 'text-coria-success' : ''}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIcons.length === 0 && (
          <div className="text-center py-12">
            <Icon name="search" size={48} className="text-coria-gray-400 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-coria-gray-900 mb-2">
              İkon bulunamadı
            </h3>
            <p className="text-coria-gray-600">
              Lütfen farklı bir arama terimi veya kategori deneyin.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-coria-gray-200">
          <h2 className="text-xl font-bold text-coria-gray-900 mb-4">
            Kullanım Kalıpları
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-coria-gray-800 mb-2 flex items-center gap-2">
                <Icon name="check" size={20} className="text-coria-success" aria-hidden="true" />
                Dekoratif İkonlar
              </h3>
              <p className="text-sm text-coria-gray-600 mb-2">
                Metin etiketi ile birlikte görünen ikonlar
              </p>
              <code className="block bg-coria-gray-100 p-3 rounded text-xs">
                {`<Icon name="download" aria-hidden="true" />\nİndir`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-coria-gray-800 mb-2 flex items-center gap-2">
                <Icon name="check" size={20} className="text-coria-success" aria-hidden="true" />
                İnteraktif İkonlar
              </h3>
              <p className="text-sm text-coria-gray-600 mb-2">
                Sadece ikon içeren butonlar/linkler
              </p>
              <code className="block bg-coria-gray-100 p-3 rounded text-xs">
                {`<button aria-label="Kapat">\n  <Icon name="close" aria-hidden="true" />\n</button>`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-coria-gray-800 mb-2 flex items-center gap-2">
                <Icon name="check" size={20} className="text-coria-success" aria-hidden="true" />
                Bilgilendirici İkonlar
              </h3>
              <p className="text-sm text-coria-gray-600 mb-2">
                Tek başına anlam taşıyan ikonlar
              </p>
              <code className="block bg-coria-gray-100 p-3 rounded text-xs">
                {`<Icon name="alert-triangle" aria-label="Uyarı" />`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-coria-gray-800 mb-2 flex items-center gap-2">
                <Icon name="check" size={20} className="text-coria-success" aria-hidden="true" />
                Boyut & Renk
              </h3>
              <p className="text-sm text-coria-gray-600 mb-2">
                Özelleştirilmiş ikonlar
              </p>
              <code className="block bg-coria-gray-100 p-3 rounded text-xs">
                {`<Icon\n  name="heart"\n  size={32}\n  className="text-coria-primary"\n/>`}
              </code>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-coria-gray-200">
            <h3 className="font-semibold text-coria-gray-800 mb-2">
              📚 Daha Fazla Bilgi
            </h3>
            <ul className="text-sm text-coria-gray-600 space-y-1">
              <li>• <a href="/docs/ui/Icon_Usage_Guide.md" className="text-coria-primary hover:underline">Icon Kullanım Kılavuzu</a></li>
              <li>• <a href="/docs/ui/Icon_Catalog_Guide.md" className="text-coria-primary hover:underline">Icon Katalog Kılavuzu</a></li>
              <li>• <a href="/docs/ui/Icon_A11y_Compliance_Report.md" className="text-coria-primary hover:underline">Erişilebilirlik Raporu</a></li>
              <li>• <a href="/storybook" className="text-coria-primary hover:underline">Storybook Galeri</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
