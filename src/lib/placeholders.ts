const PLACEHOLDERS = {
  product: '/placeholders/product.svg',
  blog: '/placeholders/blog.svg',
  category: '/placeholders/category.svg',
  partner: '/placeholders/partner.svg',
} as const;

const KNOWN_INDUSTRY_SLUGS = new Set([
  'automation-measurement',
  'automotive-transportation',
  'electricity-electronics',
  'food-pharmaceuticals',
  'furniture-wood',
  'printing-packaging',
  'waterproofing-coating',
]);

const KNOWN_GROUP_SLUGS = new Set([
  'automatic-dosing',
  'electronic-coatings',
  'fluid-transmission',
  'heat-conducting',
  'industrial-adhesives',
  'industrial-tapes',
  'lubricants',
  'metalworking-coatings',
  'nukote-coatings',
  'printers',
  'sandpaper-abrasives',
  'silicone-rubber',
  'welding-equipment',
]);

// Partner logo file mapping (prefer user-provided raster logos when available)
const PARTNER_LOGO_FILES: Record<string, string> = {
  graco: '/partners/graco.webp',
  henkel: '/partners/henkel.webp',
  tesa: '/partners/tesa.webp',

  // Additional downloaded partners (webp)
  'avery-dennison': '/partners/avery-dennison.webp',
  crc: '/partners/crc.webp',
  dow: '/partners/dow.webp',
  hermes: '/partners/hermes.webp',
  huntsman: '/partners/huntsman.webp',
  lanotec: '/partners/lanotec.webp',
  'mark-andy': '/partners/mark-andy.webp',
  mirka: '/partners/mirka.webp',
  'nukote-industrial': '/partners/nukote-industrial.webp',
  pillarhouse: '/partners/pillarhouse.webp',
  saiyakaya: '/partners/saiyakaya.webp',
  saki: '/partners/saki.webp',
  stoner: '/partners/stoner.webp',
  techcon: '/partners/techcon.webp',
  'valco-melton': '/partners/valco-melton.webp',
};

const KNOWN_PRODUCT_SLUGS = new Set([
  'tesa-4965-double-sided-tape',
  'loctite-401-instant-adhesive',
  'tesa-4651-cloth-tape',
  // Products from old website
  'kim-bom-hoa-chat-chinh-xac-te-14-gauge-olive',
  'tesa-4965-bang-keo-hai-mat-filmic-trong-suot',
  'bang-keo-giay-dan-thung-than-thien-moi-truong-tesa-4713',
  'tesa-4917-bang-keo-hai-mat-lop-keo-khac-nhau',
  'tesa-4651-bang-keo-vai-cao-cap',
  'avery-dennison-fasson-bang-keo-dan-nhan',
  'tesa-51036-bang-keo-dan-be-mat-nham',
  'loctite-660-keo-chong-xoay-50ml',
  'loctite-221-50ml',
  'loctite-648-keo-chong-xoay-250ml',
  'keo-dan-da-nang-araldite-standard-90-phut',
  'loctite-401-keo-dan-tuc-thi',
  'loctite-243-keo-chong-rung-50ml',
  'loctite-271-keo-chong-xoay-manh-50ml',
  'loctite-638-keo-chong-xoay-50ml',
  'loctite-242-keo-chong-rung-trung-binh',
  'loctite-510-keo-bit-kin-mat-bich',
  'silicon-tram-chong-tham-nuoc-dow-corning-791',
  'dow-corning-732-silicon-boi-tron-da-nang',
  'dow-corning-3145-silicon-boi-tron-mang-mong',
  'dow-corning-340-silicon-boi-tron-chong-ri',
  'molykote-g-4702-mo-boi-tron-chiu-nhiet-cao',
  'molykote-111-mo-boi-tron-da-nang',
  'crc-2-26-chat-boi-tron-chong-ri',
  'lanotec-l5-chat-boi-tron-phan-hang-thuc-pham',
  'molykote-d-321r-mo-boi-tron-chong-ri',
  'crc-5-56-chat-boi-tron-da-nang',
  'bonderite-c-ic-33-chat-phu-chong-ri',
  'stoner-m-122-chat-tay-rua-kim-loai',
  'rocol-rtd-chat-boi-tron-cat-got',
  'stoner-invisible-glass-chat-tay-rua-kinh',
  'rocol-as30-chat-boi-tron-cat-got-tong-hop',
  'actnano-advanced-nanoguard-lop-phu-bao-ve-pcb',
  'dow-corning-1-2577-lop-phu-bao-ve-dien-tu',
  'mirka-abranet-giay-nham-mang-luoi',
  'mirka-gold-giay-nham-cao-cap',
  'ok-international-ps-900-may-han-chi',
  'pillarhouse-epsilon-may-han-tu-dong',
  'techcon-ts250-may-dinh-luong-keo',
  'graco-xtr-he-thong-phun-phu-tu-dong',
  'graco-promix-may-tron-keo-tu-dong',
  'hermes-hrs-may-dinh-luong-chinh-xac',
  'graco-husky-bom-ap-luc-cao',
  'graco-e-flo-bom-dien-tu-dong',
  'bergquist-gap-pad-vat-lieu-dan-nhiet',
  'bergquist-sil-pad-tam-dan-nhiet-silicon',
  'bergquist-hi-flow-vat-lieu-dan-nhiet-dang-long',
  'mark-andy-2200-may-in-flexo',
  'valco-melton-may-dan-nhan-tu-dong',
  'nukote-industrial-coating-lop-phu-bao-ve',
  'nukote-food-grade-coating',
]);

const KNOWN_BLOG_SLUGS = new Set([
  'welcome-to-creative-engineering',
  'selecting-industrial-adhesives-for-production',
  'double-sided-tapes-in-electronics-assembly',
  'case-study-automation-dispensing-upgrade',
  'protective-coatings-how-to-choose',
]);

export function normalizeId(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function getIndustryImageFallback(slug?: string | null) {
  if (!slug) return PLACEHOLDERS.category;
  return KNOWN_INDUSTRY_SLUGS.has(slug) ? `/industries/${slug}.svg` : PLACEHOLDERS.category;
}

export function getGroupImageFallback(slug?: string | null) {
  if (!slug) return PLACEHOLDERS.category;
  return KNOWN_GROUP_SLUGS.has(slug) ? `/groups/${slug}.svg` : PLACEHOLDERS.category;
}

export function getProductImageFallback(slug?: string | null) {
  if (!slug) return PLACEHOLDERS.product;
  return KNOWN_PRODUCT_SLUGS.has(slug) ? `/products/${slug}.svg` : PLACEHOLDERS.product;
}

export function getBlogCoverFallback(slug?: string | null) {
  if (!slug) return PLACEHOLDERS.blog;
  return KNOWN_BLOG_SLUGS.has(slug) ? `/blog-covers/${slug}.svg` : PLACEHOLDERS.blog;
}

export function getPartnerLogo(idOrName?: string | null) {
  const id = normalizeId(idOrName || '');
  if (!id) return null;
  return PARTNER_LOGO_FILES[id] || null;
}

export function getPartnerLogoFallback(idOrName?: string | null) {
  return getPartnerLogo(idOrName) || PLACEHOLDERS.partner;
}

export { PLACEHOLDERS };
