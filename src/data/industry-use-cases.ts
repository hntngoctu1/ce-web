// Professional Use Cases for Industries
// Creative Engineering Vietnam - Since 1999

export interface UseCase {
  id: string;
  industrySlug: string;
  titleEn: string;
  titleVi: string;
  clientEn: string;
  clientVi: string;
  industryTagEn: string;
  industryTagVi: string;
  challengeEn: string;
  challengeVi: string;
  solutionEn: string;
  solutionVi: string;
  resultsEn: string[];
  resultsVi: string[];
  statsEn: { label: string; value: string }[];
  statsVi: { label: string; value: string }[];
  testimonialEn?: string;
  testimonialVi?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  image: string;
  featured: boolean;
}

export const useCases: UseCase[] = [
  // ========== INDUSTRIAL TAPES ==========
  {
    id: 'tape-automotive-1',
    industrySlug: 'industrial-tapes',
    titleEn: 'Automotive Assembly Line Optimization',
    titleVi: 'Tối Ưu Hóa Dây Chuyền Lắp Ráp Ô Tô',
    clientEn: 'Leading Vietnamese Automotive Manufacturer',
    clientVi: 'Nhà Sản Xuất Ô Tô Hàng Đầu Việt Nam',
    industryTagEn: 'Automotive',
    industryTagVi: 'Ô tô',
    challengeEn:
      'The client faced recurring quality issues with traditional mechanical fasteners in interior trim assembly. Visible screws affected aesthetics, and the installation process was time-consuming, creating bottlenecks in the production line.',
    challengeVi:
      'Khách hàng gặp các vấn đề chất lượng với ốc vít truyền thống trong lắp ráp nội thất. Ốc vít lộ ảnh hưởng thẩm mỹ, và quy trình lắp đặt tốn thời gian, tạo điểm nghẽn trong dây chuyền sản xuất.',
    solutionEn:
      'We implemented 3M VHB (Very High Bond) double-sided acrylic foam tape solution, replacing 80% of mechanical fasteners. Our engineering team conducted extensive testing for temperature cycling (-40°C to +85°C) and long-term durability.',
    solutionVi:
      'Chúng tôi triển khai giải pháp băng keo xốp acrylic hai mặt 3M VHB (Very High Bond), thay thế 80% ốc vít cơ khí. Đội ngũ kỹ sư tiến hành thử nghiệm chu kỳ nhiệt (-40°C đến +85°C) và độ bền lâu dài.',
    resultsEn: [
      'Assembly time reduced by 45% per vehicle',
      'Zero warranty claims related to trim detachment after 18 months',
      'Improved interior aesthetics with seamless finish',
      'Annual cost savings of $120,000 in fastener materials',
    ],
    resultsVi: [
      'Giảm 45% thời gian lắp ráp mỗi xe',
      'Không có khiếu nại bảo hành về tách nội thất sau 18 tháng',
      'Cải thiện thẩm mỹ nội thất với bề mặt liền mạch',
      'Tiết kiệm $120,000/năm chi phí vật liệu',
    ],
    statsEn: [
      { label: 'Time Saved', value: '45%' },
      { label: 'Cost Reduction', value: '$120K/yr' },
      { label: 'Defect Rate', value: '0%' },
    ],
    statsVi: [
      { label: 'Tiết kiệm thời gian', value: '45%' },
      { label: 'Giảm chi phí', value: '$120K/năm' },
      { label: 'Tỷ lệ lỗi', value: '0%' },
    ],
    testimonialEn:
      'Creative Engineering\'s tape solution transformed our assembly process. The technical support and on-site training made the transition seamless.',
    testimonialVi:
      'Giải pháp băng keo của Creative Engineering đã biến đổi quy trình lắp ráp của chúng tôi. Hỗ trợ kỹ thuật và đào tạo tại chỗ giúp chuyển đổi suôn sẻ.',
    testimonialAuthor: 'Mr. Nguyen Van A',
    testimonialRole: 'Production Manager',
    image: '/images/industries_img/Industrial Tapes.png',
    featured: true,
  },
  {
    id: 'tape-electronics-2',
    industrySlug: 'industrial-tapes',
    titleEn: 'Smartphone Display Bonding Excellence',
    titleVi: 'Xuất Sắc Trong Kết Dính Màn Hình Smartphone',
    clientEn: 'Major Electronics Assembly Plant',
    clientVi: 'Nhà Máy Lắp Ráp Điện Tử Lớn',
    industryTagEn: 'Electronics',
    industryTagVi: 'Điện tử',
    challengeEn:
      'High-volume smartphone production required ultra-thin bonding solutions that could withstand drop tests, provide optical clarity, and allow for easy rework during quality control.',
    challengeVi:
      'Sản xuất smartphone số lượng lớn đòi hỏi giải pháp kết dính siêu mỏng chịu được thử nghiệm rơi, trong suốt quang học, và cho phép sửa chữa dễ dàng trong kiểm soát chất lượng.',
    solutionEn:
      'We supplied tesa® 61395 optically clear adhesive tape with automated dispensing integration. Our team optimized the lamination process parameters for maximum yield.',
    solutionVi:
      'Chúng tôi cung cấp băng keo trong suốt quang học tesa® 61395 tích hợp với hệ thống phân phối tự động. Đội ngũ tối ưu hóa thông số quy trình ép để đạt năng suất tối đa.',
    resultsEn: [
      'Optical transmission increased to 99.5%',
      'Rework rate reduced from 8% to 1.2%',
      'Production speed increased by 30%',
      'Passed all drop test requirements (1.5m on concrete)',
    ],
    resultsVi: [
      'Truyền dẫn quang học đạt 99.5%',
      'Tỷ lệ sửa chữa giảm từ 8% xuống 1.2%',
      'Tốc độ sản xuất tăng 30%',
      'Đạt tất cả yêu cầu thử nghiệm rơi (1.5m trên bê tông)',
    ],
    statsEn: [
      { label: 'Optical Clarity', value: '99.5%' },
      { label: 'Rework Rate', value: '1.2%' },
      { label: 'Speed Increase', value: '30%' },
    ],
    statsVi: [
      { label: 'Độ trong suốt', value: '99.5%' },
      { label: 'Tỷ lệ sửa chữa', value: '1.2%' },
      { label: 'Tăng tốc độ', value: '30%' },
    ],
    image: '/images/industries_img/Industrial Tapes.png',
    featured: false,
  },
  {
    id: 'tape-construction-3',
    industrySlug: 'industrial-tapes',
    titleEn: 'High-Rise Facade Protection System',
    titleVi: 'Hệ Thống Bảo Vệ Mặt Tiền Cao Ốc',
    clientEn: 'International Construction Company',
    clientVi: 'Công Ty Xây Dựng Quốc Tế',
    industryTagEn: 'Construction',
    industryTagVi: 'Xây dựng',
    challengeEn:
      'A 45-story building project required reliable surface protection during construction that could withstand tropical weather conditions for 18+ months while leaving no residue upon removal.',
    challengeVi:
      'Dự án tòa nhà 45 tầng cần bảo vệ bề mặt đáng tin cậy trong quá trình xây dựng, chịu được thời tiết nhiệt đới 18+ tháng và không để lại cặn khi tháo.',
    solutionEn:
      'We provided a customized protective film solution with UV-resistant adhesive technology. Our converting service delivered pre-cut sheets matching window dimensions.',
    solutionVi:
      'Chúng tôi cung cấp giải pháp màng bảo vệ tùy chỉnh với công nghệ keo chống UV. Dịch vụ gia công cắt sẵn theo kích thước cửa sổ.',
    resultsEn: [
      '100% of glass surfaces protected throughout construction',
      'Zero surface damage claims',
      'Clean removal after 20 months of exposure',
      'Reduced cleaning costs by 60% post-construction',
    ],
    resultsVi: [
      '100% bề mặt kính được bảo vệ trong suốt quá trình xây dựng',
      'Không có khiếu nại hư hại bề mặt',
      'Tháo sạch sau 20 tháng tiếp xúc',
      'Giảm 60% chi phí vệ sinh sau xây dựng',
    ],
    statsEn: [
      { label: 'Protection', value: '100%' },
      { label: 'Duration', value: '20 months' },
      { label: 'Cleaning Savings', value: '60%' },
    ],
    statsVi: [
      { label: 'Bảo vệ', value: '100%' },
      { label: 'Thời gian', value: '20 tháng' },
      { label: 'Tiết kiệm vệ sinh', value: '60%' },
    ],
    image: '/images/industries_img/Industrial Tapes.png',
    featured: false,
  },

  // ========== AUTOMATIC ROBOTIC DOSING ==========
  {
    id: 'dosing-automotive-1',
    industrySlug: 'automatic-dosing',
    titleEn: 'Automated Sealant Application for EV Battery Packs',
    titleVi: 'Ứng Dụng Chất Bịt Tự Động cho Pin Xe Điện',
    clientEn: 'Electric Vehicle Battery Manufacturer',
    clientVi: 'Nhà Sản Xuất Pin Xe Điện',
    industryTagEn: 'EV / Automotive',
    industryTagVi: 'Xe điện / Ô tô',
    challengeEn:
      'Manual sealant application for battery pack housings resulted in inconsistent bead profiles, material waste, and potential thermal management issues. The client needed a solution for their new high-volume EV battery production line.',
    challengeVi:
      'Tra chất bịt thủ công cho vỏ pin dẫn đến biên dạng đường gợn không đồng nhất, lãng phí vật liệu và các vấn đề quản lý nhiệt tiềm ẩn. Khách hàng cần giải pháp cho dây chuyền sản xuất pin EV số lượng lớn mới.',
    solutionEn:
      'We integrated a Graco dispensing system with a 6-axis robot, featuring precision volumetric control and vision-guided path correction. The system handles thermal gap fillers with viscosities up to 800,000 cPs.',
    solutionVi:
      'Chúng tôi tích hợp hệ thống phân phối Graco với robot 6 trục, trang bị điều khiển thể tích chính xác và hiệu chỉnh đường đi bằng thị giác. Hệ thống xử lý chất lấp khe nhiệt với độ nhớt đến 800,000 cPs.',
    resultsEn: [
      'Bead consistency improved to ±0.5% tolerance',
      'Material waste reduced by 35%',
      'Cycle time reduced from 8 minutes to 2.5 minutes',
      'Thermal performance improved by 20% due to consistent gap filling',
    ],
    resultsVi: [
      'Độ đồng nhất đường gợn cải thiện đến dung sai ±0.5%',
      'Giảm 35% lãng phí vật liệu',
      'Giảm thời gian chu kỳ từ 8 phút xuống 2.5 phút',
      'Hiệu suất nhiệt cải thiện 20% nhờ lấp khe đồng nhất',
    ],
    statsEn: [
      { label: 'Accuracy', value: '±0.5%' },
      { label: 'Cycle Time', value: '2.5 min' },
      { label: 'Material Savings', value: '35%' },
    ],
    statsVi: [
      { label: 'Độ chính xác', value: '±0.5%' },
      { label: 'Thời gian chu kỳ', value: '2.5 phút' },
      { label: 'Tiết kiệm vật liệu', value: '35%' },
    ],
    testimonialEn:
      'The precision dosing system from CE exceeded our expectations. Their engineering team understood our thermal management requirements and delivered a turnkey solution.',
    testimonialVi:
      'Hệ thống định lượng chính xác từ CE vượt quá mong đợi. Đội ngũ kỹ sư hiểu yêu cầu quản lý nhiệt và cung cấp giải pháp trọn gói.',
    testimonialAuthor: 'Dr. Tran Minh B',
    testimonialRole: 'R&D Director',
    image: '/images/industries_img/Automatic Robotic Dosing Equipment.png',
    featured: true,
  },
  {
    id: 'dosing-electronics-2',
    industrySlug: 'automatic-dosing',
    titleEn: 'LED Module Encapsulation Automation',
    titleVi: 'Tự Động Hóa Bọc Kín Module LED',
    clientEn: 'LED Lighting Manufacturer',
    clientVi: 'Nhà Sản Xuất Đèn LED',
    industryTagEn: 'LED / Lighting',
    industryTagVi: 'LED / Chiếu sáng',
    challengeEn:
      'High-power LED modules required precise silicone encapsulation for thermal management and environmental protection. Manual dispensing caused air bubbles and inconsistent coverage, leading to early failures.',
    challengeVi:
      'Module LED công suất cao cần bọc silicone chính xác để quản lý nhiệt và bảo vệ môi trường. Tra thủ công gây ra bọt khí và độ phủ không đồng nhất, dẫn đến hỏng sớm.',
    solutionEn:
      'We deployed a bench-top dispensing system with vacuum degassing, metered mixing, and programmable dispensing patterns. The system handles both dam-and-fill and conformal coating applications.',
    solutionVi:
      'Chúng tôi triển khai hệ thống phân phối bàn với khử khí chân không, trộn định lượng và các mẫu phân phối có thể lập trình. Hệ thống xử lý cả ứng dụng đổ đê và phủ bảo vệ.',
    resultsEn: [
      'Air bubble defects eliminated (from 5% to 0%)',
      'LED lifespan increased by 40% due to better thermal dissipation',
      'Production output increased from 500 to 1,200 units per shift',
      'Material usage optimized with 25% reduction',
    ],
    resultsVi: [
      'Loại bỏ lỗi bọt khí (từ 5% xuống 0%)',
      'Tuổi thọ LED tăng 40% nhờ tản nhiệt tốt hơn',
      'Năng suất tăng từ 500 lên 1,200 đơn vị mỗi ca',
      'Tối ưu hóa sử dụng vật liệu giảm 25%',
    ],
    statsEn: [
      { label: 'Defects', value: '0%' },
      { label: 'LED Lifespan', value: '+40%' },
      { label: 'Output/Shift', value: '1,200' },
    ],
    statsVi: [
      { label: 'Lỗi', value: '0%' },
      { label: 'Tuổi thọ LED', value: '+40%' },
      { label: 'Sản lượng/ca', value: '1,200' },
    ],
    image: '/images/industries_img/Automatic Robotic Dosing Equipment.png',
    featured: false,
  },
  {
    id: 'dosing-medical-3',
    industrySlug: 'automatic-dosing',
    titleEn: 'Medical Device Adhesive Dispensing',
    titleVi: 'Phân Phối Keo cho Thiết Bị Y Tế',
    clientEn: 'Medical Device Manufacturer',
    clientVi: 'Nhà Sản Xuất Thiết Bị Y Tế',
    industryTagEn: 'Medical',
    industryTagVi: 'Y tế',
    challengeEn:
      'Precision dispensing of UV-curable adhesive for disposable medical device assembly required biocompatibility compliance, traceability, and zero contamination in cleanroom conditions.',
    challengeVi:
      'Phân phối chính xác keo UV-curable cho lắp ráp thiết bị y tế dùng một lần đòi hỏi tuân thủ tương thích sinh học, truy xuất nguồn gốc và không ô nhiễm trong phòng sạch.',
    solutionEn:
      'We provided a Class 100 cleanroom-compatible dispensing system with integrated UV curing, shot-size verification, and full process data logging for regulatory compliance.',
    solutionVi:
      'Chúng tôi cung cấp hệ thống phân phối tương thích phòng sạch Class 100 với UV curing tích hợp, xác minh kích thước shot và ghi dữ liệu quy trình đầy đủ cho tuân thủ quy định.',
    resultsEn: [
      'FDA and ISO 13485 compliance achieved',
      'Bond strength consistency: Cpk > 1.67',
      'Full traceability for every dispensed unit',
      'Contamination incidents reduced to zero',
    ],
    resultsVi: [
      'Đạt tuân thủ FDA và ISO 13485',
      'Độ đồng nhất độ bền liên kết: Cpk > 1.67',
      'Truy xuất đầy đủ cho mỗi đơn vị phân phối',
      'Giảm sự cố ô nhiễm về không',
    ],
    statsEn: [
      { label: 'Cpk', value: '> 1.67' },
      { label: 'Traceability', value: '100%' },
      { label: 'Contamination', value: '0' },
    ],
    statsVi: [
      { label: 'Cpk', value: '> 1.67' },
      { label: 'Truy xuất', value: '100%' },
      { label: 'Ô nhiễm', value: '0' },
    ],
    image: '/images/industries_img/Automatic Robotic Dosing Equipment.png',
    featured: false,
  },

  // ========== ELECTRONIC COATINGS ==========
  {
    id: 'coating-automotive-1',
    industrySlug: 'electronic-coatings',
    titleEn: 'Automotive ECU Conformal Coating',
    titleVi: 'Phủ Bảo Vệ ECU Ô Tô',
    clientEn: 'Tier-1 Automotive Supplier',
    clientVi: 'Nhà Cung Cấp Ô Tô Tier-1',
    industryTagEn: 'Automotive Electronics',
    industryTagVi: 'Điện tử ô tô',
    challengeEn:
      'Engine Control Units (ECUs) were failing in field conditions due to moisture ingress and thermal cycling. The existing coating process was manual, inconsistent, and couldn\'t meet AEC-Q100 reliability requirements.',
    challengeVi:
      'Các bộ điều khiển động cơ (ECU) bị hỏng trong điều kiện thực tế do thâm nhập ẩm và chu kỳ nhiệt. Quy trình phủ hiện tại thủ công, không đồng nhất và không đạt yêu cầu độ tin cậy AEC-Q100.',
    solutionEn:
      'We implemented selective conformal coating with Henkel LOCTITE ECCOBOND technology, featuring automated UV inspection and thermal cure optimization for high Tg performance.',
    solutionVi:
      'Chúng tôi triển khai phủ bảo vệ chọn lọc với công nghệ Henkel LOCTITE ECCOBOND, trang bị kiểm tra UV tự động và tối ưu hóa cure nhiệt cho hiệu suất Tg cao.',
    resultsEn: [
      'Field failure rate reduced by 85%',
      'AEC-Q100 Grade 1 qualification achieved',
      'Coating thickness consistency: ±5μm',
      'Production throughput increased 3x',
    ],
    resultsVi: [
      'Giảm 85% tỷ lệ hỏng thực tế',
      'Đạt chứng nhận AEC-Q100 Grade 1',
      'Độ đồng nhất độ dày phủ: ±5μm',
      'Tăng năng suất 3 lần',
    ],
    statsEn: [
      { label: 'Failure Reduction', value: '85%' },
      { label: 'Thickness', value: '±5μm' },
      { label: 'Throughput', value: '3x' },
    ],
    statsVi: [
      { label: 'Giảm hỏng', value: '85%' },
      { label: 'Độ dày', value: '±5μm' },
      { label: 'Năng suất', value: '3x' },
    ],
    testimonialEn:
      'CE\'s coating solution helped us achieve automotive-grade reliability. Their process expertise was invaluable for our AEC-Q100 qualification.',
    testimonialVi:
      'Giải pháp phủ của CE giúp chúng tôi đạt độ tin cậy cấp ô tô. Chuyên môn quy trình của họ vô giá cho chứng nhận AEC-Q100.',
    testimonialAuthor: 'Eng. Le Van C',
    testimonialRole: 'Quality Manager',
    image: '/images/industries_img/Electronic Surface Coatings.png',
    featured: true,
  },
  {
    id: 'coating-industrial-2',
    industrySlug: 'electronic-coatings',
    titleEn: 'Industrial Sensor Potting Solution',
    titleVi: 'Giải Pháp Đổ Khuôn Cảm Biến Công Nghiệp',
    clientEn: 'Sensor Manufacturing Company',
    clientVi: 'Công Ty Sản Xuất Cảm Biến',
    industryTagEn: 'Industrial Sensors',
    industryTagVi: 'Cảm biến công nghiệp',
    challengeEn:
      'Industrial pressure sensors deployed in harsh chemical environments were failing due to inadequate encapsulation. The existing epoxy potting cracked under thermal shock conditions.',
    challengeVi:
      'Cảm biến áp suất công nghiệp trong môi trường hóa chất khắc nghiệt bị hỏng do bọc kín không đầy đủ. Đổ khuôn epoxy hiện tại nứt dưới điều kiện sốc nhiệt.',
    solutionEn:
      'We developed a two-component polyurethane potting system with excellent chemical resistance and flexible cure profile. The solution included custom mold design for optimal stress distribution.',
    solutionVi:
      'Chúng tôi phát triển hệ thống đổ khuôn polyurethane hai thành phần với khả năng kháng hóa chất tuyệt vời và profile cure linh hoạt. Giải pháp bao gồm thiết kế khuôn tùy chỉnh cho phân bố ứng suất tối ưu.',
    resultsEn: [
      'Sensor lifespan extended from 2 years to 7+ years',
      'Chemical resistance to pH 2-12 range',
      'Thermal shock survival: -40°C to +125°C rapid cycling',
      'Warranty claims reduced by 90%',
    ],
    resultsVi: [
      'Tuổi thọ cảm biến tăng từ 2 năm lên 7+ năm',
      'Kháng hóa chất trong phạm vi pH 2-12',
      'Chịu sốc nhiệt: chu kỳ nhanh -40°C đến +125°C',
      'Giảm 90% khiếu nại bảo hành',
    ],
    statsEn: [
      { label: 'Lifespan', value: '7+ yrs' },
      { label: 'pH Range', value: '2-12' },
      { label: 'Warranty Claims', value: '-90%' },
    ],
    statsVi: [
      { label: 'Tuổi thọ', value: '7+ năm' },
      { label: 'Phạm vi pH', value: '2-12' },
      { label: 'Bảo hành', value: '-90%' },
    ],
    image: '/images/industries_img/Electronic Surface Coatings.png',
    featured: false,
  },
  {
    id: 'coating-power-3',
    industrySlug: 'electronic-coatings',
    titleEn: 'Power Electronics Thermal Management',
    titleVi: 'Quản Lý Nhiệt Điện Tử Công Suất',
    clientEn: 'Inverter Manufacturer',
    clientVi: 'Nhà Sản Xuất Biến Tần',
    industryTagEn: 'Power Electronics',
    industryTagVi: 'Điện tử công suất',
    challengeEn:
      'High-power IGBT modules in solar inverters required both conformal protection and effective thermal dissipation. Standard coatings created thermal barriers, reducing efficiency.',
    challengeVi:
      'Module IGBT công suất cao trong biến tần năng lượng mặt trời cần cả bảo vệ conformal và tản nhiệt hiệu quả. Lớp phủ tiêu chuẩn tạo rào cản nhiệt, giảm hiệu suất.',
    solutionEn:
      'We introduced a thermally conductive silicone coating system (3.5 W/mK) that provides both environmental protection and heat spreading. The solution included optimized application thickness for best thermal performance.',
    solutionVi:
      'Chúng tôi giới thiệu hệ thống phủ silicone dẫn nhiệt (3.5 W/mK) cung cấp cả bảo vệ môi trường và tản nhiệt. Giải pháp bao gồm độ dày ứng dụng tối ưu cho hiệu suất nhiệt tốt nhất.',
    resultsEn: [
      'Junction temperature reduced by 15°C',
      'Inverter efficiency improved by 0.8%',
      'IP65 protection rating achieved',
      'Module lifetime extended by 30%',
    ],
    resultsVi: [
      'Giảm nhiệt độ junction 15°C',
      'Hiệu suất biến tần cải thiện 0.8%',
      'Đạt xếp hạng bảo vệ IP65',
      'Tuổi thọ module tăng 30%',
    ],
    statsEn: [
      { label: 'Temp Reduction', value: '-15°C' },
      { label: 'Efficiency', value: '+0.8%' },
      { label: 'Protection', value: 'IP65' },
    ],
    statsVi: [
      { label: 'Giảm nhiệt', value: '-15°C' },
      { label: 'Hiệu suất', value: '+0.8%' },
      { label: 'Bảo vệ', value: 'IP65' },
    ],
    image: '/images/industries_img/Electronic Surface Coatings.png',
    featured: false,
  },

  // ========== WELDING EQUIPMENT ==========
  {
    id: 'welding-manufacturing-1',
    industrySlug: 'welding-equipment',
    titleEn: 'Steel Structure Fabrication Upgrade',
    titleVi: 'Nâng Cấp Chế Tạo Kết Cấu Thép',
    clientEn: 'Industrial Steel Fabricator',
    clientVi: 'Nhà Chế Tạo Thép Công Nghiệp',
    industryTagEn: 'Steel Fabrication',
    industryTagVi: 'Chế tạo thép',
    challengeEn:
      'Outdated welding equipment caused inconsistent weld quality, high spatter, and frequent downtime. The client needed to upgrade their fleet for a major infrastructure project with strict quality requirements.',
    challengeVi:
      'Thiết bị hàn lỗi thời gây chất lượng mối hàn không đồng nhất, bắn tóe nhiều và ngừng hoạt động thường xuyên. Khách hàng cần nâng cấp đội thiết bị cho dự án cơ sở hạ tầng lớn với yêu cầu chất lượng nghiêm ngặt.',
    solutionEn:
      'We supplied 15 units of Lincoln Electric Power Wave® machines with advanced waveform technology, combined with comprehensive operator training and welding procedure specification (WPS) development.',
    solutionVi:
      'Chúng tôi cung cấp 15 máy Lincoln Electric Power Wave® với công nghệ sóng tiên tiến, kết hợp đào tạo toàn diện cho vận hành viên và phát triển quy trình hàn (WPS).',
    resultsEn: [
      'First-pass weld acceptance rate improved from 78% to 96%',
      'Spatter reduced by 70%, cutting cleanup time',
      'Welder productivity increased by 40%',
      'Project completed 3 weeks ahead of schedule',
    ],
    resultsVi: [
      'Tỷ lệ chấp nhận hàn lần đầu tăng từ 78% lên 96%',
      'Giảm 70% bắn tóe, cắt giảm thời gian vệ sinh',
      'Năng suất thợ hàn tăng 40%',
      'Dự án hoàn thành sớm 3 tuần',
    ],
    statsEn: [
      { label: 'First-Pass', value: '96%' },
      { label: 'Spatter', value: '-70%' },
      { label: 'Productivity', value: '+40%' },
    ],
    statsVi: [
      { label: 'Lần đầu', value: '96%' },
      { label: 'Bắn tóe', value: '-70%' },
      { label: 'Năng suất', value: '+40%' },
    ],
    testimonialEn:
      'The new welding systems and CE\'s training program transformed our welding department. We met the most demanding project specs with confidence.',
    testimonialVi:
      'Hệ thống hàn mới và chương trình đào tạo của CE đã biến đổi bộ phận hàn. Chúng tôi đáp ứng các thông số dự án khắt khe nhất với tự tin.',
    testimonialAuthor: 'Mr. Pham Van D',
    testimonialRole: 'Operations Director',
    image: '/images/industries_img/Welding Machines and Accessories.png',
    featured: true,
  },
  {
    id: 'welding-automotive-2',
    industrySlug: 'welding-equipment',
    titleEn: 'Automotive Body Shop Spot Welding',
    titleVi: 'Hàn Điểm Xưởng Thân Xe Ô Tô',
    clientEn: 'Automotive Body Repair Chain',
    clientVi: 'Chuỗi Sửa Chữa Thân Xe Ô Tô',
    industryTagEn: 'Automotive Repair',
    industryTagVi: 'Sửa chữa ô tô',
    challengeEn:
      'Modern vehicles with high-strength steel and aluminum body panels required advanced spot welding capabilities. Existing equipment couldn\'t handle mixed-material repair work.',
    challengeVi:
      'Xe hiện đại với tấm thân thép cường độ cao và nhôm đòi hỏi khả năng hàn điểm tiên tiến. Thiết bị hiện tại không thể xử lý công việc sửa chữa vật liệu hỗn hợp.',
    solutionEn:
      'We provided Fronius Deltaspot systems with adaptive welding control, capable of joining ultra-high-strength steels up to 1,500 MPa and aluminum alloys with consistent quality.',
    solutionVi:
      'Chúng tôi cung cấp hệ thống Fronius Deltaspot với điều khiển hàn thích ứng, có khả năng nối thép siêu cường độ cao đến 1,500 MPa và hợp kim nhôm với chất lượng đồng nhất.',
    resultsEn: [
      'Capability to repair 95% of modern vehicle models',
      'Weld strength meets OEM specifications',
      'Repair time reduced by 25%',
      'Customer satisfaction scores increased by 15 points',
    ],
    resultsVi: [
      'Khả năng sửa chữa 95% mẫu xe hiện đại',
      'Độ bền mối hàn đạt thông số OEM',
      'Giảm 25% thời gian sửa chữa',
      'Điểm hài lòng khách hàng tăng 15 điểm',
    ],
    statsEn: [
      { label: 'Vehicle Coverage', value: '95%' },
      { label: 'Repair Time', value: '-25%' },
      { label: 'CSAT', value: '+15 pts' },
    ],
    statsVi: [
      { label: 'Phạm vi xe', value: '95%' },
      { label: 'Thời gian', value: '-25%' },
      { label: 'CSAT', value: '+15 điểm' },
    ],
    image: '/images/industries_img/Welding Machines and Accessories.png',
    featured: false,
  },
  {
    id: 'welding-shipyard-3',
    industrySlug: 'welding-equipment',
    titleEn: 'Shipyard TIG Welding Excellence',
    titleVi: 'Xuất Sắc Hàn TIG Đóng Tàu',
    clientEn: 'Vietnamese Shipbuilding Company',
    clientVi: 'Công Ty Đóng Tàu Việt Nam',
    industryTagEn: 'Shipbuilding',
    industryTagVi: 'Đóng tàu',
    challengeEn:
      'High-quality TIG welding for stainless steel piping systems in chemical tankers required consistent results across a large welding team with varying skill levels.',
    challengeVi:
      'Hàn TIG chất lượng cao cho hệ thống đường ống thép không gỉ trong tàu chở hóa chất đòi hỏi kết quả đồng nhất với đội thợ hàn lớn có trình độ khác nhau.',
    solutionEn:
      'We deployed Miller Dynasty TIG welders with Pro-Set™ technology that automatically sets optimal parameters. Combined with consumables supply and AWS D1.6 training certification.',
    solutionVi:
      'Chúng tôi triển khai máy hàn TIG Miller Dynasty với công nghệ Pro-Set™ tự động cài đặt thông số tối ưu. Kết hợp với cung cấp vật tư tiêu hao và chứng nhận đào tạo AWS D1.6.',
    resultsEn: [
      'X-ray pass rate improved from 85% to 98%',
      'Training time for new welders reduced by 50%',
      'Argon gas consumption reduced by 20%',
      'Lloyd\'s classification approval achieved',
    ],
    resultsVi: [
      'Tỷ lệ đạt X-ray tăng từ 85% lên 98%',
      'Giảm 50% thời gian đào tạo thợ hàn mới',
      'Giảm 20% tiêu thụ khí Argon',
      'Đạt phê duyệt phân cấp Lloyd\'s',
    ],
    statsEn: [
      { label: 'X-Ray Pass', value: '98%' },
      { label: 'Training Time', value: '-50%' },
      { label: 'Gas Savings', value: '20%' },
    ],
    statsVi: [
      { label: 'Đạt X-Ray', value: '98%' },
      { label: 'Đào tạo', value: '-50%' },
      { label: 'Tiết kiệm gas', value: '20%' },
    ],
    image: '/images/industries_img/Welding Machines and Accessories.png',
    featured: false,
  },

  // ========== SILICONE RUBBER ==========
  {
    id: 'silicone-food-1',
    industrySlug: 'silicone-rubber',
    titleEn: 'Food Processing Conveyor Seals',
    titleVi: 'Gioăng Băng Tải Chế Biến Thực Phẩm',
    clientEn: 'Major Food & Beverage Manufacturer',
    clientVi: 'Nhà Sản Xuất Thực Phẩm & Đồ Uống Lớn',
    industryTagEn: 'Food & Beverage',
    industryTagVi: 'Thực phẩm & Đồ uống',
    challengeEn:
      'Conveyor seals in high-temperature sterilization zones degraded quickly, causing production stoppages and contamination risks. Existing rubber gaskets failed after only 3 months of operation.',
    challengeVi:
      'Gioăng băng tải trong vùng tiệt trùng nhiệt độ cao xuống cấp nhanh, gây dừng sản xuất và rủi ro ô nhiễm. Gioăng cao su hiện tại hỏng chỉ sau 3 tháng vận hành.',
    solutionEn:
      'We supplied FDA-compliant VMQ silicone gaskets with custom profiles, designed for continuous operation at 180°C and resistant to cleaning chemicals.',
    solutionVi:
      'Chúng tôi cung cấp gioăng silicone VMQ đạt chuẩn FDA với profile tùy chỉnh, thiết kế cho vận hành liên tục ở 180°C và kháng hóa chất vệ sinh.',
    resultsEn: [
      'Gasket lifespan extended to 18+ months',
      'Zero contamination incidents',
      'Maintenance downtime reduced by 70%',
      'Passed all FDA and HACCP audits',
    ],
    resultsVi: [
      'Tuổi thọ gioăng tăng lên 18+ tháng',
      'Không có sự cố ô nhiễm',
      'Giảm 70% thời gian bảo trì',
      'Đạt tất cả kiểm toán FDA và HACCP',
    ],
    statsEn: [
      { label: 'Lifespan', value: '18+ mo' },
      { label: 'Downtime', value: '-70%' },
      { label: 'Contamination', value: '0' },
    ],
    statsVi: [
      { label: 'Tuổi thọ', value: '18+ tháng' },
      { label: 'Dừng máy', value: '-70%' },
      { label: 'Ô nhiễm', value: '0' },
    ],
    image: '/images/industries_img/Virgin Silicone Rubber.png',
    featured: true,
  },
  {
    id: 'silicone-medical-2',
    industrySlug: 'silicone-rubber',
    titleEn: 'Medical Device Sealing Components',
    titleVi: 'Linh Kiện Làm Kín Thiết Bị Y Tế',
    clientEn: 'Medical Equipment Manufacturer',
    clientVi: 'Nhà Sản Xuất Thiết Bị Y Tế',
    industryTagEn: 'Medical Devices',
    industryTagVi: 'Thiết bị y tế',
    challengeEn:
      'Precision sealing components for dialysis machines required biocompatibility, autoclave resistance, and extremely tight tolerances for fluid control.',
    challengeVi:
      'Linh kiện làm kín chính xác cho máy lọc thận đòi hỏi tương thích sinh học, chịu được hấp tiệt trùng và dung sai cực kỳ chặt cho kiểm soát chất lỏng.',
    solutionEn:
      'We developed platinum-cured LSR (Liquid Silicone Rubber) components with ISO 10993 biocompatibility certification. Custom molding achieved tolerances of ±0.05mm.',
    solutionVi:
      'Chúng tôi phát triển linh kiện LSR (Cao Su Silicone Lỏng) đóng rắn platinum với chứng nhận tương thích sinh học ISO 10993. Đúc tùy chỉnh đạt dung sai ±0.05mm.',
    resultsEn: [
      'ISO 10993 biocompatibility certified',
      'Withstands 500+ autoclave cycles',
      'Zero fluid leakage in quality testing',
      'Lead time reduced from 8 weeks to 2 weeks',
    ],
    resultsVi: [
      'Đạt chứng nhận tương thích sinh học ISO 10993',
      'Chịu được 500+ chu kỳ hấp tiệt trùng',
      'Không rò rỉ chất lỏng trong kiểm tra chất lượng',
      'Giảm thời gian giao hàng từ 8 tuần xuống 2 tuần',
    ],
    statsEn: [
      { label: 'Autoclave', value: '500+ cycles' },
      { label: 'Tolerance', value: '±0.05mm' },
      { label: 'Lead Time', value: '2 weeks' },
    ],
    statsVi: [
      { label: 'Hấp', value: '500+ chu kỳ' },
      { label: 'Dung sai', value: '±0.05mm' },
      { label: 'Thời gian', value: '2 tuần' },
    ],
    image: '/images/industries_img/Virgin Silicone Rubber.png',
    featured: false,
  },
  {
    id: 'silicone-industrial-3',
    industrySlug: 'silicone-rubber',
    titleEn: 'High-Temperature Industrial Gaskets',
    titleVi: 'Gioăng Công Nghiệp Chịu Nhiệt Cao',
    clientEn: 'Industrial Oven Manufacturer',
    clientVi: 'Nhà Sản Xuất Lò Công Nghiệp',
    industryTagEn: 'Industrial Equipment',
    industryTagVi: 'Thiết bị công nghiệp',
    challengeEn:
      'Industrial curing ovens required door gaskets that could maintain sealing at 250°C continuous operation while withstanding repeated compression cycles.',
    challengeVi:
      'Lò sấy công nghiệp cần gioăng cửa duy trì kín ở vận hành liên tục 250°C trong khi chịu được chu kỳ nén lặp đi lặp lại.',
    solutionEn:
      'We supplied high-temperature MVQ silicone sponge gaskets with optimized compression set resistance, custom-extruded to match exact door profiles.',
    solutionVi:
      'Chúng tôi cung cấp gioăng xốp silicone MVQ chịu nhiệt cao với khả năng chống biến dạng nén tối ưu, đùn tùy chỉnh theo đúng profile cửa.',
    resultsEn: [
      'Operating temperature capability up to 260°C',
      'Compression set < 15% after 1000 hours',
      'Energy savings of 12% from improved sealing',
      'Gasket replacement interval extended 5x',
    ],
    resultsVi: [
      'Khả năng hoạt động đến 260°C',
      'Biến dạng nén < 15% sau 1000 giờ',
      'Tiết kiệm 12% năng lượng nhờ làm kín tốt hơn',
      'Chu kỳ thay gioăng kéo dài 5 lần',
    ],
    statsEn: [
      { label: 'Max Temp', value: '260°C' },
      { label: 'Compression Set', value: '<15%' },
      { label: 'Energy Savings', value: '12%' },
    ],
    statsVi: [
      { label: 'Nhiệt độ max', value: '260°C' },
      { label: 'Biến dạng nén', value: '<15%' },
      { label: 'Tiết kiệm', value: '12%' },
    ],
    image: '/images/industries_img/Virgin Silicone Rubber.png',
    featured: false,
  },

  // ========== LUBRICANTS ==========
  {
    id: 'lubricant-manufacturing-1',
    industrySlug: 'lubricants',
    titleEn: 'High-Speed Bearing Lubrication System',
    titleVi: 'Hệ Thống Bôi Trơn Ổ Trục Tốc Độ Cao',
    clientEn: 'CNC Machine Tool Manufacturer',
    clientVi: 'Nhà Sản Xuất Máy CNC',
    industryTagEn: 'Machine Tools',
    industryTagVi: 'Máy công cụ',
    challengeEn:
      'High-speed spindle bearings (30,000 RPM) experienced premature failure due to inadequate lubrication. Existing grease couldn\'t handle the thermal and mechanical stress.',
    challengeVi:
      'Ổ trục trục chính tốc độ cao (30,000 RPM) hỏng sớm do bôi trơn không đầy đủ. Mỡ hiện tại không chịu được ứng suất nhiệt và cơ học.',
    solutionEn:
      'We implemented Kluber Isoflex NBU 15 high-speed bearing grease with an optimized relubrication schedule, combined with contamination control measures.',
    solutionVi:
      'Chúng tôi triển khai mỡ ổ trục tốc độ cao Kluber Isoflex NBU 15 với lịch bôi trơn lại tối ưu, kết hợp các biện pháp kiểm soát ô nhiễm.',
    resultsEn: [
      'Spindle bearing life extended from 6 months to 3 years',
      'Spindle accuracy maintained longer',
      'Unplanned downtime reduced by 80%',
      'Annual maintenance cost savings of $45,000',
    ],
    resultsVi: [
      'Tuổi thọ ổ trục trục chính tăng từ 6 tháng lên 3 năm',
      'Độ chính xác trục chính duy trì lâu hơn',
      'Giảm 80% thời gian ngừng ngoài kế hoạch',
      'Tiết kiệm $45,000/năm chi phí bảo trì',
    ],
    statsEn: [
      { label: 'Bearing Life', value: '6x' },
      { label: 'Downtime', value: '-80%' },
      { label: 'Savings', value: '$45K/yr' },
    ],
    statsVi: [
      { label: 'Tuổi thọ', value: '6x' },
      { label: 'Dừng máy', value: '-80%' },
      { label: 'Tiết kiệm', value: '$45K/năm' },
    ],
    image: '/images/industries_img/Lubricants.png',
    featured: true,
  },
  {
    id: 'lubricant-food-2',
    industrySlug: 'lubricants',
    titleEn: 'Food-Grade Chain Lubrication',
    titleVi: 'Bôi Trơn Xích An Toàn Thực Phẩm',
    clientEn: 'Bakery Production Facility',
    clientVi: 'Nhà Máy Sản Xuất Bánh',
    industryTagEn: 'Food Production',
    industryTagVi: 'Sản xuất thực phẩm',
    challengeEn:
      'Conveyor chains in bakery ovens required food-grade lubricants that could withstand 200°C+ temperatures while preventing carbon buildup and product contamination.',
    challengeVi:
      'Xích băng tải trong lò nướng bánh cần chất bôi trơn an toàn thực phẩm chịu được nhiệt độ 200°C+ trong khi ngăn tích tụ carbon và ô nhiễm sản phẩm.',
    solutionEn:
      'We introduced NSF H1 registered synthetic chain oil with automatic lubrication system, designed for high-temperature bakery applications.',
    solutionVi:
      'Chúng tôi giới thiệu dầu xích tổng hợp đăng ký NSF H1 với hệ thống bôi trơn tự động, thiết kế cho ứng dụng lò nướng nhiệt độ cao.',
    resultsEn: [
      'Chain life doubled compared to previous lubricant',
      'Zero food contamination incidents',
      'Lubrication consumption reduced by 40%',
      'Passed all food safety audits',
    ],
    resultsVi: [
      'Tuổi thọ xích tăng gấp đôi so với chất bôi trơn trước',
      'Không có sự cố ô nhiễm thực phẩm',
      'Giảm 40% tiêu thụ chất bôi trơn',
      'Đạt tất cả kiểm toán an toàn thực phẩm',
    ],
    statsEn: [
      { label: 'Chain Life', value: '2x' },
      { label: 'Consumption', value: '-40%' },
      { label: 'Contamination', value: '0' },
    ],
    statsVi: [
      { label: 'Tuổi thọ xích', value: '2x' },
      { label: 'Tiêu thụ', value: '-40%' },
      { label: 'Ô nhiễm', value: '0' },
    ],
    image: '/images/industries_img/Lubricants.png',
    featured: false,
  },
  {
    id: 'lubricant-mining-3',
    industrySlug: 'lubricants',
    titleEn: 'Mining Equipment Extreme Duty Grease',
    titleVi: 'Mỡ Bôi Trơn Thiết Bị Khai Thác Mỏ',
    clientEn: 'Mining Equipment Operator',
    clientVi: 'Nhà Vận Hành Thiết Bị Khai Thác',
    industryTagEn: 'Mining',
    industryTagVi: 'Khai thác mỏ',
    challengeEn:
      'Heavy mining excavators experienced frequent pin and bushing failures due to extreme loads, water washout, and contamination. Standard greases couldn\'t provide adequate protection.',
    challengeVi:
      'Máy xúc khai thác hạng nặng thường xuyên hỏng chốt và bạc do tải trọng cực đoan, rửa trôi nước và ô nhiễm. Mỡ tiêu chuẩn không bảo vệ đầy đủ.',
    solutionEn:
      'We supplied extreme-pressure lithium complex grease with tackifier and water resistance additives, combined with optimized greasing intervals.',
    solutionVi:
      'Chúng tôi cung cấp mỡ phức hợp lithium chịu áp cực cao với phụ gia tăng độ dính và kháng nước, kết hợp với chu kỳ bôi trơn tối ưu.',
    resultsEn: [
      'Pin and bushing life extended by 150%',
      'Water washout resistance rated excellent',
      'Greasing intervals extended from daily to weekly',
      'Equipment availability increased by 15%',
    ],
    resultsVi: [
      'Tuổi thọ chốt và bạc tăng 150%',
      'Khả năng kháng rửa trôi đạt xuất sắc',
      'Chu kỳ bôi trơn từ hàng ngày lên hàng tuần',
      'Độ sẵn sàng thiết bị tăng 15%',
    ],
    statsEn: [
      { label: 'Component Life', value: '+150%' },
      { label: 'Grease Interval', value: '7x' },
      { label: 'Availability', value: '+15%' },
    ],
    statsVi: [
      { label: 'Tuổi thọ', value: '+150%' },
      { label: 'Chu kỳ bôi trơn', value: '7x' },
      { label: 'Sẵn sàng', value: '+15%' },
    ],
    image: '/images/industries_img/Lubricants.png',
    featured: false,
  },

  // ========== METALWORKING COATINGS ==========
  {
    id: 'metalworking-cnc-1',
    industrySlug: 'metalworking-coatings',
    titleEn: 'CNC Machining Coolant Optimization',
    titleVi: 'Tối Ưu Hóa Dung Dịch Làm Mát Gia Công CNC',
    clientEn: 'Precision Parts Manufacturer',
    clientVi: 'Nhà Sản Xuất Chi Tiết Chính Xác',
    industryTagEn: 'Precision Machining',
    industryTagVi: 'Gia công chính xác',
    challengeEn:
      'Machining of aluminum aerospace components resulted in poor surface finish and excessive tool wear. The existing coolant caused staining and required frequent replacement.',
    challengeVi:
      'Gia công linh kiện nhôm hàng không dẫn đến bề mặt kém và mòn dụng cụ quá mức. Dung dịch làm mát hiện tại gây ố và cần thay thường xuyên.',
    solutionEn:
      'We implemented a semi-synthetic coolant specifically formulated for aluminum with stain inhibitors, combined with a coolant management program including monitoring and treatment.',
    solutionVi:
      'Chúng tôi triển khai dung dịch bán tổng hợp đặc biệt cho nhôm với chất ức chế ố, kết hợp chương trình quản lý dung dịch bao gồm giám sát và xử lý.',
    resultsEn: [
      'Surface finish improved to Ra 0.4μm',
      'Tool life increased by 40%',
      'Coolant sump life extended from 2 months to 12 months',
      'Zero staining issues on finished parts',
    ],
    resultsVi: [
      'Bề mặt cải thiện đạt Ra 0.4μm',
      'Tuổi thọ dụng cụ tăng 40%',
      'Tuổi thọ bể dung dịch tăng từ 2 tháng lên 12 tháng',
      'Không có vấn đề ố trên chi tiết hoàn thành',
    ],
    statsEn: [
      { label: 'Surface Finish', value: 'Ra 0.4μm' },
      { label: 'Tool Life', value: '+40%' },
      { label: 'Coolant Life', value: '12 mo' },
    ],
    statsVi: [
      { label: 'Bề mặt', value: 'Ra 0.4μm' },
      { label: 'Tuổi thọ dao', value: '+40%' },
      { label: 'Tuổi thọ DD', value: '12 tháng' },
    ],
    image: '/images/industries_img/Coatings – Metalworking and Cleaning.png',
    featured: true,
  },
  {
    id: 'metalworking-rust-2',
    industrySlug: 'metalworking-coatings',
    titleEn: 'Inter-Operational Rust Prevention',
    titleVi: 'Chống Gỉ Giữa Các Công Đoạn',
    clientEn: 'Steel Components Manufacturer',
    clientVi: 'Nhà Sản Xuất Linh Kiện Thép',
    industryTagEn: 'Steel Processing',
    industryTagVi: 'Gia công thép',
    challengeEn:
      'Steel parts developed rust during inter-operational storage and transit, requiring additional cleaning and causing customer rejections. Humid factory conditions worsened the problem.',
    challengeVi:
      'Chi tiết thép bị gỉ trong lưu kho và vận chuyển giữa các công đoạn, cần vệ sinh thêm và gây từ chối từ khách hàng. Điều kiện nhà xưởng ẩm làm vấn đề tệ hơn.',
    solutionEn:
      'We provided a water-based rust preventive with excellent humidity resistance, easily applied via spray or dip, and leaving a thin dry film that is compatible with subsequent painting.',
    solutionVi:
      'Chúng tôi cung cấp chất chống gỉ gốc nước với khả năng kháng ẩm xuất sắc, dễ dàng phun hoặc nhúng, để lại màng khô mỏng tương thích với sơn tiếp theo.',
    resultsEn: [
      'Zero rust incidents during 6-month storage period',
      'Customer rejection rate reduced from 8% to 0.5%',
      'No additional cleaning required before painting',
      'Environmentally friendly water-based formula',
    ],
    resultsVi: [
      'Không có sự cố gỉ trong 6 tháng lưu kho',
      'Tỷ lệ từ chối khách hàng giảm từ 8% xuống 0.5%',
      'Không cần vệ sinh thêm trước khi sơn',
      'Công thức gốc nước thân thiện môi trường',
    ],
    statsEn: [
      { label: 'Protection', value: '6 months' },
      { label: 'Rejections', value: '-94%' },
      { label: 'Rust Incidents', value: '0' },
    ],
    statsVi: [
      { label: 'Bảo vệ', value: '6 tháng' },
      { label: 'Từ chối', value: '-94%' },
      { label: 'Gỉ sét', value: '0' },
    ],
    image: '/images/industries_img/Coatings – Metalworking and Cleaning.png',
    featured: false,
  },
  {
    id: 'metalworking-cleaning-3',
    industrySlug: 'metalworking-coatings',
    titleEn: 'Precision Parts Aqueous Cleaning',
    titleVi: 'Vệ Sinh Linh Kiện Chính Xác Bằng Nước',
    clientEn: 'Hydraulic Components Manufacturer',
    clientVi: 'Nhà Sản Xuất Linh Kiện Thủy Lực',
    industryTagEn: 'Hydraulics',
    industryTagVi: 'Thủy lực',
    challengeEn:
      'Precision hydraulic valve bodies required spotless cleanliness (NAS 6 class) before assembly. Solvent cleaning was being phased out due to environmental regulations.',
    challengeVi:
      'Thân van thủy lực chính xác đòi hỏi sạch tuyệt đối (NAS class 6) trước lắp ráp. Vệ sinh bằng dung môi đang bị loại bỏ do quy định môi trường.',
    solutionEn:
      'We implemented a multi-stage aqueous cleaning system with alkaline cleaner, rinse stages, and rust inhibitor, combined with ultrasonic agitation for blind holes.',
    solutionVi:
      'Chúng tôi triển khai hệ thống vệ sinh nước nhiều giai đoạn với chất tẩy kiềm, giai đoạn xả và chất ức chế gỉ, kết hợp khuấy siêu âm cho lỗ mù.',
    resultsEn: [
      'NAS 5 cleanliness consistently achieved (better than target)',
      'Solvent usage eliminated 100%',
      'Cleaning cycle time reduced by 30%',
      'Full compliance with environmental regulations',
    ],
    resultsVi: [
      'Đạt độ sạch NAS 5 ổn định (tốt hơn mục tiêu)',
      'Loại bỏ 100% sử dụng dung môi',
      'Giảm 30% thời gian chu kỳ vệ sinh',
      'Tuân thủ đầy đủ quy định môi trường',
    ],
    statsEn: [
      { label: 'Cleanliness', value: 'NAS 5' },
      { label: 'Solvent', value: '-100%' },
      { label: 'Cycle Time', value: '-30%' },
    ],
    statsVi: [
      { label: 'Độ sạch', value: 'NAS 5' },
      { label: 'Dung môi', value: '-100%' },
      { label: 'Chu kỳ', value: '-30%' },
    ],
    image: '/images/industries_img/Coatings – Metalworking and Cleaning.png',
    featured: false,
  },

  // ========== SANDPAPER ABRASIVES ==========
  {
    id: 'abrasive-automotive-1',
    industrySlug: 'sandpaper-abrasives',
    titleEn: 'Automotive Paint Shop Refinishing',
    titleVi: 'Hoàn Thiện Sơn Xưởng Ô Tô',
    clientEn: 'Automotive OEM Paint Shop',
    clientVi: 'Xưởng Sơn OEM Ô Tô',
    industryTagEn: 'Automotive',
    industryTagVi: 'Ô tô',
    challengeEn:
      'Surface preparation before clearcoat application was inconsistent, leading to orange peel defects and rework. Abrasive consumption was high due to rapid clogging.',
    challengeVi:
      'Chuẩn bị bề mặt trước khi phủ lớp bóng không đồng nhất, dẫn đến lỗi vỏ cam và làm lại. Tiêu thụ giấy nhám cao do tắc nhanh.',
    solutionEn:
      'We introduced 3M Cubitron II ceramic abrasives with dust extraction optimization, providing consistent cut and longer life even on waterborne paint systems.',
    solutionVi:
      'Chúng tôi giới thiệu giấy nhám ceramic 3M Cubitron II với tối ưu hút bụi, cung cấp độ cắt đồng nhất và tuổi thọ dài hơn ngay cả trên hệ thống sơn gốc nước.',
    resultsEn: [
      'First-time quality rate improved from 82% to 95%',
      'Abrasive consumption reduced by 35%',
      'Sanding time reduced by 25%',
      'Rework costs reduced by 60%',
    ],
    resultsVi: [
      'Tỷ lệ chất lượng lần đầu tăng từ 82% lên 95%',
      'Giảm 35% tiêu thụ giấy nhám',
      'Giảm 25% thời gian mài',
      'Giảm 60% chi phí làm lại',
    ],
    statsEn: [
      { label: 'Quality', value: '95%' },
      { label: 'Consumption', value: '-35%' },
      { label: 'Rework', value: '-60%' },
    ],
    statsVi: [
      { label: 'Chất lượng', value: '95%' },
      { label: 'Tiêu thụ', value: '-35%' },
      { label: 'Làm lại', value: '-60%' },
    ],
    image: '/images/industries_img/Sandpaper and Abrasives, Polishing.png',
    featured: true,
  },
  {
    id: 'abrasive-wood-2',
    industrySlug: 'sandpaper-abrasives',
    titleEn: 'Furniture Manufacturing Sanding Line',
    titleVi: 'Dây Chuyền Chà Nhám Sản Xuất Nội Thất',
    clientEn: 'Premium Furniture Manufacturer',
    clientVi: 'Nhà Sản Xuất Nội Thất Cao Cấp',
    industryTagEn: 'Furniture',
    industryTagVi: 'Nội thất',
    challengeEn:
      'Wide-belt sanding of lacquered furniture panels resulted in inconsistent finish and visible scratch patterns. Belt changes were frequent, affecting productivity.',
    challengeVi:
      'Chà nhám dây đai rộng cho tấm nội thất phủ sơn dẫn đến hoàn thiện không đồng nhất và mẫu xước có thể nhìn thấy. Thay dây đai thường xuyên, ảnh hưởng năng suất.',
    solutionEn:
      'We supplied premium stearated aluminum oxide belts with multi-grit progression system, optimized for lacquered wood finishing with minimal loading.',
    solutionVi:
      'Chúng tôi cung cấp dây đai oxit nhôm stearate cao cấp với hệ thống tiến độ đa độ nhám, tối ưu cho hoàn thiện gỗ phủ sơn với tải tối thiểu.',
    resultsEn: [
      'Scratch-free finish achieved consistently',
      'Belt life increased by 80%',
      'Line speed increased by 20%',
      'Customer complaints reduced to zero',
    ],
    resultsVi: [
      'Đạt hoàn thiện không xước ổn định',
      'Tuổi thọ dây đai tăng 80%',
      'Tốc độ dây chuyền tăng 20%',
      'Khiếu nại khách hàng giảm về không',
    ],
    statsEn: [
      { label: 'Belt Life', value: '+80%' },
      { label: 'Line Speed', value: '+20%' },
      { label: 'Complaints', value: '0' },
    ],
    statsVi: [
      { label: 'Tuổi thọ đai', value: '+80%' },
      { label: 'Tốc độ', value: '+20%' },
      { label: 'Khiếu nại', value: '0' },
    ],
    image: '/images/industries_img/Sandpaper and Abrasives, Polishing.png',
    featured: false,
  },
  {
    id: 'abrasive-metal-3',
    industrySlug: 'sandpaper-abrasives',
    titleEn: 'Stainless Steel Polishing Excellence',
    titleVi: 'Đánh Bóng Thép Không Gỉ Xuất Sắc',
    clientEn: 'Architectural Metalwork Company',
    clientVi: 'Công Ty Kim Loại Kiến Trúc',
    industryTagEn: 'Architectural Metal',
    industryTagVi: 'Kim loại kiến trúc',
    challengeEn:
      'Mirror-finish stainless steel panels for luxury building facades required consistent No. 8 mirror finish. Manual polishing was slow and results varied by operator.',
    challengeVi:
      'Tấm thép không gỉ hoàn thiện gương cho mặt tiền tòa nhà sang trọng đòi hỏi hoàn thiện gương No. 8 đồng nhất. Đánh bóng thủ công chậm và kết quả khác nhau theo thợ.',
    solutionEn:
      'We implemented a systematic polishing progression from P320 to P2000, followed by compound polishing, with standardized procedures and training.',
    solutionVi:
      'Chúng tôi triển khai quy trình đánh bóng có hệ thống từ P320 đến P2000, theo sau là đánh bóng bằng hợp chất, với quy trình chuẩn hóa và đào tạo.',
    resultsEn: [
      'Consistent No. 8 mirror finish achieved',
      'Polishing time reduced by 40%',
      'Operator skill dependency reduced',
      'Premium pricing enabled due to quality',
    ],
    resultsVi: [
      'Đạt hoàn thiện gương No. 8 đồng nhất',
      'Giảm 40% thời gian đánh bóng',
      'Giảm phụ thuộc kỹ năng thợ',
      'Có thể định giá cao nhờ chất lượng',
    ],
    statsEn: [
      { label: 'Finish', value: 'No. 8 Mirror' },
      { label: 'Time', value: '-40%' },
      { label: 'Consistency', value: '100%' },
    ],
    statsVi: [
      { label: 'Hoàn thiện', value: 'Gương No. 8' },
      { label: 'Thời gian', value: '-40%' },
      { label: 'Đồng nhất', value: '100%' },
    ],
    image: '/images/industries_img/Sandpaper and Abrasives, Polishing.png',
    featured: false,
  },

  // ========== NUKOTE COATINGS ==========
  {
    id: 'nukote-tank-1',
    industrySlug: 'nukote-coatings',
    titleEn: 'Chemical Storage Tank Lining',
    titleVi: 'Lót Bể Chứa Hóa Chất',
    clientEn: 'Chemical Processing Plant',
    clientVi: 'Nhà Máy Chế Biến Hóa Chất',
    industryTagEn: 'Chemical Processing',
    industryTagVi: 'Chế biến hóa chất',
    challengeEn:
      'Concrete chemical storage tanks were deteriorating due to acid attack, causing structural concerns and environmental risks. Traditional epoxy linings failed within 2 years.',
    challengeVi:
      'Bể chứa hóa chất bê tông xuống cấp do tấn công axit, gây lo ngại cấu trúc và rủi ro môi trường. Lớp lót epoxy truyền thống hỏng trong vòng 2 năm.',
    solutionEn:
      'We applied Nukote ST polyurea/polyurethane hybrid system with excellent chemical resistance to pH 1-14, rapid cure for minimal downtime, and seamless waterproof membrane.',
    solutionVi:
      'Chúng tôi áp dụng hệ thống hybrid polyurea/polyurethane Nukote ST với khả năng kháng hóa chất xuất sắc pH 1-14, đóng rắn nhanh cho thời gian dừng tối thiểu và màng chống nước liền mạch.',
    resultsEn: [
      'Tank returned to service in 48 hours',
      'Chemical resistance to concentrated acids',
      'Expected service life of 20+ years',
      'Full containment with zero leakage',
    ],
    resultsVi: [
      'Bể trở lại hoạt động trong 48 giờ',
      'Kháng hóa chất với axit đậm đặc',
      'Tuổi thọ dự kiến 20+ năm',
      'Ngăn chứa đầy đủ không rò rỉ',
    ],
    statsEn: [
      { label: 'Downtime', value: '48 hrs' },
      { label: 'pH Range', value: '1-14' },
      { label: 'Service Life', value: '20+ yrs' },
    ],
    statsVi: [
      { label: 'Dừng', value: '48 giờ' },
      { label: 'Phạm vi pH', value: '1-14' },
      { label: 'Tuổi thọ', value: '20+ năm' },
    ],
    image: '/images/industries_img/Nukote – Protective Coatings.png',
    featured: true,
  },
  {
    id: 'nukote-floor-2',
    industrySlug: 'nukote-coatings',
    titleEn: 'Industrial Floor Coating System',
    titleVi: 'Hệ Thống Phủ Sàn Công Nghiệp',
    clientEn: 'Logistics Warehouse',
    clientVi: 'Kho Vận Logistics',
    industryTagEn: 'Warehousing',
    industryTagVi: 'Kho bãi',
    challengeEn:
      'High-traffic warehouse floors were cracking and dusting, causing forklift damage and product contamination. Floor needed to withstand 5-ton forklift traffic 24/7.',
    challengeVi:
      'Sàn kho lưu lượng cao bị nứt và bụi, gây hư hại xe nâng và ô nhiễm sản phẩm. Sàn cần chịu được xe nâng 5 tấn 24/7.',
    solutionEn:
      'We installed Nukote industrial floor system with abrasion-resistant topcoat, anti-slip texture, and line marking, completed over a weekend to minimize business disruption.',
    solutionVi:
      'Chúng tôi lắp đặt hệ thống sàn công nghiệp Nukote với lớp phủ chống mài mòn, kết cấu chống trượt và kẻ vạch, hoàn thành trong cuối tuần để giảm thiểu gián đoạn kinh doanh.',
    resultsEn: [
      'Floor completed in 48 hours, operational Monday morning',
      'Forklift traffic wear minimal after 3 years',
      'Dust-free environment achieved',
      'Easy cleaning reduces maintenance costs',
    ],
    resultsVi: [
      'Sàn hoàn thành trong 48 giờ, vận hành thứ Hai',
      'Mài mòn từ xe nâng tối thiểu sau 3 năm',
      'Đạt môi trường không bụi',
      'Dễ vệ sinh giảm chi phí bảo trì',
    ],
    statsEn: [
      { label: 'Install Time', value: '48 hrs' },
      { label: 'Traffic Load', value: '5 tons' },
      { label: 'Wear', value: 'Minimal' },
    ],
    statsVi: [
      { label: 'Lắp đặt', value: '48 giờ' },
      { label: 'Tải trọng', value: '5 tấn' },
      { label: 'Mài mòn', value: 'Tối thiểu' },
    ],
    image: '/images/industries_img/Nukote – Protective Coatings.png',
    featured: false,
  },
  {
    id: 'nukote-truck-3',
    industrySlug: 'nukote-coatings',
    titleEn: 'Truck Bed Liner Application',
    titleVi: 'Lót Thùng Xe Tải',
    clientEn: 'Fleet Management Company',
    clientVi: 'Công Ty Quản Lý Đội Xe',
    industryTagEn: 'Fleet / Transportation',
    industryTagVi: 'Đội xe / Vận chuyển',
    challengeEn:
      'Delivery truck beds were corroding and denting, reducing resale value and causing cargo damage. Drop-in liners were cracking and trapping moisture underneath.',
    challengeVi:
      'Thùng xe giao hàng bị ăn mòn và móp, giảm giá trị bán lại và gây hư hại hàng hóa. Lót nhựa đặt vào bị nứt và giữ ẩm bên dưới.',
    solutionEn:
      'We applied spray-on Nukote polyurea bed liner with textured finish for cargo grip, seamless coverage including tailgate, and color matching to vehicle.',
    solutionVi:
      'Chúng tôi phun lót thùng polyurea Nukote với hoàn thiện có kết cấu cho bám hàng hóa, phủ liền mạch bao gồm cửa sau và màu phù hợp với xe.',
    resultsEn: [
      'Truck resale value maintained 20% higher',
      'Zero cargo damage claims',
      'Corrosion completely eliminated',
      'Application time: 2 hours per truck',
    ],
    resultsVi: [
      'Giá trị bán lại xe duy trì cao hơn 20%',
      'Không có khiếu nại hư hại hàng hóa',
      'Loại bỏ hoàn toàn ăn mòn',
      'Thời gian áp dụng: 2 giờ mỗi xe',
    ],
    statsEn: [
      { label: 'Resale Value', value: '+20%' },
      { label: 'Cargo Claims', value: '0' },
      { label: 'Apply Time', value: '2 hrs' },
    ],
    statsVi: [
      { label: 'Giá bán lại', value: '+20%' },
      { label: 'Khiếu nại', value: '0' },
      { label: 'Thời gian', value: '2 giờ' },
    ],
    image: '/images/industries_img/Nukote – Protective Coatings.png',
    featured: false,
  },

  // ========== INDUSTRIAL ADHESIVES ==========
  {
    id: 'adhesive-automotive-1',
    industrySlug: 'industrial-adhesives',
    titleEn: 'Structural Bonding in Bus Manufacturing',
    titleVi: 'Kết Dính Kết Cấu Trong Sản Xuất Xe Buýt',
    clientEn: 'Bus & Coach Manufacturer',
    clientVi: 'Nhà Sản Xuất Xe Buýt & Coach',
    industryTagEn: 'Transportation',
    industryTagVi: 'Giao thông vận tải',
    challengeEn:
      'Traditional riveted construction for bus body panels was labor-intensive, added weight, and created potential corrosion points. The client wanted to modernize their manufacturing process.',
    challengeVi:
      'Xây dựng đinh tán truyền thống cho tấm thân xe buýt tốn công, tăng trọng lượng và tạo điểm ăn mòn tiềm ẩn. Khách hàng muốn hiện đại hóa quy trình sản xuất.',
    solutionEn:
      'We implemented Henkel LOCTITE structural adhesive bonding, replacing 60% of mechanical fasteners with high-strength methacrylate adhesive suitable for dissimilar materials.',
    solutionVi:
      'Chúng tôi triển khai kết dính keo kết cấu Henkel LOCTITE, thay thế 60% ốc vít cơ khí bằng keo methacrylate cường độ cao phù hợp cho vật liệu khác nhau.',
    resultsEn: [
      'Vehicle weight reduced by 150kg per bus',
      'Assembly time reduced by 35%',
      'Improved structural rigidity and NVH',
      'Corrosion resistance significantly improved',
    ],
    resultsVi: [
      'Giảm 150kg trọng lượng mỗi xe buýt',
      'Giảm 35% thời gian lắp ráp',
      'Cải thiện độ cứng kết cấu và NVH',
      'Khả năng chống ăn mòn cải thiện đáng kể',
    ],
    statsEn: [
      { label: 'Weight', value: '-150kg' },
      { label: 'Assembly', value: '-35%' },
      { label: 'Rigidity', value: '+25%' },
    ],
    statsVi: [
      { label: 'Trọng lượng', value: '-150kg' },
      { label: 'Lắp ráp', value: '-35%' },
      { label: 'Độ cứng', value: '+25%' },
    ],
    image: '/images/industries_img/Industrial Adhesives.png',
    featured: true,
  },
  {
    id: 'adhesive-composite-2',
    industrySlug: 'industrial-adhesives',
    titleEn: 'Composite Panel Bonding for Wind Turbines',
    titleVi: 'Kết Dính Tấm Composite cho Turbine Gió',
    clientEn: 'Wind Energy Equipment Manufacturer',
    clientVi: 'Nhà Sản Xuất Thiết Bị Năng Lượng Gió',
    industryTagEn: 'Renewable Energy',
    industryTagVi: 'Năng lượng tái tạo',
    challengeEn:
      'Bonding of GFRP blade sections required adhesives with high elongation, fatigue resistance, and the ability to fill large gaps while maintaining bond strength in outdoor conditions.',
    challengeVi:
      'Kết dính các phần cánh GFRP đòi hỏi keo có độ giãn dài cao, chống mỏi và khả năng lấp khe lớn trong khi duy trì độ bền liên kết trong điều kiện ngoài trời.',
    solutionEn:
      'We supplied specialized polyurethane structural adhesive with thixotropic properties for vertical application, combined with application equipment and process optimization.',
    solutionVi:
      'Chúng tôi cung cấp keo kết cấu polyurethane chuyên dụng với tính chất thixotropic cho ứng dụng thẳng đứng, kết hợp thiết bị ứng dụng và tối ưu hóa quy trình.',
    resultsEn: [
      'Blade manufacturing time reduced by 20%',
      'Consistent bond line thickness achieved',
      'Fatigue performance exceeds 20-year requirement',
      'Zero blade delamination in field operation',
    ],
    resultsVi: [
      'Giảm 20% thời gian sản xuất cánh',
      'Đạt độ dày đường keo đồng nhất',
      'Hiệu suất mỏi vượt yêu cầu 20 năm',
      'Không tách lớp cánh trong vận hành thực tế',
    ],
    statsEn: [
      { label: 'Mfg Time', value: '-20%' },
      { label: 'Fatigue Life', value: '20+ yrs' },
      { label: 'Field Failures', value: '0' },
    ],
    statsVi: [
      { label: 'Thời gian SX', value: '-20%' },
      { label: 'Tuổi thọ mỏi', value: '20+ năm' },
      { label: 'Hỏng thực tế', value: '0' },
    ],
    image: '/images/industries_img/Industrial Adhesives.png',
    featured: false,
  },
  {
    id: 'adhesive-electronics-3',
    industrySlug: 'industrial-adhesives',
    titleEn: 'Electronic Component Bonding',
    titleVi: 'Kết Dính Linh Kiện Điện Tử',
    clientEn: 'Consumer Electronics Manufacturer',
    clientVi: 'Nhà Sản Xuất Điện Tử Tiêu Dùng',
    industryTagEn: 'Consumer Electronics',
    industryTagVi: 'Điện tử tiêu dùng',
    challengeEn:
      'Bonding of camera modules in smartphones required ultra-fast cure, precise positioning during assembly, and the ability to withstand thermal cycling and drop tests.',
    challengeVi:
      'Kết dính module camera trong smartphone đòi hỏi đóng rắn siêu nhanh, định vị chính xác trong lắp ráp và khả năng chịu chu kỳ nhiệt và thử nghiệm rơi.',
    solutionEn:
      'We provided UV-curable adhesive with secondary heat cure, optimized for active alignment processes with cure times under 3 seconds.',
    solutionVi:
      'Chúng tôi cung cấp keo UV-curable với cure nhiệt thứ cấp, tối ưu cho quy trình căn chỉnh chủ động với thời gian cure dưới 3 giây.',
    resultsEn: [
      'Assembly cycle time reduced to 4 seconds',
      'Camera module positioning accuracy: ±5μm',
      'All drop and thermal shock tests passed',
      'Rework rate reduced from 3% to 0.3%',
    ],
    resultsVi: [
      'Giảm thời gian chu kỳ lắp ráp xuống 4 giây',
      'Độ chính xác định vị module camera: ±5μm',
      'Đạt tất cả thử nghiệm rơi và sốc nhiệt',
      'Tỷ lệ làm lại giảm từ 3% xuống 0.3%',
    ],
    statsEn: [
      { label: 'Cycle Time', value: '4 sec' },
      { label: 'Accuracy', value: '±5μm' },
      { label: 'Rework', value: '0.3%' },
    ],
    statsVi: [
      { label: 'Chu kỳ', value: '4 giây' },
      { label: 'Độ chính xác', value: '±5μm' },
      { label: 'Làm lại', value: '0.3%' },
    ],
    image: '/images/industries_img/Industrial Adhesives.png',
    featured: false,
  },

  // ========== PRINTERS ==========
  {
    id: 'printer-food-1',
    industrySlug: 'printers',
    titleEn: 'Food Packaging Date Coding',
    titleVi: 'In Ngày Sản Xuất Bao Bì Thực Phẩm',
    clientEn: 'Snack Food Producer',
    clientVi: 'Nhà Sản Xuất Thực Phẩm Snack',
    industryTagEn: 'Food Packaging',
    industryTagVi: 'Đóng gói thực phẩm',
    challengeEn:
      'High-speed packaging lines required reliable date/lot coding on flexible film with instant dry time. Existing printers caused frequent line stoppages and illegible codes.',
    challengeVi:
      'Dây chuyền đóng gói tốc độ cao đòi hỏi in ngày/lô đáng tin cậy trên màng mềm với thời gian khô tức thì. Máy in hiện tại gây dừng dây chuyền thường xuyên và mã không đọc được.',
    solutionEn:
      'We installed Markem-Imaje continuous inkjet printers with MEK-free inks, featuring self-maintenance and real-time code verification.',
    solutionVi:
      'Chúng tôi lắp đặt máy in phun liên tục Markem-Imaje với mực không MEK, trang bị tự bảo trì và xác minh mã thời gian thực.',
    resultsEn: [
      'Line efficiency improved from 75% to 95%',
      'Code legibility rate: 99.9%',
      'Ink consumption reduced by 40%',
      'Zero environmental compliance issues',
    ],
    resultsVi: [
      'Hiệu suất dây chuyền tăng từ 75% lên 95%',
      'Tỷ lệ đọc được mã: 99.9%',
      'Giảm 40% tiêu thụ mực',
      'Không có vấn đề tuân thủ môi trường',
    ],
    statsEn: [
      { label: 'Efficiency', value: '95%' },
      { label: 'Legibility', value: '99.9%' },
      { label: 'Ink Usage', value: '-40%' },
    ],
    statsVi: [
      { label: 'Hiệu suất', value: '95%' },
      { label: 'Đọc được', value: '99.9%' },
      { label: 'Tiêu thụ mực', value: '-40%' },
    ],
    image: '/images/industries_img/Printers.png',
    featured: true,
  },
  {
    id: 'printer-pharma-2',
    industrySlug: 'printers',
    titleEn: 'Pharmaceutical Serialization',
    titleVi: 'Số Hóa Serial Dược Phẩm',
    clientEn: 'Pharmaceutical Manufacturer',
    clientVi: 'Nhà Sản Xuất Dược Phẩm',
    industryTagEn: 'Pharmaceuticals',
    industryTagVi: 'Dược phẩm',
    challengeEn:
      'New serialization regulations required unique 2D codes on every product package with full traceability. The solution needed to integrate with existing packaging lines without reducing speed.',
    challengeVi:
      'Quy định số hóa serial mới đòi hỏi mã 2D duy nhất trên mỗi gói sản phẩm với truy xuất đầy đủ. Giải pháp cần tích hợp với dây chuyền đóng gói hiện có mà không giảm tốc độ.',
    solutionEn:
      'We implemented thermal transfer overprinting with integrated vision verification, connected to serialization software for real-time data exchange and regulatory compliance.',
    solutionVi:
      'Chúng tôi triển khai in chuyển nhiệt với xác minh thị giác tích hợp, kết nối với phần mềm số hóa serial cho trao đổi dữ liệu thời gian thực và tuân thủ quy định.',
    resultsEn: [
      'Full compliance with WHO and national regulations',
      '100% verification of all printed codes',
      'Zero impact on line speed (300 packs/min)',
      'Complete track & trace capability',
    ],
    resultsVi: [
      'Tuân thủ đầy đủ quy định WHO và quốc gia',
      'Xác minh 100% tất cả mã in',
      'Không ảnh hưởng tốc độ dây chuyền (300 gói/phút)',
      'Khả năng theo dõi & truy xuất đầy đủ',
    ],
    statsEn: [
      { label: 'Verification', value: '100%' },
      { label: 'Speed', value: '300/min' },
      { label: 'Compliance', value: 'WHO' },
    ],
    statsVi: [
      { label: 'Xác minh', value: '100%' },
      { label: 'Tốc độ', value: '300/phút' },
      { label: 'Tuân thủ', value: 'WHO' },
    ],
    image: '/images/industries_img/Printers.png',
    featured: false,
  },
  {
    id: 'printer-wire-3',
    industrySlug: 'printers',
    titleEn: 'Wire & Cable Marking',
    titleVi: 'Đánh Dấu Dây & Cáp',
    clientEn: 'Wire & Cable Manufacturer',
    clientVi: 'Nhà Sản Xuất Dây & Cáp',
    industryTagEn: 'Wire & Cable',
    industryTagVi: 'Dây & Cáp',
    challengeEn:
      'Marking on extruded cable jacket required high-contrast codes that resist abrasion and chemicals, printed at extrusion line speeds up to 500m/min.',
    challengeVi:
      'Đánh dấu trên vỏ cáp đùn đòi hỏi mã tương phản cao chịu được mài mòn và hóa chất, in ở tốc độ dây chuyền đùn đến 500m/phút.',
    solutionEn:
      'We provided laser marking systems with automatic speed synchronization, delivering permanent marking without consumables and minimal maintenance.',
    solutionVi:
      'Chúng tôi cung cấp hệ thống đánh dấu laser với đồng bộ tốc độ tự động, mang lại đánh dấu vĩnh viễn không cần vật tư tiêu hao và bảo trì tối thiểu.',
    resultsEn: [
      'Marking speed capability up to 600m/min',
      'Zero ink/ribbon consumable costs',
      'Marks survive all abrasion and chemical tests',
      'Maintenance reduced by 90%',
    ],
    resultsVi: [
      'Khả năng đánh dấu đến 600m/phút',
      'Không tốn chi phí mực/ribbon tiêu hao',
      'Dấu vượt qua tất cả thử nghiệm mài mòn và hóa chất',
      'Giảm 90% bảo trì',
    ],
    statsEn: [
      { label: 'Speed', value: '600m/min' },
      { label: 'Consumables', value: '$0' },
      { label: 'Maintenance', value: '-90%' },
    ],
    statsVi: [
      { label: 'Tốc độ', value: '600m/phút' },
      { label: 'Vật tư', value: '$0' },
      { label: 'Bảo trì', value: '-90%' },
    ],
    image: '/images/industries_img/Printers.png',
    featured: false,
  },

  // ========== FLUID TRANSMISSION ==========
  {
    id: 'fluid-hydraulic-1',
    industrySlug: 'fluid-transmission',
    titleEn: 'Hydraulic System Upgrade for Press Line',
    titleVi: 'Nâng Cấp Hệ Thống Thủy Lực Dây Chuyền Ép',
    clientEn: 'Metal Stamping Factory',
    clientVi: 'Nhà Máy Dập Kim Loại',
    industryTagEn: 'Metal Forming',
    industryTagVi: 'Gia công kim loại',
    challengeEn:
      'Aging hydraulic hoses were causing frequent leaks and unplanned downtime. High-pressure spikes during stamping operations were exceeding hose burst ratings.',
    challengeVi:
      'Ống thủy lực cũ gây rò rỉ thường xuyên và dừng máy ngoài kế hoạch. Xung áp suất cao trong quá trình dập vượt quá định mức nổ ống.',
    solutionEn:
      'We conducted a complete hydraulic hose audit and replaced with 4-spiral hose rated for 1.5x working pressure, including proper routing, clamping, and bend radius optimization.',
    solutionVi:
      'Chúng tôi tiến hành kiểm toán ống thủy lực hoàn chỉnh và thay thế bằng ống 4 vòng xoắn định mức 1.5x áp suất làm việc, bao gồm đi ống, kẹp và tối ưu bán kính uốn.',
    resultsEn: [
      'Zero hose failures in 2 years since replacement',
      'Unplanned downtime reduced by 85%',
      'Oil leakage eliminated, improving workplace safety',
      'Maintenance predictability improved',
    ],
    resultsVi: [
      'Không hỏng ống trong 2 năm kể từ thay thế',
      'Giảm 85% dừng máy ngoài kế hoạch',
      'Loại bỏ rò rỉ dầu, cải thiện an toàn làm việc',
      'Cải thiện khả năng dự đoán bảo trì',
    ],
    statsEn: [
      { label: 'Failures', value: '0' },
      { label: 'Downtime', value: '-85%' },
      { label: 'Oil Leaks', value: '0' },
    ],
    statsVi: [
      { label: 'Hỏng hóc', value: '0' },
      { label: 'Dừng máy', value: '-85%' },
      { label: 'Rò rỉ dầu', value: '0' },
    ],
    image: '/images/industries_img/Fluid Transmission and Shredding.png',
    featured: true,
  },
  {
    id: 'fluid-pneumatic-2',
    industrySlug: 'fluid-transmission',
    titleEn: 'Pneumatic Fitting Standardization',
    titleVi: 'Chuẩn Hóa Phụ Kiện Khí Nén',
    clientEn: 'Electronics Assembly Plant',
    clientVi: 'Nhà Máy Lắp Ráp Điện Tử',
    industryTagEn: 'Electronics Manufacturing',
    industryTagVi: 'Sản xuất điện tử',
    challengeEn:
      'Multiple brands of pneumatic fittings caused inventory complexity, installation errors, and air leaks. Maintenance technicians struggled with inconsistent quality.',
    challengeVi:
      'Nhiều thương hiệu phụ kiện khí nén gây phức tạp tồn kho, lỗi lắp đặt và rò rỉ khí. Kỹ thuật viên bảo trì vật lộn với chất lượng không đồng nhất.',
    solutionEn:
      'We standardized on SMC push-to-connect fittings across the entire plant, reducing SKU count by 70% while ensuring consistent quality and easy maintenance.',
    solutionVi:
      'Chúng tôi chuẩn hóa phụ kiện đẩy kết nối SMC trên toàn nhà máy, giảm 70% số SKU trong khi đảm bảo chất lượng đồng nhất và bảo trì dễ dàng.',
    resultsEn: [
      'SKU count reduced from 150 to 45',
      'Air leak incidents reduced by 75%',
      'Maintenance time per fitting reduced by 50%',
      'Procurement costs reduced by 20%',
    ],
    resultsVi: [
      'Số SKU giảm từ 150 xuống 45',
      'Giảm 75% sự cố rò rỉ khí',
      'Giảm 50% thời gian bảo trì mỗi phụ kiện',
      'Giảm 20% chi phí mua hàng',
    ],
    statsEn: [
      { label: 'SKUs', value: '-70%' },
      { label: 'Leaks', value: '-75%' },
      { label: 'Maint. Time', value: '-50%' },
    ],
    statsVi: [
      { label: 'SKU', value: '-70%' },
      { label: 'Rò rỉ', value: '-75%' },
      { label: 'Bảo trì', value: '-50%' },
    ],
    image: '/images/industries_img/Fluid Transmission and Shredding.png',
    featured: false,
  },
  {
    id: 'fluid-shredder-3',
    industrySlug: 'fluid-transmission',
    titleEn: 'Industrial Waste Shredding System',
    titleVi: 'Hệ Thống Nghiền Chất Thải Công Nghiệp',
    clientEn: 'Recycling Facility',
    clientVi: 'Cơ Sở Tái Chế',
    industryTagEn: 'Recycling',
    industryTagVi: 'Tái chế',
    challengeEn:
      'Processing of mixed plastic and metal waste required a robust shredding solution. Existing equipment couldn\'t handle the variety of materials and suffered frequent breakdowns.',
    challengeVi:
      'Xử lý chất thải nhựa và kim loại hỗn hợp đòi hỏi giải pháp nghiền mạnh mẽ. Thiết bị hiện có không thể xử lý đa dạng vật liệu và thường xuyên hỏng.',
    solutionEn:
      'We supplied a dual-shaft industrial shredder with replaceable cutting tips, automatic reverse for jams, and integrated metal detection for blade protection.',
    solutionVi:
      'Chúng tôi cung cấp máy nghiền công nghiệp hai trục với đầu cắt có thể thay thế, đảo ngược tự động khi kẹt và phát hiện kim loại tích hợp để bảo vệ lưỡi.',
    resultsEn: [
      'Processing capacity increased to 3 tons/hour',
      'Blade life extended by 200%',
      'Downtime reduced from 20% to 3%',
      'Output particle size consistent',
    ],
    resultsVi: [
      'Công suất xử lý tăng lên 3 tấn/giờ',
      'Tuổi thọ lưỡi tăng 200%',
      'Giảm dừng máy từ 20% xuống 3%',
      'Kích thước hạt đầu ra đồng nhất',
    ],
    statsEn: [
      { label: 'Capacity', value: '3 ton/hr' },
      { label: 'Blade Life', value: '3x' },
      { label: 'Downtime', value: '3%' },
    ],
    statsVi: [
      { label: 'Công suất', value: '3 tấn/giờ' },
      { label: 'Tuổi thọ lưỡi', value: '3x' },
      { label: 'Dừng máy', value: '3%' },
    ],
    image: '/images/industries_img/Fluid Transmission and Shredding.png',
    featured: false,
  },

  // ========== HEAT CONDUCTING ==========
  {
    id: 'thermal-ev-1',
    industrySlug: 'heat-conducting',
    titleEn: 'EV Battery Thermal Interface Solution',
    titleVi: 'Giải Pháp Giao Diện Nhiệt Pin EV',
    clientEn: 'Electric Vehicle Manufacturer',
    clientVi: 'Nhà Sản Xuất Xe Điện',
    industryTagEn: 'Electric Vehicles',
    industryTagVi: 'Xe điện',
    challengeEn:
      'Battery cell cooling in EV battery packs required high thermal conductivity gap fillers that could accommodate manufacturing tolerances while providing electrical isolation.',
    challengeVi:
      'Làm mát cell pin trong bộ pin EV đòi hỏi chất lấp khe dẫn nhiệt cao có thể thích ứng dung sai sản xuất trong khi cung cấp cách điện.',
    solutionEn:
      'We supplied silicone-based gap filler with 6 W/mK thermal conductivity, dispensed robotically with precise volume control. The material conforms to gaps from 0.5mm to 5mm.',
    solutionVi:
      'Chúng tôi cung cấp chất lấp khe gốc silicone với độ dẫn nhiệt 6 W/mK, phân phối robot với kiểm soát thể tích chính xác. Vật liệu phù hợp với khe từ 0.5mm đến 5mm.',
    resultsEn: [
      'Battery cell temperature variation reduced by 40%',
      'Pack energy density improved by allowing tighter packaging',
      'Achieved UL 94 V-0 flame rating',
      'Battery range improved by 5% due to better thermal management',
    ],
    resultsVi: [
      'Giảm 40% biến thiên nhiệt độ cell pin',
      'Cải thiện mật độ năng lượng pack cho phép đóng gói chặt hơn',
      'Đạt xếp hạng cháy UL 94 V-0',
      'Phạm vi pin cải thiện 5% nhờ quản lý nhiệt tốt hơn',
    ],
    statsEn: [
      { label: 'Conductivity', value: '6 W/mK' },
      { label: 'Temp Variation', value: '-40%' },
      { label: 'Range', value: '+5%' },
    ],
    statsVi: [
      { label: 'Dẫn nhiệt', value: '6 W/mK' },
      { label: 'Biến thiên', value: '-40%' },
      { label: 'Phạm vi', value: '+5%' },
    ],
    image: '/images/industries_img/Heat-Conducting Materials.png',
    featured: true,
  },
  {
    id: 'thermal-server-2',
    industrySlug: 'heat-conducting',
    titleEn: 'Data Center Server Cooling',
    titleVi: 'Làm Mát Máy Chủ Trung Tâm Dữ Liệu',
    clientEn: 'Cloud Service Provider',
    clientVi: 'Nhà Cung Cấp Dịch Vụ Cloud',
    industryTagEn: 'Data Centers',
    industryTagVi: 'Trung tâm dữ liệu',
    challengeEn:
      'High-density server racks were experiencing thermal throttling, reducing computing performance. Standard thermal paste required frequent reapplication and inconsistent coverage.',
    challengeVi:
      'Rack máy chủ mật độ cao bị giới hạn nhiệt, giảm hiệu suất tính toán. Keo tản nhiệt tiêu chuẩn cần tra lại thường xuyên và độ phủ không đồng nhất.',
    solutionEn:
      'We introduced phase-change thermal interface material that softens at operating temperature, providing optimal thermal contact without pump-out over the server lifecycle.',
    solutionVi:
      'Chúng tôi giới thiệu vật liệu giao diện nhiệt chuyển pha mềm ở nhiệt độ vận hành, cung cấp tiếp xúc nhiệt tối ưu không bị bơm ra trong suốt vòng đời máy chủ.',
    resultsEn: [
      'CPU operating temperature reduced by 8°C',
      'Thermal throttling incidents eliminated',
      'Reapplication interval extended from 2 years to 5+ years',
      'Server computational performance improved by 12%',
    ],
    resultsVi: [
      'Giảm 8°C nhiệt độ vận hành CPU',
      'Loại bỏ sự cố giới hạn nhiệt',
      'Chu kỳ tra lại tăng từ 2 năm lên 5+ năm',
      'Cải thiện 12% hiệu suất tính toán máy chủ',
    ],
    statsEn: [
      { label: 'Temp Drop', value: '-8°C' },
      { label: 'Throttling', value: '0' },
      { label: 'Performance', value: '+12%' },
    ],
    statsVi: [
      { label: 'Giảm nhiệt', value: '-8°C' },
      { label: 'Giới hạn', value: '0' },
      { label: 'Hiệu suất', value: '+12%' },
    ],
    image: '/images/industries_img/Heat-Conducting Materials.png',
    featured: false,
  },
  {
    id: 'thermal-led-3',
    industrySlug: 'heat-conducting',
    titleEn: 'LED Lighting Thermal Management',
    titleVi: 'Quản Lý Nhiệt Đèn LED',
    clientEn: 'Industrial LED Fixture Manufacturer',
    clientVi: 'Nhà Sản Xuất Đèn LED Công Nghiệp',
    industryTagEn: 'LED Lighting',
    industryTagVi: 'Đèn LED',
    challengeEn:
      'High-bay LED fixtures were experiencing lumen depreciation due to inadequate thermal management. Existing thermal pads were too thick and inconsistent.',
    challengeVi:
      'Đèn LED nhà xưởng cao bị suy giảm lumen do quản lý nhiệt không đầy đủ. Miếng đệm nhiệt hiện tại quá dày và không đồng nhất.',
    solutionEn:
      'We provided 0.5mm thick thermal pads with 8 W/mK conductivity, die-cut to exact shapes for consistent application. The material provides both thermal transfer and mechanical cushioning.',
    solutionVi:
      'Chúng tôi cung cấp miếng đệm nhiệt dày 0.5mm với độ dẫn nhiệt 8 W/mK, cắt khuôn theo hình dạng chính xác cho ứng dụng đồng nhất. Vật liệu cung cấp cả truyền nhiệt và đệm cơ học.',
    resultsEn: [
      'LED junction temperature reduced by 12°C',
      'Lumen maintenance improved from 70% to 90% at 50,000 hours',
      'Assembly time reduced with pre-cut shapes',
      'Fixture warranty extended from 3 to 5 years',
    ],
    resultsVi: [
      'Giảm 12°C nhiệt độ junction LED',
      'Duy trì lumen cải thiện từ 70% lên 90% ở 50,000 giờ',
      'Giảm thời gian lắp ráp với hình dạng cắt sẵn',
      'Bảo hành đèn tăng từ 3 lên 5 năm',
    ],
    statsEn: [
      { label: 'Temp Drop', value: '-12°C' },
      { label: 'Lumen @50kh', value: '90%' },
      { label: 'Warranty', value: '5 yrs' },
    ],
    statsVi: [
      { label: 'Giảm nhiệt', value: '-12°C' },
      { label: 'Lumen @50kh', value: '90%' },
      { label: 'Bảo hành', value: '5 năm' },
    ],
    image: '/images/industries_img/Heat-Conducting Materials.png',
    featured: false,
  },
];

// Helper functions
export function getUseCasesByIndustry(industrySlug: string): UseCase[] {
  return useCases.filter((uc) => uc.industrySlug === industrySlug);
}

export function getFeaturedUseCases(): UseCase[] {
  return useCases.filter((uc) => uc.featured);
}

export function getUseCaseById(id: string): UseCase | undefined {
  return useCases.find((uc) => uc.id === id);
}

