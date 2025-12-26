import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 30 realistic industrial products across multiple industries
const productsData = [
  // ============ INDUSTRIAL TAPES (5 products) ============
  {
    slug: 'tesa-4972-pet-film-tape',
    sku: 'TESA-4972',
    nameEn: 'tesa® 4972 PET Film Double-Sided Tape',
    nameVi: 'Băng keo hai mặt màng PET tesa® 4972',
    shortDescEn: 'Thin double-sided PET tape for electronic assembly',
    shortDescVi: 'Băng keo hai mặt PET mỏng cho lắp ráp điện tử',
    price: 520000,
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
    industrySlug: 'industrial-tapes',
    isFeatured: true,
    stockQuantity: 150,
  },
  {
    slug: '3m-vhb-5952-tape',
    sku: '3M-VHB-5952',
    nameEn: '3M™ VHB™ 5952 Structural Tape',
    nameVi: 'Băng keo cấu trúc 3M™ VHB™ 5952',
    shortDescEn: 'High-strength structural bonding tape for metal',
    shortDescVi: 'Băng keo cấu trúc độ bền cao cho kim loại',
    price: 890000,
    groupSlug: 'industrial-tapes',
    brandName: '3M',
    industrySlug: 'industrial-tapes',
    isFeatured: true,
    stockQuantity: 80,
  },
  {
    slug: 'tesa-51026-cloth-tape',
    sku: 'TESA-51026',
    nameEn: 'tesa® 51026 Wire Harness Tape',
    nameVi: 'Băng keo bó dây điện tesa® 51026',
    shortDescEn: 'PET cloth tape for automotive wire harness',
    shortDescVi: 'Băng keo vải PET cho bó dây ô tô',
    price: 245000,
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
    industrySlug: 'industrial-tapes',
    stockQuantity: 200,
  },
  {
    slug: '3m-468mp-adhesive-transfer-tape',
    sku: '3M-468MP',
    nameEn: '3M™ 468MP Adhesive Transfer Tape',
    nameVi: 'Băng keo chuyển 3M™ 468MP',
    shortDescEn: 'High-performance adhesive transfer for nameplates',
    shortDescVi: 'Băng keo chuyển hiệu suất cao cho bảng tên',
    price: 680000,
    groupSlug: 'industrial-tapes',
    brandName: '3M',
    industrySlug: 'industrial-tapes',
    stockQuantity: 120,
  },
  {
    slug: 'tesa-7475-masking-tape',
    sku: 'TESA-7475',
    nameEn: 'tesa® 7475 Fine Line Masking Tape',
    nameVi: 'Băng keo che phủ nét mịn tesa® 7475',
    shortDescEn: 'Precision masking for paint lines',
    shortDescVi: 'Che phủ chính xác cho đường sơn',
    price: 320000,
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
    industrySlug: 'industrial-tapes',
    stockQuantity: 300,
  },

  // ============ INDUSTRIAL ADHESIVES (5 products) ============
  {
    slug: 'loctite-243-threadlocker',
    sku: 'LOC-243',
    nameEn: 'Loctite® 243 Medium Strength Threadlocker',
    nameVi: 'Keo khóa ren Loctite® 243 độ bền trung bình',
    shortDescEn: 'Blue threadlocker for metal fasteners',
    shortDescVi: 'Keo khóa ren màu xanh cho bu lông kim loại',
    price: 380000,
    groupSlug: 'industrial-adhesives',
    brandName: 'Henkel',
    industrySlug: 'industrial-adhesives',
    stockQuantity: 250,
  },
  {
    slug: 'loctite-480-instant-adhesive',
    sku: 'LOC-480',
    nameEn: 'Loctite® 480 Instant Adhesive Black',
    nameVi: 'Keo dán nhanh Loctite® 480 màu đen',
    shortDescEn: 'Rubber-toughened instant adhesive',
    shortDescVi: 'Keo dán nhanh tăng cường cao su',
    price: 450000,
    salePrice: 395000,
    isOnSale: true,
    groupSlug: 'industrial-adhesives',
    brandName: 'Henkel',
    industrySlug: 'industrial-adhesives',
    isFeatured: true,
    stockQuantity: 180,
  },
  {
    slug: 'loctite-638-retaining-compound',
    sku: 'LOC-638',
    nameEn: 'Loctite® 638 Retaining Compound',
    nameVi: 'Keo giữ Loctite® 638',
    shortDescEn: 'High strength for cylindrical assemblies',
    shortDescVi: 'Độ bền cao cho lắp ráp hình trụ',
    price: 520000,
    groupSlug: 'industrial-adhesives',
    brandName: 'Henkel',
    industrySlug: 'industrial-adhesives',
    stockQuantity: 100,
  },
  {
    slug: 'loctite-3463-metal-magic-steel',
    sku: 'LOC-3463',
    nameEn: 'Loctite® 3463 Metal Magic Steel Stick',
    nameVi: 'Thanh sửa chữa kim loại Loctite® 3463',
    shortDescEn: 'Steel-filled epoxy for metal repair',
    shortDescVi: 'Epoxy chứa thép để sửa chữa kim loại',
    price: 290000,
    groupSlug: 'industrial-adhesives',
    brandName: 'Henkel',
    industrySlug: 'industrial-adhesives',
    stockQuantity: 150,
  },
  {
    slug: 'bostik-h750-hot-melt',
    sku: 'BOS-H750',
    nameEn: 'Bostik H750 Hot Melt Adhesive',
    nameVi: 'Keo nóng chảy Bostik H750',
    shortDescEn: 'General purpose packaging hot melt',
    shortDescVi: 'Keo nóng chảy đóng gói đa năng',
    price: 185000,
    groupSlug: 'industrial-adhesives',
    brandName: 'Bostik',
    industrySlug: 'industrial-adhesives',
    stockQuantity: 400,
  },

  // ============ LUBRICANTS (4 products) ============
  {
    slug: 'crc-5-56-multi-purpose',
    sku: 'CRC-556',
    nameEn: 'CRC 5-56 Multi-Purpose Lubricant',
    nameVi: 'Dầu bôi trơn đa năng CRC 5-56',
    shortDescEn: 'Penetrating lubricant and corrosion inhibitor',
    shortDescVi: 'Dầu thẩm thấu và chống ăn mòn',
    price: 165000,
    groupSlug: 'lubricants',
    brandName: 'CRC',
    industrySlug: 'lubricants',
    stockQuantity: 500,
  },
  {
    slug: 'crc-silicone-spray',
    sku: 'CRC-SIL',
    nameEn: 'CRC Silicone Lubricant Spray',
    nameVi: 'Dầu xịt silicone CRC',
    shortDescEn: 'Food-grade silicone lubricant',
    shortDescVi: 'Dầu silicone cấp thực phẩm',
    price: 195000,
    groupSlug: 'lubricants',
    brandName: 'CRC',
    industrySlug: 'lubricants',
    stockQuantity: 350,
  },
  {
    slug: 'lanotec-heavy-duty-liquid',
    sku: 'LAN-HDL',
    nameEn: 'Lanotec Heavy Duty Liquid Lanolin',
    nameVi: 'Dầu lanolin đa năng Lanotec',
    shortDescEn: 'Long-lasting lanolin-based protection',
    shortDescVi: 'Bảo vệ lâu dài gốc lanolin',
    price: 420000,
    groupSlug: 'lubricants',
    brandName: 'Lanotec',
    industrySlug: 'lubricants',
    stockQuantity: 120,
  },
  {
    slug: 'molykote-111-compound',
    sku: 'MLK-111',
    nameEn: 'Molykote® 111 Compound',
    nameVi: 'Mỡ bôi trơn Molykote® 111',
    shortDescEn: 'Silicone grease for O-rings and seals',
    shortDescVi: 'Mỡ silicone cho gioăng O-ring',
    price: 580000,
    groupSlug: 'lubricants',
    brandName: 'Dow',
    industrySlug: 'lubricants',
    isFeatured: true,
    stockQuantity: 80,
  },

  // ============ ELECTRONIC COATINGS (4 products) ============
  {
    slug: 'dow-sylgard-184',
    sku: 'DOW-184',
    nameEn: 'Dow SYLGARD™ 184 Silicone Elastomer',
    nameVi: 'Silicone đàn hồi Dow SYLGARD™ 184',
    shortDescEn: 'Optical-grade potting and encapsulation',
    shortDescVi: 'Đổ khuôn và bọc cấp quang học',
    price: 1250000,
    groupSlug: 'electronic-coatings',
    brandName: 'Dow',
    industrySlug: 'electronic-coatings',
    isFeatured: true,
    stockQuantity: 60,
  },
  {
    slug: 'loctite-3526-conformal-coating',
    sku: 'LOC-3526',
    nameEn: 'Loctite® 3526 UV Conformal Coating',
    nameVi: 'Lớp phủ bảo vệ UV Loctite® 3526',
    shortDescEn: 'Fast UV-cure conformal coating for PCB',
    shortDescVi: 'Lớp phủ bảo vệ đóng rắn UV nhanh cho PCB',
    price: 890000,
    groupSlug: 'electronic-coatings',
    brandName: 'Henkel',
    industrySlug: 'electronic-coatings',
    stockQuantity: 90,
  },
  {
    slug: 'dow-dowsil-tc-5026',
    sku: 'DOW-TC5026',
    nameEn: 'DOWSIL™ TC-5026 Thermal Compound',
    nameVi: 'Keo tản nhiệt DOWSIL™ TC-5026',
    shortDescEn: 'High-performance thermal interface material',
    shortDescVi: 'Vật liệu giao diện nhiệt hiệu suất cao',
    price: 1450000,
    groupSlug: 'electronic-coatings',
    brandName: 'Dow',
    industrySlug: 'heat-conducting',
    isFeatured: true,
    stockQuantity: 45,
  },
  {
    slug: 'huntsman-araldite-2011',
    sku: 'HUN-2011',
    nameEn: 'Huntsman Araldite® 2011 Epoxy',
    nameVi: 'Keo Epoxy Huntsman Araldite® 2011',
    shortDescEn: 'Two-component general purpose epoxy',
    shortDescVi: 'Epoxy hai thành phần đa năng',
    price: 380000,
    groupSlug: 'electronic-coatings',
    brandName: 'Huntsman',
    industrySlug: 'electronic-coatings',
    stockQuantity: 200,
  },

  // ============ ABRASIVES / POLISHING (4 products) ============
  {
    slug: 'mirka-abralon-4000',
    sku: 'MIR-ABR4000',
    nameEn: 'Mirka Abralon® 4000 Grit Disc',
    nameVi: 'Đĩa mài Mirka Abralon® 4000 grit',
    shortDescEn: 'Foam-backed finishing disc for fine sanding',
    shortDescVi: 'Đĩa hoàn thiện đế xốp cho mài mịn',
    price: 85000,
    groupSlug: 'sandpaper-abrasives',
    brandName: 'Mirka',
    industrySlug: 'sandpaper-abrasives',
    stockQuantity: 1000,
  },
  {
    slug: 'mirka-gold-p240',
    sku: 'MIR-GOLD240',
    nameEn: 'Mirka Gold P240 Sanding Disc',
    nameVi: 'Đĩa nhám Mirka Gold P240',
    shortDescEn: 'Premium aluminium oxide sanding disc',
    shortDescVi: 'Đĩa nhám nhôm oxide cao cấp',
    price: 45000,
    groupSlug: 'sandpaper-abrasives',
    brandName: 'Mirka',
    industrySlug: 'sandpaper-abrasives',
    stockQuantity: 2000,
  },
  {
    slug: 'hermes-rb406-belt',
    sku: 'HER-RB406',
    nameEn: 'Hermes RB 406 X Sanding Belt',
    nameVi: 'Dây đai nhám Hermes RB 406 X',
    shortDescEn: 'Heavy-duty cloth belt for metal',
    shortDescVi: 'Dây đai vải hạng nặng cho kim loại',
    price: 125000,
    groupSlug: 'sandpaper-abrasives',
    brandName: 'Hermes',
    industrySlug: 'sandpaper-abrasives',
    stockQuantity: 500,
  },
  {
    slug: '3m-trizact-3000',
    sku: '3M-TRIZ3000',
    nameEn: '3M™ Trizact™ P3000 Finishing Film',
    nameVi: 'Màng hoàn thiện 3M™ Trizact™ P3000',
    shortDescEn: 'Precision finishing for clear coat',
    shortDescVi: 'Hoàn thiện chính xác cho lớp phủ trong',
    price: 195000,
    groupSlug: 'sandpaper-abrasives',
    brandName: '3M',
    industrySlug: 'sandpaper-abrasives',
    isFeatured: true,
    stockQuantity: 300,
  },

  // ============ PROTECTIVE COATINGS (3 products) ============
  {
    slug: 'nukote-st-polyurea',
    sku: 'NUK-ST',
    nameEn: 'Nukote ST Aromatic Polyurea',
    nameVi: 'Polyurea thơm Nukote ST',
    shortDescEn: 'Fast-cure protective lining for tanks',
    shortDescVi: 'Lớp lót bảo vệ đóng rắn nhanh cho bồn chứa',
    price: 2800000,
    groupSlug: 'nukote-coatings',
    brandName: 'Nukote Industrial',
    industrySlug: 'nukote-coatings',
    isFeatured: true,
    stockQuantity: 25,
  },
  {
    slug: 'nukote-cpc-corrosion',
    sku: 'NUK-CPC',
    nameEn: 'Nukote CPC Corrosion Coating',
    nameVi: 'Lớp phủ chống ăn mòn Nukote CPC',
    shortDescEn: 'High-build epoxy for steel protection',
    shortDescVi: 'Epoxy dày cho bảo vệ thép',
    price: 1950000,
    groupSlug: 'nukote-coatings',
    brandName: 'Nukote Industrial',
    industrySlug: 'nukote-coatings',
    stockQuantity: 40,
  },
  {
    slug: 'stoner-e432-mold-release',
    sku: 'STO-E432',
    nameEn: 'Stoner E432 Mold Release',
    nameVi: 'Chất tách khuôn Stoner E432',
    shortDescEn: 'Semi-permanent release for composites',
    shortDescVi: 'Chất tách khuôn bán vĩnh cửu cho composite',
    price: 680000,
    groupSlug: 'nukote-coatings',
    brandName: 'Stoner',
    industrySlug: 'nukote-coatings',
    stockQuantity: 150,
  },

  // ============ DISPENSING EQUIPMENT (3 products) ============
  {
    slug: 'graco-sealant-gun-pro',
    sku: 'GRA-SGP',
    nameEn: 'Graco SealantGun Pro Pneumatic',
    nameVi: 'Súng bơm keo khí nén Graco SealantGun Pro',
    shortDescEn: 'Professional pneumatic sealant dispenser',
    shortDescVi: 'Bơm keo khí nén chuyên nghiệp',
    price: 4500000,
    groupSlug: 'automatic-dosing',
    brandName: 'Graco',
    industrySlug: 'automatic-dosing',
    isFeatured: true,
    stockQuantity: 20,
  },
  {
    slug: 'techcon-ts5540-valve',
    sku: 'TEC-TS5540',
    nameEn: 'Techcon TS5540 Diaphragm Valve',
    nameVi: 'Van màng Techcon TS5540',
    shortDescEn: 'Precision dispensing valve for low viscosity',
    shortDescVi: 'Van định lượng chính xác cho độ nhớt thấp',
    price: 2850000,
    groupSlug: 'automatic-dosing',
    brandName: 'Techcon',
    industrySlug: 'automatic-dosing',
    stockQuantity: 35,
  },
  {
    slug: 'valco-melton-2500-gun',
    sku: 'VAL-2500',
    nameEn: 'Valco Melton 2500 Hot Melt Gun',
    nameVi: 'Súng keo nóng Valco Melton 2500',
    shortDescEn: 'High-output hot melt applicator',
    shortDescVi: 'Bơm keo nóng công suất cao',
    price: 8500000,
    groupSlug: 'automatic-dosing',
    brandName: 'Valco Melton',
    industrySlug: 'automatic-dosing',
    stockQuantity: 10,
  },

  // ============ METALWORKING (2 products) ============
  {
    slug: 'crc-brakleen-pro',
    sku: 'CRC-BKPRO',
    nameEn: 'CRC Brakleen® Professional Degreaser',
    nameVi: 'Dung dịch tẩy dầu CRC Brakleen® Pro',
    shortDescEn: 'Fast-evaporating parts cleaner',
    shortDescVi: 'Dung dịch vệ sinh linh kiện bay hơi nhanh',
    price: 145000,
    groupSlug: 'metalworking-coatings',
    brandName: 'CRC',
    industrySlug: 'metalworking-coatings',
    stockQuantity: 600,
  },
  {
    slug: 'crc-lectra-clean-ii',
    sku: 'CRC-LC2',
    nameEn: 'CRC Lectra Clean II Degreaser',
    nameVi: 'Dung dịch tẩy dầu CRC Lectra Clean II',
    shortDescEn: 'Non-flammable electrical degreaser',
    shortDescVi: 'Dung dịch tẩy dầu điện không cháy',
    price: 285000,
    salePrice: 245000,
    isOnSale: true,
    groupSlug: 'metalworking-coatings',
    brandName: 'CRC',
    industrySlug: 'metalworking-coatings',
    stockQuantity: 400,
  },
];

