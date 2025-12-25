import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample products based on CE.com.vn catalog
const sampleProducts = [
  // tesa Products
  {
    sku: 'TESA-88642',
    nameEn: 'tesa® 88642 Double Coated Tissue Tape',
    nameVi: 'Băng keo hai mặt tesa® 88642',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 125000,
  },
  {
    sku: 'TESA-50551',
    nameEn: 'tesa® 50551 Wheel Rim Protection Film',
    nameVi: 'Phim bảo vệ vành xe tesa® 50551',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 280000,
  },
  {
    sku: 'TESA-60996',
    nameEn: 'tesa® 60996 Double-sided Tape for Lamination',
    nameVi: 'Băng keo hai mặt cho cán màng tesa® 60996',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 195000,
  },
  {
    sku: 'TESA-50600',
    nameEn: 'tesa® 50600 Green Polyester Masking Tape',
    nameVi: 'Băng keo che phủ polyester xanh tesa® 50600',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 165000,
  },
  {
    sku: 'TESA-7475',
    nameEn: 'tesa® 7475 PV2 Test Tapes for Silicone Coatings',
    nameVi: 'Băng keo test lớp phủ silicone tesa® 7475',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 320000,
  },
  {
    sku: 'TESA-72424',
    nameEn: 'tesa® Softprint 72424 FE Foam Plate Mounting Tape',
    nameVi: 'Băng keo gắn bản in tesa® Softprint 72424',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 450000,
  },
  {
    sku: 'TESA-4651',
    nameEn: 'tesa® 4651 Premium Cloth Tape',
    nameVi: 'Băng keo vải cao cấp tesa® 4651',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 180000,
  },
  {
    sku: 'TESA-4965',
    nameEn: 'tesa® 4965 Double-Sided Tape',
    nameVi: 'Băng keo hai mặt tesa® 4965',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 450000,
  },
  {
    sku: 'TESA-4970',
    nameEn: 'tesa® 4970 Double-sided Filmic Tape',
    nameVi: 'Băng keo hai mặt film tesa® 4970',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 380000,
  },
  {
    sku: 'TESA-51608',
    nameEn: 'tesa® 51608 PET Fleece Tape',
    nameVi: 'Băng keo lông cừu PET tesa® 51608',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 220000,
  },
  {
    sku: 'TESA-53793',
    nameEn: 'tesa® 53793 Strapping Tape',
    nameVi: 'Băng keo đóng gói tesa® 53793',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 145000,
  },
  {
    sku: 'TESA-60760',
    nameEn: 'tesa® 60760 Aluminum Foil Tape',
    nameVi: 'Băng keo nhôm tesa® 60760',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 290000,
  },
  {
    sku: 'TESA-64620',
    nameEn: 'tesa® 64620 Universal Polyester Tape',
    nameVi: 'Băng keo polyester đa năng tesa® 64620',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 175000,
  },
  {
    sku: 'TESA-4124',
    nameEn: 'tesa® 4124 PVC Packaging Tape',
    nameVi: 'Băng keo đóng gói PVC tesa® 4124',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 95000,
  },
  {
    sku: 'TESA-4104',
    nameEn: 'tesa® 4104 PVC Packaging Tape Premium',
    nameVi: 'Băng keo đóng gói PVC cao cấp tesa® 4104',
    brand: 'Tesa',
    group: 'Industrial Tapes',
    price: 120000,
  },

  // DOWSIL/Dow Products
  {
    sku: 'DOWSIL-TC6015',
    nameEn: 'DOWSIL™ TC-6015 Thermal Conductive Encapsulant',
    nameVi: 'Chất bọc dẫn nhiệt DOWSIL™ TC-6015',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 1250000,
  },
  {
    sku: 'DOWSIL-844',
    nameEn: 'DOWSIL™ 844 RTV Adhesive Sealant',
    nameVi: 'Keo dán kín RTV DOWSIL™ 844',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 580000,
  },
  {
    sku: 'DOWSIL-3145',
    nameEn: 'DOWSIL™ 3145 RTV Silicone Adhesive',
    nameVi: 'Keo silicone RTV DOWSIL™ 3145',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 650000,
  },
  {
    sku: 'DOWSIL-SE9187',
    nameEn: 'DOWSIL™ SE 9187 Thermally Conductive Adhesive',
    nameVi: 'Keo dẫn nhiệt DOWSIL™ SE 9187',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 1450000,
  },
  {
    sku: 'DOWSIL-1-2577',
    nameEn: 'DOWSIL™ 1-2577 Conformal Coating',
    nameVi: 'Lớp phủ bảo vệ DOWSIL™ 1-2577',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 890000,
  },
  {
    sku: 'DOWSIL-EA4600',
    nameEn: 'DOWSIL™ EA-4600 CV Electrically Conductive Adhesive',
    nameVi: 'Keo dẫn điện DOWSIL™ EA-4600',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 2100000,
  },
  {
    sku: 'DOWSIL-TC5022',
    nameEn: 'DOWSIL™ TC-5022 Thermal Compound',
    nameVi: 'Hợp chất dẫn nhiệt DOWSIL™ TC-5022',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 780000,
  },
  {
    sku: 'DOWSIL-CN8760',
    nameEn: 'DOWSIL™ CN-8760 Protective Coating',
    nameVi: 'Lớp phủ bảo vệ DOWSIL™ CN-8760',
    brand: 'Dow',
    group: 'Industrial Adhesives',
    price: 920000,
  },

  // Loctite Products
  {
    sku: 'LOC-401',
    nameEn: 'Loctite 401 Instant Adhesive',
    nameVi: 'Keo dán nhanh Loctite 401',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 280000,
  },
  {
    sku: 'LOC-406',
    nameEn: 'Loctite 406 Instant Adhesive for Plastics',
    nameVi: 'Keo dán nhựa nhanh Loctite 406',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 320000,
  },
  {
    sku: 'LOC-480',
    nameEn: 'Loctite 480 Rubber Toughened Instant Adhesive',
    nameVi: 'Keo dán cao su Loctite 480',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 380000,
  },
  {
    sku: 'LOC-243',
    nameEn: 'Loctite 243 Medium Strength Threadlocker Blue',
    nameVi: 'Keo khóa ren trung bình Loctite 243',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 250000,
  },
  {
    sku: 'LOC-263',
    nameEn: 'Loctite 263 High Strength Threadlocker Red',
    nameVi: 'Keo khóa ren cao Loctite 263',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 270000,
  },
  {
    sku: 'LOC-638',
    nameEn: 'Loctite 638 Retaining Compound High Strength',
    nameVi: 'Keo giữ lắp cao Loctite 638',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 420000,
  },
  {
    sku: 'LOC-577',
    nameEn: 'Loctite 577 Thread Sealant Medium Strength',
    nameVi: 'Keo làm kín ren Loctite 577',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 350000,
  },
  {
    sku: 'LOC-5188',
    nameEn: 'Loctite 5188 Flange Sealant',
    nameVi: 'Keo làm kín mặt bích Loctite 5188',
    brand: 'Henkel',
    group: 'Industrial Adhesives',
    price: 480000,
  },

  // 3M Products
  {
    sku: '3M-VHB-4991',
    nameEn: '3M™ VHB™ Tape 4991 Gray',
    nameVi: 'Băng keo VHB 3M™ 4991 Xám',
    brand: '3M',
    group: 'Industrial Tapes',
    price: 650000,
  },
  {
    sku: '3M-VHB-5952',
    nameEn: '3M™ VHB™ Tape 5952 Black',
    nameVi: 'Băng keo VHB 3M™ 5952 Đen',
    brand: '3M',
    group: 'Industrial Tapes',
    price: 720000,
  },
  {
    sku: '3M-467MP',
    nameEn: '3M™ Adhesive Transfer Tape 467MP',
    nameVi: 'Băng keo chuyển 3M™ 467MP',
    brand: '3M',
    group: 'Industrial Tapes',
    price: 380000,
  },
  {
    sku: '3M-468MP',
    nameEn: '3M™ Adhesive Transfer Tape 468MP',
    nameVi: 'Băng keo chuyển 3M™ 468MP',
    brand: '3M',
    group: 'Industrial Tapes',
    price: 420000,
  },
  {
    sku: '3M-9495LE',
    nameEn: '3M™ Double Coated Tape 9495LE',
    nameVi: 'Băng keo hai mặt 3M™ 9495LE',
    brand: '3M',
    group: 'Industrial Tapes',
    price: 550000,
  },
  {
    sku: '3M-DP460',
    nameEn: '3M™ Scotch-Weld™ Epoxy Adhesive DP460',
    nameVi: 'Keo epoxy 3M™ Scotch-Weld™ DP460',
    brand: '3M',
    group: 'Industrial Adhesives',
    price: 890000,
  },
  {
    sku: '3M-DP810',
    nameEn: '3M™ Scotch-Weld™ Acrylic Adhesive DP810',
    nameVi: 'Keo acrylic 3M™ Scotch-Weld™ DP810',
    brand: '3M',
    group: 'Industrial Adhesives',
    price: 950000,
  },
  {
    sku: '3M-4229P',
    nameEn: '3M™ Acrylic Foam Tape 4229P',
    nameVi: 'Băng keo xốp acrylic 3M™ 4229P',
    brand: '3M',
    group: 'Industrial Tapes',
    price: 480000,
  },

  // Advanced Materials / Specialty
  {
    sku: 'ANG-TITAN',
    nameEn: 'Advanced nanoGUARD ANG TITAN for PCBAs',
    nameVi: 'Lớp phủ nano ANG TITAN cho PCB',
    brand: 'nanoGUARD',
    group: 'Specialty Coatings',
    price: 1850000,
  },
  {
    sku: 'ANG-SHIELD',
    nameEn: 'Advanced nanoGUARD Shield Conformal Coating',
    nameVi: 'Lớp phủ bảo vệ nanoGUARD Shield',
    brand: 'nanoGUARD',
    group: 'Specialty Coatings',
    price: 1650000,
  },
  {
    sku: 'HUMISEAL-1B73',
    nameEn: 'HumiSeal 1B73 Acrylic Conformal Coating',
    nameVi: 'Lớp phủ acrylic HumiSeal 1B73',
    brand: 'HumiSeal',
    group: 'Specialty Coatings',
    price: 980000,
  },
  {
    sku: 'HUMISEAL-1A33',
    nameEn: 'HumiSeal 1A33 Urethane Conformal Coating',
    nameVi: 'Lớp phủ urethane HumiSeal 1A33',
    brand: 'HumiSeal',
    group: 'Specialty Coatings',
    price: 1120000,
  },

  // Packaging & Protective
  {
    sku: 'FOAM-PE-10',
    nameEn: 'PE Foam Sheet 10mm',
    nameVi: 'Tấm xốp PE 10mm',
    brand: 'Generic',
    group: 'Packaging',
    price: 45000,
  },
  {
    sku: 'FOAM-EPE-20',
    nameEn: 'EPE Foam Roll 20mm',
    nameVi: 'Cuộn xốp EPE 20mm',
    brand: 'Generic',
    group: 'Packaging',
    price: 85000,
  },
  {
    sku: 'BUBBLE-WRAP',
    nameEn: 'Bubble Wrap Roll 1m x 100m',
    nameVi: 'Cuộn xốp hơi 1m x 100m',
    brand: 'Generic',
    group: 'Packaging',
    price: 350000,
  },
  {
    sku: 'STRETCH-FILM',
    nameEn: 'Stretch Film 500mm x 300m',
    nameVi: 'Màng quấn pallet 500mm x 300m',
    brand: 'Generic',
    group: 'Packaging',
    price: 180000,
  },

  // Electronics / Thermal Management
  {
    sku: 'THERMAL-PAD-1',
    nameEn: 'Silicone Thermal Pad 100x100x1mm',
    nameVi: 'Tấm tản nhiệt silicone 100x100x1mm',
    brand: 'Generic',
    group: 'Electronics',
    price: 125000,
  },
  {
    sku: 'THERMAL-PASTE',
    nameEn: 'Thermal Paste 5g Syringe',
    nameVi: 'Keo tản nhiệt ống 5g',
    brand: 'Generic',
    group: 'Electronics',
    price: 65000,
  },
];

