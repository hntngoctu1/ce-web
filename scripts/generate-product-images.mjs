#!/usr/bin/env node
/**
 * Generate product images for all seeded products from old website.
 * Uses the same brand-aligned SVG style as generate-placeholders.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const PUBLIC_DIR = path.join(ROOT, 'public');
const PRODUCTS_DIR = path.join(PUBLIC_DIR, 'products');

const CE = {
  primary: '#676E9F',
  primaryDark: '#2E3354',
  bg: '#F6F7FB',
  card: '#FFFFFF',
  line: 'rgba(103,110,159,0.20)',
  ink: '#10162F',
  muted: '#4B5563',
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function svgWrap({ w, h, title, subtitle, iconSvg, seed = 1 }) {
  const id = `g${seed}`;
  const safeTitle = esc(title);
  const safeSubtitle = subtitle ? esc(subtitle) : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${CE.bg}"/>
      <stop offset="1" stop-color="#EEF0FA"/>
    </linearGradient>
    <linearGradient id="${id}-accent" x1="0" y1="${h}" x2="${w}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${CE.primary}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${CE.primaryDark}" stop-opacity="0.10"/>
    </linearGradient>
    <pattern id="${id}-grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" stroke="${CE.line}" stroke-width="1"/>
    </pattern>
    <filter id="${id}-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="rgba(16,22,47,0.12)"/>
    </filter>
  </defs>

  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id})"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id}-grid)" opacity="0.35"/>

  <!-- Accent shapes -->
  <path d="M ${w * 0.62} ${h * 0.05} C ${w * 0.88} ${h * 0.18}, ${w * 0.98} ${h * 0.42}, ${w * 0.9} ${h * 0.7} C ${w * 0.8} ${h * 0.98}, ${w * 0.52} ${h * 0.98}, ${w * 0.4} ${h * 0.82} C ${w * 0.25} ${h * 0.62}, ${w * 0.4} ${h * 0.22}, ${w * 0.62} ${h * 0.05} Z"
        fill="url(#${id}-accent)"/>

  <g filter="url(#${id}-shadow)">
    <rect x="${Math.round(w * 0.07)}" y="${Math.round(h * 0.1)}" width="${Math.round(w * 0.86)}" height="${Math.round(h * 0.8)}" rx="28" fill="${CE.card}"/>
    <rect x="${Math.round(w * 0.07)}" y="${Math.round(h * 0.1)}" width="${Math.round(w * 0.86)}" height="${Math.round(h * 0.8)}" rx="28" stroke="rgba(103,110,159,0.22)"/>
  </g>

  <!-- Icon -->
  <g transform="translate(${Math.round(w * 0.14)}, ${Math.round(h * 0.22)})">
    ${iconSvg}
  </g>

  <!-- Text -->
  <g transform="translate(${Math.round(w * 0.14)}, ${Math.round(h * 0.62)})">
    <text x="0" y="0" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="${Math.round(
      h * 0.065
    )}" font-weight="800" fill="${CE.ink}" letter-spacing="-0.5">${safeTitle}</text>
    ${
      subtitle
        ? `<text x="0" y="${Math.round(h * 0.075)}" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="${Math.round(
            h * 0.038
          )}" font-weight="600" fill="${CE.muted}">${safeSubtitle}</text>`
        : ''
    }
  </g>
</svg>
`;
}

// Simple inline icons (stroke only) to keep brand premium/minimal.
function iconStroke(paths, { size = 220, stroke = CE.primary, strokeWidth = 10 } = {}) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none">
    <g stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
      ${paths}
    </g>
  </svg>`;
}

const ICONS = {
  tape: iconStroke(
    `
    <path d="M30 30h30a20 20 0 0 1 0 40H30z"/>
    <path d="M30 30v40"/>
    <path d="M48 50a6 6 0 1 0 0.1 0"/>
  `
  ),
  adhesive: iconStroke(
    `
    <path d="M44 22h12l6 12-6 12H44l-6-12z"/>
    <path d="M50 46v32"/>
    <path d="M38 62h24"/>
  `
  ),
  silicone: iconStroke(
    `
    <path d="M50 18c10 16 22 28 22 42a22 22 0 1 1-44 0c0-14 12-26 22-42z"/>
    <path d="M40 66c4 6 16 6 20 0"/>
  `
  ),
  lubricant: iconStroke(
    `
    <path d="M22 58h36a16 16 0 0 0 0-32H22"/>
    <path d="M22 26v44"/>
    <path d="M78 50H52"/>
  `
  ),
  coating: iconStroke(
    `
    <path d="M30 30h40v40H30z"/>
    <path d="M30 40h40"/>
    <path d="M30 50h40"/>
    <path d="M30 60h40"/>
  `
  ),
  electronics: iconStroke(
    `
    <path d="M18 30h64v40H18z"/>
    <path d="M30 22v8M46 22v8M62 22v8M30 70v8M46 70v8M62 70v8"/>
    <path d="M38 44h24M50 36v28"/>
  `
  ),
  sandpaper: iconStroke(
    `
    <path d="M30 28h40v44H30z"/>
    <path d="M34 36h0.1M42 36h0.1M50 36h0.1M58 36h0.1"/>
    <path d="M34 46h0.1M42 46h0.1M50 46h0.1M58 46h0.1"/>
    <path d="M34 56h0.1M42 56h0.1M50 56h0.1M58 56h0.1"/>
    <path d="M34 66h0.1M42 66h0.1M50 66h0.1M58 66h0.1"/>
  `
  ),
  welding: iconStroke(
    `
    <path d="M30 66l40-32"/>
    <path d="M30 34l40 32"/>
    <path d="M26 50h14"/>
    <path d="M60 50h14"/>
  `
  ),
  robot: iconStroke(
    `
    <path d="M34 44h32v26H34z"/>
    <path d="M40 44v-8h20v8"/>
    <path d="M42 56h0.1M58 56h0.1"/>
    <path d="M50 30v6"/>
  `
  ),
  printer: iconStroke(
    `
    <path d="M30 40h40v26H30z"/>
    <path d="M36 40v-14h28v14"/>
    <path d="M36 66v12h28V66"/>
    <path d="M34 52h0.1M40 52h0.1"/>
  `
  ),
  heat: iconStroke(
    `
    <path d="M50 22v56"/>
    <path d="M38 34c0 8 12 8 12 16s-12 8-12 16"/>
    <path d="M62 34c0 8-12 8-12 16s12 8 12 16"/>
  `
  ),
  fluid: iconStroke(
    `
    <path d="M22 58h36a16 16 0 0 0 0-32H22"/>
    <path d="M22 26v44"/>
    <path d="M78 50H52"/>
  `
  ),
  generic: iconStroke(
    `
    <path d="M30 30h40v40H30z"/>
    <path d="M30 50h40"/>
    <path d="M50 30v40"/>
  `
  ),
};

// Map product groups to icons
const GROUP_ICON_MAP = {
  'industrial-tapes': ICONS.tape,
  'industrial-adhesives': ICONS.adhesive,
  'silicone-rubber': ICONS.silicone,
  lubricants: ICONS.lubricant,
  'metalworking-coatings': ICONS.coating,
  'electronic-coatings': ICONS.electronics,
  'sandpaper-abrasives': ICONS.sandpaper,
  'welding-equipment': ICONS.welding,
  'automatic-dosing': ICONS.robot,
  'fluid-transmission': ICONS.fluid,
  'heat-conducting': ICONS.heat,
  printers: ICONS.printer,
  'nukote-coatings': ICONS.coating,
};

// Products from old website - all 51 products
const PRODUCTS = [
  // Industrial Tapes
  {
    slug: 'kim-bom-hoa-chat-chinh-xac-te-14-gauge-olive',
    title: 'TE 14G',
    subtitle: 'Dispensing Needle',
    group: 'automatic-dosing',
  },
  {
    slug: 'tesa-4965-bang-keo-hai-mat-filmic-trong-suot',
    title: 'tesa® 4965',
    subtitle: 'Double-Sided Tape',
    group: 'industrial-tapes',
  },
  {
    slug: 'bang-keo-giay-dan-thung-than-thien-moi-truong-tesa-4713',
    title: 'tesa 4713',
    subtitle: 'Paper Tape',
    group: 'industrial-tapes',
  },
  {
    slug: 'tesa-4917-bang-keo-hai-mat-lop-keo-khac-nhau',
    title: 'tesa 4917',
    subtitle: 'Double-Sided',
    group: 'industrial-tapes',
  },
  {
    slug: 'tesa-4651-bang-keo-vai-cao-cap',
    title: 'tesa® 4651',
    subtitle: 'Cloth Tape',
    group: 'industrial-tapes',
  },
  {
    slug: 'avery-dennison-fasson-bang-keo-dan-nhan',
    title: 'Fasson',
    subtitle: 'Labeling Tape',
    group: 'industrial-tapes',
  },
  {
    slug: 'tesa-51036-bang-keo-dan-be-mat-nham',
    title: 'tesa 51036',
    subtitle: 'Rough Surface',
    group: 'industrial-tapes',
  },

  // Industrial Adhesives
  {
    slug: 'loctite-660-keo-chong-xoay-50ml',
    title: 'Loctite 660',
    subtitle: 'Retaining Compound',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-221-50ml',
    title: 'Loctite 221',
    subtitle: 'Adhesive',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-648-keo-chong-xoay-250ml',
    title: 'Loctite 648',
    subtitle: 'Retaining 250ml',
    group: 'industrial-adhesives',
  },
  {
    slug: 'keo-dan-da-nang-araldite-standard-90-phut',
    title: 'Araldite',
    subtitle: '90 Min Cure',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-401-keo-dan-tuc-thi',
    title: 'Loctite 401',
    subtitle: 'Instant Adhesive',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-243-keo-chong-rung-50ml',
    title: 'Loctite 243',
    subtitle: 'Threadlocker',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-271-keo-chong-xoay-manh-50ml',
    title: 'Loctite 271',
    subtitle: 'High Strength',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-638-keo-chong-xoay-50ml',
    title: 'Loctite 638',
    subtitle: 'Retaining',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-242-keo-chong-rung-trung-binh',
    title: 'Loctite 242',
    subtitle: 'Medium Strength',
    group: 'industrial-adhesives',
  },
  {
    slug: 'loctite-510-keo-bit-kin-mat-bich',
    title: 'Loctite 510',
    subtitle: 'Flange Sealant',
    group: 'industrial-adhesives',
  },

  // Silicone Rubber
  {
    slug: 'silicon-tram-chong-tham-nuoc-dow-corning-791',
    title: 'Dow 791',
    subtitle: 'Waterproof Seal',
    group: 'silicone-rubber',
  },
  {
    slug: 'dow-corning-732-silicon-boi-tron-da-nang',
    title: 'Dow 732',
    subtitle: 'Silicone Lube',
    group: 'silicone-rubber',
  },
  {
    slug: 'dow-corning-3145-silicon-boi-tron-mang-mong',
    title: 'Dow 3145',
    subtitle: 'Thin Film',
    group: 'silicone-rubber',
  },
  {
    slug: 'dow-corning-340-silicon-boi-tron-chong-ri',
    title: 'Dow 340',
    subtitle: 'Anti-Corrosion',
    group: 'silicone-rubber',
  },

  // Lubricants
  {
    slug: 'molykote-g-4702-mo-boi-tron-chiu-nhiet-cao',
    title: 'Molykote G-4702',
    subtitle: 'High Temp Grease',
    group: 'lubricants',
  },
  {
    slug: 'molykote-111-mo-boi-tron-da-nang',
    title: 'Molykote 111',
    subtitle: 'Multi-Purpose',
    group: 'lubricants',
  },
  {
    slug: 'crc-2-26-chat-boi-tron-chong-ri',
    title: 'CRC 2-26',
    subtitle: 'Rust Inhibitor',
    group: 'lubricants',
  },
  {
    slug: 'lanotec-l5-chat-boi-tron-phan-hang-thuc-pham',
    title: 'Lanotec L5',
    subtitle: 'Food Grade',
    group: 'lubricants',
  },
  {
    slug: 'molykote-d-321r-mo-boi-tron-chong-ri',
    title: 'Molykote D-321R',
    subtitle: 'Anti-Rust',
    group: 'lubricants',
  },
  {
    slug: 'crc-5-56-chat-boi-tron-da-nang',
    title: 'CRC 5-56',
    subtitle: 'Multi-Purpose',
    group: 'lubricants',
  },

  // Metalworking Coatings
  {
    slug: 'bonderite-c-ic-33-chat-phu-chong-ri',
    title: 'Bonderite C-IC 33',
    subtitle: 'Rust Inhibitor',
    group: 'metalworking-coatings',
  },
  {
    slug: 'stoner-m-122-chat-tay-rua-kim-loai',
    title: 'Stoner M-122',
    subtitle: 'Metal Cleaner',
    group: 'metalworking-coatings',
  },
  {
    slug: 'rocol-rtd-chat-boi-tron-cat-got',
    title: 'Rocol RTD',
    subtitle: 'Cutting Fluid',
    group: 'metalworking-coatings',
  },
  {
    slug: 'stoner-invisible-glass-chat-tay-rua-kinh',
    title: 'Invisible Glass',
    subtitle: 'Glass Cleaner',
    group: 'metalworking-coatings',
  },
  {
    slug: 'rocol-as30-chat-boi-tron-cat-got-tong-hop',
    title: 'Rocol AS30',
    subtitle: 'Synthetic Fluid',
    group: 'metalworking-coatings',
  },

  // Electronic Coatings
  {
    slug: 'actnano-advanced-nanoguard-lop-phu-bao-ve-pcb',
    title: 'nanoGUARD',
    subtitle: 'PCB Protection',
    group: 'electronic-coatings',
  },
  {
    slug: 'dow-corning-1-2577-lop-phu-bao-ve-dien-tu',
    title: 'Dow 1-2577',
    subtitle: 'Electronic Coating',
    group: 'electronic-coatings',
  },

  // Sandpaper & Abrasives
  {
    slug: 'mirka-abranet-giay-nham-mang-luoi',
    title: 'Mirka Abranet',
    subtitle: 'Mesh Sandpaper',
    group: 'sandpaper-abrasives',
  },
  {
    slug: 'mirka-gold-giay-nham-cao-cap',
    title: 'Mirka Gold',
    subtitle: 'Premium Sandpaper',
    group: 'sandpaper-abrasives',
  },

  // Welding Equipment
  {
    slug: 'ok-international-ps-900-may-han-chi',
    title: 'OK PS-900',
    subtitle: 'Soldering Station',
    group: 'welding-equipment',
  },
  {
    slug: 'pillarhouse-epsilon-may-han-tu-dong',
    title: 'Pillarhouse Epsilon',
    subtitle: 'Auto Soldering',
    group: 'welding-equipment',
  },
  {
    slug: 'techcon-ts250-may-dinh-luong-keo',
    title: 'Techcon TS250',
    subtitle: 'Dispensing System',
    group: 'welding-equipment',
  },

  // Automatic Dosing
  {
    slug: 'graco-xtr-he-thong-phun-phu-tu-dong',
    title: 'Graco XTR',
    subtitle: 'Coating System',
    group: 'automatic-dosing',
  },
  {
    slug: 'graco-promix-may-tron-keo-tu-dong',
    title: 'Graco ProMix',
    subtitle: 'Adhesive Mixer',
    group: 'automatic-dosing',
  },
  {
    slug: 'hermes-hrs-may-dinh-luong-chinh-xac',
    title: 'Hermes HRS',
    subtitle: 'Precision Dosing',
    group: 'automatic-dosing',
  },

  // Fluid Transmission
  {
    slug: 'graco-husky-bom-ap-luc-cao',
    title: 'Graco Husky',
    subtitle: 'High Pressure Pump',
    group: 'fluid-transmission',
  },
  {
    slug: 'graco-e-flo-bom-dien-tu-dong',
    title: 'Graco E-Flo',
    subtitle: 'Electric Pump',
    group: 'fluid-transmission',
  },

  // Heat Conducting
  {
    slug: 'bergquist-gap-pad-vat-lieu-dan-nhiet',
    title: 'Gap Pad',
    subtitle: 'Thermal Interface',
    group: 'heat-conducting',
  },
  {
    slug: 'bergquist-sil-pad-tam-dan-nhiet-silicon',
    title: 'Sil-Pad',
    subtitle: 'Silicon Thermal',
    group: 'heat-conducting',
  },
  {
    slug: 'bergquist-hi-flow-vat-lieu-dan-nhiet-dang-long',
    title: 'Hi-Flow',
    subtitle: 'Liquid Thermal',
    group: 'heat-conducting',
  },

  // Printers
  {
    slug: 'mark-andy-2200-may-in-flexo',
    title: 'Mark Andy 2200',
    subtitle: 'Flexo Printer',
    group: 'printers',
  },
  {
    slug: 'valco-melton-may-dan-nhan-tu-dong',
    title: 'Valco Melton',
    subtitle: 'Labeling Machine',
    group: 'printers',
  },

  // Nukote Coatings
  {
    slug: 'nukote-industrial-coating-lop-phu-bao-ve',
    title: 'Nukote Industrial',
    subtitle: 'Protection Coating',
    group: 'nukote-coatings',
  },
  {
    slug: 'nukote-food-grade-coating',
    title: 'Nukote Food',
    subtitle: 'Food Grade Coating',
    group: 'nukote-coatings',
  },
];

function makeSquare(title, subtitle, icon, seed = 1) {
  return svgWrap({ w: 1200, h: 1200, title, subtitle, iconSvg: icon, seed });
}

function main() {
  ensureDir(PRODUCTS_DIR);

  let generated = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    const icon = GROUP_ICON_MAP[product.group] || ICONS.generic;
    const seed = 1000 + generated; // Start from 1000 to avoid conflicts
    const svg = makeSquare(product.title, product.subtitle, icon, seed);
    const filePath = path.join(PRODUCTS_DIR, `${product.slug}.svg`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipped (exists): ${product.slug}.svg`);
      skipped++;
      continue;
    }

    write(filePath, svg);
    generated++;
    console.log(`✅ Generated: ${product.slug}.svg`);
  }

  console.log(`\n✅ Generated ${generated} product images`);
  console.log(`⏭️  Skipped ${skipped} (already exist)`);
}

main();
