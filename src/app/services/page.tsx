import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Services - Creative Engineering',
  description:
    'Explore our comprehensive industrial services including Mix & Dispensing, Converting Services, Custom Labeling, and Laser & Die Cutting.',
};

// Service data with full details
const servicesData = [
  {
    id: 'mix-dispensing',
    slug: 'mix-dispensing',
    nameEn: 'Mix & Dispensing',
    nameVi: 'Trộn & Phân phối',
    shortDescEn: 'Precision mixing and dispensing solutions for adhesives, sealants, and coatings.',
    shortDescVi: 'Giải pháp trộn và phân phối chính xác cho keo dán, chất bịt kín và lớp phủ.',
    longDescEn:
      'Our advanced mix and dispensing systems deliver precise, repeatable results for a wide range of industrial applications. From single-component to multi-component systems, we provide automated solutions that increase productivity and reduce waste.',
    longDescVi:
      'Hệ thống trộn và phân phối tiên tiến của chúng tôi mang lại kết quả chính xác, có thể lặp lại cho nhiều ứng dụng công nghiệp. Từ hệ thống một thành phần đến nhiều thành phần, chúng tôi cung cấp giải pháp tự động hóa giúp tăng năng suất và giảm lãng phí.',
    imageSrc: '/images/services/MIX_DISPENSING1.png',
    tags: ['Precision', 'Automation'],
    tagsVi: ['Chính xác', 'Tự động hóa'],
    features: [
      { en: 'Automated dispensing systems', vi: 'Hệ thống phân phối tự động' },
      { en: 'Multi-component mixing', vi: 'Trộn đa thành phần' },
      { en: 'Volume accuracy ±1%', vi: 'Độ chính xác thể tích ±1%' },
      { en: 'Real-time monitoring', vi: 'Giám sát thời gian thực' },
    ],
  },
  {
    id: 'converting-services',
    slug: 'converting-services',
    nameEn: 'Converting Services',
    nameVi: 'Dịch vụ Chuyển đổi',
    shortDescEn: 'Custom converting solutions for tapes, films, and flexible materials.',
    shortDescVi: 'Giải pháp gia công chuyển đổi cho băng keo, màng và vật liệu linh hoạt.',
    longDescEn:
      'We specialize in precision converting of adhesive tapes, films, foams, and other flexible materials. Our state-of-the-art equipment handles complex die-cutting, slitting, and laminating requirements with exceptional accuracy.',
    longDescVi:
      'Chúng tôi chuyên gia công chuyển đổi băng keo, màng, xốp và các vật liệu linh hoạt khác với độ chính xác cao. Thiết bị hiện đại của chúng tôi xử lý các yêu cầu cắt khuôn, cắt dọc và cán màng phức tạp.',
    imageSrc: '/images/services/CONVERTING SERVICES.png',
    tags: ['Custom', 'Flexible'],
    tagsVi: ['Tùy chỉnh', 'Linh hoạt'],
    features: [
      { en: 'Precision die-cutting', vi: 'Cắt khuôn chính xác' },
      { en: 'Multi-layer lamination', vi: 'Cán nhiều lớp' },
      { en: 'Custom shapes & sizes', vi: 'Hình dạng & kích thước tùy chỉnh' },
      { en: 'Quick turnaround', vi: 'Thời gian xử lý nhanh' },
    ],
  },
  {
    id: 'custom-labeling',
    slug: 'custom-labeling',
    nameEn: 'Custom Labeling',
    nameVi: 'Nhãn Tùy chỉnh',
    shortDescEn: 'Professional labeling solutions for industrial and commercial applications.',
    shortDescVi: 'Giải pháp dán nhãn chuyên nghiệp cho ứng dụng công nghiệp và thương mại.',
    longDescEn:
      'From product identification to safety compliance, our custom labeling services meet the highest industry standards. We offer durable materials, precise printing, and application solutions for any environment.',
    longDescVi:
      'Từ nhận dạng sản phẩm đến tuân thủ an toàn, dịch vụ dán nhãn tùy chỉnh của chúng tôi đáp ứng các tiêu chuẩn ngành cao nhất. Chúng tôi cung cấp vật liệu bền, in chính xác và giải pháp ứng dụng cho mọi môi trường.',
    imageSrc: '/images/services/CUSTOM LABELING.png',
    tags: ['Professional', 'Quality'],
    tagsVi: ['Chuyên nghiệp', 'Chất lượng'],
    features: [
      { en: 'Barcode & QR labels', vi: 'Nhãn mã vạch & QR' },
      { en: 'Chemical resistant', vi: 'Chống hóa chất' },
      { en: 'Variable data printing', vi: 'In dữ liệu biến đổi' },
      { en: 'UL/CSA certified', vi: 'Chứng nhận UL/CSA' },
    ],
  },
  {
    id: 'laser-die-cutting',
    slug: 'laser-die-cutting',
    nameEn: 'Laser & Die Cutting',
    nameVi: 'Cắt Laser & Khuôn',
    shortDescEn: 'High-precision laser and die cutting for complex shapes and materials.',
    shortDescVi: 'Cắt laser và khuôn độ chính xác cao cho hình dạng và vật liệu phức tạp.',
    longDescEn:
      'Our advanced laser and die cutting capabilities handle the most demanding precision requirements. From prototypes to high-volume production, we deliver consistent quality across metals, plastics, foams, and composites.',
    longDescVi:
      'Khả năng cắt laser và khuôn tiên tiến của chúng tôi xử lý các yêu cầu chính xác khắt khe nhất. Từ mẫu thử đến sản xuất số lượng lớn, chúng tôi đảm bảo chất lượng đồng nhất trên kim loại, nhựa, xốp và vật liệu composite.',
    imageSrc: '/images/services/laser_die cutting.png',
    tags: ['High-Precision', 'Advanced'],
    tagsVi: ['Độ chính xác cao', 'Tiên tiến'],
    features: [
      { en: 'Tolerance ±0.1mm', vi: 'Dung sai ±0.1mm' },
      { en: 'Complex geometries', vi: 'Hình học phức tạp' },
      { en: 'Rapid prototyping', vi: 'Tạo mẫu nhanh' },
      { en: 'High-volume production', vi: 'Sản xuất số lượng lớn' },
    ],
  },
];

