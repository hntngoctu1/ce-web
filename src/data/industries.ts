export type IndustryResource = {
  title: string;
  type: 'pdf' | 'video' | 'guide' | 'link';
  href: string;
};

export type Industry = {
  slug: string;
  name: string;
  summary: string;
  heroImage: string;
  tags: string[];
  keyOutcomes: string[];
  useCases: string[];
  products: { title: string; href: string }[];
  resources: IndustryResource[];
  stats?: { label: string; value: string }[];
};

export const industries: Industry[] = [
  {
    slug: 'automation-robotics',
    name: 'Automation & Robotics',
    summary:
      'Precision dispensing, coating, and labeling systems engineered for automated lines with zero-downtime changeovers.',
    heroImage:
      'https://images.unsplash.com/photo-1508387024700-9fe5c0b37f65?auto=format&fit=crop&w=1400&q=80',
    tags: ['automation', 'robotics', 'dispensing', 'vision'],
    keyOutcomes: [
      'Reduce rework and defects with closed-loop process control',
      'Stabilize bead width and shot size across shifts',
      'Shorten changeover time with recipe-driven presets',
      'Traceability with digital logs and recipe versioning',
    ],
    useCases: ['Conformal coating', 'Meter-mix-dispense', 'Automated labeling', 'Inline vision QA'],
    products: [
      { title: 'Metering & Dispensing Systems', href: '/menu/product?search=dispensing' },
      { title: 'Automated Labeling & Printing', href: '/menu/product?search=label' },
      { title: 'Vision & QA Tooling', href: '/menu/product?search=vision' },
    ],
    resources: [
      { title: 'Inline Coating Playbook (PDF)', type: 'pdf', href: '#' },
      { title: 'How to stabilize bead width (Guide)', type: 'guide', href: '#' },
      { title: 'Robot cell checklist (PDF)', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Scrap reduction', value: '-22%' },
      { label: 'Changeover', value: '-30%' },
      { label: 'OEE uplift', value: '+12%' },
    ],
  },
  {
    slug: 'electronics-semiconductor',
    name: 'Electronics & Semiconductor',
    summary:
      'Protect boards and packages with precise coating, potting, cleaning, and ESD-safe materials qualified for high-reliability builds.',
    heroImage:
      'https://images.unsplash.com/photo-1582719478248-54e9f2af8c89?auto=format&fit=crop&w=1400&q=80',
    tags: ['electronics', 'coating', 'esd', 'cleaning'],
    keyOutcomes: [
      'Uniform film builds with controlled viscosity windows',
      'Less ionic contamination via process-safe cleaners',
      'Material accountability with lot tracking',
      'ESD-safe handling and storage practices',
    ],
    useCases: [
      'Conformal coating',
      'Potting/Encapsulation',
      'Rework-safe cleaning',
      'ESD handling',
    ],
    products: [
      { title: 'Conformal Coatings', href: '/menu/product?search=coating' },
      { title: 'Potting & Encapsulation', href: '/menu/product?search=potting' },
      { title: 'ESD-Safe Supplies', href: '/menu/product?search=esd' },
    ],
    resources: [
      { title: 'Conformal coating thickness guide', type: 'guide', href: '#' },
      { title: 'Potting material selector', type: 'pdf', href: '#' },
      { title: 'ESD workstation checklist', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'DPPM', value: '-18%' },
      { label: 'Throughput', value: '+9%' },
      { label: 'Rework', value: '-14%' },
    ],
  },
  {
    slug: 'automotive-mobility',
    name: 'Automotive & Mobility',
    summary:
      'Bonding, sealing, NVH, and thermal solutions for EV and ICE platforms with PPAP-ready traceability.',
    heroImage:
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80',
    tags: ['automotive', 'nvh', 'thermal', 'battery'],
    keyOutcomes: [
      'Consistent bead geometry on high-speed lines',
      'Battery-safe thermal and flame-retardant materials',
      'Adhesion on mixed substrates (aluminum, composites, plastics)',
      'Process FMEA friendly: spec-driven and validated',
    ],
    useCases: [
      'Battery module potting',
      'Glass & trim bonding',
      'NVH damping',
      'Thermal gap fillers',
    ],
    products: [
      { title: 'Structural Adhesives', href: '/menu/product?search=adhesive' },
      { title: 'Thermal Gap Fillers', href: '/menu/product?search=thermal' },
      { title: 'Sealants & Foams', href: '/menu/product?search=sealant' },
    ],
    resources: [
      { title: 'Battery potting starter kit', type: 'guide', href: '#' },
      { title: 'Gap filler comparison chart', type: 'pdf', href: '#' },
      { title: 'Adhesive surface prep SOP', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Cycle time', value: '-12%' },
      { label: 'Material waste', value: '-15%' },
      { label: 'Audit readiness', value: 'PPAP' },
    ],
  },
  {
    slug: 'packaging-labeling',
    name: 'Packaging, Printing & Labeling',
    summary:
      'High-uptime labeling, coding, and converting solutions with clean changeovers and verified readability.',
    heroImage:
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=80',
    tags: ['packaging', 'labeling', 'printing', 'coding'],
    keyOutcomes: [
      'Readable codes (1D/2D) with process-safe inks/ribbons',
      'Fast SKU changeovers for short runs',
      'Clean cuts and laminations with less dust',
      'Verified adhesion on films, cartons, metals',
    ],
    useCases: ['Label printing & apply', 'Coding/marking', 'Die-cut converting', 'Carton sealing'],
    products: [
      { title: 'Labeling & Coding Systems', href: '/menu/product?search=label' },
      { title: 'Industrial Tapes & Films', href: '/menu/product?search=tape' },
      { title: 'Adhesives for Packaging', href: '/menu/product?search=packaging' },
    ],
    resources: [
      { title: 'Label material selector', type: 'guide', href: '#' },
      { title: 'Print & apply readiness checklist', type: 'pdf', href: '#' },
      { title: 'Die-cut converting tips', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Changeover', value: '-25%' },
      { label: 'Misprints', value: '-30%' },
      { label: 'Read rate', value: '99.5%' },
    ],
  },
  {
    slug: 'medical-healthcare',
    name: 'Medical & Healthcare',
    summary:
      'Cleanroom-friendly bonding, gasketing, and coating solutions for devices and consumables with validated processes.',
    heroImage:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
    tags: ['medical', 'cleanroom', 'device', 'sterile'],
    keyOutcomes: [
      'ISO cleanroom compatible materials and processes',
      'Low-outgassing, skin-safe chemistries',
      'Traceable lots and validated dispense parameters',
      'Biocompatibility-focused handling',
    ],
    useCases: [
      'Device assembly bonding',
      'Gaskets & seals',
      'Tube and bag sealing',
      'Coating for protection',
    ],
    products: [
      { title: 'Medical-grade Adhesives', href: '/menu/product?search=medical' },
      { title: 'Cleanroom Tapes & Films', href: '/menu/product?search=cleanroom' },
      { title: 'Precision Dispensers', href: '/menu/product?search=dispenser' },
    ],
    resources: [
      { title: 'Cleanroom dispense checklist', type: 'pdf', href: '#' },
      { title: 'Skin-contact adhesive guide', type: 'guide', href: '#' },
      { title: 'Validation protocol starter', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Non-conformance', value: '-20%' },
      { label: 'Validation time', value: '-15%' },
      { label: 'Traceability', value: 'Lot-level' },
    ],
  },
];
