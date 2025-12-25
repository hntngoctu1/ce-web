export type IndustryResource = {
  title: string;
  titleVi?: string;
  type: 'pdf' | 'video' | 'guide' | 'link';
  href: string;
};

export type Industry = {
  slug: string;
  name: string;
  nameVi: string;
  summary: string;
  summaryVi: string;
  heroImage: string;
  tags: string[];
  tagsVi: string[];
  keyOutcomes: string[];
  keyOutcomesVi: string[];
  useCases: string[];
  useCasesVi: string[];
  products: { title: string; titleVi: string; href: string }[];
  resources: IndustryResource[];
  stats?: { label: string; labelVi: string; value: string }[];
};

export const industries: Industry[] = [
  {
    slug: 'industrial-tapes',
    name: 'Industrial Tapes',
    nameVi: 'Băng Keo Công Nghiệp',
    summary:
      'High-performance industrial tapes for bonding, masking, insulation, and surface protection across all manufacturing sectors.',
    summaryVi:
      'Băng keo công nghiệp hiệu suất cao cho kết dính, che chắn, cách điện và bảo vệ bề mặt trong tất cả các ngành sản xuất.',
    heroImage: '/groups/industrial-tapes.svg',
    tags: ['tapes', 'bonding', 'masking', 'insulation', 'protection'],
    tagsVi: ['băng keo', 'kết dính', 'che chắn', 'cách điện', 'bảo vệ'],
    keyOutcomes: [
      'Superior adhesion on various substrates including metals, plastics, and composites',
      'Temperature resistance from -40°C to +260°C for demanding applications',
      'Clean removal without residue for masking applications',
      'Long-term durability and weather resistance for outdoor use',
    ],
    keyOutcomesVi: [
      'Độ bám dính vượt trội trên nhiều bề mặt bao gồm kim loại, nhựa và composite',
      'Chịu nhiệt từ -40°C đến +260°C cho các ứng dụng khắt khe',
      'Tháo gỡ sạch không để lại cặn cho ứng dụng che chắn',
      'Độ bền lâu dài và chống thời tiết cho sử dụng ngoài trời',
    ],
    useCases: [
      'Surface protection',
      'Electrical insulation',
      'Masking for painting',
      'Assembly bonding',
      'Packaging sealing',
    ],
    useCasesVi: [
      'Bảo vệ bề mặt',
      'Cách điện',
      'Che chắn khi sơn',
      'Kết dính lắp ráp',
      'Dán kín đóng gói',
    ],
    products: [
      {
        title: 'Double-sided Tapes',
        titleVi: 'Băng keo hai mặt',
        href: '/menu/product?search=double-sided',
      },
      {
        title: 'Masking Tapes',
        titleVi: 'Băng keo che chắn',
        href: '/menu/product?search=masking',
      },
      {
        title: 'Electrical Tapes',
        titleVi: 'Băng keo điện',
        href: '/menu/product?search=electrical',
      },
      {
        title: 'Specialty Tapes',
        titleVi: 'Băng keo đặc biệt',
        href: '/menu/product?search=specialty-tape',
      },
    ],
    resources: [
      { title: 'Tape Selection Guide', titleVi: 'Hướng dẫn chọn băng keo', type: 'pdf', href: '#' },
      { title: 'Application Manual', titleVi: 'Sổ tay ứng dụng', type: 'guide', href: '#' },
    ],
    stats: [
      { label: 'Temperature Range', labelVi: 'Phạm vi nhiệt độ', value: '-40°C ~ +260°C' },
      { label: 'Adhesion Strength', labelVi: 'Độ bám dính', value: 'Up to 25N/cm' },
      { label: 'Brands Available', labelVi: 'Thương hiệu', value: '15+' },
    ],
  },
  {
    // NOTE: keep slug aligned with DB + icons in /public/groups
    slug: 'silicone-rubber',
    name: 'Virgin Silicone Rubber',
    nameVi: 'Cao Su Silicone Nguyên Chất',
    summary:
      'Premium quality virgin silicone rubber materials for sealing, gasketing, and high-temperature applications with excellent flexibility.',
    summaryVi:
      'Vật liệu cao su silicone nguyên chất cao cấp cho các ứng dụng làm kín, gioăng và chịu nhiệt cao với độ linh hoạt tuyệt vời.',
    heroImage: '/groups/silicone-rubber.svg',
    tags: ['silicone', 'rubber', 'sealing', 'gasket', 'high-temp'],
    tagsVi: ['silicone', 'cao su', 'làm kín', 'gioăng', 'chịu nhiệt'],
    keyOutcomes: [
      'Excellent compression set resistance for long-lasting seals',
      'Wide operating temperature range from -60°C to +230°C',
      'FDA compliant options for food and medical applications',
      'Resistance to UV, ozone, and weathering',
    ],
    keyOutcomesVi: [
      'Khả năng chống biến dạng nén tuyệt vời cho các mối làm kín bền lâu',
      'Phạm vi nhiệt độ hoạt động rộng từ -60°C đến +230°C',
      'Tùy chọn đạt chuẩn FDA cho ứng dụng thực phẩm và y tế',
      'Kháng tia UV, ozone và thời tiết',
    ],
    useCases: [
      'O-rings and seals',
      'Custom gaskets',
      'Vibration dampening',
      'Electrical insulation',
      'Food processing equipment',
    ],
    useCasesVi: [
      'O-ring và phớt',
      'Gioăng tùy chỉnh',
      'Giảm chấn',
      'Cách điện',
      'Thiết bị chế biến thực phẩm',
    ],
    products: [
      {
        title: 'Silicone Sheets',
        titleVi: 'Tấm silicone',
        href: '/menu/product?search=silicone-sheet',
      },
      {
        title: 'Silicone Cord',
        titleVi: 'Dây silicone',
        href: '/menu/product?search=silicone-cord',
      },
      {
        title: 'Silicone Tubes',
        titleVi: 'Ống silicone',
        href: '/menu/product?search=silicone-tube',
      },
    ],
    resources: [
      {
        title: 'Silicone Properties Chart',
        titleVi: 'Bảng tính chất silicone',
        type: 'pdf',
        href: '#',
      },
      {
        title: 'Material Selection Guide',
        titleVi: 'Hướng dẫn chọn vật liệu',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Temperature Range', labelVi: 'Phạm vi nhiệt độ', value: '-60°C ~ +230°C' },
      { label: 'Hardness Range', labelVi: 'Độ cứng', value: '20-80 Shore A' },
      { label: 'Compliance', labelVi: 'Tiêu chuẩn', value: 'FDA/RoHS' },
    ],
  },
  {
    slug: 'lubricants',
    name: 'Lubricants',
    nameVi: 'Chất Bôi Trơn',
    summary:
      'Industrial lubricants and greases for machinery maintenance, reducing friction, wear, and extending equipment lifespan.',
    summaryVi:
      'Chất bôi trơn và mỡ công nghiệp cho bảo trì máy móc, giảm ma sát, mài mòn và kéo dài tuổi thọ thiết bị.',
    heroImage: '/groups/lubricants.svg',
    tags: ['lubricant', 'grease', 'oil', 'maintenance', 'friction'],
    tagsVi: ['bôi trơn', 'mỡ', 'dầu', 'bảo trì', 'ma sát'],
    keyOutcomes: [
      'Reduced friction coefficient for smoother operation',
      'Extended machinery lifespan through wear protection',
      'High-temperature stability for demanding environments',
      'Corrosion protection for metal components',
    ],
    keyOutcomesVi: [
      'Giảm hệ số ma sát cho vận hành mượt mà hơn',
      'Kéo dài tuổi thọ máy móc thông qua bảo vệ chống mài mòn',
      'Ổn định nhiệt độ cao cho môi trường khắt khe',
      'Bảo vệ chống ăn mòn cho các bộ phận kim loại',
    ],
    useCases: [
      'Bearing lubrication',
      'Chain and gear maintenance',
      'Pneumatic systems',
      'High-speed machinery',
      'Mold release',
    ],
    useCasesVi: [
      'Bôi trơn ổ trục',
      'Bảo trì xích và bánh răng',
      'Hệ thống khí nén',
      'Máy móc tốc độ cao',
      'Tháo khuôn',
    ],
    products: [
      {
        title: 'Industrial Greases',
        titleVi: 'Mỡ công nghiệp',
        href: '/menu/product?search=grease',
      },
      {
        title: 'Lubricating Oils',
        titleVi: 'Dầu bôi trơn',
        href: '/menu/product?search=lubricant-oil',
      },
      {
        title: 'Spray Lubricants',
        titleVi: 'Bôi trơn dạng xịt',
        href: '/menu/product?search=spray-lubricant',
      },
    ],
    resources: [
      {
        title: 'Lubricant Selection Guide',
        titleVi: 'Hướng dẫn chọn chất bôi trơn',
        type: 'pdf',
        href: '#',
      },
      {
        title: 'Maintenance Schedule Template',
        titleVi: 'Mẫu lịch bảo trì',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Friction Reduction', labelVi: 'Giảm ma sát', value: 'Up to 40%' },
      { label: 'Temperature Range', labelVi: 'Phạm vi nhiệt độ', value: '-40°C ~ +300°C' },
      { label: 'Equipment Life', labelVi: 'Tuổi thọ thiết bị', value: '+50%' },
    ],
  },
  {
    slug: 'metalworking-coatings',
    name: 'Coatings – Metalworking and Cleaning',
    nameVi: 'Chất Phủ – Gia Công Kim Loại và Vệ Sinh',
    summary:
      'Specialized coatings, coolants, and cleaning solutions for metalworking processes including cutting, grinding, and surface treatment.',
    summaryVi:
      'Chất phủ, dung dịch làm mát và vệ sinh chuyên dụng cho quy trình gia công kim loại bao gồm cắt, mài và xử lý bề mặt.',
    heroImage: '/groups/metalworking-coatings.svg',
    tags: ['metalworking', 'coolant', 'cutting', 'cleaning', 'coating'],
    tagsVi: ['gia công kim loại', 'làm mát', 'cắt', 'vệ sinh', 'phủ'],
    keyOutcomes: [
      'Improved tool life with proper cooling and lubrication',
      'Better surface finish quality on machined parts',
      'Reduced machine downtime with effective cleaning',
      'Environmental compliance with modern formulations',
    ],
    keyOutcomesVi: [
      'Cải thiện tuổi thọ dụng cụ với làm mát và bôi trơn đúng cách',
      'Chất lượng bề mặt tốt hơn trên các chi tiết gia công',
      'Giảm thời gian ngừng máy với vệ sinh hiệu quả',
      'Tuân thủ môi trường với các công thức hiện đại',
    ],
    useCases: [
      'CNC machining',
      'Grinding operations',
      'Parts washing',
      'Rust prevention',
      'Die casting',
    ],
    useCasesVi: ['Gia công CNC', 'Hoạt động mài', 'Rửa chi tiết', 'Ngăn ngừa gỉ sét', 'Đúc khuôn'],
    products: [
      {
        title: 'Cutting Fluids',
        titleVi: 'Dung dịch cắt gọt',
        href: '/menu/product?search=cutting-fluid',
      },
      {
        title: 'Industrial Cleaners',
        titleVi: 'Chất tẩy rửa công nghiệp',
        href: '/menu/product?search=industrial-cleaner',
      },
      {
        title: 'Rust Preventives',
        titleVi: 'Chất chống gỉ',
        href: '/menu/product?search=rust-preventive',
      },
    ],
    resources: [
      {
        title: 'Coolant Management Guide',
        titleVi: 'Hướng dẫn quản lý dung dịch làm mát',
        type: 'pdf',
        href: '#',
      },
      {
        title: 'Cleaning Process Optimization',
        titleVi: 'Tối ưu quy trình vệ sinh',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Tool Life Extension', labelVi: 'Kéo dài tuổi thọ dụng cụ', value: '+30%' },
      { label: 'Surface Quality', labelVi: 'Chất lượng bề mặt', value: 'Ra 0.4μm' },
      { label: 'Waste Reduction', labelVi: 'Giảm chất thải', value: '-25%' },
    ],
  },
  {
    slug: 'electronic-coatings',
    name: 'Electronic Surface Coatings',
    nameVi: 'Chất Phủ Bề Mặt Điện Tử',
    summary:
      'Conformal coatings, potting compounds, and encapsulants for protecting electronic assemblies from moisture, dust, and contamination.',
    summaryVi:
      'Chất phủ bảo vệ, hợp chất đổ khuôn và chất bọc bảo vệ các cụm lắp ráp điện tử khỏi độ ẩm, bụi và ô nhiễm.',
    heroImage: '/groups/electronic-coatings.svg',
    tags: ['conformal', 'potting', 'encapsulation', 'PCB', 'protection'],
    tagsVi: ['phủ bảo vệ', 'đổ khuôn', 'bọc kín', 'PCB', 'bảo vệ'],
    keyOutcomes: [
      'Complete protection against moisture, dust, and chemicals',
      'Thermal management for heat-generating components',
      'Improved reliability in harsh operating environments',
      'Compliance with IPC and automotive standards',
    ],
    keyOutcomesVi: [
      'Bảo vệ hoàn toàn chống ẩm, bụi và hóa chất',
      'Quản lý nhiệt cho các linh kiện tỏa nhiệt',
      'Cải thiện độ tin cậy trong môi trường vận hành khắc nghiệt',
      'Tuân thủ tiêu chuẩn IPC và ô tô',
    ],
    useCases: [
      'PCB conformal coating',
      'LED potting',
      'Sensor encapsulation',
      'Power electronics',
      'Automotive ECUs',
    ],
    useCasesVi: ['Phủ bảo vệ PCB', 'Đổ khuôn LED', 'Bọc cảm biến', 'Điện tử công suất', 'ECU ô tô'],
    products: [
      {
        title: 'Conformal Coatings',
        titleVi: 'Chất phủ bảo vệ',
        href: '/menu/product?search=conformal',
      },
      {
        title: 'Potting Compounds',
        titleVi: 'Hợp chất đổ khuôn',
        href: '/menu/product?search=potting',
      },
      { title: 'Encapsulants', titleVi: 'Chất bọc kín', href: '/menu/product?search=encapsulant' },
    ],
    resources: [
      {
        title: 'Coating Thickness Guidelines',
        titleVi: 'Hướng dẫn độ dày lớp phủ',
        type: 'pdf',
        href: '#',
      },
      {
        title: 'Material Compatibility Chart',
        titleVi: 'Bảng tương thích vật liệu',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Protection Level', labelVi: 'Mức bảo vệ', value: 'IP67+' },
      { label: 'Operating Temp', labelVi: 'Nhiệt độ hoạt động', value: '-55°C ~ +200°C' },
      { label: 'Reliability Increase', labelVi: 'Tăng độ tin cậy', value: '+40%' },
    ],
  },
  {
    slug: 'sandpaper-abrasives',
    name: 'Sandpaper and Abrasives, Polishing',
    nameVi: 'Giấy Nhám và Vật Liệu Mài, Đánh Bóng',
    summary:
      'Complete range of abrasive products for surface preparation, finishing, and polishing across automotive, woodworking, and metal industries.',
    summaryVi:
      'Dòng sản phẩm mài mòn đầy đủ cho chuẩn bị bề mặt, hoàn thiện và đánh bóng trong các ngành ô tô, chế biến gỗ và kim loại.',
    heroImage: '/groups/sandpaper-abrasives.svg',
    tags: ['sandpaper', 'abrasive', 'polishing', 'finishing', 'grinding'],
    tagsVi: ['giấy nhám', 'mài mòn', 'đánh bóng', 'hoàn thiện', 'mài'],
    keyOutcomes: [
      'Consistent surface finish across production batches',
      'Extended abrasive life for cost efficiency',
      'Dust-free options for cleaner working environment',
      'Full grit range from coarse removal to fine polishing',
    ],
    keyOutcomesVi: [
      'Bề mặt hoàn thiện đồng nhất giữa các lô sản xuất',
      'Tuổi thọ vật liệu mài kéo dài để tiết kiệm chi phí',
      'Tùy chọn không bụi cho môi trường làm việc sạch hơn',
      'Đầy đủ độ nhám từ loại bỏ thô đến đánh bóng mịn',
    ],
    useCases: [
      'Automotive refinishing',
      'Wood sanding',
      'Metal polishing',
      'Paint preparation',
      'Composite finishing',
    ],
    useCasesVi: [
      'Hoàn thiện ô tô',
      'Chà nhám gỗ',
      'Đánh bóng kim loại',
      'Chuẩn bị sơn',
      'Hoàn thiện composite',
    ],
    products: [
      {
        title: 'Sandpaper Sheets',
        titleVi: 'Giấy nhám tờ',
        href: '/menu/product?search=sandpaper',
      },
      { title: 'Abrasive Discs', titleVi: 'Đĩa mài', href: '/menu/product?search=abrasive-disc' },
      {
        title: 'Polishing Compounds',
        titleVi: 'Hợp chất đánh bóng',
        href: '/menu/product?search=polishing',
      },
      { title: 'Grinding Wheels', titleVi: 'Đá mài', href: '/menu/product?search=grinding-wheel' },
    ],
    resources: [
      { title: 'Grit Selection Guide', titleVi: 'Hướng dẫn chọn độ nhám', type: 'pdf', href: '#' },
      {
        title: 'Surface Finishing Standards',
        titleVi: 'Tiêu chuẩn hoàn thiện bề mặt',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Grit Range', labelVi: 'Phạm vi độ nhám', value: 'P40 - P5000' },
      { label: 'Surface Finish', labelVi: 'Độ bóng bề mặt', value: 'Ra 0.05μm' },
      { label: 'Productivity Gain', labelVi: 'Tăng năng suất', value: '+25%' },
    ],
  },
  {
    slug: 'nukote-coatings',
    name: 'Nukote – Protective Coatings',
    nameVi: 'Nukote – Chất Phủ Bảo Vệ',
    summary:
      'Nukote polyurea and hybrid coatings for extreme protection against abrasion, corrosion, impact, and chemical exposure.',
    summaryVi:
      'Chất phủ polyurea và hybrid Nukote để bảo vệ tối đa chống mài mòn, ăn mòn, va đập và tiếp xúc hóa chất.',
    heroImage: '/groups/nukote-coatings.svg',
    tags: ['nukote', 'polyurea', 'protective', 'corrosion', 'abrasion'],
    tagsVi: ['nukote', 'polyurea', 'bảo vệ', 'ăn mòn', 'mài mòn'],
    keyOutcomes: [
      'Extreme abrasion resistance for heavy-duty applications',
      'Rapid cure time for minimal downtime',
      'Seamless waterproof membrane formation',
      'Chemical resistance to acids, bases, and solvents',
    ],
    keyOutcomesVi: [
      'Khả năng chống mài mòn cực cao cho ứng dụng công nghiệp nặng',
      'Thời gian đóng rắn nhanh để giảm thiểu thời gian ngừng',
      'Hình thành màng chống nước liền mạch',
      'Kháng hóa chất với axit, bazơ và dung môi',
    ],
    useCases: [
      'Tank linings',
      'Secondary containment',
      'Truck bed liners',
      'Waterproofing',
      'Industrial flooring',
    ],
    useCasesVi: ['Lót bể chứa', 'Bể chứa phụ', 'Lót thùng xe tải', 'Chống thấm', 'Sàn công nghiệp'],
    products: [
      {
        title: 'Nukote Polyurea',
        titleVi: 'Nukote Polyurea',
        href: '/menu/product?search=nukote-polyurea',
      },
      {
        title: 'Nukote Hybrid',
        titleVi: 'Nukote Hybrid',
        href: '/menu/product?search=nukote-hybrid',
      },
      {
        title: 'Nukote Primers',
        titleVi: 'Sơn lót Nukote',
        href: '/menu/product?search=nukote-primer',
      },
    ],
    resources: [
      {
        title: 'Nukote Product Catalog',
        titleVi: 'Catalog sản phẩm Nukote',
        type: 'pdf',
        href: '#',
      },
      { title: 'Application Guidelines', titleVi: 'Hướng dẫn ứng dụng', type: 'guide', href: '#' },
    ],
    stats: [
      { label: 'Abrasion Resistance', labelVi: 'Kháng mài mòn', value: 'ASTM D4060' },
      { label: 'Cure Time', labelVi: 'Thời gian đóng rắn', value: '< 10 seconds' },
      { label: 'Service Life', labelVi: 'Tuổi thọ sử dụng', value: '20+ years' },
    ],
  },
  {
    slug: 'industrial-adhesives',
    name: 'Industrial Adhesives',
    nameVi: 'Keo Dán Công Nghiệp',
    summary:
      'High-performance structural and assembly adhesives for bonding metals, plastics, composites, and dissimilar materials.',
    summaryVi:
      'Keo kết cấu và lắp ráp hiệu suất cao để liên kết kim loại, nhựa, composite và các vật liệu khác nhau.',
    heroImage: '/groups/industrial-adhesives.svg',
    tags: ['adhesive', 'bonding', 'structural', 'epoxy', 'assembly'],
    tagsVi: ['keo dán', 'kết dính', 'kết cấu', 'epoxy', 'lắp ráp'],
    keyOutcomes: [
      'High bond strength comparable to mechanical fasteners',
      'Stress distribution for improved joint durability',
      'Elimination of drilling and welding in many applications',
      'Fast cure options for high-speed production',
    ],
    keyOutcomesVi: [
      'Độ bền liên kết cao tương đương với ốc vít cơ khí',
      'Phân bố ứng suất để cải thiện độ bền mối nối',
      'Loại bỏ khoan và hàn trong nhiều ứng dụng',
      'Tùy chọn đóng rắn nhanh cho sản xuất tốc độ cao',
    ],
    useCases: [
      'Metal bonding',
      'Plastic assembly',
      'Composite joining',
      'Glass bonding',
      'Electronic assembly',
    ],
    useCasesVi: ['Dán kim loại', 'Lắp ráp nhựa', 'Nối composite', 'Dán kính', 'Lắp ráp điện tử'],
    products: [
      { title: 'Epoxy Adhesives', titleVi: 'Keo epoxy', href: '/menu/product?search=epoxy' },
      {
        title: 'Acrylic Adhesives',
        titleVi: 'Keo acrylic',
        href: '/menu/product?search=acrylic-adhesive',
      },
      {
        title: 'Polyurethane Adhesives',
        titleVi: 'Keo polyurethane',
        href: '/menu/product?search=pu-adhesive',
      },
      {
        title: 'Cyanoacrylate',
        titleVi: 'Keo siêu dính',
        href: '/menu/product?search=cyanoacrylate',
      },
    ],
    resources: [
      { title: 'Adhesive Selection Chart', titleVi: 'Bảng chọn keo', type: 'pdf', href: '#' },
      {
        title: 'Surface Preparation Guide',
        titleVi: 'Hướng dẫn xử lý bề mặt',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Shear Strength', labelVi: 'Độ bền cắt', value: 'Up to 45 MPa' },
      { label: 'Cure Options', labelVi: 'Tùy chọn đóng rắn', value: 'RT/Heat/UV' },
      { label: 'Temperature Range', labelVi: 'Phạm vi nhiệt độ', value: '-55°C ~ +200°C' },
    ],
  },
  {
    slug: 'welding-equipment',
    name: 'Welding Machines and Accessories',
    nameVi: 'Máy Hàn và Phụ Kiện',
    summary:
      'Professional welding equipment including MIG, TIG, and spot welders, plus consumables and safety accessories.',
    summaryVi:
      'Thiết bị hàn chuyên nghiệp bao gồm máy hàn MIG, TIG và hàn điểm, cùng vật tư tiêu hao và phụ kiện an toàn.',
    heroImage: '/groups/welding-equipment.svg',
    tags: ['welding', 'MIG', 'TIG', 'spot', 'fabrication'],
    tagsVi: ['hàn', 'MIG', 'TIG', 'hàn điểm', 'chế tạo'],
    keyOutcomes: [
      'Consistent weld quality with advanced controls',
      'Reduced spatter and post-weld cleanup',
      'Energy efficiency for lower operating costs',
      'Operator safety with modern protection features',
    ],
    keyOutcomesVi: [
      'Chất lượng mối hàn đồng nhất với điều khiển tiên tiến',
      'Giảm bắn tóe và làm sạch sau hàn',
      'Tiết kiệm năng lượng để giảm chi phí vận hành',
      'An toàn cho người vận hành với các tính năng bảo vệ hiện đại',
    ],
    useCases: [
      'Steel fabrication',
      'Automotive repair',
      'Sheet metal work',
      'Pipe welding',
      'Maintenance repair',
    ],
    useCasesVi: ['Chế tạo thép', 'Sửa chữa ô tô', 'Gia công tôn', 'Hàn ống', 'Sửa chữa bảo trì'],
    products: [
      { title: 'MIG Welders', titleVi: 'Máy hàn MIG', href: '/menu/product?search=mig-welder' },
      { title: 'TIG Welders', titleVi: 'Máy hàn TIG', href: '/menu/product?search=tig-welder' },
      { title: 'Welding Wire', titleVi: 'Dây hàn', href: '/menu/product?search=welding-wire' },
      {
        title: 'Safety Equipment',
        titleVi: 'Thiết bị an toàn',
        href: '/menu/product?search=welding-safety',
      },
    ],
    resources: [
      {
        title: 'Welder Selection Guide',
        titleVi: 'Hướng dẫn chọn máy hàn',
        type: 'pdf',
        href: '#',
      },
      { title: 'Welding Parameters Chart', titleVi: 'Bảng thông số hàn', type: 'guide', href: '#' },
    ],
    stats: [
      { label: 'Duty Cycle', labelVi: 'Chu kỳ làm việc', value: 'Up to 60%' },
      { label: 'Power Range', labelVi: 'Công suất', value: '100A - 500A' },
      { label: 'Process Types', labelVi: 'Loại quy trình', value: 'MIG/TIG/Stick' },
    ],
  },
  {
    slug: 'printers',
    name: 'Printers',
    nameVi: 'Máy In',
    summary:
      'Industrial printing solutions including inkjet coders, label printers, and marking systems for product identification.',
    summaryVi:
      'Giải pháp in công nghiệp bao gồm máy in phun mã, máy in nhãn và hệ thống đánh dấu để nhận dạng sản phẩm.',
    heroImage: '/groups/printers.svg',
    tags: ['printer', 'inkjet', 'label', 'coding', 'marking'],
    tagsVi: ['máy in', 'phun mực', 'nhãn', 'mã hóa', 'đánh dấu'],
    keyOutcomes: [
      'High-speed printing for production line integration',
      'Clear, permanent codes for traceability requirements',
      'Low maintenance with self-cleaning systems',
      'Versatile substrate compatibility',
    ],
    keyOutcomesVi: [
      'In tốc độ cao để tích hợp dây chuyền sản xuất',
      'Mã rõ ràng, bền cho yêu cầu truy xuất nguồn gốc',
      'Bảo trì thấp với hệ thống tự làm sạch',
      'Tương thích đa dạng bề mặt in',
    ],
    useCases: [
      'Date coding',
      'Barcode printing',
      'Product labeling',
      'Case marking',
      'Serialization',
    ],
    useCasesVi: [
      'In ngày sản xuất',
      'In mã vạch',
      'In nhãn sản phẩm',
      'Đánh dấu thùng',
      'Số hóa serial',
    ],
    products: [
      {
        title: 'Inkjet Printers',
        titleVi: 'Máy in phun',
        href: '/menu/product?search=inkjet-printer',
      },
      {
        title: 'Label Printers',
        titleVi: 'Máy in nhãn',
        href: '/menu/product?search=label-printer',
      },
      {
        title: 'Thermal Transfer',
        titleVi: 'In nhiệt',
        href: '/menu/product?search=thermal-printer',
      },
      {
        title: 'Ink & Supplies',
        titleVi: 'Mực và vật tư',
        href: '/menu/product?search=printer-supplies',
      },
    ],
    resources: [
      {
        title: 'Printer Selection Guide',
        titleVi: 'Hướng dẫn chọn máy in',
        type: 'pdf',
        href: '#',
      },
      {
        title: 'Ink Compatibility Chart',
        titleVi: 'Bảng tương thích mực',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Print Speed', labelVi: 'Tốc độ in', value: 'Up to 300m/min' },
      { label: 'Resolution', labelVi: 'Độ phân giải', value: '600 dpi' },
      { label: 'Uptime', labelVi: 'Thời gian hoạt động', value: '99.5%' },
    ],
  },
  {
    slug: 'automatic-dosing',
    name: 'Automatic Robotic Dosing Equipment',
    nameVi: 'Thiết Bị Định Lượng Tự Động Robot',
    summary:
      'Precision dispensing robots and automated dosing systems for adhesives, sealants, and other fluid materials.',
    summaryVi:
      'Robot phân phối chính xác và hệ thống định lượng tự động cho keo dán, chất bịt kín và các vật liệu lỏng khác.',
    heroImage: '/groups/automatic-dosing.svg',
    tags: ['robot', 'dispensing', 'automation', 'dosing', 'precision'],
    tagsVi: ['robot', 'phân phối', 'tự động hóa', 'định lượng', 'chính xác'],
    keyOutcomes: [
      'Consistent shot size and bead profile every cycle',
      'Reduced material waste with precise metering',
      'Higher throughput with automated operation',
      'Process traceability with data logging',
    ],
    keyOutcomesVi: [
      'Kích thước shot và biên dạng đường gợn nhất quán mỗi chu kỳ',
      'Giảm lãng phí vật liệu với định lượng chính xác',
      'Thông lượng cao hơn với vận hành tự động',
      'Truy xuất quy trình với ghi dữ liệu',
    ],
    useCases: [
      'Adhesive dispensing',
      'Sealant application',
      'Potting operations',
      'Conformal coating',
      'Thermal paste',
    ],
    useCasesVi: [
      'Phân phối keo',
      'Ứng dụng chất bịt kín',
      'Hoạt động đổ khuôn',
      'Phủ bảo vệ',
      'Keo tản nhiệt',
    ],
    products: [
      {
        title: 'Dispensing Robots',
        titleVi: 'Robot phân phối',
        href: '/menu/product?search=dispensing-robot',
      },
      {
        title: 'Metering Systems',
        titleVi: 'Hệ thống định lượng',
        href: '/menu/product?search=metering',
      },
      {
        title: 'Dispensing Valves',
        titleVi: 'Van phân phối',
        href: '/menu/product?search=dispensing-valve',
      },
      {
        title: 'Controllers',
        titleVi: 'Bộ điều khiển',
        href: '/menu/product?search=dispenser-controller',
      },
    ],
    resources: [
      {
        title: 'System Selection Guide',
        titleVi: 'Hướng dẫn chọn hệ thống',
        type: 'pdf',
        href: '#',
      },
      { title: 'Integration Manual', titleVi: 'Sổ tay tích hợp', type: 'guide', href: '#' },
    ],
    stats: [
      { label: 'Accuracy', labelVi: 'Độ chính xác', value: '±1%' },
      { label: 'Repeatability', labelVi: 'Độ lặp lại', value: '±0.5%' },
      { label: 'Cycle Time', labelVi: 'Thời gian chu kỳ', value: '< 2 sec' },
    ],
  },
  {
    slug: 'fluid-transmission',
    name: 'Fluid Transmission and Shredding',
    nameVi: 'Truyền Động Chất Lỏng và Nghiền',
    summary:
      'Hydraulic and pneumatic components, hoses, fittings, and industrial shredding equipment for manufacturing operations.',
    summaryVi:
      'Linh kiện thủy lực và khí nén, ống, phụ kiện và thiết bị nghiền công nghiệp cho hoạt động sản xuất.',
    heroImage: '/groups/fluid-transmission.svg',
    tags: ['hydraulic', 'pneumatic', 'hose', 'fitting', 'shredder'],
    tagsVi: ['thủy lực', 'khí nén', 'ống', 'phụ kiện', 'máy nghiền'],
    keyOutcomes: [
      'Reliable fluid power transmission for heavy machinery',
      'Leak-free connections with quality fittings',
      'High-pressure capability for demanding applications',
      'Efficient material reduction with industrial shredders',
    ],
    keyOutcomesVi: [
      'Truyền động năng lượng chất lỏng đáng tin cậy cho máy móc hạng nặng',
      'Kết nối không rò rỉ với phụ kiện chất lượng',
      'Khả năng áp suất cao cho các ứng dụng khắt khe',
      'Giảm kích thước vật liệu hiệu quả với máy nghiền công nghiệp',
    ],
    useCases: [
      'Hydraulic systems',
      'Pneumatic conveyors',
      'Material handling',
      'Waste processing',
      'Recycling operations',
    ],
    useCasesVi: [
      'Hệ thống thủy lực',
      'Băng tải khí nén',
      'Xử lý vật liệu',
      'Xử lý chất thải',
      'Hoạt động tái chế',
    ],
    products: [
      {
        title: 'Hydraulic Hoses',
        titleVi: 'Ống thủy lực',
        href: '/menu/product?search=hydraulic-hose',
      },
      {
        title: 'Pneumatic Fittings',
        titleVi: 'Phụ kiện khí nén',
        href: '/menu/product?search=pneumatic-fitting',
      },
      {
        title: 'Industrial Shredders',
        titleVi: 'Máy nghiền công nghiệp',
        href: '/menu/product?search=shredder',
      },
    ],
    resources: [
      { title: 'Hose Selection Guide', titleVi: 'Hướng dẫn chọn ống', type: 'pdf', href: '#' },
      { title: 'Fitting Specifications', titleVi: 'Thông số phụ kiện', type: 'guide', href: '#' },
    ],
    stats: [
      { label: 'Pressure Rating', labelVi: 'Áp suất định mức', value: 'Up to 400 bar' },
      { label: 'Temperature Range', labelVi: 'Phạm vi nhiệt độ', value: '-40°C ~ +120°C' },
      { label: 'Shredder Capacity', labelVi: 'Công suất nghiền', value: 'Up to 5 ton/hr' },
    ],
  },
  {
    slug: 'heat-conducting',
    name: 'Heat-Conducting Material',
    nameVi: 'Vật Liệu Dẫn Nhiệt',
    summary:
      'Thermal interface materials including pads, pastes, and gap fillers for effective heat dissipation in electronics and power systems.',
    summaryVi:
      'Vật liệu giao diện nhiệt bao gồm miếng đệm, keo tản nhiệt và chất lấp khe để tản nhiệt hiệu quả trong điện tử và hệ thống nguồn.',
    heroImage: '/groups/heat-conducting.svg',
    tags: ['thermal', 'heat', 'cooling', 'TIM', 'electronics'],
    tagsVi: ['nhiệt', 'tản nhiệt', 'làm mát', 'TIM', 'điện tử'],
    keyOutcomes: [
      'Efficient heat transfer from components to heatsinks',
      'Low thermal resistance for optimal cooling',
      'Conformable materials for uneven surfaces',
      'Long-term stability without pump-out or dry-out',
    ],
    keyOutcomesVi: [
      'Truyền nhiệt hiệu quả từ linh kiện đến tản nhiệt',
      'Điện trở nhiệt thấp để làm mát tối ưu',
      'Vật liệu có thể biến dạng cho bề mặt không đều',
      'Ổn định lâu dài không bị bơm ra hoặc khô',
    ],
    useCases: [
      'CPU/GPU cooling',
      'LED thermal management',
      'Power electronics',
      'Battery cooling',
      'EV inverters',
    ],
    useCasesVi: [
      'Làm mát CPU/GPU',
      'Quản lý nhiệt LED',
      'Điện tử công suất',
      'Làm mát pin',
      'Biến tần EV',
    ],
    products: [
      {
        title: 'Thermal Pads',
        titleVi: 'Miếng đệm tản nhiệt',
        href: '/menu/product?search=thermal-pad',
      },
      {
        title: 'Thermal Paste',
        titleVi: 'Keo tản nhiệt',
        href: '/menu/product?search=thermal-paste',
      },
      { title: 'Gap Fillers', titleVi: 'Chất lấp khe', href: '/menu/product?search=gap-filler' },
      {
        title: 'Phase Change Materials',
        titleVi: 'Vật liệu chuyển pha',
        href: '/menu/product?search=phase-change',
      },
    ],
    resources: [
      { title: 'TIM Selection Guide', titleVi: 'Hướng dẫn chọn TIM', type: 'pdf', href: '#' },
      {
        title: 'Thermal Conductivity Chart',
        titleVi: 'Bảng độ dẫn nhiệt',
        type: 'guide',
        href: '#',
      },
    ],
    stats: [
      { label: 'Thermal Conductivity', labelVi: 'Độ dẫn nhiệt', value: 'Up to 14 W/mK' },
      { label: 'Operating Temp', labelVi: 'Nhiệt độ hoạt động', value: '-55°C ~ +200°C' },
      { label: 'Thickness Range', labelVi: 'Phạm vi độ dày', value: '0.25mm - 10mm' },
    ],
  },
];
