import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Shield,
  Zap,
  Settings,
  Target,
  Award,
  Layers,
  Cpu,
  Droplets,
  Scissors,
  Tag,
  Crosshair,
} from 'lucide-react';

// Comprehensive service data with professional content
const servicesData = [
  {
    id: 'mix-dispensing',
    slug: 'mix-dispensing',
    nameEn: 'Mix & Dispensing',
    nameVi: 'Trộn & Phân phối',
    metaDescEn:
      'Advanced precision mixing and dispensing solutions for adhesives, sealants, potting compounds, and coatings. Automated systems with ±1% accuracy.',
    metaDescVi:
      'Giải pháp trộn và phân phối chính xác tiên tiến cho keo dán, chất bịt kín, chất đổ khuôn và lớp phủ. Hệ thống tự động với độ chính xác ±1%.',
    heroDescEn:
      'Transform your production line with our state-of-the-art mixing and dispensing systems. From single-component to complex multi-ratio formulations, we deliver precision, consistency, and efficiency that drives manufacturing excellence.',
    heroDescVi:
      'Chuyển đổi dây chuyền sản xuất của bạn với hệ thống trộn và phân phối tiên tiến nhất. Từ đơn thành phần đến công thức đa tỷ lệ phức tạp, chúng tôi mang đến độ chính xác, nhất quán và hiệu quả thúc đẩy sự xuất sắc trong sản xuất.',
    imageSrc: '/images/services/MIX_DISPENSING1.png',
    icon: Droplets,
    tags: ['Precision', 'Automation'],
    tagsVi: ['Chính xác', 'Tự động hóa'],
    stats: [
      {
        valueEn: '±1%',
        valueVi: '±1%',
        labelEn: 'Volume Accuracy',
        labelVi: 'Độ chính xác thể tích',
      },
      {
        valueEn: '24/7',
        valueVi: '24/7',
        labelEn: 'Continuous Operation',
        labelVi: 'Hoạt động liên tục',
      },
      { valueEn: '50%', valueVi: '50%', labelEn: 'Waste Reduction', labelVi: 'Giảm lãng phí' },
      { valueEn: '3x', valueVi: '3x', labelEn: 'Faster Production', labelVi: 'Sản xuất nhanh hơn' },
    ],
    overviewEn: `Our Mix & Dispensing solutions represent the pinnacle of precision engineering for industrial adhesive and sealant applications. With over two decades of expertise, Creative Engineering provides comprehensive systems that transform how manufacturers handle complex material dispensing challenges.

Whether you're working with single-component adhesives, two-part epoxies, silicones, polyurethanes, or multi-component potting compounds, our systems deliver unmatched accuracy and repeatability. Our equipment ranges from benchtop units for R&D and small batch production to fully automated inline systems for high-volume manufacturing.`,
    overviewVi: `Giải pháp Trộn & Phân phối của chúng tôi đại diện cho đỉnh cao của kỹ thuật chính xác cho các ứng dụng keo dán và chất bịt kín công nghiệp. Với hơn hai thập kỷ chuyên môn, Creative Engineering cung cấp các hệ thống toàn diện biến đổi cách các nhà sản xuất xử lý các thách thức phân phối vật liệu phức tạp.

Dù bạn đang làm việc với keo đơn thành phần, epoxy hai phần, silicone, polyurethane, hay hợp chất đổ khuôn đa thành phần, hệ thống của chúng tôi mang lại độ chính xác và khả năng lặp lại vượt trội. Thiết bị của chúng tôi từ các đơn vị để bàn cho R&D và sản xuất lô nhỏ đến hệ thống inline tự động hoàn toàn cho sản xuất khối lượng lớn.`,
    features: [
      {
        icon: Settings,
        titleEn: 'Automated Dispensing Systems',
        titleVi: 'Hệ thống Phân phối Tự động',
        descEn:
          'Programmable dispensing robots and gantry systems with precision motion control. Handles complex patterns, multiple shot sizes, and varied geometries with ease.',
        descVi:
          'Robot phân phối và hệ thống gantry có thể lập trình với điều khiển chuyển động chính xác. Xử lý dễ dàng các mẫu phức tạp, nhiều kích thước shot và hình học đa dạng.',
      },
      {
        icon: Layers,
        titleEn: 'Multi-Component Mixing',
        titleVi: 'Trộn Đa thành phần',
        descEn:
          'Dynamic and static mixing solutions for 2K, 3K, and multi-part formulations. Precise ratio control from 1:1 to 100:1 with real-time monitoring.',
        descVi:
          'Giải pháp trộn động và tĩnh cho công thức 2K, 3K và nhiều thành phần. Kiểm soát tỷ lệ chính xác từ 1:1 đến 100:1 với giám sát thời gian thực.',
      },
      {
        icon: Target,
        titleEn: 'Precision Metering',
        titleVi: 'Đo lường Chính xác',
        descEn:
          'Volumetric and gravimetric dispensing with ±1% accuracy. Servo-driven pumps, gear meters, and progressive cavity technology for consistent results.',
        descVi:
          'Phân phối thể tích và trọng lượng với độ chính xác ±1%. Bơm servo, đồng hồ bánh răng và công nghệ khoang tiến triển cho kết quả nhất quán.',
      },
      {
        icon: Cpu,
        titleEn: 'Smart Process Control',
        titleVi: 'Điều khiển Quy trình Thông minh',
        descEn:
          'Industry 4.0 ready systems with data logging, process monitoring, and predictive maintenance. Full traceability and quality documentation.',
        descVi:
          'Hệ thống sẵn sàng Industry 4.0 với ghi dữ liệu, giám sát quy trình và bảo trì dự đoán. Truy xuất nguồn gốc và tài liệu chất lượng đầy đủ.',
      },
    ],
    applications: [
      { en: 'Automotive body sealing & bonding', vi: 'Dán kín & kết dính thân xe ô tô' },
      { en: 'Electronics potting & encapsulation', vi: 'Đổ khuôn & bọc điện tử' },
      { en: 'Aerospace structural adhesives', vi: 'Keo kết cấu hàng không vũ trụ' },
      { en: 'Medical device assembly', vi: 'Lắp ráp thiết bị y tế' },
      { en: 'Solar panel manufacturing', vi: 'Sản xuất tấm pin mặt trời' },
      { en: 'Battery cell assembly', vi: 'Lắp ráp pin' },
      { en: 'Appliance gasket application', vi: 'Ứng dụng gioăng thiết bị gia dụng' },
      { en: 'Construction sealant systems', vi: 'Hệ thống chất bịt kín xây dựng' },
    ],
    processSteps: [
      {
        stepEn: 'Consultation',
        stepVi: 'Tư vấn',
        descEn:
          'We analyze your material properties, production requirements, and quality specifications.',
        descVi:
          'Chúng tôi phân tích tính chất vật liệu, yêu cầu sản xuất và thông số chất lượng của bạn.',
      },
      {
        stepEn: 'System Design',
        stepVi: 'Thiết kế Hệ thống',
        descEn:
          'Our engineers design a custom solution optimized for your specific application needs.',
        descVi:
          'Các kỹ sư của chúng tôi thiết kế giải pháp tùy chỉnh tối ưu cho nhu cầu ứng dụng cụ thể của bạn.',
      },
      {
        stepEn: 'Testing & Validation',
        stepVi: 'Kiểm tra & Xác nhận',
        descEn:
          'Rigorous testing with your materials to validate performance and process parameters.',
        descVi:
          'Kiểm tra nghiêm ngặt với vật liệu của bạn để xác nhận hiệu suất và thông số quy trình.',
      },
      {
        stepEn: 'Installation & Training',
        stepVi: 'Cài đặt & Đào tạo',
        descEn: 'Professional installation, operator training, and ongoing technical support.',
        descVi: 'Cài đặt chuyên nghiệp, đào tạo vận hành và hỗ trợ kỹ thuật liên tục.',
      },
    ],
    brandsEn: ['Henkel', 'Graco', 'Nordson', 'Scheugenpflug', 'ViscoTec'],
    brandsVi: ['Henkel', 'Graco', 'Nordson', 'Scheugenpflug', 'ViscoTec'],
  },
  {
    id: 'converting-services',
    slug: 'converting-services',
    nameEn: 'Converting Services',
    nameVi: 'Dịch vụ Chuyển đổi',
    metaDescEn:
      'Custom converting solutions for adhesive tapes, films, foams, and flexible materials. Precision die-cutting, slitting, and laminating services.',
    metaDescVi:
      'Giải pháp gia công chuyển đổi tùy chỉnh cho băng keo, màng, xốp và vật liệu linh hoạt. Dịch vụ cắt khuôn, cắt dọc và cán màng chính xác.',
    heroDescEn:
      'From raw materials to precision components—our converting services transform adhesive tapes, specialty films, and flexible materials into exactly what your application demands. Speed, precision, and flexibility define everything we do.',
    heroDescVi:
      'Từ nguyên liệu thô đến linh kiện chính xác—dịch vụ chuyển đổi của chúng tôi biến băng keo, màng đặc biệt và vật liệu linh hoạt thành chính xác những gì ứng dụng của bạn yêu cầu. Tốc độ, độ chính xác và tính linh hoạt định nghĩa mọi thứ chúng tôi làm.',
    imageSrc: '/images/services/CONVERTING SERVICES.png',
    icon: Scissors,
    tags: ['Custom', 'Flexible'],
    tagsVi: ['Tùy chỉnh', 'Linh hoạt'],
    stats: [
      {
        valueEn: '±0.1mm',
        valueVi: '±0.1mm',
        labelEn: 'Cutting Tolerance',
        labelVi: 'Dung sai cắt',
      },
      {
        valueEn: '48hr',
        valueVi: '48 giờ',
        labelEn: 'Prototype Turnaround',
        labelVi: 'Thời gian mẫu thử',
      },
      {
        valueEn: '1000+',
        valueVi: '1000+',
        labelEn: 'Material Options',
        labelVi: 'Lựa chọn vật liệu',
      },
      { valueEn: '99.5%', valueVi: '99.5%', labelEn: 'Quality Rate', labelVi: 'Tỷ lệ chất lượng' },
    ],
    overviewEn: `Creative Engineering's Converting Services division specializes in transforming raw adhesive materials into precision-engineered components. With state-of-the-art rotary and flatbed die-cutting equipment, precision slitting lines, and advanced laminating capabilities, we serve industries where accuracy and consistency are non-negotiable.

Our converting facility processes everything from thin films (25 microns) to thick foam materials (50mm+), including pressure-sensitive adhesives, double-coated tapes, thermal interface materials, EMI shielding materials, and specialty foams. Whether you need 100 pieces or 100,000, we deliver with the same commitment to quality.`,
    overviewVi: `Bộ phận Dịch vụ Chuyển đổi của Creative Engineering chuyên biến nguyên liệu keo dán thành các linh kiện kỹ thuật chính xác. Với thiết bị cắt khuôn quay và phẳng tiên tiến nhất, dây chuyền cắt dọc chính xác và khả năng cán màng tiên tiến, chúng tôi phục vụ các ngành công nghiệp nơi độ chính xác và nhất quán là không thể thương lượng.

Cơ sở chuyển đổi của chúng tôi xử lý mọi thứ từ màng mỏng (25 micron) đến vật liệu xốp dày (50mm+), bao gồm keo nhạy áp, băng phủ đôi, vật liệu giao diện nhiệt, vật liệu che chắn EMI và xốp đặc biệt. Dù bạn cần 100 miếng hay 100.000, chúng tôi giao hàng với cùng cam kết về chất lượng.`,
    features: [
      {
        icon: Crosshair,
        titleEn: 'Precision Die-Cutting',
        titleVi: 'Cắt Khuôn Chính xác',
        descEn:
          'Rotary and flatbed die-cutting for complex shapes with tolerances to ±0.1mm. Kiss-cutting, through-cutting, and perforating capabilities.',
        descVi:
          'Cắt khuôn quay và phẳng cho hình dạng phức tạp với dung sai đến ±0.1mm. Khả năng cắt kiss, cắt xuyên và đục lỗ.',
      },
      {
        icon: Layers,
        titleEn: 'Multi-Layer Lamination',
        titleVi: 'Cán Nhiều Lớp',
        descEn:
          'Combine multiple materials with precise registration. Adhesive lamination, heat lamination, and pressure-sensitive lamination options.',
        descVi:
          'Kết hợp nhiều vật liệu với độ chính xác đăng ký. Các tùy chọn cán keo, cán nhiệt và cán nhạy áp.',
      },
      {
        icon: Settings,
        titleEn: 'Precision Slitting',
        titleVi: 'Cắt Dọc Chính xác',
        descEn:
          'Width tolerances to ±0.25mm. Score slitting, shear slitting, and razor slitting for all material types.',
        descVi:
          'Dung sai chiều rộng đến ±0.25mm. Cắt rạch, cắt cắt và cắt dao cạo cho tất cả loại vật liệu.',
      },
      {
        icon: Zap,
        titleEn: 'Rapid Prototyping',
        titleVi: 'Tạo mẫu Nhanh',
        descEn:
          'Digital cutting and laser cutting for prototypes. From design to samples in 24-48 hours.',
        descVi: 'Cắt kỹ thuật số và cắt laser cho mẫu thử. Từ thiết kế đến mẫu trong 24-48 giờ.',
      },
    ],
    applications: [
      { en: 'Gaskets and seals', vi: 'Gioăng và phớt' },
      { en: 'EMI/RFI shielding components', vi: 'Linh kiện che chắn EMI/RFI' },
      { en: 'Thermal interface pads', vi: 'Miếng đệm giao diện nhiệt' },
      { en: 'Display bonding tapes', vi: 'Băng dán màn hình' },
      { en: 'Automotive NVH solutions', vi: 'Giải pháp NVH ô tô' },
      { en: 'Medical device components', vi: 'Linh kiện thiết bị y tế' },
      { en: 'Electronic assembly parts', vi: 'Linh kiện lắp ráp điện tử' },
      { en: 'Protective film applications', vi: 'Ứng dụng màng bảo vệ' },
    ],
    processSteps: [
      {
        stepEn: 'Material Selection',
        stepVi: 'Chọn Vật liệu',
        descEn:
          'We help identify the optimal material from our extensive portfolio or source specialty materials.',
        descVi:
          'Chúng tôi giúp xác định vật liệu tối ưu từ danh mục rộng lớn hoặc tìm nguồn vật liệu đặc biệt.',
      },
      {
        stepEn: 'Design Engineering',
        stepVi: 'Kỹ thuật Thiết kế',
        descEn: 'Our team optimizes part geometry for manufacturability and cost-effectiveness.',
        descVi:
          'Đội ngũ của chúng tôi tối ưu hóa hình học linh kiện để sản xuất và tiết kiệm chi phí.',
      },
      {
        stepEn: 'Tooling & Setup',
        stepVi: 'Dụng cụ & Thiết lập',
        descEn: 'Precision tooling creation and machine setup for your specific requirements.',
        descVi: 'Tạo dụng cụ chính xác và thiết lập máy cho yêu cầu cụ thể của bạn.',
      },
      {
        stepEn: 'Production & QC',
        stepVi: 'Sản xuất & QC',
        descEn: 'Full production with in-process quality control and final inspection.',
        descVi: 'Sản xuất đầy đủ với kiểm soát chất lượng trong quy trình và kiểm tra cuối cùng.',
      },
    ],
    brandsEn: ['3M', 'Tesa', 'Nitto', 'Avery Dennison', 'Rogers Corporation'],
    brandsVi: ['3M', 'Tesa', 'Nitto', 'Avery Dennison', 'Rogers Corporation'],
  },
  {
    id: 'custom-labeling',
    slug: 'custom-labeling',
    nameEn: 'Custom Labeling',
    nameVi: 'Nhãn Tùy chỉnh',
    metaDescEn:
      'Professional industrial labeling solutions—durable labels for product identification, safety compliance, asset tracking, and brand identity.',
    metaDescVi:
      'Giải pháp nhãn công nghiệp chuyên nghiệp—nhãn bền cho nhận dạng sản phẩm, tuân thủ an toàn, theo dõi tài sản và nhận diện thương hiệu.',
    heroDescEn:
      'Labels that perform under pressure. From extreme temperatures to harsh chemicals, our custom labeling solutions ensure your products, assets, and safety information remain clearly identified throughout their lifecycle.',
    heroDescVi:
      'Nhãn hoạt động dưới áp lực. Từ nhiệt độ khắc nghiệt đến hóa chất mạnh, giải pháp nhãn tùy chỉnh của chúng tôi đảm bảo sản phẩm, tài sản và thông tin an toàn của bạn luôn được nhận dạng rõ ràng trong suốt vòng đời.',
    imageSrc: '/images/services/CUSTOM LABELING.png',
    icon: Tag,
    tags: ['Professional', 'Quality'],
    tagsVi: ['Chuyên nghiệp', 'Chất lượng'],
    stats: [
      {
        valueEn: '-40°C to +150°C',
        valueVi: '-40°C đến +150°C',
        labelEn: 'Temperature Range',
        labelVi: 'Phạm vi nhiệt độ',
      },
      { valueEn: 'UL/CSA', valueVi: 'UL/CSA', labelEn: 'Certifications', labelVi: 'Chứng nhận' },
      { valueEn: '10+ Years', valueVi: '10+ Năm', labelEn: 'Durability', labelVi: 'Độ bền' },
      { valueEn: '100%', valueVi: '100%', labelEn: 'Scan Accuracy', labelVi: 'Độ chính xác quét' },
    ],
    overviewEn: `In industrial environments, labels aren't just identifiers—they're critical components of safety, compliance, and operational efficiency. Creative Engineering's Custom Labeling solutions deliver durable, high-performance labels engineered to withstand the toughest conditions while maintaining perfect readability.

We offer comprehensive labeling solutions including UL/CSA recognized materials for electrical safety, chemical-resistant labels for harsh environments, high-temperature labels for automotive and aerospace, and serialized labels with variable data for traceability. Our in-house design team works with you to create labels that meet both regulatory requirements and brand standards.`,
    overviewVi: `Trong môi trường công nghiệp, nhãn không chỉ là công cụ nhận dạng—chúng là thành phần quan trọng của an toàn, tuân thủ và hiệu quả hoạt động. Giải pháp Nhãn Tùy chỉnh của Creative Engineering cung cấp nhãn bền, hiệu suất cao được thiết kế để chịu được các điều kiện khắc nghiệt nhất trong khi vẫn duy trì độ dễ đọc hoàn hảo.

Chúng tôi cung cấp giải pháp nhãn toàn diện bao gồm vật liệu được UL/CSA công nhận cho an toàn điện, nhãn chống hóa chất cho môi trường khắc nghiệt, nhãn chịu nhiệt cao cho ô tô và hàng không vũ trụ, và nhãn số hóa với dữ liệu biến đổi để truy xuất nguồn gốc. Đội ngũ thiết kế nội bộ của chúng tôi làm việc với bạn để tạo nhãn đáp ứng cả yêu cầu quy định và tiêu chuẩn thương hiệu.`,
    features: [
      {
        icon: Shield,
        titleEn: 'Durable Materials',
        titleVi: 'Vật liệu Bền',
        descEn:
          'Polyester, polyimide, vinyl, and specialty films that resist chemicals, abrasion, UV exposure, and extreme temperatures.',
        descVi:
          'Polyester, polyimide, vinyl và màng đặc biệt chống hóa chất, mài mòn, tia UV và nhiệt độ khắc nghiệt.',
      },
      {
        icon: Award,
        titleEn: 'Compliance Ready',
        titleVi: 'Sẵn sàng Tuân thủ',
        descEn:
          'UL, CSA, CE marking, and industry-specific compliance. We understand the requirements and deliver certified solutions.',
        descVi:
          'UL, CSA, đánh dấu CE và tuân thủ ngành cụ thể. Chúng tôi hiểu các yêu cầu và cung cấp giải pháp được chứng nhận.',
      },
      {
        icon: Cpu,
        titleEn: 'Variable Data Printing',
        titleVi: 'In Dữ liệu Biến đổi',
        descEn:
          'Barcodes, QR codes, serial numbers, and unique identifiers. Full traceability from print to application.',
        descVi:
          'Mã vạch, mã QR, số sê-ri và mã định danh duy nhất. Truy xuất đầy đủ từ in đến ứng dụng.',
      },
      {
        icon: Settings,
        titleEn: 'Application Solutions',
        titleVi: 'Giải pháp Ứng dụng',
        descEn:
          'Manual applicators to high-speed automated systems. We match the application method to your production needs.',
        descVi:
          'Máy dán thủ công đến hệ thống tự động tốc độ cao. Chúng tôi phù hợp phương pháp ứng dụng với nhu cầu sản xuất của bạn.',
      },
    ],
    applications: [
      { en: 'Electrical safety labels', vi: 'Nhãn an toàn điện' },
      { en: 'Product identification', vi: 'Nhận dạng sản phẩm' },
      { en: 'Asset tracking & management', vi: 'Theo dõi & quản lý tài sản' },
      { en: 'Warning & safety labels', vi: 'Nhãn cảnh báo & an toàn' },
      { en: 'Calibration & inspection labels', vi: 'Nhãn hiệu chuẩn & kiểm tra' },
      { en: 'Brand & logo labels', vi: 'Nhãn thương hiệu & logo' },
      { en: 'Tamper-evident labels', vi: 'Nhãn chống giả' },
      { en: 'Outdoor durable labels', vi: 'Nhãn bền ngoài trời' },
    ],
    processSteps: [
      {
        stepEn: 'Requirements Analysis',
        stepVi: 'Phân tích Yêu cầu',
        descEn: 'We understand your environment, compliance needs, and performance requirements.',
        descVi: 'Chúng tôi hiểu môi trường, nhu cầu tuân thủ và yêu cầu hiệu suất của bạn.',
      },
      {
        stepEn: 'Material & Design',
        stepVi: 'Vật liệu & Thiết kế',
        descEn:
          'Selection of optimal materials and creation of label designs that meet all specifications.',
        descVi: 'Chọn vật liệu tối ưu và tạo thiết kế nhãn đáp ứng tất cả thông số kỹ thuật.',
      },
      {
        stepEn: 'Proofing & Testing',
        stepVi: 'Duyệt & Kiểm tra',
        descEn: 'Sample production and environmental testing to validate performance.',
        descVi: 'Sản xuất mẫu và kiểm tra môi trường để xác nhận hiệu suất.',
      },
      {
        stepEn: 'Production & Delivery',
        stepVi: 'Sản xuất & Giao hàng',
        descEn: 'High-quality production with strict quality control and reliable delivery.',
        descVi:
          'Sản xuất chất lượng cao với kiểm soát chất lượng nghiêm ngặt và giao hàng đáng tin cậy.',
      },
    ],
    brandsEn: ['Brady', '3M', 'Avery Dennison', 'CILS', 'Polyonics'],
    brandsVi: ['Brady', '3M', 'Avery Dennison', 'CILS', 'Polyonics'],
  },
  {
    id: 'laser-die-cutting',
    slug: 'laser-die-cutting',
    nameEn: 'Laser & Die Cutting',
    nameVi: 'Cắt Laser & Khuôn',
    metaDescEn:
      'High-precision laser cutting and die cutting services for complex geometries in metals, plastics, foams, and composites. Tolerances to ±0.05mm.',
    metaDescVi:
      'Dịch vụ cắt laser và cắt khuôn độ chính xác cao cho hình học phức tạp trong kim loại, nhựa, xốp và composite. Dung sai đến ±0.05mm.',
    heroDescEn:
      "When standard cutting methods can't deliver, our advanced laser and precision die cutting technologies step in. We handle the most demanding geometries, tightest tolerances, and most challenging materials—turning impossibilities into realities.",
    heroDescVi:
      'Khi các phương pháp cắt tiêu chuẩn không thể đáp ứng, công nghệ cắt laser và cắt khuôn chính xác tiên tiến của chúng tôi sẵn sàng. Chúng tôi xử lý các hình học đòi hỏi nhất, dung sai chặt nhất và vật liệu thách thức nhất—biến điều không thể thành hiện thực.',
    imageSrc: '/images/services/laser_die cutting.png',
    icon: Crosshair,
    tags: ['High-Precision', 'Advanced'],
    tagsVi: ['Độ chính xác cao', 'Tiên tiến'],
    stats: [
      {
        valueEn: '±0.05mm',
        valueVi: '±0.05mm',
        labelEn: 'Laser Tolerance',
        labelVi: 'Dung sai laser',
      },
      {
        valueEn: '0.1mm',
        valueVi: '0.1mm',
        labelEn: 'Min Feature Size',
        labelVi: 'Kích thước tính năng tối thiểu',
      },
      { valueEn: '24hr', valueVi: '24 giờ', labelEn: 'Rapid Prototypes', labelVi: 'Mẫu thử nhanh' },
      { valueEn: '50+', valueVi: '50+', labelEn: 'Material Types', labelVi: 'Loại vật liệu' },
    ],
    overviewEn: `Creative Engineering's Laser & Die Cutting services combine the precision of modern laser technology with the efficiency of traditional die cutting methods. Our dual capability allows us to select the optimal cutting method for each application, ensuring the best balance of quality, speed, and cost.

Our CO2 and fiber laser systems handle intricate patterns in thin films, plastics, textiles, foams, and select metals with micron-level precision. For higher volume production, our precision steel-rule and solid dies deliver consistent results at speeds that laser cutting cannot match. This flexibility means you get the right solution for prototype through production volumes.`,
    overviewVi: `Dịch vụ Cắt Laser & Khuôn của Creative Engineering kết hợp độ chính xác của công nghệ laser hiện đại với hiệu quả của phương pháp cắt khuôn truyền thống. Khả năng kép của chúng tôi cho phép chọn phương pháp cắt tối ưu cho mỗi ứng dụng, đảm bảo sự cân bằng tốt nhất về chất lượng, tốc độ và chi phí.

Hệ thống laser CO2 và sợi của chúng tôi xử lý các mẫu phức tạp trong màng mỏng, nhựa, vải, xốp và kim loại chọn lọc với độ chính xác cấp micron. Đối với sản xuất khối lượng cao hơn, khuôn thép và khuôn rắn chính xác của chúng tôi mang lại kết quả nhất quán ở tốc độ mà cắt laser không thể sánh được. Tính linh hoạt này có nghĩa là bạn nhận được giải pháp phù hợp cho mẫu thử qua khối lượng sản xuất.`,
    features: [
      {
        icon: Zap,
        titleEn: 'Laser Cutting Systems',
        titleVi: 'Hệ thống Cắt Laser',
        descEn:
          'CO2 lasers for organic materials, fiber lasers for metals and reflective materials. Clean cuts with minimal heat-affected zones.',
        descVi:
          'Laser CO2 cho vật liệu hữu cơ, laser sợi cho kim loại và vật liệu phản chiếu. Vết cắt sạch với vùng ảnh hưởng nhiệt tối thiểu.',
      },
      {
        icon: Target,
        titleEn: 'Precision Die Cutting',
        titleVi: 'Cắt Khuôn Chính xác',
        descEn:
          'Steel-rule dies, solid dies, and matched metal dies for high-volume production with consistent quality.',
        descVi:
          'Khuôn thép, khuôn rắn và khuôn kim loại phù hợp cho sản xuất khối lượng cao với chất lượng nhất quán.',
      },
      {
        icon: Clock,
        titleEn: 'Rapid Turnaround',
        titleVi: 'Xử lý Nhanh',
        descEn:
          'Laser cutting enables same-day prototypes. No tooling costs for design iterations and small batches.',
        descVi:
          'Cắt laser cho phép mẫu thử trong ngày. Không có chi phí dụng cụ cho các lần lặp thiết kế và lô nhỏ.',
      },
      {
        icon: Layers,
        titleEn: 'Multi-Material Capability',
        titleVi: 'Khả năng Đa vật liệu',
        descEn:
          'From 25-micron films to 25mm foam, thin metals to composites. One source for all your cutting needs.',
        descVi:
          'Từ màng 25 micron đến xốp 25mm, kim loại mỏng đến composite. Một nguồn cho tất cả nhu cầu cắt của bạn.',
      },
    ],
    applications: [
      { en: 'Precision gaskets & seals', vi: 'Gioăng & phớt chính xác' },
      { en: 'Electronic shielding parts', vi: 'Linh kiện che chắn điện tử' },
      { en: 'Aerospace composite cutting', vi: 'Cắt composite hàng không vũ trụ' },
      { en: 'Medical device components', vi: 'Linh kiện thiết bị y tế' },
      { en: 'Automotive interior parts', vi: 'Linh kiện nội thất ô tô' },
      { en: 'Insulation components', vi: 'Linh kiện cách nhiệt' },
      { en: 'Flexible circuit blanks', vi: 'Phôi mạch linh hoạt' },
      { en: 'Prototype parts', vi: 'Linh kiện mẫu thử' },
    ],
    processSteps: [
      {
        stepEn: 'Design Review',
        stepVi: 'Xem xét Thiết kế',
        descEn: 'We analyze your CAD files and recommend the optimal cutting method and material.',
        descVi:
          'Chúng tôi phân tích file CAD của bạn và đề xuất phương pháp cắt và vật liệu tối ưu.',
      },
      {
        stepEn: 'Process Selection',
        stepVi: 'Chọn Quy trình',
        descEn:
          'Laser vs. die cutting decision based on volume, tolerance, and material requirements.',
        descVi:
          'Quyết định laser so với cắt khuôn dựa trên khối lượng, dung sai và yêu cầu vật liệu.',
      },
      {
        stepEn: 'First Article',
        stepVi: 'Mẫu Đầu tiên',
        descEn: 'Sample production with full dimensional inspection and customer approval.',
        descVi: 'Sản xuất mẫu với kiểm tra kích thước đầy đủ và phê duyệt của khách hàng.',
      },
      {
        stepEn: 'Production',
        stepVi: 'Sản xuất',
        descEn: 'Full production run with in-process quality checks and final inspection.',
        descVi:
          'Chạy sản xuất đầy đủ với kiểm tra chất lượng trong quy trình và kiểm tra cuối cùng.',
      },
    ],
    brandsEn: ['TRUMPF', 'Mitsubishi', 'BOBST', 'Atom', 'Gerber'],
    brandsVi: ['TRUMPF', 'Mitsubishi', 'BOBST', 'Atom', 'Gerber'],
  },
];

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    return { title: 'Service Not Found' };
  }

  return {
    title: `${service.nameEn} - Creative Engineering`,
    description: service.metaDescEn,
  };
}

