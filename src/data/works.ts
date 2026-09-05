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
