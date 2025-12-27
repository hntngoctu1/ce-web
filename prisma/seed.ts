import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { allocateOrderCode } from '../src/lib/orders/order-code';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Internal brand assets (no external image dependencies)
  const img = {
    hero: {
      home: '/banners/home-1.svg',
      envision: '/banners/home-2.svg',
      engage: '/banners/home-3.svg',
      entrench: '/banners/home-1.svg',
    },
    industry: {
      'electricity-electronics': '/industries/electricity-electronics.svg',
      'automotive-transportation': '/industries/automotive-transportation.svg',
      'printing-packaging': '/industries/printing-packaging.svg',
      'automation-measurement': '/industries/automation-measurement.svg',
      'waterproofing-coating': '/industries/waterproofing-coating.svg',
      'furniture-wood': '/industries/furniture-wood.svg',
      'food-pharmaceuticals': '/industries/food-pharmaceuticals.svg',
    },
    group: {
      'industrial-tapes': '/groups/industrial-tapes.svg',
      'silicone-rubber': '/groups/silicone-rubber.svg',
      lubricants: '/groups/lubricants.svg',
      'metalworking-coatings': '/groups/metalworking-coatings.svg',
      'electronic-coatings': '/groups/electronic-coatings.svg',
      'sandpaper-abrasives': '/groups/sandpaper-abrasives.svg',
      'nukote-coatings': '/groups/nukote-coatings.svg',
      'industrial-adhesives': '/groups/industrial-adhesives.svg',
      'welding-equipment': '/groups/welding-equipment.svg',
      printers: '/groups/printers.svg',
      'automatic-dosing': '/groups/automatic-dosing.svg',
      'fluid-transmission': '/groups/fluid-transmission.svg',
      'heat-conducting': '/groups/heat-conducting.svg',
    },
    product: {
      'tesa-4965-double-sided-tape': '/products/tesa-4965-double-sided-tape.svg',
      'loctite-401-instant-adhesive': '/products/loctite-401-instant-adhesive.svg',
      'tesa-4651-cloth-tape': '/products/tesa-4651-cloth-tape.svg',
    },
    blog: {
      welcome: '/blog-covers/welcome-to-creative-engineering.svg',
      adhesives: '/blog-covers/selecting-industrial-adhesives-for-production.svg',
      tapes: '/blog-covers/double-sided-tapes-in-electronics-assembly.svg',
      automation: '/blog-covers/case-study-automation-dispensing-upgrade.svg',
      coating: '/blog-covers/protective-coatings-how-to-choose.svg',
    },
    logo: {
      henkel: '/partners/henkel.webp',
      tesa: '/partners/tesa.webp',
      graco: '/partners/graco.webp',
      '3m': '/partners/3m.svg',
      loctite: '/partners/loctite.svg',
      bostik: '/partners/bostik.svg',
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
    },
  };

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ce.com.vn' },
    update: {},
    create: {
      email: 'admin@ce.com.vn',
      name: 'Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@ce.com.vn' },
    update: {},
    create: {
      email: 'editor@ce.com.vn',
      name: 'Editor',
      password: editorPassword,
      role: UserRole.EDITOR,
    },
  });
  console.log('✅ Editor user created:', editor.email);

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Demo Customer',
      phone: '0901234567',
      password: customerPassword,
      role: UserRole.CUSTOMER,
      customerProfile: {
        create: {
          address: '123 Nguyen Hue Street',
          city: 'Ho Chi Minh City',
          province: 'Ho Chi Minh',
          companyName: 'Demo Company Ltd',
          loyaltyPoints: 250,
        },
      },
    },
  });
  console.log('✅ Customer user created:', customer.email);

  // -------------------- Demo orders (idempotent) --------------------
  const existingOrders = await prisma.order.count({ where: { userId: customer.id } });
  if (existingOrders === 0) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 3,
      select: { id: true, sku: true, nameEn: true, price: true },
      orderBy: { createdAt: 'desc' },
    });

    if (products.length > 0) {
      const makeOrder = async (status: any) => {
        return prisma.$transaction(async (tx) => {
          const { orderCode } = await allocateOrderCode(tx as any);
          const items = products.slice(0, Math.min(2, products.length)).map((p, idx) => {
            const qty = idx + 1;
            const price = Number(p.price);
            return {
              productId: p.id,
              productName: p.nameEn,
              productSku: p.sku,
              quantity: qty,
              unitPrice: price,
              totalPrice: price * qty,
            };
          });

          const subtotal = items.reduce((acc, it) => acc + Number(it.totalPrice), 0);
          const total = subtotal;
          const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days

          // Determine accounting status based on order status
          let accountingStatus:
            | 'PENDING_PAYMENT'
            | 'PAID'
            | 'PARTIALLY_PAID'
            | 'COMPLETED'
            | 'CANCELLED' = 'PENDING_PAYMENT';
          let paidAmount = 0;
          let outstandingAmount = total;
          if (status === 'DELIVERED') {
            accountingStatus = 'COMPLETED';
            paidAmount = total;
            outstandingAmount = 0;
          } else if (status === 'SHIPPED') {
            accountingStatus = 'PAID';
            paidAmount = total;
            outstandingAmount = 0;
          } else if (status === 'CONFIRMED') {
            accountingStatus = 'PARTIALLY_PAID';
            paidAmount = total * 0.5;
            outstandingAmount = total * 0.5;
          }

          return tx.order.create({
            data: {
              orderNumber: orderCode,
              orderCode,
              userId: customer.id,
              customerName: customer.name || 'Demo Customer',
              customerEmail: customer.email,
              customerPhone: customer.phone || '0901234567',
              shippingAddress: '123 Nguyen Hue Street, Ho Chi Minh City',
              buyerType: 'BUSINESS',
              buyerCompanyName: 'Demo Company Ltd',
              buyerTaxId: '0312345678',
              buyerSnapshot: JSON.stringify({
                customerType: 'BUSINESS',
                companyName: 'Demo Company Ltd',
                taxId: '0312345678',
                name: customer.name || 'Demo Customer',
                email: customer.email,
                phone: customer.phone || '0901234567',
              }),
              shippingSnapshot: JSON.stringify({
                recipientName: customer.name || 'Demo Customer',
                recipientEmail: customer.email,
                recipientPhone: customer.phone || '0901234567',
                addressLine1: '123 Nguyen Hue Street',
                city: 'Ho Chi Minh City',
                country: 'Vietnam',
              }),
              subtotal,
              total,
              // @ts-ignore - Prisma client may not have these fields yet
              totalAmount: total,
              // @ts-ignore
              paidAmount,
              // @ts-ignore
              outstandingAmount,
              currency: 'VND',
              // @ts-ignore - Prisma client may not have these fields yet
              orderDate,
              // @ts-ignore
              dueDate: new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from order date
              // @ts-ignore
              customerKind: 'BUSINESS',
              // @ts-ignore
              accountingStatus,
              status: status === 'SHIPPED' || status === 'DELIVERED' ? status : 'PENDING',
              paymentStatus:
                accountingStatus === 'PAID' || accountingStatus === 'COMPLETED'
                  ? 'PAID'
                  : accountingStatus === 'PARTIALLY_PAID'
                    ? 'PARTIAL'
                    : 'PENDING',
              paymentMethod: 'cod',
              orderStatus: status,
              paymentState:
                accountingStatus === 'PAID' || accountingStatus === 'COMPLETED'
                  ? 'PAID'
                  : accountingStatus === 'PARTIALLY_PAID'
                    ? 'PARTIAL'
                    : 'UNPAID',
              fulfillmentStatus:
                status === 'SHIPPED' || status === 'DELIVERED' ? 'SHIPPED' : 'UNFULFILLED',
              items: { create: items },
              statusHistory: {
                create: {
                  fromStatus: null,
                  toStatus: status,
                  actorAdminId: null,
                  noteInternal: 'Seeded demo order',
                },
              },
            },
          });
        });
      };

      await makeOrder('PENDING_CONFIRMATION');
      await makeOrder('CONFIRMED');
      await makeOrder('SHIPPED');
      console.log('✅ Demo orders created');
    } else {
      console.log('ℹ️ Skipped demo orders (no active products found)');
    }
  } else {
    console.log('ℹ️ Skipped demo orders (already exist)');
  }

  // Create page sections
  const pageSections = [
    {
      page: 'home',
      sectionType: 'HERO' as const,
      titleEn: 'Engineering Excellence',
      titleVi: 'Xuất sắc trong Kỹ thuật',
      subtitleEn: 'Your Trusted Partner in Industrial Solutions',
      subtitleVi: 'Đối tác Đáng tin cậy trong Giải pháp Công nghiệp',
      contentEn:
        'Creative Engineering delivers innovative solutions for industrial challenges since 1999.',
      contentVi:
        'Creative Engineering cung cấp các giải pháp sáng tạo cho thách thức công nghiệp từ năm 1999.',
      imageUrl: img.hero.home,
      order: 0,
    },
    {
      page: 'envision',
      sectionType: 'HERO' as const,
      titleEn: 'ENVISION',
      titleVi: 'TẦM NHÌN',
      subtitleEn: 'Shaping the Future of Industrial Innovation',
      subtitleVi: 'Định hình Tương lai của Đổi mới Công nghiệp',
      contentEn:
        'Founded in 1999, Creative Engineering has been at the forefront of industrial innovation, partnering with global leaders like Henkel, Tesa, and Graco to deliver cutting-edge solutions.',
      contentVi:
        'Thành lập năm 1999, Creative Engineering luôn đi đầu trong đổi mới công nghiệp, hợp tác với các nhà lãnh đạo toàn cầu như Henkel, Tesa, và Graco để cung cấp các giải pháp tiên tiến.',
      imageUrl: img.hero.envision,
      order: 0,
    },
    {
      page: 'engage',
      sectionType: 'HERO' as const,
      titleEn: 'ENGAGE',
      titleVi: 'HỢP TÁC',
      subtitleEn: 'From Concept to Reality',
      subtitleVi: 'Từ Ý tưởng đến Thực tế',
      contentEn:
        'We work closely with our clients from the initial idea through to full implementation, ensuring every solution meets your unique requirements.',
      contentVi:
        'Chúng tôi làm việc chặt chẽ với khách hàng từ ý tưởng ban đầu đến triển khai hoàn chỉnh, đảm bảo mọi giải pháp đáp ứng yêu cầu riêng của bạn.',
      imageUrl: img.hero.engage,
      order: 0,
    },
    {
      page: 'entrench',
      sectionType: 'HERO' as const,
      titleEn: 'ENTRENCH',
      titleVi: 'BỀN VỮNG',
      subtitleEn: 'Built to Last, Designed for the Future',
      subtitleVi: 'Xây dựng để Tồn tại, Thiết kế cho Tương lai',
      contentEn:
        'Our solutions are engineered for durability and long-term performance. We provide continuous support and maintenance to ensure your operations run smoothly for years to come.',
      contentVi:
        'Các giải pháp của chúng tôi được thiết kế cho độ bền và hiệu suất lâu dài. Chúng tôi cung cấp hỗ trợ và bảo trì liên tục để đảm bảo hoạt động của bạn suôn sẻ trong nhiều năm.',
      imageUrl: img.hero.entrench,
      order: 0,
    },
  ];

  for (const section of pageSections) {
    await prisma.pageSection.upsert({
      where: {
        page_sectionType_order: {
          page: section.page,
          sectionType: section.sectionType,
          order: section.order,
        },
      },
      update: section,
      create: section,
    });
  }
  console.log('✅ Page sections created');

  // Create service categories
  const services = [
    {
      slug: 'mix-dispensing',
      nameEn: 'Mix & Dispensing',
      nameVi: 'Trộn & Phân phối',
      descriptionEn:
        'Precision mixing and dispensing solutions for adhesives, sealants, and coatings.',
      descriptionVi: 'Giải pháp trộn và phân phối chính xác cho keo dán, chất bịt kín và lớp phủ.',
      iconName: 'beaker',
      imageUrl: '/services/mix-dispensing.svg',
      order: 0,
    },
    {
      slug: 'converting-services',
      nameEn: 'Converting Services',
      nameVi: 'Dịch vụ Chuyển đổi',
      descriptionEn: 'Custom converting solutions for tapes, films, and flexible materials.',
      descriptionVi: 'Giải pháp chuyển đổi tùy chỉnh cho băng keo, màng và vật liệu linh hoạt.',
      iconName: 'scissors',
      imageUrl: '/services/converting-services.svg',
      order: 1,
    },
    {
      slug: 'custom-labeling',
      nameEn: 'Custom Labeling',
      nameVi: 'Nhãn Tùy chỉnh',
      descriptionEn: 'Professional labeling solutions for industrial and commercial applications.',
      descriptionVi: 'Giải pháp dán nhãn chuyên nghiệp cho ứng dụng công nghiệp và thương mại.',
      iconName: 'tag',
      imageUrl: '/services/custom-labeling.svg',
      order: 2,
    },
    {
      slug: 'laser-die-cutting',
      nameEn: 'Laser & Die Cutting',
      nameVi: 'Cắt Laser & Khuôn',
      descriptionEn:
        'High-precision laser and die cutting services for complex shapes and materials.',
      descriptionVi:
        'Dịch vụ cắt laser và khuôn chính xác cao cho các hình dạng và vật liệu phức tạp.',
      iconName: 'zap',
      imageUrl: '/services/laser-die-cutting.svg',
      order: 3,
    },
  ];

  for (const service of services) {
    await prisma.serviceCategory.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log('✅ Service categories created');

  // Create industry categories
  // Industry categories (13 items) - canonical list (DB source of truth)
  const industries = [
    {
      slug: 'industrial-tapes',
      nameEn: 'Industrial Tapes',
      nameVi: 'Băng Keo Công Nghiệp',
      descriptionEn:
        'High-performance industrial tapes for bonding, masking, insulation, and surface protection across manufacturing.',
      descriptionVi:
        'Băng keo công nghiệp hiệu suất cao cho kết dính, che chắn, cách điện và bảo vệ bề mặt trong sản xuất.',
      imageUrl: img.group['industrial-tapes'],
      order: 0,
    },
    {
      slug: 'silicone-rubber',
      nameEn: 'Virgin Silicone Rubber',
      nameVi: 'Cao Su Silicone Nguyên Chất',
      descriptionEn:
        'Premium virgin silicone rubber for sealing, gasketing, and high-temperature applications with excellent flexibility.',
      descriptionVi:
        'Cao su silicone nguyên chất cao cấp cho làm kín, gioăng và ứng dụng chịu nhiệt cao với độ linh hoạt tuyệt vời.',
      imageUrl: img.group['silicone-rubber'],
      order: 1,
    },
    {
      slug: 'lubricants',
      nameEn: 'Lubricants',
      nameVi: 'Chất Bôi Trơn',
      descriptionEn:
        'Industrial lubricants and greases for maintenance, friction reduction, wear protection, and corrosion prevention.',
      descriptionVi:
        'Chất bôi trơn và mỡ công nghiệp cho bảo trì, giảm ma sát, chống mài mòn và chống ăn mòn.',
      imageUrl: img.group.lubricants,
      order: 2,
    },
    {
      slug: 'metalworking-coatings',
      nameEn: 'Coatings – Metalworking and Cleaning',
      nameVi: 'Chất Phủ – Gia Công Kim Loại và Vệ Sinh',
      descriptionEn:
        'Specialized coatings, coolants, and cleaning solutions for metalworking processes including cutting, grinding, and surface treatment.',
      descriptionVi:
        'Chất phủ, dung dịch làm mát và vệ sinh chuyên dụng cho gia công kim loại: cắt, mài và xử lý bề mặt.',
      imageUrl: img.group['metalworking-coatings'],
      order: 3,
    },
    {
      slug: 'electronic-coatings',
      nameEn: 'Electronic Surface Coatings',
      nameVi: 'Chất Phủ Bề Mặt Điện Tử',
      descriptionEn:
        'Conformal coatings, potting compounds, and encapsulants for protecting electronic assemblies from moisture and contamination.',
      descriptionVi:
        'Chất phủ bảo vệ, hợp chất đổ khuôn và chất bọc bảo vệ cụm lắp ráp điện tử khỏi ẩm và ô nhiễm.',
      imageUrl: img.group['electronic-coatings'],
      order: 4,
    },
    {
      slug: 'sandpaper-abrasives',
      nameEn: 'Sandpaper and Abrasives, Polishing',
      nameVi: 'Giấy Nhám và Vật Liệu Mài, Đánh Bóng',
      descriptionEn:
        'A complete range of abrasives for surface preparation, finishing, grinding, and polishing across industries.',
      descriptionVi:
        'Danh mục vật liệu mài mòn cho chuẩn bị bề mặt, hoàn thiện, mài và đánh bóng trong nhiều ngành.',
      imageUrl: img.group['sandpaper-abrasives'],
      order: 5,
    },
    {
      slug: 'nukote-coatings',
      nameEn: 'Nukote – Protective Coatings',
      nameVi: 'Nukote – Chất Phủ Bảo Vệ',
      descriptionEn:
        'Nukote polyurea and hybrid protective coatings for abrasion, corrosion, impact, and chemical resistance.',
      descriptionVi:
        'Chất phủ bảo vệ Nukote polyurea/hybrid chống mài mòn, ăn mòn, va đập và kháng hoá chất.',
      imageUrl: img.group['nukote-coatings'],
      order: 6,
    },
    {
      slug: 'industrial-adhesives',
      nameEn: 'Industrial Adhesives',
      nameVi: 'Keo Dán Công Nghiệp',
      descriptionEn:
        'Structural and assembly adhesives for bonding metals, plastics, composites, and dissimilar materials with high reliability.',
      descriptionVi:
        'Keo kết cấu và lắp ráp cho kim loại, nhựa, composite và vật liệu khác nhau, độ tin cậy cao.',
      imageUrl: img.group['industrial-adhesives'],
      order: 7,
    },
    {
      slug: 'welding-equipment',
      nameEn: 'Welding Machines and Accessories',
      nameVi: 'Máy Hàn và Phụ Kiện',
      descriptionEn:
        'Professional MIG/TIG/spot welding equipment, consumables, and safety accessories for fabrication and maintenance.',
      descriptionVi:
        'Thiết bị hàn MIG/TIG/hàn điểm, vật tư tiêu hao và phụ kiện an toàn cho chế tạo và bảo trì.',
      imageUrl: img.group['welding-equipment'],
      order: 8,
    },
    {
      slug: 'printers',
      nameEn: 'Printers',
      nameVi: 'Máy In',
      descriptionEn:
        'Industrial printing solutions: inkjet coders, label printers, and marking systems for traceability and product identification.',
      descriptionVi:
        'Giải pháp in công nghiệp: in phun mã, máy in nhãn và hệ thống đánh dấu cho truy xuất và nhận dạng sản phẩm.',
      imageUrl: img.group.printers,
      order: 9,
    },
    {
      slug: 'automatic-dosing',
      nameEn: 'Automatic Robotic Dosing Equipment',
      nameVi: 'Thiết Bị Định Lượng Tự Động Robot',
      descriptionEn:
        'Precision dispensing robots and automated dosing systems for adhesives, sealants, and fluid materials.',
      descriptionVi:
        'Robot phân phối chính xác và hệ thống định lượng tự động cho keo dán, chất bịt kín và vật liệu lỏng.',
      imageUrl: img.group['automatic-dosing'],
      order: 10,
    },
    {
      slug: 'fluid-transmission',
      nameEn: 'Fluid Transmission and Shredding',
      nameVi: 'Truyền Động Chất Lỏng và Nghiền',
      descriptionEn:
        'Hydraulic/pneumatic components, hoses and fittings, plus shredding solutions for production, recycling, and maintenance.',
      descriptionVi:
        'Linh kiện thủy lực/khí nén, ống và phụ kiện, kèm giải pháp nghiền cho sản xuất, tái chế và bảo trì.',
      imageUrl: img.group['fluid-transmission'],
      order: 11,
    },
    {
      slug: 'heat-conducting',
      nameEn: 'Heat-Conducting Material',
      nameVi: 'Vật Liệu Dẫn Nhiệt',
      descriptionEn:
        'Thermal interface materials (pads, pastes, gap fillers) for effective heat dissipation in electronics and power systems.',
      descriptionVi:
        'Vật liệu giao diện nhiệt (pad, keo, gap filler) giúp tản nhiệt hiệu quả cho điện tử và hệ thống nguồn.',
      imageUrl: img.group['heat-conducting'],
      order: 12,
    },
  ];

  for (const industry of industries) {
    await prisma.industryCategory.upsert({
      where: { slug: industry.slug },
      update: industry,
      create: industry,
    });
  }
  // Deactivate non-canonical industry categories (safe cleanup)
  await prisma.industryCategory.updateMany({
    where: { slug: { notIn: industries.map((i) => i.slug) } },
    data: { isActive: false },
  });
  console.log('✅ Industry categories created');

  // Create product groups
  const productGroups = [
    {
      slug: 'industrial-tapes',
      nameEn: 'Industrial Tapes',
      nameVi: 'Băng keo Công nghiệp',
      imageUrl: img.group['industrial-tapes'],
      order: 0,
    },
    {
      slug: 'silicone-rubber',
      nameEn: 'Virgin Silicone Rubber',
      nameVi: 'Cao su Silicone Nguyên chất',
      imageUrl: img.group['silicone-rubber'],
      order: 1,
    },
    {
      slug: 'lubricants',
      nameEn: 'Lubricants',
      nameVi: 'Chất bôi trơn',
      imageUrl: img.group.lubricants,
      order: 2,
    },
    {
      slug: 'metalworking-coatings',
      nameEn: 'Coatings - Metalworking and Cleaning',
      nameVi: 'Lớp phủ - Gia công kim loại và Vệ sinh',
      imageUrl: img.group['metalworking-coatings'],
      order: 3,
    },
    {
      slug: 'electronic-coatings',
      nameEn: 'Electronic Surface Coatings',
      nameVi: 'Lớp phủ Bề mặt Điện tử',
      imageUrl: img.group['electronic-coatings'],
      order: 4,
    },
    {
      slug: 'sandpaper-abrasives',
      nameEn: 'Sandpaper and Abrasives, Polishing',
      nameVi: 'Giấy nhám và Chất mài mòn, Đánh bóng',
      imageUrl: img.group['sandpaper-abrasives'],
      order: 5,
    },
    {
      slug: 'nukote-coatings',
      nameEn: 'Nukote - Protective Coatings',
      nameVi: 'Nukote - Lớp phủ Bảo vệ',
      imageUrl: img.group['nukote-coatings'],
      order: 6,
    },
    {
      slug: 'industrial-adhesives',
      nameEn: 'Industrial Adhesives',
      nameVi: 'Keo dán Công nghiệp',
      imageUrl: img.group['industrial-adhesives'],
      order: 7,
    },
    {
      slug: 'welding-equipment',
      nameEn: 'Welding Machines and Accessories',
      nameVi: 'Máy hàn và Phụ kiện',
      imageUrl: img.group['welding-equipment'],
      order: 8,
    },
    {
      slug: 'printers',
      nameEn: 'Printers',
      nameVi: 'Máy in',
      imageUrl: img.group.printers,
      order: 9,
    },
    {
      slug: 'automatic-dosing',
      nameEn: 'Automatic-Robotic-Dosing Equipment',
      nameVi: 'Thiết bị Tự động-Robot-Định lượng',
      imageUrl: img.group['automatic-dosing'],
      order: 10,
    },
    {
      slug: 'fluid-transmission',
      nameEn: 'Fluid Transmission and Shredding',
      nameVi: 'Truyền Chất lỏng và Nghiền',
      imageUrl: img.group['fluid-transmission'],
      order: 11,
    },
    {
      slug: 'heat-conducting',
      nameEn: 'Heat-Conducting Materials',
      nameVi: 'Vật liệu Dẫn nhiệt',
      imageUrl: img.group['heat-conducting'],
      order: 12,
    },
  ];

  for (const group of productGroups) {
    await prisma.productGroup.upsert({
      where: { slug: group.slug },
      update: group,
      create: group,
    });
  }
  console.log('✅ Product groups created');

  // Create partners
  const partners = [
    { name: 'Henkel', order: 0, isBrand: true, logoUrl: img.logo.henkel },
    { name: 'Tesa', order: 1, isBrand: true, logoUrl: img.logo.tesa },
    { name: 'Graco', order: 2, isBrand: true, logoUrl: img.logo.graco },
    { name: '3M', order: 3, isBrand: true, logoUrl: img.logo['3m'] },
    { name: 'Loctite', order: 4, isBrand: true, logoUrl: img.logo.loctite },
    { name: 'Bostik', order: 5, isBrand: true, logoUrl: img.logo.bostik },
    { name: 'Avery Dennison', order: 6, isBrand: true, logoUrl: img.logo['avery-dennison'] },
    { name: 'CRC', order: 7, isBrand: true, logoUrl: img.logo.crc },
    { name: 'Dow', order: 8, isBrand: true, logoUrl: img.logo.dow },
    { name: 'Hermes', order: 9, isBrand: true, logoUrl: img.logo.hermes },
    { name: 'Huntsman', order: 10, isBrand: true, logoUrl: img.logo.huntsman },
    { name: 'Lanotec', order: 11, isBrand: true, logoUrl: img.logo.lanotec },
    { name: 'Mark Andy', order: 12, isBrand: true, logoUrl: img.logo['mark-andy'] },
    { name: 'Mirka', order: 13, isBrand: true, logoUrl: img.logo.mirka },
    { name: 'Nukote Industrial', order: 14, isBrand: true, logoUrl: img.logo['nukote-industrial'] },
    { name: 'Pillarhouse', order: 15, isBrand: true, logoUrl: img.logo.pillarhouse },
    { name: 'Saiyakaya', order: 16, isBrand: true, logoUrl: img.logo.saiyakaya },
    { name: 'SAKI', order: 17, isBrand: true, logoUrl: img.logo.saki },
    { name: 'Stoner', order: 18, isBrand: true, logoUrl: img.logo.stoner },
    { name: 'Techcon', order: 19, isBrand: true, logoUrl: img.logo.techcon },
    { name: 'Valco Melton', order: 20, isBrand: true, logoUrl: img.logo['valco-melton'] },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { id: partner.name.toLowerCase().replace(/\s+/g, '-') },
      update: partner,
      create: { ...partner, id: partner.name.toLowerCase().replace(/\s+/g, '-') },
    });
  }
  console.log('✅ Partners created');

  // Get the industrial tapes group for sample products
  const tapesGroup = await prisma.productGroup.findUnique({ where: { slug: 'industrial-tapes' } });
  const adhesivesGroup = await prisma.productGroup.findUnique({
    where: { slug: 'industrial-adhesives' },
  });
  const henkelBrand = await prisma.partner.findUnique({ where: { id: 'henkel' } });
  const tesaBrand = await prisma.partner.findUnique({ where: { id: 'tesa' } });

  // Create sample products
  const products = [
    {
      slug: 'tesa-4965-double-sided-tape',
      sku: 'TESA-4965',
      nameEn: 'tesa® 4965 Double-Sided Tape',
      nameVi: 'Băng keo hai mặt tesa® 4965',
      shortDescEn: 'High-performance double-sided tape for permanent bonding',
      shortDescVi: 'Băng keo hai mặt hiệu suất cao cho liên kết vĩnh viễn',
      descriptionEn:
        'tesa® 4965 is a double-sided tape with a polyester backing and modified acrylic adhesive on both sides. Excellent for bonding to various surfaces including metals, plastics, and glass.',
      descriptionVi:
        'tesa® 4965 là băng keo hai mặt với lớp nền polyester và keo acrylic cải tiến ở cả hai mặt. Xuất sắc cho việc liên kết với nhiều bề mặt khác nhau bao gồm kim loại, nhựa và kính.',
      price: 450000,
      groupId: tapesGroup?.id,
      brandId: tesaBrand?.id,
      isFeatured: true,
      order: 0,
    },
    {
      slug: 'loctite-401-instant-adhesive',
      sku: 'LOC-401',
      nameEn: 'Loctite 401 Instant Adhesive',
      nameVi: 'Keo dán nhanh Loctite 401',
      shortDescEn: 'Fast-curing general purpose instant adhesive',
      shortDescVi: 'Keo dán nhanh đa năng, đông cứng nhanh',
      descriptionEn:
        'Loctite 401 is a general purpose instant adhesive designed for the assembly of difficult-to-bond materials. It provides rapid bonding of a wide range of materials.',
      descriptionVi:
        'Loctite 401 là keo dán nhanh đa năng được thiết kế cho việc lắp ráp các vật liệu khó liên kết. Nó cung cấp liên kết nhanh chóng cho nhiều loại vật liệu.',
      price: 320000,
      salePrice: 280000,
      isOnSale: true,
      groupId: adhesivesGroup?.id,
      brandId: henkelBrand?.id,
      isFeatured: true,
      order: 1,
    },
    {
      slug: 'tesa-4651-cloth-tape',
      sku: 'TESA-4651',
      nameEn: 'tesa® 4651 Premium Cloth Tape',
      nameVi: 'Băng keo vải cao cấp tesa® 4651',
      shortDescEn: 'Premium cloth tape for bundling and protection',
      shortDescVi: 'Băng keo vải cao cấp để bó và bảo vệ',
      descriptionEn:
        'tesa® 4651 is a premium cloth tape with excellent adhesion and conformability. Ideal for bundling, holding, and surface protection applications.',
      descriptionVi:
        'tesa® 4651 là băng keo vải cao cấp với độ bám dính và khả năng uốn cong tuyệt vời. Lý tưởng cho các ứng dụng bó, giữ và bảo vệ bề mặt.',
      price: 180000,
      groupId: tapesGroup?.id,
      brandId: tesaBrand?.id,
      order: 2,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });

    // Ensure deterministic images/specs when re-seeding
    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    await prisma.productSpec.deleteMany({ where: { productId: created.id } });

    const imageUrl = img.product[created.slug as keyof typeof img.product];
    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: imageUrl,
          alt: created.nameEn,
          order: 0,
          isPrimary: true,
        },
      });
    }

    // Add sample specs
    if (created.slug === 'tesa-4965-double-sided-tape') {
      await prisma.productSpec.createMany({
        data: [
          {
            productId: created.id,
            keyEn: 'Thickness',
            keyVi: 'Độ dày',
            valueEn: '0.205mm',
            valueVi: '0.205mm',
            order: 0,
          },
          {
            productId: created.id,
            keyEn: 'Width',
            keyVi: 'Chiều rộng',
            valueEn: '12mm - 1000mm',
            valueVi: '12mm - 1000mm',
            order: 1,
          },
          {
            productId: created.id,
            keyEn: 'Temperature Range',
            keyVi: 'Phạm vi nhiệt độ',
            valueEn: '-40°C to +150°C',
            valueVi: '-40°C đến +150°C',
            order: 2,
          },
        ],
      });
    }
  }
  console.log('✅ Sample products created');

  // Create blog categories
  const blogCategories = [
    { slug: 'news', nameEn: 'News', nameVi: 'Tin tức', order: 0 },
    { slug: 'insights', nameEn: 'Insights', nameVi: 'Góc nhìn', order: 1 },
    { slug: 'case-studies', nameEn: 'Case Studies', nameVi: 'Nghiên cứu Điển hình', order: 2 },
    { slug: 'tutorials', nameEn: 'Tutorials', nameVi: 'Hướng dẫn', order: 3 },
  ];

  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log('✅ Blog categories created');

  // Create blog tags
  const blogTags = [
    { slug: 'adhesives', nameEn: 'Adhesives', nameVi: 'Keo dán' },
    { slug: 'industrial', nameEn: 'Industrial', nameVi: 'Công nghiệp' },
    { slug: 'innovation', nameEn: 'Innovation', nameVi: 'Đổi mới' },
    { slug: 'sustainability', nameEn: 'Sustainability', nameVi: 'Bền vững' },
  ];

  for (const tag of blogTags) {
    await prisma.blogTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
  console.log('✅ Blog tags created');

  // Create sample blog posts (with cover images)
  const [newsCategory, insightsCategory, caseCategory] = await Promise.all([
    prisma.blogCategory.findUnique({ where: { slug: 'news' } }),
    prisma.blogCategory.findUnique({ where: { slug: 'insights' } }),
    prisma.blogCategory.findUnique({ where: { slug: 'case-studies' } }),
  ]);

  const posts = [
    {
      slug: 'welcome-to-creative-engineering',
      titleEn: 'Welcome to Creative Engineering',
      titleVi: 'Chào mừng đến với Creative Engineering',
      excerptEn:
        'How CE bridges global industrial technology with Vietnam’s manufacturing needs—since 1999.',
      excerptVi:
        'CE kết nối công nghệ công nghiệp toàn cầu với nhu cầu sản xuất tại Việt Nam—từ năm 1999.',
      coverImage: img.blog.welcome,
      categoryId: newsCategory?.id,
      isFeatured: true,
      contentEn:
        '<p>Creative Engineering has been at the forefront of industrial innovation since 1999. We partner with global leaders to bring reliable, production-ready solutions to manufacturers across Vietnam.</p><h3>What we deliver</h3><ul><li>Industrial tapes & adhesives</li><li>Coatings and surface protection</li><li>Automation, mixing & dispensing</li></ul><p>Our engineers work with your team to design, validate, and scale solutions that meet your process constraints.</p>',
      contentVi:
        '<p>Creative Engineering luôn đi đầu trong đổi mới công nghiệp từ năm 1999. Chúng tôi hợp tác với các thương hiệu toàn cầu để mang đến giải pháp ổn định, sẵn sàng sản xuất cho các nhà máy tại Việt Nam.</p><h3>Chúng tôi cung cấp</h3><ul><li>Băng keo & keo dán công nghiệp</li><li>Lớp phủ và bảo vệ bề mặt</li><li>Tự động hoá, trộn & định lượng</li></ul><p>Đội ngũ kỹ sư phối hợp cùng khách hàng để thiết kế, kiểm chứng và triển khai giải pháp phù hợp quy trình.</p>',
    },
    {
      slug: 'selecting-industrial-adhesives-for-production',
      titleEn: 'Selecting Industrial Adhesives for Production: A Practical Checklist',
      titleVi: 'Chọn keo dán công nghiệp cho sản xuất: Checklist thực tế',
      excerptEn:
        'Key factors: substrate, surface prep, cure time, temperature, and long-term reliability.',
      excerptVi:
        'Các yếu tố then chốt: vật liệu, xử lý bề mặt, thời gian đóng rắn, nhiệt độ, độ bền lâu dài.',
      coverImage: img.blog.adhesives,
      categoryId: insightsCategory?.id,
      contentEn:
        '<p>Choosing the right adhesive is a manufacturing decision, not just a purchasing one.</p><h3>Checklist</h3><ol><li>Substrates & surface energy</li><li>Surface preparation method</li><li>Cure mechanism and takt time</li><li>Environmental exposure (heat, humidity, chemicals)</li><li>Qualification tests (shear/peel, aging)</li></ol><p>CE can help shortlist options and run validation trials.</p>',
      contentVi:
        '<p>Chọn keo dán phù hợp là quyết định kỹ thuật của sản xuất, không chỉ là mua hàng.</p><h3>Checklist</h3><ol><li>Vật liệu và năng lượng bề mặt</li><li>Phương pháp xử lý bề mặt</li><li>Cơ chế đóng rắn và takt time</li><li>Môi trường làm việc (nhiệt, ẩm, hoá chất)</li><li>Test thẩm định (shear/peel, lão hoá)</li></ol><p>CE có thể hỗ trợ shortlist và chạy thử nghiệm xác nhận.</p>',
    },
    {
      slug: 'double-sided-tapes-in-electronics-assembly',
      titleEn: 'Double‑Sided Tapes in Electronics Assembly: Where They Shine',
      titleVi: 'Băng keo hai mặt trong lắp ráp điện tử: Khi nào nên dùng',
      excerptEn:
        'Fast bonding, clean process, and consistent thickness—ideal for fixtures and shielding.',
      excerptVi: 'Dán nhanh, sạch, độ dày ổn định—phù hợp cho cố định và che chắn.',
      coverImage: img.blog.tapes,
      categoryId: insightsCategory?.id,
      contentEn:
        '<p>High-performance tapes simplify assembly by reducing cure time and improving line consistency.</p><ul><li>Bonding to plastics/metal/glass</li><li>Vibration damping</li><li>Gap filling and thickness control</li></ul><p>Use proper surface cleaning to maximize adhesion.</p>',
      contentVi:
        '<p>Băng keo hiệu suất cao giúp đơn giản hoá lắp ráp: không cần chờ đóng rắn và tăng tính ổn định của line.</p><ul><li>Dán trên nhựa/kim loại/kính</li><li>Giảm rung</li><li>Kiểm soát khe hở và độ dày</li></ul><p>Vệ sinh bề mặt đúng cách để đạt độ bám tốt nhất.</p>',
    },
    {
      slug: 'case-study-automation-dispensing-upgrade',
      titleEn: 'Case Study: Improving Yield with Automated Dispensing',
      titleVi: 'Case Study: Tăng yield với hệ thống định lượng tự động',
      excerptEn:
        'A structured approach: baseline → trial → validation → roll-out, reducing rework significantly.',
      excerptVi:
        'Cách làm bài bản: baseline → trial → validation → triển khai, giảm rework rõ rệt.',
      coverImage: img.blog.automation,
      categoryId: caseCategory?.id,
      contentEn:
        '<p>Automation success depends on process mapping and validation—not just buying equipment.</p><h3>Results</h3><ul><li>More stable bead geometry</li><li>Lower operator variability</li><li>Improved traceability</li></ul><p>CE supported specification, setup, and training.</p>',
      contentVi:
        '<p>Thành công của tự động hoá phụ thuộc vào mapping quy trình và validation—không chỉ là mua thiết bị.</p><h3>Kết quả</h3><ul><li>Hình dạng đường keo ổn định hơn</li><li>Giảm phụ thuộc tay nghề</li><li>Tăng truy xuất</li></ul><p>CE hỗ trợ từ đặc tả, setup đến đào tạo vận hành.</p>',
    },
    {
      slug: 'protective-coatings-how-to-choose',
      titleEn: 'Protective Coatings: How to Choose for Harsh Environments',
      titleVi: 'Lớp phủ bảo vệ: Chọn thế nào cho môi trường khắc nghiệt',
      excerptEn:
        'Focus on corrosion, chemicals, UV, and repairability—then validate with aging tests.',
      excerptVi: 'Tập trung ăn mòn, hoá chất, UV, khả năng sửa chữa—và test lão hoá để xác nhận.',
      coverImage: img.blog.coating,
      categoryId: insightsCategory?.id,
      contentEn:
        '<p>Protective coatings must match the exposure profile.</p><ul><li>Salt spray / corrosion resistance</li><li>Chemical splash & cleaning agents</li><li>UV and outdoor durability</li><li>Ease of repair</li></ul><p>CE can recommend options and test plans.</p>',
      contentVi:
        '<p>Lớp phủ bảo vệ phải phù hợp profile môi trường.</p><ul><li>Chống ăn mòn / muối</li><li>Hoá chất và chất tẩy rửa</li><li>Độ bền UV / ngoài trời</li><li>Dễ sửa chữa</li></ul><p>CE có thể tư vấn giải pháp và kế hoạch test.</p>',
    },
  ];

  for (const p of posts) {
    const post = await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        titleEn: p.titleEn,
        titleVi: p.titleVi,
        excerptEn: p.excerptEn,
        excerptVi: p.excerptVi,
        contentEn: p.contentEn,
        contentVi: p.contentVi,
        coverImage: p.coverImage,
        categoryId: p.categoryId,
        authorId: admin.id,
        isPublished: true,
        isFeatured: p.isFeatured ?? false,
        publishedAt: new Date(),
      },
      create: {
        slug: p.slug,
        titleEn: p.titleEn,
        titleVi: p.titleVi,
        excerptEn: p.excerptEn,
        excerptVi: p.excerptVi,
        contentEn: p.contentEn,
        contentVi: p.contentVi,
        coverImage: p.coverImage,
        categoryId: p.categoryId,
        authorId: admin.id,
        isPublished: true,
        isFeatured: p.isFeatured ?? false,
        publishedAt: new Date(),
      },
    });

    // Ensure no duplicate join rows on reseed
    await prisma.blogPostTag.deleteMany({ where: { postId: post.id } });
  }
  console.log('✅ Sample blog posts created');

  // Create settings
  const settings = [
    { key: 'site_name', value: 'Creative Engineering', type: 'string', group: 'general' },
    {
      key: 'site_description',
      value: 'Your Trusted Partner in Industrial Solutions',
      type: 'string',
      group: 'general',
    },
    { key: 'contact_email', value: 'contact@ce.com.vn', type: 'string', group: 'contact' },
    { key: 'contact_phone_hcm', value: '+84 28 1234 5678', type: 'string', group: 'contact' },
    { key: 'contact_phone_hn', value: '+84 24 1234 5678', type: 'string', group: 'contact' },
    {
      key: 'address_hcm',
      value: '123 Industrial Park, District 7, Ho Chi Minh City',
      type: 'string',
      group: 'contact',
    },
    {
      key: 'address_hn',
      value: '456 Tech Park, Cau Giay, Hanoi',
      type: 'string',
      group: 'contact',
    },
    {
      key: 'social_facebook',
      value: 'https://facebook.com/creativeengineering',
      type: 'string',
      group: 'social',
    },
    {
      key: 'social_linkedin',
      value: 'https://linkedin.com/company/creative-engineering',
      type: 'string',
      group: 'social',
    },
    {
      key: 'social_youtube',
      value: 'https://youtube.com/@creativeengineering',
      type: 'string',
      group: 'social',
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log('✅ Settings created');

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
