import { Locale } from '@/types/localization';

export interface HomeMetric {
  value: string;
  label: string;
  description?: string;
}

export interface HomeFeature {
  title: string;
  description: string;
  icon: string;
}

export interface HomePersona {
  title: string;
  description: string;
  highlights: string[];
  icon: string;
}

export interface HomeDemoStep {
  title: string;
  description: string;
}

export interface HomeImpactMetric {
  value: string;
  label: string;
  description: string;
}

export interface HomeImpactInsight {
  title: string;
  description: string;
}

export interface HomeFoundationPillar {
  title: string;
  description: string;
}

export interface HomeFoundationProject {
  title: string;
  impact: string;
}

export interface HomeArticle {
  title: string;
  excerpt: string;
  url: string;
  readTime: string;
}

export interface HomeFAQItem {
  question: string;
  answer: string;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    bullets: string[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    note?: string;
  };
  metrics: HomeMetric[];
  socialProof: {
    title: string;
    subtitle: string;
    items: { title: string; description: string; icon: string }[];
  };
  personas: HomePersona[];
  features: HomeFeature[];
  demo: {
    title: string;
    subtitle: string;
    posterAlt: string;
    steps: HomeDemoStep[];
    note: string;
    cta: { label: string; href: string };
  };
  impact: {
    title: string;
    subtitle: string;
    metrics: HomeImpactMetric[];
    insights: HomeImpactInsight[];
  };
  foundation: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    pillars: HomeFoundationPillar[];
    projects: HomeFoundationProject[];
    cta: { label: string; href: string };
  };
  blog: {
    title: string;
    subtitle: string;
    articles: HomeArticle[];
    cta: { label: string; href: string };
  };
  faq: {
    title: string;
    subtitle: string;
    items: HomeFAQItem[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}

const trContent: HomeContent = {
  hero: {
    eyebrow: 'Vegan, etik ve sürdürülebilir seçim asistanı',
    title: 'Kalbinle Seç. Etkiyle Yaşa.',
    subtitle:
      'Taradığın her ürünün veganlık, alerjen, sağlık ve sürdürülebilirlik skorlarını tek bakışta gör. Bilimsel verilerle desteklenen önerilerle her seferinde daha iyi seçim yap.',
    bullets: [
      'Veganlık, alerjen ve içerik riskleri için anlık uyarılar',
      'ESG, boykot ve marka etik profillerinin 360° görünümü',
      'Akıllı kiler, israf önleme ve karbon/su etkisi takibi'
    ],
    primaryCta: { label: 'iOS için indir', href: 'https://apps.apple.com/app/coria' },
    secondaryCta: { label: 'Android için indir', href: 'https://play.google.com/store/apps/details?id=com.coria.app' },
    note: 'Premium\'u 7 gün ücretsiz dene, istediğin zaman iptal et.'
  },
  metrics: [
    { value: '2.5B+', label: 'ürün etiketi analizi' },
    { value: '10M+', label: 'güncel içerik & etiket verisi' },
    { value: '500K+', label: 'aktif CORIA topluluğu' },
    { value: '1M+ kg', label: 'CO₂ tasarrufu' }
  ],
  socialProof: {
    title: 'Topluluk ve iş ortaklarımızdan destek',
    subtitle: 'CORIA, sürdürülebilir dönüşümün kalbinde yer alan bireylerin ve kurumların güvenilir yardımcısıdır.',
    items: [
      { title: '"Alışveriş rutinimi kurtardı"', description: '"Alerjen riskleri ve etik uyarılar sayesinde ailem için güvenli alışveriş yapmak artık saniyeler sürüyor." — Elif, ebeveyn', icon: '💬' },
      { title: '"Veriye dayalı ESG raporları"', description: '"Marka analizlerinde CORIA’nın verilerini referans alıyoruz; şeffaflık ve hız kombinasyonu eşsiz." — ImpactLab', icon: '📈' },
      { title: '"Foundation ile gerçek etki"', description: '"Token tabanlı modelleri sayesinde bağışlarımızın nereye harcandığını anlık takip ediyoruz." — Yeşil Enerji Kooperatifi', icon: '🌱' }
    ]
  },
  personas: [
    {
      title: 'Vegan & Vegan Adayları',
      description: 'Ürünleri saniyeler içinde tarayarak veganlığını, içerik risklerini ve daha iyi alternatifleri gör.',
      highlights: [
        'Özel vegan/vejetaryen filtreleri',
        'Topluluk yorumları ve deneyimleri',
        'Tarif önerileri ve market alışveriş listeleri'
      ],
      icon: '🥦'
    },
    {
      title: 'Ebeveynler',
      description: 'Alerjen, şeker, tuz ve katkı risklerini çocuklarının ihtiyaçlarına göre yönet.',
      highlights: [
        'Risk seviyeleriyle alerjen uyarıları',
        'Detaylı içerik açıklamaları',
        'Güvenli alternatif önerileri'
      ],
      icon: '🧸'
    },
    {
      title: 'Sağlık Odaklı Kullanıcılar',
      description: 'Besin değerlerini, sağlık skorlarını ve kişisel hedeflerini tek ekranda takip et.',
      highlights: [
        'Makro & mikro besin analizleri',
        'Şeker/tuz/protein sapma uyarıları',
        'Uzmanlardan onaylı içerik kütüphanesi'
      ],
      icon: '💪'
    },
    {
      title: 'Sürdürülebilirlik Savunucuları',
      description: 'Karbon, su ve etik etkileri karşılaştır; Foundation projeleriyle gerçek değişimi destekle.',
      highlights: [
        'Karbon & su ayak izi sayaçları',
        'ESG ve boykot verileri',
        'CORIA Foundation proje bağışları'
      ],
      icon: '🌍'
    }
  ],
  features: [
    {
      title: 'Vegan & Alerjen Analizi',
      description: 'Barkod tarayın, ürünün veganlık durumu, alerjen riskleri ve içerik açıklamaları anında listelensin.',
      icon: '🔍'
    },
    {
      title: 'AI Yaşam Asistanı',
      description: 'Sorularınızı sorun, tarif, alternatif ürün ve alışveriş listesi önerilerini kişiselleştirilmiş olarak alın.',
      icon: '🤖'
    },
    {
      title: 'Akıllı Kiler',
      description: 'SKT takibi, otomatik hatırlatmalar ve israfı azaltan kullanım önerileriyle kilerinizi yönetin.',
      icon: '🗄️'
    },
    {
      title: 'ESG & Etik Skorlar',
      description: 'Markaların çevresel, sosyal ve yönetişim performanslarını, boykot listelerini ve tedarik şeffaflığını inceleyin.',
      icon: '📊'
    },
    {
      title: 'Karbon & Su Etkisi',
      description: 'Her ürün seçimindeki karbon, su ve döngüsellik etkisini görün; alternatif senaryoları karşılaştırın.',
      icon: '💧'
    },
    {
      title: 'Topluluk ve İçerikler',
      description: 'Öne çıkan tarifler, kullanıcı deneyimleri, uzman yazıları ve sürdürülebilir yaşam rehberleri.',
      icon: '🤝'
    }
  ],
  demo: {
    title: '45 saniyede CORIA deneyimi',
    subtitle: 'Tara → Analiz Et → Daha İyi Seç akışını interaktif demo ile keşfet.',
    posterAlt: 'CORIA uygulama ekran akışı',
    steps: [
      { title: '1. Tara', description: 'Barkodu okuttuğun anda ürünün tüm bilgileri açılır.' },
      { title: '2. Analiz Et', description: 'Veganlık, alerjen, sağlık ve ESG skorlarını tek bakışta değerlendir.' },
      { title: '3. Daha İyi Seç', description: 'Alternatif ürünleri, tarif önerilerini ve israf önleyici ipuçlarını keşfet.' }
    ],
    note: 'Demo sesli anlatım ve altyazı desteklidir.',
    cta: { label: 'Demo videosunu izle', href: '#demo' }
  },
  impact: {
    title: 'Topluluğumuzun biriktirdiği etki',
    subtitle: 'Gerçek zamanlı sayaçlar, CORIA kullanıcılarının günlük kararlarla oluşturduğu kolektif katkıyı gösterir.',
    metrics: [
      { value: '34 kg', label: 'Bugünün CO₂ tasarrufu', description: 'Daha yeşil marka tercihleri ile.' },
      { value: '120 L', label: 'Bu haftaki su tasarrufu', description: 'Su yoğun ürünlerden akıllı alternatiflere geçiş sayesinde.' },
      { value: '45 kg', label: 'Bu ay önlenen gıda israfı', description: 'Akıllı kiler hatırlatmaları ve planlı alışverişle.' }
    ],
    insights: [
      {
        title: 'Kişisel etki paneli',
        description: 'Tüm seçimleriniz ton bazında CO₂, su ve etik puan olarak toplanır; hedefler belirleyip gelişiminizi takip edin.'
      },
      {
        title: 'Topluluk trendleri',
        description: 'Şehir bazlı liderlik tabloları, sezonluk tüketim rehberleri ve kampanyalarla harekete geçin.'
      }
    ]
  },
  foundation: {
    eyebrow: 'CORIA Foundation',
    title: 'Birlikte daha büyük etki yaratıyoruz',
    subtitle: 'Uygulama gelirlerinin %5\'i ve CORIA Token fee gelirleri yeşil enerji, veganlık ve sürdürülebilirlik projelerine aktarılıyor.',
    description:
      'Believe platformu üzerinden çıkarılacak Solana tabanlı CORIA Token ile şeffaf, zincir üstü bağış ve etki raporlama modeli kuruyoruz.',
    pillars: [
      { title: 'Şeffaf fon dağıtımı', description: 'Toplanan her token ve TL, zincir üstü dashboard\'da takip edilebiliyor.' },
      { title: 'Yerel projelere odak', description: 'Vegan restoran dönüşümü, gıda bankacılığı, orman restorasyonu gibi alanlara destek.' },
      { title: 'Topluluk oylaması', description: 'Yeni projeler CORIA topluluğunun oylarıyla seçiliyor ve ilerleme aylık raporlarla paylaşılıyor.' }
    ],
    projects: [
      { title: 'Anadolu Vegan Mutfağı', impact: 'İlk 6 ayda 2.4 ton gıda israfı önlendi.' },
      { title: 'Yeşil Enerji Kooperatifi', impact: 'Topluluk fonuyla 120 kW güneş enerjisi kuruldu.' },
      { title: 'Sıfır Atık Marketleri', impact: '5 şehirde yeniden kullanılabilir ambalaj altyapısı kuruldu.' }
    ],
    cta: { label: 'Foundation detaylarını incele', href: '/foundation' }
  },
  blog: {
    title: 'Bilinçli tüketim rehberleri',
    subtitle: 'Uzman yazıları, tarifler ve sürdürülebilir yaşam pratikleriyle her hafta güncellenen içerikler.',
    articles: [
      {
        title: 'Alerjen etiketlerini 60 saniyede çöz',
        excerpt: 'Gluten, laktoz, fındık ve daha fazlası için CORIA\'nın risk skorlarını nasıl yorumlayacağını öğren.',
        url: 'https://medium.com/@coria.app.com',
        readTime: '4 dk okuma'
      },
      {
        title: 'Karbon ayak izinizi market alışverişinde azaltın',
        excerpt: 'Sezonluk ürün seçimi ve yerel üretici önerileriyle çevresel etkinizi minimuma indirin.',
        url: 'https://medium.com/@coria.app.com',
        readTime: '5 dk okuma'
      },
      {
        title: 'Foundation projelerinde yeni dönem',
        excerpt: 'Solana token modeliyle şeffaf fonlama nasıl çalışıyor? İlk raporlar yayınlandı.',
        url: 'https://medium.com/@coria.app.com',
        readTime: '3 dk okuma'
      }
    ],
    cta: { label: 'Tüm içerikleri görüntüle', href: 'https://medium.com/@coria.app.com' }
  },
  faq: {
    title: 'Sık sorulan sorular',
    subtitle: 'CORIA\'yı kullanmaya başlamadan önce en çok merak edilenleri derledik.',
    items: [
      {
        question: 'CORIA Premium neler sunuyor?',
        answer:
          'Sınırsız ürün tarama, detaylı etki raporları, gelişmiş filtreler, israf azaltma önerileri ve Foundation projelerine katkı sertifikası.'
      },
      {
        question: 'Veri gizliliği nasıl sağlanıyor?',
        answer:
          'Kişisel veriler sadece profil deneyimini iyileştirmek için kullanılır, üçüncü taraflarla paylaşılmaz ve dilediğiniz an hesap verilerini silebilirsiniz.'
      },
      {
        question: 'Foundation projelerine nasıl başvurabilirim?',
        answer:
          'Foundation sayfasındaki başvuru formundan projenizi gönderebilir, değerlendirme süreci ve kriterleri detaylı inceleyebilirsiniz.'
      }
    ]
  },
  finalCta: {
    title: 'CORIA ile bilinçli tüketimin gücünü keşfet',
    subtitle: 'Topluluğumuza katılın, etki panelinizi açın ve sürdürülebilir geleceğe birlikte yön verin.',
    primary: { label: 'Foundation\'a katıl', href: '/foundation' },
    secondary: { label: 'Özellikleri keşfet', href: '/features' }
  }
};

const enContent: HomeContent = {
  hero: {
    eyebrow: 'Your vegan, ethical and sustainability co-pilot',
    title: 'Choose with Heart. Live with Impact.',
    subtitle:
      'See vegan status, allergen risks, health and sustainability scores for every product in seconds. Make better choices backed by science and transparency.',
    bullets: [
      'Instant vegan, vegetarian and allergen alerts',
      '360° ESG, boycott and ethical brand intelligence',
      'Smart pantry, waste reduction and carbon/water tracking'
    ],
    primaryCta: { label: 'Download for iOS', href: 'https://apps.apple.com/app/coria' },
    secondaryCta: { label: 'Download for Android', href: 'https://play.google.com/store/apps/details?id=com.coria.app' },
    note: 'Try Premium free for 7 days — cancel anytime.'
  },
  metrics: [
    { value: '2.5B+', label: 'product labels analysed' },
    { value: '10M+', label: 'verified ingredient insights' },
    { value: '500K+', label: 'active community members' },
    { value: '1M+ kg', label: 'CO₂ saved so far' }
  ],
  socialProof: {
    title: 'Trusted by a purpose-led community',
    subtitle: 'Individuals, cooperatives and mission-driven brands rely on CORIA to make measurable change.',
    items: [
      { title: '"Saved our family routine"', description: '"Allergen alerts and ethical guidance mean safer, faster shopping every week." — Sarah, parent', icon: '💬' },
      { title: '"Data we can act on"', description: '"We reference CORIA’s ESG insights in every sustainability report we publish." — ImpactLab', icon: '📈' },
      { title: '"Real impact tracking"', description: '"Foundation dashboards show exactly how our token donations fund local projects." — Green Energy Cooperative', icon: '🌱' }
    ]
  },
  personas: [
    {
      title: 'Vegans & Vegan-Curious',
      description: 'Scan and understand vegan status, ingredient risks and better alternatives in seconds.',
      highlights: [
        'Dedicated vegan/vegetarian filters',
        'Community reviews and shared experiences',
        'Curated recipes and mindful shopping lists'
      ],
      icon: '🥦'
    },
    {
      title: 'Parents',
      description: 'Stay on top of allergen, sugar, salt and additive risks tailored to your family’s needs.',
      highlights: [
        'Risk levels with clear allergen alerts',
        'Transparent ingredient explanations',
        'Trusted alternative suggestions'
      ],
      icon: '🧸'
    },
    {
      title: 'Health Guardians',
      description: 'Track nutrition scores, macros and personal targets — anywhere you shop.',
      highlights: [
        'Macro & micro nutrient breakdowns',
        'Alerts for sugar/salt/protein deviations',
        'Expert-backed wellness content library'
      ],
      icon: '💪'
    },
    {
      title: 'Impact Advocates',
      description: 'Compare carbon, water and ethical footprints — fund real projects through CORIA Foundation.',
      highlights: [
        'Real-time carbon & water dashboards',
        'ESG and boycott intelligence',
        'On-chain donations to verified projects'
      ],
      icon: '🌍'
    }
  ],
  features: [
    {
      title: 'Vegan & Allergen Intelligence',
      description: 'Scan a barcode to instantly reveal vegan status, allergen risks and clean ingredient explanations.',
      icon: '🔍'
    },
    {
      title: 'AI Lifestyle Assistant',
      description: 'Ask anything — get personalised product insights, recipes, shopping optimisation and waste-saving tips.',
      icon: '🤖'
    },
    {
      title: 'Smart Pantry',
      description: 'Track best-before dates, receive reminders and reduce waste with smart usage recommendations.',
      icon: '🗄️'
    },
    {
      title: 'ESG & Ethics Radar',
      description: 'Dive deep into brand ethics, boycott alerts and transparent supply-chain signals.',
      icon: '📊'
    },
    {
      title: 'Carbon & Water Footprints',
      description: 'Understand every choice across carbon, water and circularity metrics. Compare sustainable swaps.',
      icon: '💧'
    },
    {
      title: 'Community & Knowledge',
      description: 'Tap into curated guides, expert research, community stories and seasonal living tips.',
      icon: '🤝'
    }
  ],
  demo: {
    title: 'Experience CORIA in 45 seconds',
    subtitle: 'Scan → Analyse → Choose Better. See the full flow before downloading.',
    posterAlt: 'CORIA app walkthrough screens',
    steps: [
      { title: '1. Scan', description: 'A single tap pulls the entire product profile.' },
      { title: '2. Analyse', description: 'Review vegan, allergen, health and ESG scores together.' },
      { title: '3. Choose', description: 'Act on alternatives, pantry actions and personalised tips.' }
    ],
    note: 'Demo available with captions and descriptive audio.',
    cta: { label: 'Watch the interactive demo', href: '#demo' }
  },
  impact: {
    title: 'Community impact in real time',
    subtitle: 'Live counters highlight how CORIA members transform daily decisions into measurable change.',
    metrics: [
      { value: '34 kg', label: 'Today’s CO₂ savings', description: 'Driven by greener brand choices.' },
      { value: '120 L', label: 'Water preserved this week', description: 'Thanks to smarter seasonal swaps.' },
      { value: '45 kg', label: 'Food waste prevented this month', description: 'Guided by pantry reminders and smart recipes.' }
    ],
    insights: [
      {
        title: 'Personal impact dashboard',
        description: 'Set goals and track your cumulative carbon, water and ethical footprint improvements.'
      },
      {
        title: 'Community trends',
        description: 'Follow city leaderboards, seasonal campaigns and collaborative challenges.'
      }
    ]
  },
  foundation: {
    eyebrow: 'CORIA Foundation',
    title: 'Funding the future we believe in',
    subtitle: 'We direct 5% of revenues and CORIA Token fees to verified vegan, green energy and zero-waste projects.',
    description:
      'Through our partnership with Believe and a Solana-based token model, every contribution is transparently monitored on-chain.',
    pillars: [
      { title: 'Transparent allocation', description: 'Track every token and TL in a public impact dashboard.' },
      { title: 'Local-first projects', description: 'Support vegan kitchen transitions, food rescue and reforestation initiatives.' },
      { title: 'Community governance', description: 'Members vote for new projects and receive monthly progress updates.' }
    ],
    projects: [
      { title: 'Anatolia Vegan Kitchen', impact: '2.4 tons of food waste avoided in six months.' },
      { title: 'Green Energy Cooperative', impact: '120 kW solar capacity funded by the community.' },
      { title: 'Zero Waste Markets', impact: 'Reusable packaging infrastructure launched in five cities.' }
    ],
    cta: { label: 'Explore Foundation projects', href: '/foundation' }
  },
  blog: {
    title: 'Insights for conscious living',
    subtitle: 'Fresh guides, recipes and research-backed stories every week.',
    articles: [
      {
        title: 'Decode allergen labels in 60 seconds',
        excerpt: 'Learn how CORIA’s risk scoring keeps families safe from hidden triggers.',
        url: 'https://medium.com/@coria.app.com',
        readTime: '4 min read'
      },
      {
        title: 'Shrink your carbon footprint at the grocery store',
        excerpt: 'Seasonal produce tips, local sourcing and waste-free planning strategies.',
        url: 'https://medium.com/@coria.app.com',
        readTime: '5 min read'
      },
      {
        title: 'What’s new at CORIA Foundation?',
        excerpt: 'Our first Solana-powered impact reports and the projects they fuelled.',
        url: 'https://medium.com/@coria.app.com',
        readTime: '3 min read'
      }
    ],
    cta: { label: 'Browse all stories', href: 'https://medium.com/@coria.app.com' }
  },
  faq: {
    title: 'Frequently asked questions',
    subtitle: 'Short answers to help you get started quickly.',
    items: [
      {
        question: 'What’s included in CORIA Premium?',
        answer:
          'Unlimited scans, deep-dive impact reports, advanced filters, smart pantry automation and digital certificates for Foundation contributions.'
      },
      {
        question: 'How do you handle data privacy?',
        answer:
          'We only use personal data to personalise your experience, never sell it, and you can export or delete your profile at any time.'
      },
      {
        question: 'How can I apply with my project?',
        answer:
          'Submit via the Foundation application form, review the criteria and track evaluation milestones from your dashboard.'
      }
    ]
  },
  finalCta: {
    title: 'Join CORIA and lead the change',
    subtitle: 'Unlock your impact dashboard, support Foundation projects and access premium insights.',
    primary: { label: 'Discover Foundation', href: '/foundation' },
    secondary: { label: 'Explore features', href: '/features' }
  }
};

const fallbackContent = enContent;

export function getHomeContent(locale: string): HomeContent {
  const normalized = locale as Locale;
  if (normalized === 'tr') {
    return trContent;
  }
  if (normalized === 'en') {
    return enContent;
  }
  return fallbackContent;
}
