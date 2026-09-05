// Project catalog for the Works / Portfolio section.
// To add a project, append a new entry — every field has sensible defaults
// and the UI will pick it up automatically.

export type Project = {
  slug: string
  title: string
  category: string
  country: string
  region: string
  year: string
  /** Two images minimum. The first is shown upright, the second is the
   *  tilted "playing card" alongside it. More than two are allowed — extras
   *  appear in the detail dialog gallery. */
  images: string[]
  facebook?: string
  instagram?: string
  website?: string
  /** Short blurb shown on the card and at the top of the dialog. */
  summary: string
  /** "About the work" section shown in the detail dialog. */
  about: string
  /** "How it was designed" section shown in the detail dialog. */
  designMethod: string
  /** Optional list of highlights shown as bullets in the dialog. */
  highlights?: string[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'horizon-marketing',
    title: 'Horizon Marketing',
    category: 'Brand & Growth',
    country: 'United Arab Emirates',
    region: 'Dubai',
    year: '2024',
    images: ['/works/horizon-marketing-1.svg', '/works/horizon-marketing-2.svg'],
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    website: 'https://example.com',
    summary:
      'A modular marketing site and campaign system built around a clear visual language and fast publishing workflow.',
    about:
      'Horizon Marketing needed a digital home that could keep up with weekly campaign launches. The site is built on WordPress with a custom block library so the team can ship new landing pages without engineering support, while the front end stays consistent with the brand.',
    designMethod:
      'The design pairs a deep teal/coral palette inherited from the brand with a confident display typeface. Layouts use a 12-column grid and shared section primitives to keep new pages on-brand without handholding.',
    highlights: [
      'Custom WordPress block library',
      'Reusable campaign templates',
      '12-column responsive grid',
      'WCAG AA accessibility',
    ],
  },
  {
    slug: 'lumen-store',
    title: 'Lumen Store',
    category: 'E-commerce',
    country: 'France',
    region: 'Paris',
    year: '2024',
    images: ['/works/lumen-store-1.svg', '/works/lumen-store-2.svg'],
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    summary:
      'A boutique e-commerce experience for a premium lighting studio, with curated collections and a refined product story.',
    about:
      'Lumen Store targets interior designers and boutique retailers who buy once and remember the experience. The site prioritises product photography, slow browsing, and clean editorial sections over aggressive merchandising.',
    designMethod:
      'A warm dark palette with a single coral accent guides attention to the add-to-cart action. Typography pairs a display serif for product names with a quiet sans for descriptions, and the product grid uses large images and minimal chrome to keep the focus on the pieces.',
    highlights: [
      'WooCommerce + custom theme',
      'Editorial product stories',
      'Designer wishlist & trade pricing',
      'Lazy-loaded imagery',
    ],
  },
  {
    slug: 'atlas-clinic',
    title: 'Atlas Clinic',
    category: 'Healthcare',
    country: 'Algeria',
    region: 'Algiers',
    year: '2023',
    images: ['/works/atlas-clinic-1.svg', '/works/atlas-clinic-2.svg'],
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    summary:
      'A specialist dental clinic site with a doctor-first appointment flow and a calm, trustworthy visual tone.',
    about:
      'Atlas Clinic wanted to look the opposite of a generic medical template. The site leads with the doctors, then services, then a simple 3-step appointment flow that ends in WhatsApp. The result is a site that feels personal without being informal.',
    designMethod:
      'A muted teal-on-near-black palette signals cleanliness without resorting to stock imagery. A weekly calendar component doubles as a visual anchor on the homepage and a functional booking surface deeper in the flow.',
    highlights: [
      'Doctor profile system',
      '3-step booking flow',
      'WhatsApp hand-off',
      'Multilingual ready (FR/AR/EN)',
    ],
  },
  {
    slug: 'khayal-studio',
    title: 'Khayal Studio',
    category: 'Creative Studio',
    country: 'Morocco',
    region: 'Casablanca',
    year: '2023',
    images: ['/works/khayal-studio-1.svg', '/works/khayal-studio-2.svg'],
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    summary:
      'A visual identity and motion studio with a portfolio site that frames each case study like a small exhibition.',
    about:
      'Khayal Studio is a multidisciplinary practice that needed a portfolio that respects the work. Each case study is a single, long page with breathing room between sections, so the work can lead and the chrome can disappear.',
    designMethod:
      'The site uses a centered, type-driven layout with one strong accent per case study. Hover states are minimal, motion is restrained, and the typography does the heavy lifting — which keeps the focus on the studio\'s craft.',
    highlights: [
      'Type-driven layouts',
      'Long-form case studies',
      'Custom CMS schema',
      'Subtle scroll-driven motion',
    ],
  },
  {
    slug: 'la-roche-designs',
    title: 'La Roche Designs - تصميم وتنفيذ ديكورات المناسبات الفاخرة',
    category: 'تصميم وتنفيذ ديكورات المناسبات',
    country: 'الإمارات العربية المتحدة / سوريا',
    region: 'الشرق الأوسط',
    year: '2026',
    images: ['/works/la-roche-designs-1.svg', '/works/la-roche-designs-2.svg'],
    facebook: 'https://www.facebook.com/profile.php?id=100066473259236',
    instagram: 'https://www.instagram.com/larochedesigns.sy',
    website: 'https://la-roche-designs.vercel.app',
    summary:
      'حلول مخصصة لتصميم وتنفيذ ديكورات المناسبات الفاخرة، مداخل الأفراح، ستاندات الأكريليك والمرايا، وتصنيع الهدايا.',
    about:
      'La Roche Designs متخصصة في تصميم وتنفيذ ديكورات المناسبات، تصنيع ستاندات الأكريليك والمرايا، وتقديم هدايا مخصصة. خبرة معلنة تمتد إلى 15 عاماً في تصميم وتنفيذ المناسبات الفاخرة في الإمارات، مع افتتاح فرع في سوريا لتقديم نفس الجودة والإبداع. نقدم حلولاً مخصصة تناسب احتياجات منظمي الحفلات والأفراد على حدٍّ سواء، مع اهتمام دقيق بكل تفصيلة من الفكرة إلى التنفيذ.',
    designMethod:
      'نعتمد أسلوب تصميم يبدأ بفهم الفكرة ومتطلبات العميل، ثم تطوير تصور بصري يتناسب مع طابع المناسبة، يلي ذلك اختيار الخامات وتحديد تفاصيل التنفيذ من مقاسات وتشطيبات، وأخيراً التصنيع والتنفيذ بعناية مع تسليم المشروع جاهزاً. نستخدم لوحة ألوان فاخرة تجمع بين الفحم (#1C1C1C)، العاج (#F6F1E8)، والذهبي الشمبانيا (#C8A96B) لإضفاء طابع راقي على كل تصميم، مع دعم كامل للغة العربية عبر تخطيط RTL وخطوط Cairo و Changa.',
    highlights: [
      'خبرة 15 عاماً في تصميم المناسبات الفاخرة',
      'حلول مخصصة لمنظمي الحفلات والأفراد',
      'تصنيع ستاندات أكريليك ومرايا',
      'تصميم مداخل مناسبات مميزة',
      'هدايا مخصصة بتصاميم فريدة',
      'دعم كامل للغة العربية (RTL) مع خطوط Cairo و Changa',
      'تصميم متجاوب (Responsive) يعمل على جميع الأجهزة',
      'واجهة فاخرة بألوان charcoal/ivory/champagne',
    ],
  },
  {
    slug: 'afandie-pharm',
    title: 'صيدلية الأفندي المركزية',
    category: 'Healthcare / Pharmacy',
    country: 'Palestine',
    region: 'Khan Younis - Abasan Al-Kabira',
    year: '2026',
    images: ['/works/afandie-pharm-1.svg', '/works/afandie-pharm-2.svg'],
    facebook: 'https://www.facebook.com/afandiepharm',
    instagram: 'https://instagram.com/afandie_pharmacy',
    website: 'https://afandiepharm.vercel.app/',
    summary:
      'موقع تعريفي لصيدلية الأفندي المركزية، يعرض الخدمات الصيدلانية ومعلومات التواصل للزوار في عبسان الكبيرة وخان يونس.',
    about:
      'صيدلية الأفندي المركزية هي صيدلية مجتمعية رائدة تقع في قلب عبسان الكبيرة بمحافظة خان يونس. تقدم خدمات صيدلانية شاملة تشمل صرف الأدوية، الاستشارات الصيدلانية، مستحضرات الأطفال والفيتامينات، إضافة إلى التثقيف الصحي عبر صفحات التواصل الاجتماعي. يستهدف الموقع أهل المنطقة الباحثين عن دواء موثوق واستشارة صيدلانية سريعة.',
    designMethod:
      'صُمم الموقع بأسلوب RTL عربي حديث باستخدام Next.js 16 وReact 19 مع مكتبة Tailwind CSS 4 لمظهر أنيق متجاوب. اعتمدنا على نظام بطاقات Cards ومسارات تنقل واضحة (Hero → About → Services → Why Us → Contact) مع تدرجات لونية هادئة باللونين الأخضر الزمردي والعنبر لإيصال إحساس الرعاية الصحية والثقة. تم استخدام خطوط Noto Sans Arabic لضمان قراءة مريحة، مع توافق كامل مع جميع أحجام الشاشات وإمكانية الوصول WCAG AA.',
    highlights: [
      'Next.js 16 + React 19',
      'Tailwind CSS 4 RTL',
      'Arabic Typography (Noto Sans Arabic)',
      'Responsive design (mobile-first)',
      'WhatsApp floating CTA',
      'Google Maps integration',
      'WCAG AA accessibility',
      'SEO optimized metadata',
    ],
  },
  {
    slug: 'ontario-pet-care',
    title: 'Ontario Pet Care',
    category: 'Pet Care Services',
    country: 'Canada',
    region: 'Ontario',
    year: '2015',
    images: ['/works/ontario-pet-care-1.svg', '/works/ontario-pet-care-2.svg'],
    facebook: 'https://www.facebook.com/ontariopetcare',
    instagram: 'https://www.instagram.com/ontariopetcare',
    website: 'https://ontariopetcare.ca',
    summary:
      'منصة خدمات متكاملة للعناية بالحيوانات الأليفة في أونتاريو، تقدم العناية والتنظيف والمشي والإقامة والرعاية البيطرية.',
    about:
      'Ontario Pet Care مشروع متخصص في رعاية الحيوانات الأليفة للعائلات في أونتاريو، مع تركيز على منطقة تورنتو الكبرى. يخدم المشروع الكلاب والقطط وغيرها من الحيوانات الأليفة من خلال فريق من المختصين ومقدمي الرعاية. تشمل الخدمات العناية اليومية، الإقامة، المشي، الجلوس، والرعاية البيطرية الطارئة.',
    designMethod:
      'يعتمد التصميم على واجهة ودودة ودافئة تعكس الثقة والاهتمام بالحيوانات الأليفة. يستخدم الموقع صورًا واقعية، وألوانًا مستوحاة من الطبيعة مثل الأخضر الزمردي، مع لمسات كهرمانية لإبراز الدعوات إلى الحجز. بُنيت التجربة كصفحة واحدة متجاوبة مع تنقل سلس، بطاقات خدمات واضحة، ونماذج حجز وتواصل مباشرة.',
    highlights: [
      'Next.js 16',
      'Responsive single-page design',
      'Pet grooming, walking, sitting and boarding',
      'Veterinary care booking',
      'Framer Motion animations',
      'SEO and Open Graph metadata',
      'Validated booking and contact forms',
    ],
  },
]
