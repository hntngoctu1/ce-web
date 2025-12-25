export type Solution = {
  slug: string;
  name: string;
  summary: string;
  heroImage: string;
  tags: string[];
  keyOutcomes: string[];
  steps: string[];
  products: { title: string; href: string }[];
  resources: { title: string; type: 'pdf' | 'guide' | 'video' | 'link'; href: string }[];
  stats?: { label: string; value: string }[];
};

export const solutions: Solution[] = [
  {
    slug: 'meter-mix-dispense',
    name: 'Meter-Mix-Dispense',
    summary:
      'Closed-loop MMD for 1K/2K materials with stable bead geometry, viscosity windows, and recipe control.',
    heroImage:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80',
    tags: ['dispensing', 'automation', '2k', 'process-control'],
    keyOutcomes: [
      'Stable ratio control across shifts',
      'Bead width repeatability with flow monitoring',
      'Faster purging and changeovers',
    ],
    steps: [
      'Assess material, mix ratio, and tolerance',
      'Select pump/valve and heating/conditioning',
      'Program recipes and shot profiles',
      'Inline verification (weight/vision) and traceability',
    ],
    products: [
      { title: '2K Mixing Systems', href: '/menu/product?search=meter' },
      { title: 'Precision Valves', href: '/menu/product?search=valve' },
      { title: 'Dispense Controllers', href: '/menu/product?search=controller' },
    ],
    resources: [
      { title: 'Ratio control checklist', type: 'pdf', href: '#' },
      { title: 'Bead width tuning guide', type: 'guide', href: '#' },
      { title: 'Vision verification tips', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Scrap', value: '-15%' },
      { label: 'Changeover', value: '-25%' },
      { label: 'Bead CpK', value: '>1.33' },
    ],
  },
  {
    slug: 'conformal-coating',
    name: 'Conformal Coating',
    summary:
      'Uniform film builds, masked correctly, cured properly, with process-safe cleaners and verification.',
    heroImage:
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=80',
    tags: ['coating', 'electronics', 'qa', 'cure'],
    keyOutcomes: [
      'Target thickness with controlled viscosity',
      'Masking quality and cure verification',
      'Reduced rework from bubbles/voids',
    ],
    steps: [
      'Material selection and viscosity control',
      'Path planning & masking standards',
      'Cure profile verification (temp, UV, IR)',
      'Inspection (thickness, AOI/blacklight) & traceability',
    ],
    products: [
      { title: 'Conformal Coatings', href: '/menu/product?search=coating' },
      { title: 'Coating Valves & Heads', href: '/menu/product?search=coating%20valve' },
      { title: 'Cure Systems', href: '/menu/product?search=cure' },
    ],
    resources: [
      { title: 'Coating thickness SOP', type: 'pdf', href: '#' },
      { title: 'Masking best practices', type: 'guide', href: '#' },
      { title: 'Cure profile template', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Rework', value: '-18%' },
      { label: 'Throughput', value: '+9%' },
      { label: 'Yield', value: '+6%' },
    ],
  },
  {
    slug: 'industrial-labeling',
    name: 'Industrial Labeling & Coding',
    summary:
      'High-uptime print-and-apply, coding, and verification to keep SKUs flowing with compliant readability.',
    heroImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
    tags: ['labeling', 'coding', 'packaging', 'verification'],
    keyOutcomes: [
      'Readable 1D/2D codes at line speed',
      'Quick SKU changeovers',
      'Less downtime from ribbon/ink/adhesion issues',
    ],
    steps: [
      'Define substrates and adhesion/ink requirements',
      'Select print/apply hardware and media',
      'Set up verification (grade) and reject handling',
      'Train ops for changeovers and maintenance',
    ],
    products: [
      { title: 'Print & Apply Systems', href: '/menu/product?search=label' },
      { title: 'Ribbons & Inks', href: '/menu/product?search=ink' },
      { title: 'Verification & Vision', href: '/menu/product?search=vision' },
    ],
    resources: [
      { title: 'Label materials matrix', type: 'pdf', href: '#' },
      { title: 'Code verification primer', type: 'guide', href: '#' },
      { title: 'Changeover checklist', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Read rate', value: '99.5%' },
      { label: 'Changeover', value: '-20%' },
      { label: 'Misprints', value: '-25%' },
    ],
  },
  {
    slug: 'thermal-management',
    name: 'Thermal Management',
    summary:
      'Gap fillers, pads, and potting with consistent dispense and cure for EV, power, and compute modules.',
    heroImage:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=80',
    tags: ['thermal', 'ev', 'compute', 'gap-filler'],
    keyOutcomes: [
      'Repeatable dispense volume for high-viscosity materials',
      'Controlled cure and minimal voids',
      'Better thermal interface performance',
    ],
    steps: [
      'Select TIM (viscosity, filler, flame rating)',
      'Define heating/conditioning for pumpability',
      'Program shot sizes and verification',
      'Cure profile and adhesion checks',
    ],
    products: [
      { title: 'Thermal Gap Fillers', href: '/menu/product?search=thermal' },
      { title: 'Heating & Conditioning', href: '/menu/product?search=heater' },
      { title: 'Dispense Valves for TIM', href: '/menu/product?search=valve' },
    ],
    resources: [
      { title: 'Gap filler process guide', type: 'guide', href: '#' },
      { title: 'Void prevention checklist', type: 'pdf', href: '#' },
      { title: 'TIM selection quick sheet', type: 'pdf', href: '#' },
    ],
    stats: [
      { label: 'Void rate', value: '-20%' },
      { label: 'Thermal variance', value: '-12%' },
      { label: 'Cycle time', value: '-10%' },
    ],
  },
];