async function main() {
  console.log('🌱 Starting product seed...');

  // 1. Create default warehouse if not exists
  let warehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        code: 'MAIN',
        name: 'Main Warehouse',
        address: 'Ho Chi Minh City, Vietnam',
        isDefault: true,
      },
    });
    console.log('✅ Created default warehouse:', warehouse.code);
  } else {
    console.log('✅ Default warehouse exists:', warehouse.code);
  }

  // 2. Create or find brands
  const brandMap: Record<string, string> = {};
  const uniqueBrands = [...new Set(sampleProducts.map((p) => p.brand))];

  for (const brandName of uniqueBrands) {
    let brand = await prisma.partner.findFirst({ where: { name: brandName, isBrand: true } });
    if (!brand) {
      brand = await prisma.partner.create({
        data: { name: brandName, isBrand: true, isActive: true },
      });
    }
    brandMap[brandName] = brand.id;
  }
  console.log('✅ Brands ready:', Object.keys(brandMap).length);

  // 3. Create or find product groups
  const groupMap: Record<string, string> = {};
  const uniqueGroups = [...new Set(sampleProducts.map((p) => p.group))];

  for (const groupName of uniqueGroups) {
    const slug = groupName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    let group = await prisma.productGroup.findFirst({ where: { slug } });
    if (!group) {
      group = await prisma.productGroup.create({
        data: {
          slug,
          nameEn: groupName,
          nameVi: groupName,
          isActive: true,
        },
      });
    }
    groupMap[groupName] = group.id;
  }
  console.log('✅ Product groups ready:', Object.keys(groupMap).length);

  // 4. Create products
  let created = 0;
  let skipped = 0;

  for (const p of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { sku: p.sku } });
    if (existing) {
      skipped++;
      continue;
    }

    const slug = p.nameEn
      .toLowerCase()
      .replace(/[™®]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    await prisma.product.create({
      data: {
        slug: `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sku: p.sku,
        nameEn: p.nameEn,
        nameVi: p.nameVi,
        shortDescEn: `High-quality ${p.nameEn} from ${p.brand}`,
        shortDescVi: `${p.nameVi} chất lượng cao từ ${p.brand}`,
        descriptionEn: `${p.nameEn} is a premium industrial product designed for professional applications. Features excellent performance, durability, and reliability.`,
        descriptionVi: `${p.nameVi} là sản phẩm công nghiệp cao cấp được thiết kế cho ứng dụng chuyên nghiệp. Hiệu suất xuất sắc, độ bền cao và đáng tin cậy.`,
        price: p.price,
        currency: 'VND',
        isActive: true,
        isFeatured: Math.random() > 0.7,
        stockQuantity: 0, // Will use InventoryItem instead
        brandId: brandMap[p.brand],
        groupId: groupMap[p.group],
      },
    });
    created++;
  }
  console.log(`✅ Products: ${created} created, ${skipped} skipped (already exist)`);

  // 5. Create inventory items for ALL products
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, sku: true, nameEn: true },
  });

  let invCreated = 0;
  let invSkipped = 0;

  for (const product of allProducts) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { productId: product.id, warehouseId: warehouse.id },
    });

    if (existing) {
      invSkipped++;
      continue;
    }

    // Random initial stock between 10-200
    const initialQty = Math.floor(Math.random() * 190) + 10;
    const reorderPoint = Math.floor(initialQty * 0.2); // 20% of initial

    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        warehouseId: warehouse.id,
        onHandQty: initialQty,
        reservedQty: 0,
        availableQty: initialQty,
        reorderPointQty: reorderPoint,
        reorderQty: reorderPoint * 2,
      },
    });
    invCreated++;
  }
  console.log(`✅ Inventory items: ${invCreated} created, ${invSkipped} skipped (already exist)`);

  // 6. Create initial GRN document for audit trail
  if (invCreated > 0) {
    const docCode = `GRN-SEED-${Date.now()}`;
    const doc = await prisma.stockDocument.create({
      data: {
        code: docCode,
        type: 'GRN',
        status: 'POSTED',
        warehouseId: warehouse.id,
        referenceType: 'MANUAL',
        note: 'Initial stock seed - automated',
        postedAt: new Date(),
      },
    });
    console.log('✅ Created seed GRN document:', docCode);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('📦 Total products in database:', allProducts.length);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
