import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Products from old website https://www.ce.com.vn/vi/products/
// All products set to 500,000 VND
const PRODUCTS_FROM_OLD_SITE = [
  // Industrial Tapes
  {
    nameVi: 'Kim bơm hóa chất chính xác TE 14 Gauge Olive',
    nameEn: 'Precision Chemical Dispensing Needle TE 14 Gauge Olive',
    slug: 'kim-bom-hoa-chat-chinh-xac-te-14-gauge-olive',
    shortDescVi: 'Kim bơm hóa chất chính xác cho ứng dụng công nghiệp',
    shortDescEn: 'Precision chemical dispensing needle for industrial applications',
    groupSlug: 'automatic-dosing',
    brandName: 'Techcon',
  },
  {
    nameVi: 'Tesa 4965 băng keo hai mặt filmic trong suốt',
    nameEn: 'Tesa 4965 Double-Sided Filmic Transparent Tape',
    slug: 'tesa-4965-bang-keo-hai-mat-filmic-trong-suot',
    shortDescVi: 'Băng keo hai mặt filmic trong suốt, độ bền cao',
    shortDescEn: 'Transparent double-sided filmic tape with high durability',
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
  },
  {
    nameVi: 'Băng keo giấy dán thùng thân thiện với môi trường tesa 4713',
    nameEn: 'Tesa 4713 Environmentally Friendly Paper Carton Sealing Tape',
    slug: 'bang-keo-giay-dan-thung-than-thien-moi-truong-tesa-4713',
    shortDescVi: 'Băng keo giấy dán thùng thân thiện với môi trường',
    shortDescEn: 'Environmentally friendly paper carton sealing tape',
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
  },
  {
    nameVi: 'Tesa 4917 – Băng keo hai mặt với lớp keo khác nhau',
    nameEn: 'Tesa 4917 – Double-Sided Tape with Different Adhesive Layers',
    slug: 'tesa-4917-bang-keo-hai-mat-lop-keo-khac-nhau',
    shortDescVi: 'Băng keo hai mặt với lớp keo khác nhau cho ứng dụng đặc biệt',
    shortDescEn: 'Double-sided tape with different adhesive layers for special applications',
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
  },
  {
    nameVi: 'Tesa 4651 – Băng keo vải cao cấp',
    nameEn: 'Tesa 4651 – Premium Cloth Tape',
    slug: 'tesa-4651-bang-keo-vai-cao-cap',
    shortDescVi: 'Băng keo vải cao cấp cho bó và bảo vệ',
    shortDescEn: 'Premium cloth tape for bundling and protection',
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
  },

  // Industrial Adhesives - Loctite
  {
    nameVi: 'Loctite 660 – Keo chống xoay – 50ml',
    nameEn: 'Loctite 660 – Retaining Compound – 50ml',
    slug: 'loctite-660-keo-chong-xoay-50ml',
    shortDescVi: 'Keo chống xoay chuyên dụng, độ bền cao',
    shortDescEn: 'Professional retaining compound with high strength',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Loctite 221 – 50ml',
    nameEn: 'Loctite 221 – 50ml',
    slug: 'loctite-221-50ml',
    shortDescVi: 'Keo dán công nghiệp đa năng',
    shortDescEn: 'Multi-purpose industrial adhesive',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Loctite 648 – Keo chống xoay – 250ml',
    nameEn: 'Loctite 648 – Retaining Compound – 250ml',
    slug: 'loctite-648-keo-chong-xoay-250ml',
    shortDescVi: 'Keo chống xoay công nghiệp, dung tích lớn',
    shortDescEn: 'Industrial retaining compound, large volume',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Keo Dán Đa Năng Araldite Standard 90 phút',
    nameEn: 'Araldite Standard Multi-Purpose Adhesive 90 Minutes',
    slug: 'keo-dan-da-nang-araldite-standard-90-phut',
    shortDescVi: 'Keo dán đa năng, thời gian đông cứng 90 phút',
    shortDescEn: 'Multi-purpose adhesive with 90-minute curing time',
    groupSlug: 'industrial-adhesives',
    brandName: 'Huntsman',
  },
  {
    nameVi: 'Loctite 401 – Keo dán tức thì',
    nameEn: 'Loctite 401 – Instant Adhesive',
    slug: 'loctite-401-keo-dan-tuc-thi',
    shortDescVi: 'Keo dán tức thì, đông cứng nhanh',
    shortDescEn: 'Instant adhesive with fast curing',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Loctite 243 – Keo chống rung – 50ml',
    nameEn: 'Loctite 243 – Threadlocker – 50ml',
    slug: 'loctite-243-keo-chong-rung-50ml',
    shortDescVi: 'Keo chống rung cho ốc vít',
    shortDescEn: 'Threadlocker for screws and bolts',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Loctite 271 – Keo chống xoay mạnh – 50ml',
    nameEn: 'Loctite 271 – High Strength Retaining Compound – 50ml',
    slug: 'loctite-271-keo-chong-xoay-manh-50ml',
    shortDescVi: 'Keo chống xoay độ bền cao',
    shortDescEn: 'High strength retaining compound',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Loctite 638 – Keo chống xoay – 50ml',
    nameEn: 'Loctite 638 – Retaining Compound – 50ml',
    slug: 'loctite-638-keo-chong-xoay-50ml',
    shortDescVi: 'Keo chống xoay công nghiệp',
    shortDescEn: 'Industrial retaining compound',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },

  // Silicone Rubber
  {
    nameVi: 'Silicon trám chống thấm nước Dow Corning® 791',
    nameEn: 'Dow Corning® 791 Waterproof Sealing Silicone',
    slug: 'silicon-tram-chong-tham-nuoc-dow-corning-791',
    shortDescVi: 'Silicon trám chống thấm nước cao cấp',
    shortDescEn: 'Premium waterproof sealing silicone',
    groupSlug: 'silicone-rubber',
    brandName: 'Dow',
  },
  {
    nameVi: 'Dow Corning® 732 – Silicon bôi trơn đa năng',
    nameEn: 'Dow Corning® 732 Multi-Purpose Silicone Lubricant',
    slug: 'dow-corning-732-silicon-boi-tron-da-nang',
    shortDescVi: 'Silicon bôi trơn đa năng, chống ăn mòn',
    shortDescEn: 'Multi-purpose silicone lubricant, corrosion resistant',
    groupSlug: 'silicone-rubber',
    brandName: 'Dow',
  },
  {
    nameVi: 'Dow Corning® 3145 – Silicon bôi trơn màng mỏng',
    nameEn: 'Dow Corning® 3145 Thin Film Silicone Lubricant',
    slug: 'dow-corning-3145-silicon-boi-tron-mang-mong',
    shortDescVi: 'Silicon bôi trơn màng mỏng cho thiết bị điện tử',
    shortDescEn: 'Thin film silicone lubricant for electronic equipment',
    groupSlug: 'silicone-rubber',
    brandName: 'Dow',
  },

  // Lubricants
  {
    nameVi: 'Molykote G-4702 – Mỡ bôi trơn chịu nhiệt cao',
    nameEn: 'Molykote G-4702 High Temperature Grease',
    slug: 'molykote-g-4702-mo-boi-tron-chiu-nhiet-cao',
    shortDescVi: 'Mỡ bôi trơn chịu nhiệt cao, độ bền vượt trội',
    shortDescEn: 'High temperature grease with superior durability',
    groupSlug: 'lubricants',
    brandName: 'Molykote',
  },
  {
    nameVi: 'Molykote 111 – Mỡ bôi trơn đa năng',
    nameEn: 'Molykote 111 Multi-Purpose Grease',
    slug: 'molykote-111-mo-boi-tron-da-nang',
    shortDescVi: 'Mỡ bôi trơn đa năng cho nhiều ứng dụng',
    shortDescEn: 'Multi-purpose grease for various applications',
    groupSlug: 'lubricants',
    brandName: 'Molykote',
  },
  {
    nameVi: 'CRC 2-26 – Chất bôi trơn chống rỉ',
    nameEn: 'CRC 2-26 Rust Inhibitor Lubricant',
    slug: 'crc-2-26-chat-boi-tron-chong-ri',
    shortDescVi: 'Chất bôi trơn chống rỉ, bảo vệ kim loại',
    shortDescEn: 'Rust inhibitor lubricant for metal protection',
    groupSlug: 'lubricants',
    brandName: 'CRC',
  },
  {
    nameVi: 'Lanotec L5 – Chất bôi trơn phân hạng thực phẩm',
    nameEn: 'Lanotec L5 Food Grade Lubricant',
    slug: 'lanotec-l5-chat-boi-tron-phan-hang-thuc-pham',
    shortDescVi: 'Chất bôi trơn phân hạng thực phẩm, an toàn',
    shortDescEn: 'Food grade lubricant, safe for food contact',
    groupSlug: 'lubricants',
    brandName: 'Lanotec',
  },

  // Metalworking Coatings
  {
    nameVi: 'Bonderite C-IC 33 – Chất phủ chống rỉ',
    nameEn: 'Bonderite C-IC 33 Rust Inhibitor Coating',
    slug: 'bonderite-c-ic-33-chat-phu-chong-ri',
    shortDescVi: 'Chất phủ chống rỉ cho kim loại',
    shortDescEn: 'Rust inhibitor coating for metals',
    groupSlug: 'metalworking-coatings',
    brandName: 'Bonderite',
  },
  {
    nameVi: 'Stoner M-122 – Chất tẩy rửa kim loại',
    nameEn: 'Stoner M-122 Metal Cleaner',
    slug: 'stoner-m-122-chat-tay-rua-kim-loai',
    shortDescVi: 'Chất tẩy rửa kim loại hiệu quả',
    shortDescEn: 'Effective metal cleaning solution',
    groupSlug: 'metalworking-coatings',
    brandName: 'Stoner',
  },
  {
    nameVi: 'Rocol RTD – Chất bôi trơn cắt gọt',
    nameEn: 'Rocol RTD Cutting Fluid',
    slug: 'rocol-rtd-chat-boi-tron-cat-got',
    shortDescVi: 'Chất bôi trơn cắt gọt kim loại',
    shortDescEn: 'Metal cutting fluid',
    groupSlug: 'metalworking-coatings',
    brandName: 'Rocol',
  },

  // Electronic Coatings
  {
    nameVi: 'actnano Advanced nanoGUARD – Lớp phủ bảo vệ PCB',
    nameEn: 'actnano Advanced nanoGUARD PCB Protection Coating',
    slug: 'actnano-advanced-nanoguard-lop-phu-bao-ve-pcb',
    shortDescVi: 'Lớp phủ bảo vệ PCB chống nước IPx8',
    shortDescEn: 'PCB protection coating with IPx8 water resistance',
    groupSlug: 'electronic-coatings',
    brandName: 'actnano',
  },
  {
    nameVi: 'Dow Corning® 1-2577 – Lớp phủ bảo vệ điện tử',
    nameEn: 'Dow Corning® 1-2577 Electronic Protection Coating',
    slug: 'dow-corning-1-2577-lop-phu-bao-ve-dien-tu',
    shortDescVi: 'Lớp phủ bảo vệ bo mạch và linh kiện điện tử',
    shortDescEn: 'Protection coating for PCBs and electronic components',
    groupSlug: 'electronic-coatings',
    brandName: 'Dow',
  },

  // Sandpaper & Abrasives
  {
    nameVi: 'Mirka Abranet – Giấy nhám mạng lưới',
    nameEn: 'Mirka Abranet Mesh Sandpaper',
    slug: 'mirka-abranet-giay-nham-mang-luoi',
    shortDescVi: 'Giấy nhám mạng lưới, không bị tắc',
    shortDescEn: 'Mesh sandpaper, non-clogging',
    groupSlug: 'sandpaper-abrasives',
    brandName: 'Mirka',
  },
  {
    nameVi: 'Mirka Gold – Giấy nhám cao cấp',
    nameEn: 'Mirka Gold Premium Sandpaper',
    slug: 'mirka-gold-giay-nham-cao-cap',
    shortDescVi: 'Giấy nhám cao cấp cho đánh bóng',
    shortDescEn: 'Premium sandpaper for polishing',
    groupSlug: 'sandpaper-abrasives',
    brandName: 'Mirka',
  },

  // Welding Equipment
  {
    nameVi: 'OK International PS-900 – Máy hàn chì',
    nameEn: 'OK International PS-900 Soldering Station',
    slug: 'ok-international-ps-900-may-han-chi',
    shortDescVi: 'Máy hàn chì công nghiệp chuyên nghiệp',
    shortDescEn: 'Professional industrial soldering station',
    groupSlug: 'welding-equipment',
    brandName: 'OK International',
  },
  {
    nameVi: 'Pillarhouse Epsilon – Máy hàn tự động',
    nameEn: 'Pillarhouse Epsilon Automatic Soldering Machine',
    slug: 'pillarhouse-epsilon-may-han-tu-dong',
    shortDescVi: 'Máy hàn tự động cho sản xuất hàng loạt',
    shortDescEn: 'Automatic soldering machine for mass production',
    groupSlug: 'welding-equipment',
    brandName: 'Pillarhouse',
  },
  {
    nameVi: 'Techcon TS250 – Máy định lượng keo',
    nameEn: 'Techcon TS250 Adhesive Dispensing System',
    slug: 'techcon-ts250-may-dinh-luong-keo',
    shortDescVi: 'Máy định lượng keo chính xác',
    shortDescEn: 'Precision adhesive dispensing system',
    groupSlug: 'welding-equipment',
    brandName: 'Techcon',
  },

  // Automatic Dosing
  {
    nameVi: 'Graco XTR – Hệ thống phun phủ tự động',
    nameEn: 'Graco XTR Automatic Coating System',
    slug: 'graco-xtr-he-thong-phun-phu-tu-dong',
    shortDescVi: 'Hệ thống phun phủ tự động công nghiệp',
    shortDescEn: 'Industrial automatic coating system',
    groupSlug: 'automatic-dosing',
    brandName: 'Graco',
  },
  {
    nameVi: 'Graco ProMix – Máy trộn keo tự động',
    nameEn: 'Graco ProMix Automatic Adhesive Mixer',
    slug: 'graco-promix-may-tron-keo-tu-dong',
    shortDescVi: 'Máy trộn keo tự động hai thành phần',
    shortDescEn: 'Automatic two-component adhesive mixer',
    groupSlug: 'automatic-dosing',
    brandName: 'Graco',
  },
  {
    nameVi: 'Hermes HRS – Máy định lượng chính xác',
    nameEn: 'Hermes HRS Precision Dosing System',
    slug: 'hermes-hrs-may-dinh-luong-chinh-xac',
    shortDescVi: 'Máy định lượng chính xác cho keo và chất lỏng',
    shortDescEn: 'Precision dosing system for adhesives and liquids',
    groupSlug: 'automatic-dosing',
    brandName: 'Hermes',
  },

  // Fluid Transmission
  {
    nameVi: 'Graco Husky – Bơm áp lực cao',
    nameEn: 'Graco Husky High Pressure Pump',
    slug: 'graco-husky-bom-ap-luc-cao',
    shortDescVi: 'Bơm áp lực cao cho chất lỏng công nghiệp',
    shortDescEn: 'High pressure pump for industrial fluids',
    groupSlug: 'fluid-transmission',
    brandName: 'Graco',
  },
  {
    nameVi: 'Graco E-Flo – Bơm điện tự động',
    nameEn: 'Graco E-Flo Electric Automatic Pump',
    slug: 'graco-e-flo-bom-dien-tu-dong',
    shortDescVi: 'Bơm điện tự động cho ứng dụng công nghiệp',
    shortDescEn: 'Electric automatic pump for industrial applications',
    groupSlug: 'fluid-transmission',
    brandName: 'Graco',
  },

  // Heat Conducting
  {
    nameVi: 'Bergquist Gap Pad – Vật liệu dẫn nhiệt',
    nameEn: 'Bergquist Gap Pad Thermal Interface Material',
    slug: 'bergquist-gap-pad-vat-lieu-dan-nhiet',
    shortDescVi: 'Vật liệu dẫn nhiệt cho thiết bị điện tử',
    shortDescEn: 'Thermal interface material for electronic devices',
    groupSlug: 'heat-conducting',
    brandName: 'Bergquist',
  },
  {
    nameVi: 'Bergquist Sil-Pad – Tấm dẫn nhiệt silicon',
    nameEn: 'Bergquist Sil-Pad Silicon Thermal Pad',
    slug: 'bergquist-sil-pad-tam-dan-nhiet-silicon',
    shortDescVi: 'Tấm dẫn nhiệt silicon cao cấp',
    shortDescEn: 'Premium silicon thermal pad',
    groupSlug: 'heat-conducting',
    brandName: 'Bergquist',
  },

  // Printers
  {
    nameVi: 'Mark Andy 2200 – Máy in flexo',
    nameEn: 'Mark Andy 2200 Flexographic Printer',
    slug: 'mark-andy-2200-may-in-flexo',
    shortDescVi: 'Máy in flexo công nghiệp',
    shortDescEn: 'Industrial flexographic printer',
    groupSlug: 'printers',
    brandName: 'Mark Andy',
  },
  {
    nameVi: 'Valco Melton – Máy dán nhãn tự động',
    nameEn: 'Valco Melton Automatic Labeling Machine',
    slug: 'valco-melton-may-dan-nhan-tu-dong',
    shortDescVi: 'Máy dán nhãn tự động cho bao bì',
    shortDescEn: 'Automatic labeling machine for packaging',
    groupSlug: 'printers',
    brandName: 'Valco Melton',
  },

  // Nukote Coatings
  {
    nameVi: 'Nukote Industrial Coating – Lớp phủ bảo vệ công nghiệp',
    nameEn: 'Nukote Industrial Protection Coating',
    slug: 'nukote-industrial-coating-lop-phu-bao-ve',
    shortDescVi: 'Lớp phủ bảo vệ công nghiệp chống ăn mòn',
    shortDescEn: 'Industrial protection coating, corrosion resistant',
    groupSlug: 'nukote-coatings',
    brandName: 'Nukote Industrial',
  },
  {
    nameVi: 'Nukote Food Grade Coating – Lớp phủ phân hạng thực phẩm',
    nameEn: 'Nukote Food Grade Coating',
    slug: 'nukote-food-grade-coating',
    shortDescVi: 'Lớp phủ phân hạng thực phẩm, an toàn',
    shortDescEn: 'Food grade coating, safe for food contact',
    groupSlug: 'nukote-coatings',
    brandName: 'Nukote Industrial',
  },

  // Additional products to reach 50
  {
    nameVi: 'Avery Dennison Fasson – Băng keo dán nhãn',
    nameEn: 'Avery Dennison Fasson Labeling Tape',
    slug: 'avery-dennison-fasson-bang-keo-dan-nhan',
    shortDescVi: 'Băng keo dán nhãn chuyên nghiệp',
    shortDescEn: 'Professional labeling tape',
    groupSlug: 'industrial-tapes',
    brandName: 'Avery Dennison',
  },
  {
    nameVi: 'Tesa 51036 – Băng keo dán bề mặt nhám',
    nameEn: 'Tesa 51036 Rough Surface Mounting Tape',
    slug: 'tesa-51036-bang-keo-dan-be-mat-nham',
    shortDescVi: 'Băng keo dán bề mặt nhám, độ bền cao',
    shortDescEn: 'Rough surface mounting tape with high durability',
    groupSlug: 'industrial-tapes',
    brandName: 'Tesa',
  },
  {
    nameVi: 'Loctite 242 – Keo chống rung trung bình',
    nameEn: 'Loctite 242 Medium Strength Threadlocker',
    slug: 'loctite-242-keo-chong-rung-trung-binh',
    shortDescVi: 'Keo chống rung độ bền trung bình',
    shortDescEn: 'Medium strength threadlocker',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Loctite 510 – Keo bịt kín mặt bích',
    nameEn: 'Loctite 510 Flange Sealant',
    slug: 'loctite-510-keo-bit-kin-mat-bich',
    shortDescVi: 'Keo bịt kín mặt bích chống rò rỉ',
    shortDescEn: 'Flange sealant for leak prevention',
    groupSlug: 'industrial-adhesives',
    brandName: 'Loctite',
  },
  {
    nameVi: 'Dow Corning® 340 – Silicon bôi trơn chống rỉ',
    nameEn: 'Dow Corning® 340 Anti-Corrosion Silicone Lubricant',
    slug: 'dow-corning-340-silicon-boi-tron-chong-ri',
    shortDescVi: 'Silicon bôi trơn chống rỉ cho kim loại',
    shortDescEn: 'Anti-corrosion silicone lubricant for metals',
    groupSlug: 'silicone-rubber',
    brandName: 'Dow',
  },
  {
    nameVi: 'Molykote D-321R – Mỡ bôi trơn chống rỉ',
    nameEn: 'Molykote D-321R Anti-Rust Grease',
    slug: 'molykote-d-321r-mo-boi-tron-chong-ri',
    shortDescVi: 'Mỡ bôi trơn chống rỉ, bảo vệ lâu dài',
    shortDescEn: 'Anti-rust grease with long-term protection',
    groupSlug: 'lubricants',
    brandName: 'Molykote',
  },
  {
    nameVi: 'CRC 5-56 – Chất bôi trơn đa năng',
    nameEn: 'CRC 5-56 Multi-Purpose Lubricant',
    slug: 'crc-5-56-chat-boi-tron-da-nang',
    shortDescVi: 'Chất bôi trơn đa năng, chống rỉ',
    shortDescEn: 'Multi-purpose lubricant with rust protection',
    groupSlug: 'lubricants',
    brandName: 'CRC',
  },
  {
    nameVi: 'Stoner Invisible Glass – Chất tẩy rửa kính',
    nameEn: 'Stoner Invisible Glass Cleaner',
    slug: 'stoner-invisible-glass-chat-tay-rua-kinh',
    shortDescVi: 'Chất tẩy rửa kính chuyên nghiệp',
    shortDescEn: 'Professional glass cleaner',
    groupSlug: 'metalworking-coatings',
    brandName: 'Stoner',
  },
  {
    nameVi: 'Rocol AS30 – Chất bôi trơn cắt gọt tổng hợp',
    nameEn: 'Rocol AS30 Synthetic Cutting Fluid',
    slug: 'rocol-as30-chat-boi-tron-cat-got-tong-hop',
    shortDescVi: 'Chất bôi trơn cắt gọt tổng hợp, hiệu suất cao',
    shortDescEn: 'Synthetic cutting fluid with high performance',
    groupSlug: 'metalworking-coatings',
    brandName: 'Rocol',
  },
  {
    nameVi: 'Bergquist Hi-Flow – Vật liệu dẫn nhiệt dạng lỏng',
    nameEn: 'Bergquist Hi-Flow Liquid Thermal Interface',
    slug: 'bergquist-hi-flow-vat-lieu-dan-nhiet-dang-long',
    shortDescVi: 'Vật liệu dẫn nhiệt dạng lỏng cho CPU/GPU',
    shortDescEn: 'Liquid thermal interface for CPU/GPU',
    groupSlug: 'heat-conducting',
    brandName: 'Bergquist',
  },
];

