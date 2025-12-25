import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Phone, Mail } from 'lucide-react';

// Service data
const servicesData = [
  {
    id: 'mix-dispensing',
    slug: 'mix-dispensing',
    nameEn: 'Mix & Dispensing',
    nameVi: 'Trộn & Phân phối',
    metaDescEn:
      'Precision mixing and dispensing solutions for adhesives, sealants, and coatings with automated accuracy.',
    metaDescVi:
      'Giải pháp trộn và phân phối chính xác cho keo dán, chất bịt kín và lớp phủ với độ chính xác tự động.',
    heroDescEn:
      'Deliver precise, repeatable dispensing results with our advanced mixing and dispensing systems designed for industrial excellence.',
    heroDescVi:
      'Cung cấp kết quả phân phối chính xác, có thể lặp lại với hệ thống trộn và phân phối tiên tiến của chúng tôi được thiết kế cho sự xuất sắc trong công nghiệp.',
    imageSrc: '/images/services/MIX_DISPENSING1.png',
    tags: ['Precision', 'Automation'],
    tagsVi: ['Chính xác', 'Tự động hóa'],
    features: [
      {
        titleEn: 'Automated Dispensing',
        titleVi: 'Phân phối Tự động',
        descEn: 'Programmable systems for consistent, hands-free operation.',
        descVi: 'Hệ thống có thể lập trình để vận hành nhất quán, không cần can thiệp thủ công.',
      },
      {
        titleEn: 'Multi-Component Mixing',
        titleVi: 'Trộn Đa thành phần',
        descEn: 'Precise ratio control for 2K and multi-part formulations.',
        descVi: 'Kiểm soát tỷ lệ chính xác cho công thức 2K và nhiều thành phần.',
      },
      {
        titleEn: 'Volume Accuracy',
        titleVi: 'Độ chính xác Thể tích',
        descEn: 'Achieve ±1% accuracy for minimal waste and maximum quality.',
        descVi: 'Đạt độ chính xác ±1% để giảm thiểu lãng phí và tối đa hóa chất lượng.',
      },
      {
        titleEn: 'Real-time Monitoring',
        titleVi: 'Giám sát Thời gian thực',
        descEn: 'Track and log all dispensing parameters for quality assurance.',
        descVi: 'Theo dõi và ghi lại tất cả thông số phân phối để đảm bảo chất lượng.',
      },
    ],
    applications: [
      { en: 'Automotive assembly', vi: 'Lắp ráp ô tô' },
      { en: 'Electronics manufacturing', vi: 'Sản xuất điện tử' },
      { en: 'Aerospace components', vi: 'Linh kiện hàng không vũ trụ' },
      { en: 'Medical devices', vi: 'Thiết bị y tế' },
      { en: 'Consumer electronics', vi: 'Điện tử tiêu dùng' },
      { en: 'Construction sealants', vi: 'Chất bịt kín xây dựng' },
    ],
  },
  {
    id: 'converting-services',
    slug: 'converting-services',
    nameEn: 'Converting Services',
    nameVi: 'Dịch vụ Chuyển đổi',
    metaDescEn:
      'Custom converting solutions for tapes, films, and flexible materials to meet exact specifications.',
    metaDescVi:
      'Giải pháp gia công chuyển đổi cho băng keo, màng và vật liệu linh hoạt theo yêu cầu chính xác.',
    heroDescEn:
      'Transform raw materials into precision components with our state-of-the-art converting capabilities.',
    heroDescVi:
      'Biến nguyên liệu thô thành các thành phần chính xác với khả năng chuyển đổi hiện đại của chúng tôi.',
    imageSrc: '/images/services/CONVERTING SERVICES.png',
    tags: ['Custom', 'Flexible'],
    tagsVi: ['Tùy chỉnh', 'Linh hoạt'],
    features: [
      {
        titleEn: 'Precision Die-Cutting',
        titleVi: 'Cắt Khuôn Chính xác',
        descEn: 'Complex shapes and tight tolerances for demanding applications.',
        descVi: 'Hình dạng phức tạp và dung sai chặt chẽ cho các ứng dụng khắt khe.',
      },
      {
        titleEn: 'Multi-Layer Lamination',
        titleVi: 'Cán Nhiều Lớp',
        descEn: 'Bond multiple materials for enhanced performance.',
        descVi: 'Kết dính nhiều vật liệu để tăng hiệu suất.',
      },
      {
        titleEn: 'Custom Slitting',
        titleVi: 'Cắt Dọc Tùy chỉnh',
        descEn: 'Width tolerances to ±0.5mm for precise applications.',
        descVi: 'Dung sai chiều rộng đến ±0.5mm cho các ứng dụng chính xác.',
      },
      {
        titleEn: 'Quick Turnaround',
        titleVi: 'Xử lý Nhanh',
        descEn: 'Rapid prototyping and short-run production capabilities.',
        descVi: 'Khả năng tạo mẫu nhanh và sản xuất số lượng nhỏ.',
      },
    ],
    applications: [
      { en: 'Gaskets and seals', vi: 'Gioăng và phớt' },
      { en: 'EMI/RFI shielding', vi: 'Che chắn EMI/RFI' },
      { en: 'Thermal interface materials', vi: 'Vật liệu giao diện nhiệt' },
      { en: 'Display components', vi: 'Linh kiện màn hình' },
      { en: 'Insulation products', vi: 'Sản phẩm cách nhiệt' },
      { en: 'Protective films', vi: 'Màng bảo vệ' },
    ],
  },
  {
    id: 'custom-labeling',
    slug: 'custom-labeling',
    nameEn: 'Custom Labeling',
    nameVi: 'Nhãn Tùy chỉnh',
    metaDescEn:
      'Professional labeling solutions for industrial and commercial applications with premium quality.',
    metaDescVi:
      'Giải pháp dán nhãn chuyên nghiệp cho ứng dụng công nghiệp và thương mại với chất lượng cao cấp.',
    heroDescEn:
      'Create durable, professional labels that meet the strictest industry standards and regulatory requirements.',
    heroDescVi:
      'Tạo nhãn bền, chuyên nghiệp đáp ứng các tiêu chuẩn ngành và yêu cầu quy định nghiêm ngặt nhất.',
    imageSrc: '/images/services/CUSTOM LABELING.png',
    tags: ['Professional', 'Quality'],
    tagsVi: ['Chuyên nghiệp', 'Chất lượng'],
    features: [
      {
        titleEn: 'Barcode & QR Labels',
        titleVi: 'Nhãn Mã vạch & QR',
        descEn: 'High-resolution printing for reliable scanning.',
        descVi: 'In độ phân giải cao để quét đáng tin cậy.',
      },
      {
        titleEn: 'Chemical Resistant',
        titleVi: 'Chống Hóa chất',
        descEn: 'Materials that withstand harsh industrial environments.',
        descVi: 'Vật liệu chịu được môi trường công nghiệp khắc nghiệt.',
      },
      {
        titleEn: 'Variable Data Printing',
        titleVi: 'In Dữ liệu Biến đổi',
        descEn: 'Unique serialization and customization per label.',
        descVi: 'Số hóa và tùy chỉnh độc nhất cho mỗi nhãn.',
      },
      {
        titleEn: 'Certification Ready',
        titleVi: 'Sẵn sàng Chứng nhận',
        descEn: 'UL, CSA, and other regulatory-compliant options.',
        descVi: 'Các tùy chọn tuân thủ UL, CSA và các quy định khác.',
      },
    ],
    applications: [
      { en: 'Product identification', vi: 'Nhận dạng sản phẩm' },
      { en: 'Safety & warning labels', vi: 'Nhãn an toàn & cảnh báo' },
      { en: 'Asset tracking', vi: 'Theo dõi tài sản' },
      { en: 'Compliance labeling', vi: 'Nhãn tuân thủ' },
      { en: 'Brand labeling', vi: 'Nhãn thương hiệu' },
      { en: 'Inventory management', vi: 'Quản lý hàng tồn kho' },
    ],
  },
  {
    id: 'laser-die-cutting',
    slug: 'laser-die-cutting',
    nameEn: 'Laser & Die Cutting',
    nameVi: 'Cắt Laser & Khuôn',
    metaDescEn:
      'High-precision laser and die cutting services for complex shapes and specialty materials.',
    metaDescVi:
      'Dịch vụ cắt laser và khuôn độ chính xác cao cho hình dạng phức tạp và vật liệu đặc biệt.',
    heroDescEn:
      'Achieve unmatched precision and versatility with our advanced laser and die cutting technologies.',
    heroDescVi:
      'Đạt được độ chính xác và tính linh hoạt vượt trội với công nghệ cắt laser và khuôn tiên tiến của chúng tôi.',
    imageSrc: '/images/services/laser_die cutting.png',
    tags: ['High-Precision', 'Advanced'],
    tagsVi: ['Độ chính xác cao', 'Tiên tiến'],
    features: [
      {
        titleEn: 'Extreme Tolerance',
        titleVi: 'Dung sai Cực nhỏ',
        descEn: 'Achieve ±0.1mm tolerances for critical applications.',
        descVi: 'Đạt dung sai ±0.1mm cho các ứng dụng quan trọng.',
      },
      {
        titleEn: 'Complex Geometries',
        titleVi: 'Hình học Phức tạp',
        descEn: 'Cut intricate patterns impossible with traditional methods.',
        descVi: 'Cắt các mẫu phức tạp không thể thực hiện với phương pháp truyền thống.',
      },
      {
        titleEn: 'Rapid Prototyping',
        titleVi: 'Tạo mẫu Nhanh',
        descEn: 'From design to prototype in hours, not days.',
        descVi: 'Từ thiết kế đến mẫu thử trong vài giờ, không phải vài ngày.',
      },
      {
        titleEn: 'Scalable Production',
        titleVi: 'Sản xuất Có thể mở rộng',
        descEn: 'Seamlessly transition from prototypes to high-volume runs.',
        descVi: 'Chuyển đổi liền mạch từ mẫu thử sang sản xuất số lượng lớn.',
      },
    ],
    applications: [
      { en: 'Precision gaskets', vi: 'Gioăng chính xác' },
      { en: 'Electronic components', vi: 'Linh kiện điện tử' },
      { en: 'Aerospace parts', vi: 'Linh kiện hàng không vũ trụ' },
      { en: 'Medical device components', vi: 'Linh kiện thiết bị y tế' },
      { en: 'Automotive trim', vi: 'Viền ô tô' },
      { en: 'Industrial seals', vi: 'Phớt công nghiệp' },
    ],
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
  const tags = isVi ? service.tagsVi : service.tags;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ce-gradient py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-10 [background-size:24px_24px]" />

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
              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{name}</h1>
              <p className="text-lg text-white/80 md:text-xl">{heroDesc}</p>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
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

      {/* Features Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="ce-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Tính năng & Khả năng' : 'Features & Capabilities'}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {isVi
                ? 'Khám phá những gì làm cho dịch vụ của chúng tôi trở nên xuất sắc'
                : 'Discover what makes our service exceptional'}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {service.features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:border-ce-primary/20 hover:shadow-lg lg:p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ce-primary/10 transition-colors group-hover:bg-ce-primary">
                  <CheckCircle2 className="h-6 w-6 text-ce-primary transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-ce-primary-800">
                  {isVi ? feature.titleVi : feature.titleEn}
                </h3>
                <p className="text-muted-foreground">{isVi ? feature.descVi : feature.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="bg-ce-neutral-20 py-20">
        <div className="ce-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl">
                {isVi ? 'Ứng dụng' : 'Applications'}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {isVi
                  ? 'Dịch vụ của chúng tôi phục vụ nhiều ngành công nghiệp và ứng dụng đa dạng.'
                  : 'Our service serves a wide range of industries and diverse applications.'}
              </p>

              <ul className="grid gap-3 sm:grid-cols-2">
                {service.applications.map((app, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-ce-accent-teal" />
                    <span>{isVi ? app.vi : app.en}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Card */}
            <div className="rounded-2xl bg-white p-8 shadow-lg lg:p-10">
              <h3 className="mb-4 text-2xl font-bold text-ce-primary-800">
                {isVi ? 'Sẵn sàng bắt đầu?' : 'Ready to get started?'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {isVi
                  ? 'Liên hệ với đội ngũ chuyên gia của chúng tôi để thảo luận về dự án của bạn.'
                  : 'Contact our expert team to discuss your project requirements.'}
              </p>

              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-ce-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-ce-primary-600 hover:shadow-lg"
                >
                  {isVi ? 'Yêu cầu báo giá' : 'Request a Quote'}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-center">
                  <a
                    href="tel:+84123456789"
                    className="flex items-center justify-center gap-2 hover:text-ce-primary"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+84 123 456 789</span>
                  </a>
                  <a
                    href="mailto:info@ce-vietnam.com"
                    className="flex items-center justify-center gap-2 hover:text-ce-primary"
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

      {/* Navigation */}
      <section className="border-t bg-white py-10">
        <div className="ce-container">
          <div className="flex items-center justify-between">
            {prevService ? (
              <Link
                href={`/services/${prevService.slug}`}
                className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-ce-primary"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm">{isVi ? prevService.nameVi : prevService.nameEn}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextService ? (
              <Link
                href={`/services/${nextService.slug}`}
                className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-ce-primary"
              >
                <span className="text-sm">{isVi ? nextService.nameVi : nextService.nameEn}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
