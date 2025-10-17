'use client';

/**
 * CORIA Gray Scale Showcase Component
 * Demonstrates all 10 levels of the CORIA gray scale with accessibility information
 * JIRA-617: Gray scale implementation and validation
 */

export function GrayScaleShowcase() {
  const grayLevels = [
    {
      level: '50',
      hex: '#FBFAF7',
      usage: 'Lightest backgrounds, subtle highlights',
      contrast: '1.02:1',
      textSafe: false,
    },
    {
      level: '100',
      hex: '#F3EEE4',
      usage: 'Card backgrounds, light surfaces',
      contrast: '1.08:1',
      textSafe: false,
    },
    {
      level: '200',
      hex: '#E8E5E0',
      usage: 'Borders, dividers, disabled states',
      contrast: '1.14:1',
      textSafe: false,
    },
    {
      level: '300',
      hex: '#D4D0C9',
      usage: 'Subtle borders, input borders',
      contrast: '1.35:1',
      textSafe: false,
    },
    {
      level: '400',
      hex: '#B6B2AA',
      usage: 'Placeholder text, disabled text',
      contrast: '2.1:1',
      textSafe: false,
    },
    {
      level: '500',
      hex: '#7A8B7F',
      usage: 'Secondary text, captions (large text only)',
      contrast: '3.8:1',
      textSafe: 'large',
    },
    {
      level: '600',
      hex: '#5F6F64',
      usage: 'Body text, icons',
      contrast: '5.2:1',
      textSafe: true,
    },
    {
      level: '700',
      hex: '#46554B',
      usage: 'Headings, emphasized text',
      contrast: '7.2:1',
      textSafe: true,
    },
    {
      level: '800',
      hex: '#38453C',
      usage: 'Primary text, strong emphasis',
      contrast: '9.1:1',
      textSafe: true,
    },
    {
      level: '900',
      hex: '#2C3E34',
      usage: 'Headings, primary text, darkest',
      contrast: '11.3:1',
      textSafe: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-coria-gray-900 mb-4">
          CORIA Gray Scale System
        </h1>
        <p className="text-lg text-coria-gray-700 max-w-3xl">
          A 10-level neutral color palette designed for accessibility and organic minimalism.
          All colors are WCAG AA compliant for appropriate use cases.
        </p>
      </div>

      {/* Gray Scale Swatches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {grayLevels.map((gray) => (
          <div
            key={gray.level}
            className="border border-coria-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Color Swatch */}
            <div
              className={`h-32 flex items-center justify-center bg-coria-gray-${gray.level}`}
              style={{ backgroundColor: gray.hex }}
            >
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    parseInt(gray.level) >= 500 ? 'text-white' : 'text-coria-gray-900'
                  }`}
                >
                  {gray.level}
                </div>
                <div
                  className={`text-sm ${
                    parseInt(gray.level) >= 500 ? 'text-white/80' : 'text-coria-gray-700'
                  }`}
                >
                  {gray.hex}
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="p-4 bg-white">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-coria-gray-900">
                  coria-gray-{gray.level}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    gray.textSafe === true
                      ? 'bg-green-100 text-green-800'
                      : gray.textSafe === 'large'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {gray.textSafe === true
                    ? 'Text Safe ✓'
                    : gray.textSafe === 'large'
                    ? 'Large Text Only'
                    : 'Decorative Only'}
                </span>
              </div>
              <p className="text-sm text-coria-gray-700 mb-2">{gray.usage}</p>
              <div className="flex items-center gap-2 text-xs text-coria-gray-600">
                <span className="font-mono">{gray.contrast}</span>
                <span>contrast on white</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Examples */}
      <div className="space-y-12">
        {/* Typography Examples */}
        <section>
          <h2 className="text-2xl font-bold text-coria-gray-900 mb-6">Typography Examples</h2>
          <div className="space-y-4 bg-white border border-coria-gray-200 rounded-lg p-6">
            <h1 className="text-4xl font-bold text-coria-gray-900">
              Heading 1 - Gray 900 (11.3:1)
            </h1>
            <h2 className="text-3xl font-bold text-coria-gray-800">
              Heading 2 - Gray 800 (9.1:1)
            </h2>
            <h3 className="text-2xl font-semibold text-coria-gray-700">
              Heading 3 - Gray 700 (7.2:1)
            </h3>
            <p className="text-lg text-coria-gray-800">
              Body text using gray 800 for optimal readability (9.1:1 contrast ratio).
            </p>
            <p className="text-base text-coria-gray-700">
              Secondary body text using gray 700 (7.2:1 contrast ratio).
            </p>
            <p className="text-sm text-coria-gray-600">
              Smaller text using gray 600 (5.2:1 contrast ratio - still WCAG AA compliant).
            </p>
            <p className="text-lg text-coria-gray-500">
              Large caption text using gray 500 (3.8:1 - acceptable for 18px+ only).
            </p>
          </div>
        </section>

        {/* Card Examples */}
        <section>
          <h2 className="text-2xl font-bold text-coria-gray-900 mb-6">Card Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default Card */}
            <div className="bg-white border border-coria-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-coria-gray-900 mb-2">
                Default Card
              </h3>
              <p className="text-coria-gray-700 mb-4">
                White background with gray 200 border. Text uses gray 900 for headings and gray 700 for body.
              </p>
              <small className="text-coria-gray-600">Metadata in gray 600</small>
            </div>

            {/* Light Card */}
            <div className="bg-coria-gray-50 border border-coria-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-coria-gray-900 mb-2">
                Light Card
              </h3>
              <p className="text-coria-gray-700 mb-4">
                Gray 50 background provides subtle differentiation while maintaining excellent readability.
              </p>
              <small className="text-coria-gray-600">Still accessible</small>
            </div>

            {/* Outlined Card */}
            <div className="bg-white border-2 border-coria-gray-300 rounded-lg p-6 hover:border-coria-gray-400 transition-colors">
              <h3 className="text-xl font-semibold text-coria-gray-900 mb-2">
                Outlined Card
              </h3>
              <p className="text-coria-gray-700 mb-4">
                Emphasized border using gray 300, with hover state to gray 400.
              </p>
              <small className="text-coria-gray-600">Hover to see effect</small>
            </div>
          </div>
        </section>

        {/* Button Examples */}
        <section>
          <h2 className="text-2xl font-bold text-coria-gray-900 mb-6">Button Examples</h2>
          <div className="flex flex-wrap gap-4 bg-white border border-coria-gray-200 rounded-lg p-6">
            <button className="px-6 py-3 bg-coria-gray-100 text-coria-gray-900 border border-coria-gray-300 rounded-md hover:bg-coria-gray-200 hover:border-coria-gray-400 transition-colors">
              Secondary Button
            </button>
            <button className="px-6 py-3 bg-transparent text-coria-gray-700 border border-coria-gray-300 rounded-md hover:bg-coria-gray-50 transition-colors">
              Ghost Button
            </button>
            <button className="px-6 py-3 bg-white text-coria-gray-900 border-2 border-coria-gray-400 rounded-md hover:bg-coria-gray-50 hover:border-coria-gray-500 transition-colors">
              Outlined Button
            </button>
            <button
              className="px-6 py-3 bg-coria-gray-100 text-coria-gray-400 border border-coria-gray-200 rounded-md cursor-not-allowed"
              disabled
            >
              Disabled Button
            </button>
          </div>
        </section>

        {/* Form Examples */}
        <section>
          <h2 className="text-2xl font-bold text-coria-gray-900 mb-6">Form Examples</h2>
          <div className="bg-white border border-coria-gray-200 rounded-lg p-6 max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coria-gray-700 mb-2">
                  Default Input
                </label>
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full border border-coria-gray-300 bg-white text-coria-gray-900 placeholder:text-coria-gray-400 rounded-md px-4 py-2 focus:outline-none focus:border-coria-primary focus:ring-2 focus:ring-coria-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coria-gray-700 mb-2">
                  Disabled Input
                </label>
                <input
                  type="text"
                  placeholder="Disabled..."
                  disabled
                  className="w-full border border-coria-gray-200 bg-coria-gray-50 text-coria-gray-400 placeholder:text-coria-gray-300 rounded-md px-4 py-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coria-gray-700 mb-2">
                  Textarea
                </label>
                <textarea
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full border border-coria-gray-300 bg-white text-coria-gray-900 placeholder:text-coria-gray-400 rounded-md px-4 py-2 focus:outline-none focus:border-coria-primary focus:ring-2 focus:ring-coria-primary/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Information */}
        <section>
          <h2 className="text-2xl font-bold text-coria-gray-900 mb-6">
            Accessibility Guidelines
          </h2>
          <div className="bg-coria-gray-50 border border-coria-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-coria-gray-900 mb-3">
                  ✅ Safe for Text
                </h3>
                <ul className="space-y-2 text-coria-gray-700">
                  <li>• <strong>Gray 600-900</strong>: All text sizes</li>
                  <li>• <strong>Gray 500</strong>: Large text only (18px+)</li>
                  <li>• All meet WCAG AA standards</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-coria-gray-900 mb-3">
                  ⚠️ Decorative Only
                </h3>
                <ul className="space-y-2 text-coria-gray-700">
                  <li>• <strong>Gray 50-400</strong>: Backgrounds, borders</li>
                  <li>• <strong>Do not use</strong> for text content</li>
                  <li>• Insufficient contrast for readability</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
