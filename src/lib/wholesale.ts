// Wholesale domain catalog displayed on the home page in a dedicated section.
// These entries are also seeded into the database by prisma/seed.ts so each
// domain has a real slug and detail modal works end-to-end.

export type WholesaleDomain = {
  name: string
  slug: string
  extension: string
  category: string
  description: string
  originalPrice: number
  wholesalePrice: number
}

export const WHOLESALE_DOMAINS: WholesaleDomain[] = [
  { name: 'healthsupplementscanada.com', slug: 'healthsupplementscanada-com', extension: '.com', category: 'Health', description: 'Ideal for a Canadian health supplements e-commerce store or wellness brand.', originalPrice: 499, wholesalePrice: 99 },
  { name: 'checkoutcircuit.com', slug: 'checkoutcircuit-com', extension: '.com', category: 'E-commerce', description: 'Perfect for a checkout optimization tool, payment gateway, or e-commerce platform.', originalPrice: 799, wholesalePrice: 99 },
  { name: 'pamperpetcare.com', slug: 'pamperpetcare-com', extension: '.com', category: 'Brandable', description: 'Great for a pet care subscription box, grooming service, or pet products brand.', originalPrice: 499, wholesalePrice: 99 },
  { name: 'raphip.com', slug: 'raphip-com', extension: '.com', category: 'Brandable', description: 'Short, memorable 6-letter brandable name. Ideal for a tech startup or creative agency.', originalPrice: 899, wholesalePrice: 99 },
  { name: 'torontogiftsdelivery.com', slug: 'torontogiftsdelivery-com', extension: '.com', category: 'Local Services', description: 'Perfect for a Toronto-based gift delivery service or local e-commerce business.', originalPrice: 399, wholesalePrice: 99 },
  { name: 'urgenteyeglasses.com', slug: 'urgenteyeglasses-com', extension: '.com', category: 'Health', description: 'Ideal for an emergency eyeglasses service, same-day optical delivery, or vision care brand.', originalPrice: 599, wholesalePrice: 99 },
  { name: '5damat-aldalil.com', slug: '5damat-aldalil-com', extension: '.com', category: 'Brandable', description: 'Arabic brandable name suitable for a Middle Eastern business or cultural platform.', originalPrice: 499, wholesalePrice: 99 },
  { name: 'testandplan.com', slug: 'testandplan-com', extension: '.com', category: 'SaaS', description: 'Great for a QA testing platform, project planning tool, or development workflow SaaS.', originalPrice: 699, wholesalePrice: 99 },
  { name: 'sitewebai.com', slug: 'sitewebai-com', extension: '.com', category: 'AI', description: 'Perfect for an AI website builder, web design tool, or AI-powered web platform.', originalPrice: 899, wholesalePrice: 99 },
  { name: 'monkeypens.com', slug: 'monkeypens-com', extension: '.com', category: 'Brandable', description: 'Fun, brandable name for a stationery brand, writing tools, or creative supplies store.', originalPrice: 499, wholesalePrice: 99 },
  { name: 'eatphoto.com', slug: 'eatphoto-com', extension: '.com', category: 'Brandable', description: 'Ideal for a food photography service, restaurant review platform, or foodie social app.', originalPrice: 699, wholesalePrice: 99 },
  { name: 'validatortest.com', slug: 'validatortest-com', extension: '.com', category: 'Technology', description: 'Perfect for a validation testing tool, form checker, or quality assurance platform.', originalPrice: 499, wholesalePrice: 99 },
  { name: 'bizarab.com', slug: 'bizarab-com', extension: '.com', category: 'Brandable', description: 'Short, catchy 7-letter brandable name. Great for an Arabic or international tech startup.', originalPrice: 799, wholesalePrice: 99 },
  { name: 'brightwavehub.com', slug: 'brightwavehub-com', extension: '.com', category: 'Technology', description: 'Ideal for a tech hub, digital agency, or innovation platform with a modern feel.', originalPrice: 599, wholesalePrice: 99 },
  { name: 'nichedapp.com', slug: 'nichedapp-com', extension: '.com', category: 'SaaS', description: 'Perfect for a niche app marketplace, directory, or micro-SaaS discovery platform.', originalPrice: 699, wholesalePrice: 99 },
  { name: 'softskilltrainers.com', slug: 'softskilltrainers-com', extension: '.com', category: 'Brandable', description: 'Great for a soft skills training platform, coaching service, or professional development brand.', originalPrice: 599, wholesalePrice: 99 },
  { name: 'dailytradingstrategy.com', slug: 'dailytradingstrategy-com', extension: '.com', category: 'Finance', description: 'Ideal for a daily trading signals service, stock market blog, or fintech education platform.', originalPrice: 799, wholesalePrice: 99 },
  { name: 'ciberdomain.com', slug: 'ciberdomain-com', extension: '.com', category: 'Technology', description: 'Perfect for a domain registrar, cybersecurity service, or digital asset management platform.', originalPrice: 599, wholesalePrice: 99 },
]