async function main() {
  console.log('🌱 Starting seed: Products from old website...');

  const PRICE = 500000; // 500,000 VND

  // Get all groups and brands
  const groups = await prisma.productGroup.findMany();
  const brands = await prisma.partner.findMany({ where: { isBrand: true } });

  const groupMap = new Map(groups.map((g) => [g.slug, g]));
  const brandMap = new Map(brands.map((b) => [b.name, b]));

  // Create missing brands
  const missingBrands = [
    { name: 'Molykote', order: 100 },
    { name: 'Bonderite', order: 101 },
    { name: 'Rocol', order: 102 },
    { name: 'actnano', order: 103 },
    { name: 'OK International', order: 104 },
    { name: 'Bergquist', order: 105 },
  ];

  for (const brandData of missingBrands) {
    const brandId = brandData.name.toLowerCase().replace(/\s+/g, '-');
    const existing = await prisma.partner.findUnique({ where: { id: brandId } });
    if (!existing) {
      await prisma.partner.create({
        data: {
          id: brandId,
          name: brandData.name,
          order: brandData.order,
          isBrand: true,
          logoUrl: '/partners/placeholder.svg',
        },
      });
      console.log(`✅ Created missing brand: ${brandData.name}`);
      brandMap.set(brandData.name, { id: brandId, name: brandData.name } as any);
    }
  }

  let created = 0;
  let skipped = 0;

  for (const productData of PRODUCTS_FROM_OLD_SITE) {
    const group = groupMap.get(productData.groupSlug);
    if (!group) {
      console.warn(
        `⚠️  Group not found: ${productData.groupSlug} for product ${productData.nameVi}`
      );
      skipped++;
      continue;
    }

    const brand = brandMap.get(productData.brandName);
    if (!brand) {
      console.warn(
        `⚠️  Brand not found: ${productData.brandName} for product ${productData.nameVi}`
      );
      skipped++;
      continue;
    }

    try {
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          nameEn: productData.nameEn,
          nameVi: productData.nameVi,
          shortDescEn: productData.shortDescEn,
          shortDescVi: productData.shortDescVi,
          price: PRICE,
          currency: 'VND',
          groupId: group.id,
          brandId: brand.id,
          isActive: true,
        },
        create: {
          slug: productData.slug,
          nameEn: productData.nameEn,
          nameVi: productData.nameVi,
          shortDescEn: productData.shortDescEn,
          shortDescVi: productData.shortDescVi,
          price: PRICE,
          currency: 'VND',
          groupId: group.id,
          brandId: brand.id,
          isActive: true,
          stockQuantity: 100,
        },
      });

      // Always update/create product image - use generated SVG
      const imageUrl = `/products/${productData.slug}.svg`;

      // Delete existing images first to avoid duplicates
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });

      // Create new image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          alt: productData.nameEn,
          order: 0,
          isPrimary: true,
        },
      });

      console.log(`   📷 Image: ${imageUrl}`);

      created++;
      console.log(`✅ Created: ${productData.nameVi}`);
    } catch (error) {
      console.error(`❌ Error creating product ${productData.nameVi}:`, error);
      skipped++;
    }
  }

  console.log(`\n🌱 Seed completed!`);
  console.log(`✅ Created: ${created} products`);
  console.log(`⚠️  Skipped: ${skipped} products`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