export async function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const isVi = locale.toLowerCase().startsWith('vi');

  const service = servicesData.find((s) => s.slug === slug);
  if (!service) {
    notFound();
  }

  const currentIndex = servicesData.findIndex((s) => s.slug === slug);
  const prevService = currentIndex > 0 ? servicesData[currentIndex - 1] : null;
  const nextService =
    currentIndex < servicesData.length - 1 ? servicesData[currentIndex + 1] : null;

  const name = isVi ? service.nameVi : service.nameEn;
  const heroDesc = isVi ? service.heroDescVi : service.heroDescEn;
  const overview = isVi ? service.overviewVi : service.overviewEn;
  const tags = isVi ? service.tagsVi : service.tags;
  const brands = isVi ? service.brandsVi : service.brandsEn;
  const IconComponent = service.icon;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ce-primary-800 via-ce-primary to-ce-primary-600 py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-10 [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -bottom-1/2 -right-1/4 h-[600px] w-[600px] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -left-1/4 -top-1/2 h-[500px] w-[500px] rounded-full bg-white/5" />

        <div className="ce-container relative">
          {/* Back link */}
          <Link
            href="/services"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isVi ? 'Tất cả dịch vụ' : 'All Services'}</span>
          </Link>

          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              {/* Icon & Tags */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <IconComponent className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{name}</h1>
              <p className="text-lg leading-relaxed text-white/85 md:text-xl">{heroDesc}</p>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {service.stats.map((stat, i) => (
                  <div key={i} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">
                      {isVi ? stat.valueVi : stat.valueEn}
                    </div>
                    <div className="mt-1 text-xs text-white/70">
                      {isVi ? stat.labelVi : stat.labelEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
              <Image
                src={service.imageSrc}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="ce-container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Tổng quan Dịch vụ' : 'Service Overview'}
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              {overview.split('\n\n').map((paragraph, i) => (
                <p key={i} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-ce-neutral-20 py-16 lg:py-24">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Tính năng & Khả năng' : 'Features & Capabilities'}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {isVi
                ? 'Công nghệ và chuyên môn tiên tiến hỗ trợ dịch vụ của chúng tôi'
                : 'Advanced technology and expertise that power our services'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {service.features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  className="group rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all duration-300 hover:border-ce-primary/20 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-ce-primary/10 transition-colors group-hover:bg-ce-primary">
                    <FeatureIcon className="h-7 w-7 text-ce-primary transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-ce-primary-800">
                    {isVi ? feature.titleVi : feature.titleEn}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {isVi ? feature.descVi : feature.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Quy trình Làm việc' : 'Our Process'}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {isVi
                ? 'Phương pháp tiếp cận có hệ thống để đảm bảo kết quả tối ưu'
                : 'A systematic approach to ensure optimal results'}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {service.processSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < service.processSteps.length - 1 && (
                  <div
                    className="absolute right-0 top-8 hidden h-0.5 w-full bg-ce-primary/20 lg:block"
                    style={{ left: '60%' }}
                  />
                )}
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ce-primary text-2xl font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-ce-primary-800">
                    {isVi ? step.stepVi : step.stepEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isVi ? step.descVi : step.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="bg-gradient-to-br from-ce-primary-800 to-ce-primary py-16 lg:py-24">
        <div className="ce-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                {isVi ? 'Ứng dụng' : 'Applications'}
              </h2>
              <p className="mb-8 text-lg text-white/80">
                {isVi
                  ? 'Dịch vụ của chúng tôi phục vụ các ngành công nghiệp và ứng dụng đa dạng trên toàn cầu.'
                  : 'Our service supports diverse industries and applications worldwide.'}
              </p>

              <ul className="grid gap-3 sm:grid-cols-2">
                {service.applications.map((app, i) => (
                  <li key={i} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-ce-accent-teal" />
                    <span>{isVi ? app.vi : app.en}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact CTA Card */}
            <div className="rounded-2xl bg-white p-8 shadow-2xl lg:p-10">
              <h3 className="mb-4 text-2xl font-bold text-ce-primary-800">
                {isVi ? 'Bắt đầu Dự án' : 'Start Your Project'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {isVi
                  ? 'Liên hệ với đội ngũ chuyên gia của chúng tôi để thảo luận về yêu cầu cụ thể của bạn và nhận tư vấn miễn phí.'
                  : 'Contact our expert team to discuss your specific requirements and get a free consultation.'}
              </p>

              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-ce-primary px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-ce-primary-600 hover:shadow-lg"
                >
                  {isVi ? 'Yêu cầu Báo giá Miễn phí' : 'Request Free Quote'}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex flex-col gap-4 pt-4 text-sm sm:flex-row sm:justify-center">
                  <a
                    href="tel:+84123456789"
                    className="flex items-center justify-center gap-2 text-muted-foreground hover:text-ce-primary"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+84 123 456 789</span>
                  </a>
                  <a
                    href="mailto:info@ce-vietnam.com"
                    className="flex items-center justify-center gap-2 text-muted-foreground hover:text-ce-primary"
                  >
                    <Mail className="h-4 w-4" />
                    <span>info@ce-vietnam.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="bg-white py-12">
        <div className="ce-container">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {isVi ? 'Đối tác Công nghệ' : 'Technology Partners'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {brands.map((brand, i) => (
              <span key={i} className="text-lg font-semibold text-ce-primary/60">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="border-t bg-ce-neutral-20 py-8">
        <div className="ce-container">
          <div className="flex items-center justify-between">
            {prevService ? (
              <Link
                href={`/services/${prevService.slug}`}
                className="group flex items-center gap-3 text-muted-foreground transition-colors hover:text-ce-primary"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/60">
                    {isVi ? 'Trước' : 'Previous'}
                  </div>
                  <div className="font-semibold">
                    {isVi ? prevService.nameVi : prevService.nameEn}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href="/services"
              className="hidden rounded-full border-2 border-ce-primary/20 px-6 py-2 text-sm font-semibold text-ce-primary transition-colors hover:bg-ce-primary hover:text-white sm:block"
            >
              {isVi ? 'Tất cả Dịch vụ' : 'All Services'}
            </Link>

            {nextService ? (
              <Link
                href={`/services/${nextService.slug}`}
                className="group flex items-center gap-3 text-right text-muted-foreground transition-colors hover:text-ce-primary"
              >
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground/60">
                    {isVi ? 'Tiếp theo' : 'Next'}
                  </div>
                  <div className="font-semibold">
                    {isVi ? nextService.nameVi : nextService.nameEn}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
