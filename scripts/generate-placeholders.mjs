#!/usr/bin/env node
/**
 * Generate internal, brand-aligned SVG assets for CE website.
 * - No external network calls
 * - Deterministic output
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const PUBLIC_DIR = path.join(ROOT, 'public');

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

function svgWrap({ w, h, title, subtitle, iconSvg, seed = 1, ratioLabel }) {
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

  <!-- Corner label -->
  <g opacity="0.85">
    <rect x="${w - 170}" y="28" width="142" height="34" rx="10" fill="rgba(103,110,159,0.12)"/>
    <text x="${w - 154}" y="51" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="13" font-weight="700" fill="${CE.primary}">${
      ratioLabel ? esc(ratioLabel) : `${w}×${h}`
    }</text>
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
  electronics: iconStroke(
    `
    <path d="M18 30h64v40H18z"/>
    <path d="M30 22v8M46 22v8M62 22v8M30 70v8M46 70v8M62 70v8"/>
    <path d="M38 44h24M50 36v28"/>
  `
  ),
  automotive: iconStroke(
    `
    <path d="M22 58l10-20h36l10 20"/>
    <path d="M24 58h52"/>
    <path d="M30 58v10M70 58v10"/>
    <path d="M34 68a6 6 0 1 0 0.1 0M66 68a6 6 0 1 0 0.1 0"/>
  `
  ),
  packaging: iconStroke(
    `
    <path d="M30 30l20-10 20 10v40l-20 10-20-10z"/>
    <path d="M30 30l20 10 20-10"/>
    <path d="M50 40v40"/>
  `
  ),
  automation: iconStroke(
    `
    <path d="M28 62c10 0 10-24 20-24s10 24 24 24"/>
    <path d="M20 70h60"/>
    <path d="M30 70v10M70 70v10"/>
    <path d="M34 32h32"/>
  `
  ),
  waterproof: iconStroke(
    `
    <path d="M50 18c10 16 22 28 22 42a22 22 0 1 1-44 0c0-14 12-26 22-42z"/>
    <path d="M40 66c4 6 16 6 20 0"/>
  `
  ),
  wood: iconStroke(
    `
    <path d="M24 28h52v44H24z"/>
    <path d="M32 36c10 0 10 28 20 28s10-28 20-28"/>
    <path d="M32 44c10 0 10 20 20 20s10-20 20-20"/>
  `
  ),
  pharma: iconStroke(
    `
    <path d="M42 22h16"/>
    <path d="M46 22v18l-12 22a16 16 0 0 0 14 24h4a16 16 0 0 0 14-24L54 40V22"/>
    <path d="M36 62h28"/>
  `
  ),
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
  coating: iconStroke(
    `
    <path d="M30 30h40v40H30z"/>
    <path d="M30 40h40"/>
    <path d="M30 50h40"/>
    <path d="M30 60h40"/>
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
  welding: iconStroke(
    `
    <path d="M30 66l40-32"/>
    <path d="M30 34l40 32"/>
    <path d="M26 50h14"/>
    <path d="M60 50h14"/>
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

function makeSquare(title, subtitle, icon, seed = 1) {
  return svgWrap({ w: 1200, h: 1200, title, subtitle, iconSvg: icon, seed, ratioLabel: '1:1' });
}
function makeWide(title, subtitle, icon, seed = 1) {
  return svgWrap({ w: 1600, h: 900, title, subtitle, iconSvg: icon, seed, ratioLabel: '16:9' });
}
function makePartner(name, seed = 1) {
  const w = 800;
  const h = 360;
  const id = `p${seed}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(
    name
  )}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="${w}" y2="${h}">
      <stop offset="0" stop-color="${CE.bg}"/>
      <stop offset="1" stop-color="#EEF0FA"/>
    </linearGradient>
    <pattern id="${id}-grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" stroke="${CE.line}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" rx="28" fill="url(#${id})"/>
  <rect x="0" y="0" width="${w}" height="${h}" rx="28" fill="url(#${id}-grid)" opacity="0.35"/>
  <rect x="40" y="40" width="${w - 80}" height="${h - 80}" rx="22" fill="${CE.card}" stroke="rgba(103,110,159,0.22)"/>
  <path d="M70 110h120" stroke="${CE.primary}" stroke-width="10" stroke-linecap="round"/>
  <text x="70" y="210" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="64" font-weight="900" fill="${CE.ink}" letter-spacing="-0.6">${esc(
    name
  )}</text>
  <text x="70" y="258" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="22" font-weight="700" fill="${CE.primary}">Partner / Brand</text>
</svg>
`;
}

function main() {
  const out = {
    placeholders: path.join(PUBLIC_DIR, 'placeholders'),
    industries: path.join(PUBLIC_DIR, 'industries'),
    groups: path.join(PUBLIC_DIR, 'groups'),
    services: path.join(PUBLIC_DIR, 'services'),
    products: path.join(PUBLIC_DIR, 'products'),
    blogCovers: path.join(PUBLIC_DIR, 'blog-covers'),
    partners: path.join(PUBLIC_DIR, 'partners'),
  };

  Object.values(out).forEach(ensureDir);

  // Generic fallbacks
  write(
    path.join(out.placeholders, 'product.svg'),
    makeSquare('Product', 'CE Catalog', ICONS.generic, 101)
  );
  write(
    path.join(out.placeholders, 'blog.svg'),
    makeWide('Insights', 'Creative Engineering', ICONS.generic, 102)
  );
  write(
    path.join(out.placeholders, 'category.svg'),
    makeWide('Category', 'Industrial solutions', ICONS.generic, 103)
  );
  write(path.join(out.placeholders, 'partner.svg'), makePartner('Creative Engineering', 104));

  // Industries (7)
  const industries = [
    ['electricity-electronics', 'Electronics', 'Assembly • EMI • Insulation', ICONS.electronics],
    ['automotive-transportation', 'Automotive', 'Bonding • NVH • Protection', ICONS.automotive],
    ['printing-packaging', 'Packaging', 'Converting • Labeling • Tapes', ICONS.packaging],
    [
      'automation-measurement',
      'Automation',
      'Dispensing • Measurement • Control',
      ICONS.automation,
    ],
    [
      'waterproofing-coating',
      'Protective Coating',
      'Waterproofing • Surface protection',
      ICONS.waterproof,
    ],
    ['furniture-wood', 'Furniture & Wood', 'Bonding • Finishing • Protection', ICONS.wood],
    ['food-pharmaceuticals', 'Food & Pharma', 'Safe materials • Clean process', ICONS.pharma],
  ];
  industries.forEach(([slug, title, subtitle, icon], i) => {
    write(path.join(out.industries, `${slug}.svg`), makeWide(title, subtitle, icon, 200 + i));
  });

  // Services (4) – consistent look for service cards/sections
  const services = [
    ['mix-dispensing', 'Mix & Dispensing', 'Precision application', ICONS.robot],
    ['converting-services', 'Converting Services', 'Cutting • Slitting • Laminating', ICONS.tape],
    ['custom-labeling', 'Custom Labeling', 'Traceability • Branding', ICONS.packaging],
    ['laser-die-cutting', 'Laser & Die Cutting', 'Complex shapes • Tight tolerance', ICONS.coating],
  ];
  services.forEach(([slug, title, subtitle, icon], i) => {
    write(path.join(out.services, `${slug}.svg`), makeWide(title, subtitle, icon, 300 + i));
  });

  // Product groups (all seed groups)
  const groups = [
    ['industrial-tapes', 'Industrial Tapes', 'Converting-ready tapes', ICONS.tape],
    ['silicone-rubber', 'Silicone Rubber', 'Virgin silicone materials', ICONS.heat],
    ['lubricants', 'Lubricants', 'Process & maintenance', ICONS.fluid],
    ['metalworking-coatings', 'Metalworking Coatings', 'Cleaning • Protection', ICONS.coating],
    ['electronic-coatings', 'Electronic Coatings', 'Surface protection', ICONS.electronics],
    ['sandpaper-abrasives', 'Abrasives', 'Sanding • Polishing', ICONS.sandpaper],
    ['nukote-coatings', 'Protective Coatings', 'Durable & repairable', ICONS.waterproof],
    ['industrial-adhesives', 'Industrial Adhesives', 'Structural bonding', ICONS.adhesive],
    ['welding-equipment', 'Welding Equipment', 'Machines & accessories', ICONS.welding],
    ['printers', 'Printers', 'Industrial marking', ICONS.printer],
    ['automatic-dosing', 'Automatic Dosing', 'Robotic dispensing', ICONS.robot],
    ['fluid-transmission', 'Fluid Transmission', 'Hoses • Fittings', ICONS.fluid],
    ['heat-conducting', 'Heat Conducting', 'Thermal interface', ICONS.heat],
  ];
  groups.forEach(([slug, title, subtitle, icon], i) => {
    write(path.join(out.groups, `${slug}.svg`), makeWide(title, subtitle, icon, 400 + i));
  });

  // Seed sample products (3)
  const products = [
    ['tesa-4965-double-sided-tape', 'tesa® 4965', 'Double‑Sided Tape', ICONS.tape],
    ['loctite-401-instant-adhesive', 'Loctite 401', 'Instant Adhesive', ICONS.adhesive],
    ['tesa-4651-cloth-tape', 'tesa® 4651', 'Premium Cloth Tape', ICONS.tape],
  ];
  products.forEach(([slug, title, subtitle, icon], i) => {
    write(path.join(out.products, `${slug}.svg`), makeSquare(title, subtitle, icon, 500 + i));
  });

  // Seed sample blog covers (5)
  const blogCovers = [
    ['welcome-to-creative-engineering', 'Welcome', 'Engineering since 1999', ICONS.generic],
    [
      'selecting-industrial-adhesives-for-production',
      'Adhesives',
      'A practical checklist',
      ICONS.adhesive,
    ],
    [
      'double-sided-tapes-in-electronics-assembly',
      'Tapes',
      'Electronics assembly',
      ICONS.electronics,
    ],
    ['case-study-automation-dispensing-upgrade', 'Case Study', 'Automated dispensing', ICONS.robot],
    ['protective-coatings-how-to-choose', 'Coatings', 'Harsh environments', ICONS.waterproof],
  ];
  blogCovers.forEach(([slug, title, subtitle, icon], i) => {
    write(path.join(out.blogCovers, `${slug}.svg`), makeWide(title, subtitle, icon, 600 + i));
  });

  // Partners (seed 6)
  const partners = ['Henkel', 'Tesa', 'Graco', '3M', 'Loctite', 'Bostik'];
  partners.forEach((name, i) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    write(path.join(out.partners, `${id}.svg`), makePartner(name, 700 + i));
  });

  console.log('✅ Generated brand placeholders into public/*');
}

main();