async function main() {
  console.log('🌱 Starting 30 products import...\n');

  // Get all groups, brands, industries for mapping
  const groups = await prisma.productGroup.findMany();
  const brands = await prisma.partner.findMany({ where: { isBrand: true } });
  const industries = await prisma.industryCategory.findMany();

  const groupMap = new Map(groups.map((g) => [g.slug, g.id]));
  const brandMap = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));
  const industryMap = new Map(industries.map((i) => [i.slug, i.id]));

  let created = 0;
  let updated = 0;

  for (const product of productsData) {
    const groupId = groupMap.get(product.groupSlug) || null;
    const brandId = brandMap.get(product.brandName.toLowerCase()) || null;
    const industryId = industryMap.get(product.industrySlug) || null;

    const data = {
      slug: product.slug,
      sku: product.sku,
      nameEn: product.nameEn,
      nameVi: product.nameVi,
      shortDescEn: product.shortDescEn,
      shortDescVi: product.shortDescVi,
      descriptionEn: `${product.shortDescEn}. High-quality industrial product from ${product.brandName}.`,
      descriptionVi: `${product.shortDescVi}. Sản phẩm công nghiệp chất lượng cao từ ${product.brandName}.`,
      price: product.price,
      salePrice: product.salePrice || null,
      isOnSale: product.isOnSale || false,
      isFeatured: product.isFeatured || false,
      stockQuantity: product.stockQuantity || 100,
      groupId,
      brandId,
      industryId,
      isActive: true,
    };

    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });

    if (existing) {
      await prisma.product.update({ where: { slug: product.slug }, data });
      updated++;
      console.log(`  ✏️  Updated: ${product.nameEn}`);
    } else {
      await prisma.product.create({ data });
      created++;
      console.log(`  ✅ Created: ${product.nameEn}`);
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`   Created: ${created} products`);
  console.log(`   Updated: ${updated} products`);
  console.log(`   Total: ${productsData.length} products\n`);

  // Summary by group
  const summary = await prisma.product.groupBy({
    by: ['groupId'],
    _count: { _all: true },
    where: { isActive: true },
  });

  console.log('📊 Products by Group:');
  for (const s of summary) {
    const group = groups.find((g) => g.id === s.groupId);
    console.log(`   ${group?.nameEn || 'Uncategorized'}: ${s._count._all}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