export default async function ServicesPage() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const isVi = locale.toLowerCase().startsWith('vi');

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ce-gradient py-20 lg:py-28">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] opacity-10 [background-size:24px_24px]" />

        <div className="ce-container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              {isVi ? 'Năng lực của chúng tôi' : 'Our Capabilities'}
            </span>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {isVi ? 'Dịch Vụ' : 'Our Services'}
            </h1>
            <p className="text-lg text-white/80 md:text-xl">
              {isVi
                ? 'Giải pháp công nghiệp toàn diện được thiết kế riêng cho nhu cầu của bạn'
                : 'Comprehensive industrial solutions tailored to your needs'}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative bg-white py-20 lg:py-28">
        <div className="ce-container">
          <div className="space-y-20 lg:space-y-28">
            {servicesData.map((service, index) => {
              const name = isVi ? service.nameVi : service.nameEn;
              const shortDesc = isVi ? service.shortDescVi : service.shortDescEn;
              const longDesc = isVi ? service.longDescVi : service.longDescEn;
              const tags = isVi ? service.tagsVi : service.tags;
              const isReversed = index % 2 === 1;

              return (
                <div
                  key={service.id}
                  className={`flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 ${
                    isReversed ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative lg:w-1/2">
                    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                      <Image
                        src={service.imageSrc}
                        alt={name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Tags */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ce-primary-700 backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2">
                    <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.15em] text-ce-primary">
                      {isVi ? `Dịch vụ #${index + 1}` : `Service #${index + 1}`}
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl">
                      {name}
                    </h2>
                    <p className="mb-4 text-lg text-muted-foreground">{shortDesc}</p>
                    <p className="mb-6 text-base leading-relaxed text-muted-foreground/80">
                      {longDesc}
                    </p>

                    {/* Features */}
                    <ul className="mb-8 grid gap-3 sm:grid-cols-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-ce-accent-teal" />
                          <span>{isVi ? feature.vi : feature.en}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      href={`/services/${service.slug}`}
                      className="group/btn inline-flex items-center gap-2 rounded-full bg-ce-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-ce-primary-600 hover:shadow-lg"
                    >
                      <span>{isVi ? 'Tìm hiểu thêm' : 'Learn more'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ce-neutral-20 py-20">
        <div className="ce-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-ce-primary-800 md:text-4xl">
              {isVi ? 'Bắt đầu dự án của bạn' : 'Start Your Project'}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {isVi
                ? 'Liên hệ với chúng tôi để thảo luận về nhu cầu cụ thể của bạn và khám phá cách chúng tôi có thể giúp đỡ.'
                : 'Contact us to discuss your specific requirements and discover how we can help.'}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ce-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-ce-primary-600 hover:shadow-lg"
              >
                {isVi ? 'Liên hệ ngay' : 'Contact Us'}
              </Link>
              <Link
                href="/menu/product"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ce-primary bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-ce-primary transition-all duration-300 hover:bg-ce-primary hover:text-white"
              >
                {isVi ? 'Xem sản phẩm' : 'View Products'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
