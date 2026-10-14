export type CampaignSpotKind = 'nature' | 'heritage' | 'food' | 'cafe' | 'farm' | 'craft';

export interface CampaignSpot {
  name: string;
  location: string;
  activity: string;
  audience: string;
  kind: CampaignSpotKind;
  image?: string;
  imageAlt?: string;
  images?: { src: string; alt: string }[];
  serviceId?: string;
}

export interface MonthlyCampaign {
  month: number;
  theme: string;
  title: string;
  summary: string;
  spots: CampaignSpot[];
}

export interface CampaignPrice {
  name: string;
  amount: number;
  unit: string;
  includes?: string[];
  audience?: string;
}

export interface CampaignScheduleItem {
  time: string;
  activity: string;
}

export interface CampaignDetails {
  status: string;
  place: string;
  time: string;
  organizer?: string;
  message?: string;
  audience?: string;
  prices?: CampaignPrice[];
  pricingNote?: string;
  activities?: { title: string; description: string }[];
  schedule?: CampaignScheduleItem[];
  dateNote?: string;
  operationNotes?: string[];
}

export const CAMPAIGNS_365: MonthlyCampaign[] = [
  {
    month: 1,
    theme: 'Tết & Xuân',
    title: 'Du xuân Bình Mỹ',
    summary: 'Du xuân giữa vườn hoa, nhà vườn, hội xuân và hương vị quê Bình Mỹ.',
    spots: [
      {
        name: 'Vườn sinh thái Sông Bình Mỹ',
        location: 'Xã Bình Mỹ, Củ Chi · địa chỉ nhà vườn cần xác nhận',
        activity: 'Du xuân, check-in vườn hoa Tết, tham quan nhà vườn và thưởng thức đặc sản quê.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Du khách chèo xuồng trên dòng nước xanh tại Bình Mỹ' }],
      },
      {
        name: 'Vườn Ký Ức BM (Tư Huỳnh)',
        location: 'Điểm trải nghiệm trong hệ sinh thái Bình Mỹ Tourism',
        activity: 'Hóa trang, trải nghiệm khoai mì và nghe chuyện ký ức nông thôn với chủ đề Tết xưa.',
        audience: 'Gia đình có trẻ nhỏ, người thích ảnh hoài niệm',
        kind: 'farm',
      },
      {
        name: 'Quán Ăn Bờ Sông Tư Dần',
        location: 'Bình Mỹ, TP.HCM',
        activity: 'Dùng bữa đầu năm với món quê bên sông sau chuyến du xuân.',
        audience: 'Gia đình, nhóm đông người',
        kind: 'food',
      },
    ],
  },
  {
    month: 2,
    theme: 'Valentine & Hẹn hò',
    title: 'Valentine bên sông Bình Mỹ',
    summary: 'Hẹn hò tháng 2 với ẩm thực ven sông, góc check-in và chương trình acoustic dự kiến.',
    spots: [
      {
        name: 'Nhà hàng Ẩm thực ven sông Bình Mỹ',
        location: 'Bình Mỹ, TP.HCM · cần xác nhận địa chỉ cụ thể',
        activity: 'Đề xuất set menu Valentine cho hai người, góc check-in bên sông và đêm nhạc acoustic.',
        audience: 'Cặp đôi, gia đình, nhóm bạn',
        kind: 'food',
      },
      {
        name: 'Zi Coffee & Tea',
        location: '142 Bình Mỹ, TP.HCM',
        activity: 'Dừng uống cà phê hoặc trà trước hay sau hành trình khám phá.',
        audience: 'Sinh viên, cặp đôi, khách trẻ',
        kind: 'cafe',
        image: '/assets/zi_coffee_binh_my.jpg',
        imageAlt: 'Ảnh minh họa quán cà phê sân vườn Bình Mỹ',
        serviceId: 's5',
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Picnic, chèo xuồng và chụp ảnh giữa không gian xanh. Khung giờ hoàng hôn cần cơ sở xác nhận.',
        audience: 'Cặp đôi yêu thiên nhiên',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cau_go.jpg', alt: 'Cầu gỗ bắc qua ao tại khu du lịch sinh thái Bình Mỹ' }],
      },
    ],
  },
  {
    month: 3,
    theme: 'Tháng Thanh niên',
    title: 'Tháng Thanh niên: Trải nghiệm làng nghề',
    summary: 'Khám phá nghề thủ công, thử làm gốm và tìm hiểu hầm thủy đạo qua chuyến học tập thực tế.',
    spots: [
      {
        name: 'Trải nghiệm làng nghề đan lục bình',
        location: 'Điểm làng nghề tại Bình Mỹ · cần xác nhận đơn vị và địa chỉ',
        activity: 'Tìm hiểu nghề thủ công và tự tay đan sản phẩm từ lục bình; tài liệu ghi có quà mang về.',
        audience: 'Học sinh, sinh viên, câu lạc bộ',
        kind: 'craft',
      },
      {
        name: 'Khám phá làng gốm truyền thống',
        location: 'Điểm trải nghiệm gốm tại Bình Mỹ · cần xác nhận đơn vị và địa chỉ',
        activity: 'Quan sát quy trình làm gốm, thử tạo hình và trang trí sản phẩm đất sét.',
        audience: 'Học sinh, sinh viên, gia đình',
        kind: 'craft',
      },
      {
        name: 'Tham quan hầm thủy đạo Rạch Đáy',
        location: 'Khu Du lịch Bình Mỹ · cần xác nhận điểm tham quan',
        activity: 'Tìm hiểu câu chuyện lịch sử và đời sống địa phương qua hoạt động học tập thực tế.',
        audience: 'Học sinh, sinh viên, câu lạc bộ',
        kind: 'heritage',
      },
    ],
  },
  {
    month: 4,
    theme: '30/4 – Về nguồn & Tri ân',
    title: 'Dấu ấn Đất Thép',
    summary: 'Hành trình tìm hiểu lịch sử Củ Chi, tri ân và kết nối với Bình Mỹ.',
    spots: [
      {
        name: 'Nghĩa trang Liệt sĩ Củ Chi',
        location: 'Đường Tỉnh lộ 15, An Nhơn Tây, TP.HCM',
        activity: 'Dâng hương và tưởng niệm dịp 30/4; cần đăng ký và tuân thủ quy định tại địa điểm.',
        audience: 'Sinh viên, gia đình, đoàn thể',
        kind: 'heritage',
        images: [{ src: '/assets/Nghia_trang_Liet_si_Cu_Chi_cong.jpg', alt: 'Cổng Nghĩa trang Liệt sĩ huyện Củ Chi' }],
      },
      {
        name: 'Đền tưởng niệm liệt sĩ Bến Dược',
        location: 'Khu di tích Địa đạo Củ Chi, khu vực Bến Dược',
        activity: 'Tham quan đền và nhà văn bia, tìm hiểu câu chuyện lịch sử địa phương.',
        audience: 'Khách về nguồn, sinh viên, gia đình',
        kind: 'heritage',
        images: [
          { src: '/assets/Den_Ben_Duoc_cong.jpg', alt: 'Cổng Đền Bến Dược tại Củ Chi' },
          { src: '/assets/Den_Ben_Duoc_toan_canh.jpg', alt: 'Toàn cảnh khu Đền Bến Dược nhìn từ trên cao' },
        ],
      },
      {
        name: 'Khu Di tích lịch sử Địa đạo Củ Chi',
        location: 'Bến Đình – Bến Dược, Củ Chi',
        activity: 'Tham quan địa đạo, tìm hiểu lịch sử kháng chiến; có thể nối tuyến với Bình Mỹ.',
        audience: 'Khách trẻ, gia đình, khách quốc tế',
        kind: 'heritage',
        images: [
          { src: '/assets/Dia_dao_Cu_Chi_cong.jpg', alt: 'Cổng vào Khu di tích lịch sử Địa đạo Củ Chi' },
          { src: '/assets/Dia_dao_Cu_Chi_duong_ham.jpg', alt: 'Đường hầm bên trong Địa đạo Củ Chi' },
        ],
      },
    ],
  },
  {
    month: 5,
    theme: 'Chạm hè',
    title: 'Đi trốn gần thành phố',
    summary: 'Mở đầu mùa hè bằng trải nghiệm sông nước, hoạt động nhẹ và bữa ăn nhà vườn.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Gợi ý chèo xuồng, workshop và ăn trưa nhà vườn; xác nhận lịch hoạt động với cơ sở.',
        audience: 'Nhóm bạn, gia đình',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Trải nghiệm chèo xuồng tại Bình Mỹ' }],
      },
      {
        name: 'KDL Sinh thái ven sông Bình Mỹ',
        location: '22 Nguyễn Thị Da, Ấp 17, Bình Mỹ, TP.HCM',
        activity: 'Nghỉ ngơi và trải nghiệm ngoài trời; cần gọi xác nhận dịch vụ đang hoạt động.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Chòi lá ven hồ tại khu du lịch Bình Mỹ' }],
      },
      {
        name: 'Hai Châu Bình Mỹ',
        location: '8/1 Đường 162, Ấp 5, Bình Mỹ',
        activity: 'Gợi ý điểm ăn uống để kết thúc hành trình nửa ngày hoặc một ngày.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'food',
      },
    ],
  },
  {
    month: 6,
    theme: 'Mùa hè & Gia đình',
    title: 'Một ngày cả nhà',
    summary: 'Chọn hoạt động dễ tham gia để trẻ em, cha mẹ và ông bà cùng trải nghiệm.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Gợi ý chèo xuồng, workshop làm bánh, gốm hoặc khoai mì và ăn trưa; lịch cần cơ sở xác nhận.',
        audience: 'Gia đình có trẻ nhỏ',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cau_go.jpg', alt: 'Cầu gỗ trong khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Vườn Ký Ức BM (Tư Huỳnh)',
        location: 'Trong hệ sinh thái Bình Mỹ Tourism',
        activity: 'Kể chuyện ký ức và gợi ý hoạt động dân gian để kết nối các thế hệ.',
        audience: 'Gia đình nhiều thế hệ',
        kind: 'farm',
      },
      {
        name: 'Quán Ăn Bờ Sông Tư Dần',
        location: 'Bình Mỹ, TP.HCM',
        activity: 'Bữa trưa hoặc bữa chiều món quê bên sông sau chuyến trải nghiệm.',
        audience: 'Gia đình',
        kind: 'food',
      },
    ],
  },
  {
    month: 7,
    theme: 'Trại hè xanh · Nông dân nhí',
    title: 'Trại hè xanh: Nông dân nhí Bình Mỹ',
    summary: 'Một ngày về quê để trẻ tự tay làm vườn, vào bếp, khám phá nghề thủ công và chơi trò dân gian.',
    spots: [
      {
        name: 'Một ngày làm nông dân',
        location: 'Nhà vườn tại Bình Mỹ · địa điểm đăng cai cần xác nhận',
        activity: 'Gieo hạt, chăm rau, thu hoạch nông sản và mang về chậu cây tự trồng.',
        audience: 'Trẻ 6–14 tuổi cùng gia đình hoặc trường học',
        kind: 'farm',
      },
      {
        name: 'Gian bếp nông dân nhí',
        location: 'Khu workshop có mái che · cần xác nhận cơ sở',
        activity: 'Rửa rau, chuẩn bị nguyên liệu và làm bánh dân gian dưới sự giám sát của người lớn.',
        audience: 'Trẻ em và người thân',
        kind: 'food',
      },
      {
        name: 'Hộ chiếu nông dân nhí',
        location: 'Theo chương trình tổ chức tại Bình Mỹ',
        activity: 'Tích dấu qua bốn thử thách; hoàn thành chương trình sẽ nhận giấy chứng nhận và quà nhỏ.',
        audience: 'Trẻ em tham gia trại hè',
        kind: 'craft',
      },
    ],
  },
  {
    month: 8,
    theme: 'Lễ hội ẩm thực Nam Bộ',
    title: 'Bếp quê Bình Mỹ: Về Bình Mỹ – Thưởng thức vị quê',
    summary: 'Phiên chợ món quê, workshop nấu ăn và hành trình tìm hiểu nguyên liệu từ vườn đến bàn ăn.',
    spots: [
      {
        name: 'Phiên chợ hương vị quê nhà',
        location: 'Không gian lễ hội tại Bình Mỹ · cần xác nhận địa điểm',
        activity: 'Gian hàng ẩm thực do người dân giới thiệu và chế biến; danh sách món cần xác nhận với hộ tham gia.',
        audience: 'Gia đình, nhóm bạn, du khách yêu ẩm thực',
        kind: 'food',
      },
      {
        name: 'Vào bếp cùng người Bình Mỹ',
        location: 'Khu workshop ẩm thực · cần xác nhận cơ sở',
        activity: 'Tìm hiểu nguyên liệu, tự tay chế biến món dân gian và nhận công thức mang về.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'food',
      },
      {
        name: 'Từ khu vườn đến bàn ăn',
        location: 'Nhà vườn liên kết tại Bình Mỹ · cần xác nhận',
        activity: 'Tham quan vườn, tìm hiểu cách chăm sóc cây trồng và thu hoạch nguyên liệu.',
        audience: 'Gia đình, nhóm bạn và khách yêu ẩm thực',
        kind: 'farm',
      },
    ],
  },
  {
    month: 9,
    theme: 'Đêm hội Trung thu',
    title: 'Trăng về Bình Mỹ: Trăng sáng miền quê – Đong đầy ký ức',
    summary: 'Đêm hội vườn quê với đèn lồng thủ công, rước đèn, múa lân, trò chơi dân gian và phá cỗ.',
    spots: [
      {
        name: 'Workshop “Tự tay làm ánh trăng”',
        location: 'Không gian tổ chức tại Bình Mỹ · cần xác nhận địa điểm',
        activity: 'Tự làm đèn ông sao hoặc đèn giấy; thành phẩm có thể mang về làm kỷ niệm.',
        audience: 'Trẻ em và gia đình',
        kind: 'craft',
      },
      {
        name: 'Con đường ánh trăng',
        location: 'Tuyến vườn tại địa điểm tổ chức · cần xác nhận',
        activity: 'Dạo tuyến vườn trang trí đèn lồng và tiểu cảnh trăng rằm.',
        audience: 'Gia đình, cặp đôi, nhóm bạn',
        kind: 'nature',
      },
      {
        name: 'Đêm hội múa lân & phá cỗ',
        location: 'Sân khấu và khu sinh hoạt tại Bình Mỹ · cần xác nhận',
        activity: 'Dự kiến múa lân, trò chơi dân gian, rước đèn, phá cỗ và kể chuyện dưới trăng.',
        audience: 'Gia đình có trẻ nhỏ và du khách yêu văn hóa truyền thống',
        kind: 'heritage',
      },
    ],
  },
  {
    month: 10,
    theme: 'Trung thu theo lịch âm',
    title: 'Trăng về Bình Mỹ · Lịch chuyển theo Rằm',
    summary: 'Chỉ chuyển đêm hội sang tháng 10 nếu ngày Trung thu dương lịch rơi vào tháng này; xác nhận lịch theo từng năm.',
    spots: [
      {
        name: 'Đêm hội Trung thu (khi Rằm rơi vào tháng 10)',
        location: 'Không gian tổ chức tại Bình Mỹ · cần xác nhận địa điểm',
        activity: 'Dời chương trình từ tháng 9 theo ngày Rằm tháng 8 âm lịch của năm đó.',
        audience: 'Gia đình có trẻ nhỏ, cặp đôi, nhóm bạn',
        kind: 'heritage',
      },
      {
        name: 'Workshop đèn lồng & bánh Trung thu',
        location: 'Khu workshop tại địa điểm đăng cai · cần xác nhận',
        activity: 'Làm đèn ông sao, đèn giấy và bánh Trung thu đơn giản theo chương trình đã xác nhận.',
        audience: 'Trẻ em và gia đình',
        kind: 'craft',
      },
      {
        name: 'Rước đèn, múa lân & phá cỗ',
        location: 'Tuyến vườn và sân sinh hoạt · cần xác nhận',
        activity: 'Các hoạt động theo lịch mẫu, được điều chỉnh theo ngày lễ và điều kiện thực tế.',
        audience: 'Gia đình và du khách yêu văn hóa truyền thống',
        kind: 'heritage',
      },
    ],
  },
  {
    month: 11,
    theme: 'Gieo trồng & Đất lành',
    title: 'Đất lành gieo hạt',
    summary: 'Dành thời gian cho đất, cây trồng, mùa vụ và câu chuyện của người làm vườn.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Gợi ý trải nghiệm vườn và workshop nông nghiệp hoặc làm bánh theo lịch của cơ sở.',
        audience: 'Gia đình, sinh viên, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Chòi lá ven hồ tại khu du lịch Bình Mỹ' }],
      },
      {
        name: 'Vườn Ký Ức BM (Tư Huỳnh)',
        location: 'Trong hệ sinh thái Bình Mỹ Tourism',
        activity: 'Tìm hiểu cây khoai mì, ký ức nông nghiệp và lao động nông thôn.',
        audience: 'Học sinh, gia đình',
        kind: 'farm',
      },
      {
        name: 'Nhà vườn hoặc HTX thí điểm của dự án',
        location: 'Bình Mỹ; chọn cơ sở sau khi xác minh và được đồng ý hợp tác',
        activity: 'Có thể tổ chức gieo hạt, trồng cây hoặc thu hoạch khi đã xác nhận dịch vụ, lịch và quyền sử dụng ảnh.',
        audience: 'Khách muốn trải nghiệm nông nghiệp',
        kind: 'farm',
        images: [{ src: '/assets/Rau_muong_VietGAP_Binh_My.jpg', alt: 'Ruộng rau muống VietGAP tại Bình Mỹ' }],
      },
    ],
  },
  {
    month: 12,
    theme: 'Giáng sinh & Đón năm mới',
    title: 'Bình Mỹ cuối năm',
    summary: 'Khép lại năm với chuyến picnic, cà phê, bữa ăn và cuộc hẹn gần thành phố.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Gợi ý picnic nhóm và workshop; chỉ giới thiệu trang trí Noel khi cơ sở triển khai thực tế.',
        audience: 'Gia đình, nhóm bạn, nhóm công ty nhỏ',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Du khách chèo xuồng trên dòng nước xanh tại Bình Mỹ' }],
      },
      {
        name: 'Cafe Hẹn Củ Chi',
        location: '477 Bình Mỹ, TP.HCM',
        activity: 'Gợi ý buổi cà phê cuối năm; chỉ nhắc đến trang trí Noel nếu quán có thực tế.',
        audience: 'Sinh viên, cặp đôi, nhóm bạn',
        kind: 'cafe',
      },
      {
        name: 'Hai Châu Bình Mỹ',
        location: '8/1 Đường 162, Ấp 5, Bình Mỹ',
        activity: 'Gợi ý bữa ăn tổng kết năm để khép lại hành trình Bình Mỹ 365.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'food',
      },
    ],
  },
];

// Operational details transcribed from the supplied month 1, 2, 3 and 7–9
// planning documents. Planned events and unconfirmed prices remain labeled as such.
export const CAMPAIGN_DETAILS: Partial<Record<number, CampaignDetails>> = {
  1: {
    status: 'Giá theo tài liệu · cần nhà vườn xác nhận',
    place: 'Vườn sinh thái Sông Bình Mỹ hoặc nhà vườn liên kết tại xã Bình Mỹ, Củ Chi, TP.HCM',
    time: '08:00–17:00 · từ mùng 2 đến hết Rằm tháng Giêng âm lịch',
    organizer: 'Ban quản lý Bình Mỹ Wellness Web phối hợp cùng Nhà vườn Sông Bình Mỹ',
    message: 'Du xuân giữa vườn hoa và không gian làng quê; có check-in áo dài, hái lộc, tham quan vườn cây, thưởng thức đặc sản và trò chơi dân gian.',
    audience: 'Khách thích chụp ảnh; gia đình và nhóm bạn muốn trải nghiệm nhà vườn.',
    prices: [
      {
        name: 'Gói Cơ Bản · Vé vào cổng & check-in',
        amount: 99000,
        unit: 'người',
        includes: ['Tham quan không gian làng quê và vườn hoa Tết', 'Tham gia hái lộc đầu năm', 'Tặng 1 phần trà thảo mộc chào xuân'],
        audience: 'Khách tham quan ngắn ngày, thích chụp ảnh.',
      },
      {
        name: 'Gói Trải Nghiệm Nhà Vườn · Tiêu chuẩn',
        amount: 199000,
        unit: 'người',
        includes: ['Toàn bộ quyền lợi Gói Cơ Bản', 'Tham quan vườn cây, tự hái và thưởng thức trái cây theo mùa', 'Hội xuân, chợ Tết, xin chữ và trò chơi dân gian', 'Tặng 1 phần quà lộc quê'],
        audience: 'Gia đình, nhóm bạn muốn trải nghiệm nông nghiệp.',
      },
      {
        name: 'Combo Gia Đình / Nhóm · từ 4 người',
        amount: 899000,
        unit: 'nhóm 4 người',
        includes: ['Toàn bộ quyền lợi Gói Trải Nghiệm Nhà Vườn cho 4 người', 'Tặng 1 set quà đặc sản Bình Mỹ mang về', 'Hỗ trợ góc chụp ảnh chung miễn phí'],
        audience: 'Gia đình có trẻ em hoặc nhóm bạn đi dịp Tết.',
      },
    ],
    pricingNote: 'Hotline trong tài liệu là số mẫu (09xx.xxx.xxx), nên không hiển thị như số liên hệ. Xác nhận giá, lịch âm và địa điểm trước khi đặt.',
    activities: [
      { title: 'Check-in vườn hoa & hái lộc', description: 'Tản bộ, chụp ảnh áo dài và nhận lộc đầu năm.' },
      { title: 'Trải nghiệm nhà vườn', description: 'Tham quan cây ăn trái, tự hái trái chín theo mùa và thưởng thức đặc sản quê.' },
      { title: 'Hội xuân truyền thống', description: 'Xin chữ, trò chơi dân gian và chợ Tết Bình Mỹ.' },
    ],
  },
  2: {
    status: 'Giá theo tài liệu · cần nhà hàng xác nhận',
    place: 'Nhà hàng Ẩm thực ven sông Bình Mỹ',
    time: '17:00–22:00 · chương trình dự kiến trong tháng 2',
    organizer: 'Ban quản lý Bình Mỹ Wellness Web phối hợp cùng Nhà hàng Ẩm thực ven sông Bình Mỹ',
    message: 'Không gian hẹn hò ven sông dịp Valentine, kết hợp ẩm thực, góc check-in và đêm nhạc acoustic.',
    audience: 'Cặp đôi, gia đình, nhóm bạn.',
    prices: [
      { name: 'Vé trải nghiệm Valentine', amount: 150000, unit: 'người' },
    ],
    pricingNote: 'Tài liệu chưa nêu rõ quyền lợi bao gồm trong vé. Hotline 09xx.xxx.xxx là số mẫu; xác nhận giá, menu, chương trình, lịch biểu diễn và số liên hệ với nhà hàng trước khi đặt.',
    activities: [
      { title: 'Check-in & lưu giữ khoảnh khắc', description: 'Cổng trái tim, góc chụp ảnh bên sông, tiểu cảnh hoa xuân và mini game ảnh đôi.' },
      { title: 'Thưởng thức ẩm thực ven sông', description: 'Đề xuất set menu cho hai người; ưu đãi đặt bàn sớm hoặc món tráng miệng là phương án cần nhà hàng xác nhận.' },
      { title: 'Đêm nhạc acoustic', description: 'Dự kiến biểu diễn nhạc tình yêu buổi tối và giao lưu lời nhắn yêu thương.' },
    ],
  },
  3: {
    status: 'Giá theo tài liệu · cần đơn vị tổ chức xác nhận',
    place: 'Khu Du lịch Bình Mỹ · xác nhận vị trí và đơn vị phụ trách từng trải nghiệm',
    time: '07:30–17:00 · chương trình dự kiến trong tháng 3',
    organizer: 'Ban quản lý Bình Mỹ Wellness Web phối hợp cùng Du lịch Bình Mỹ',
    message: 'Chương trình Tháng Thanh niên kết hợp làng nghề, trải nghiệm gốm và học tập thực tế tại hầm thủy đạo Rạch Đáy.',
    audience: 'Học sinh, sinh viên, câu lạc bộ và đoàn thể.',
    prices: [
      { name: 'Trải nghiệm làng nghề đan lục bình', amount: 100000, unit: 'người', includes: ['Thử đan sản phẩm thủ công', 'Có quà mang về'] },
      { name: 'Khám phá làng gốm truyền thống', amount: 120000, unit: 'người', includes: ['Trải nghiệm tạo hình và trang trí đất sét', 'Có quà mang về'] },
      { name: 'Tham quan hầm thủy đạo Rạch Đáy', amount: 80000, unit: 'người' },
    ],
    pricingNote: 'Tài liệu có nêu ưu đãi 50% cho học sinh, sinh viên nhưng chưa ghi điều kiện và phạm vi áp dụng. Hotline 09xx.xxx.xxx là số mẫu; xác nhận thông tin với đơn vị tổ chức trước khi quảng bá.',
    activities: [
      { title: 'Làng nghề đan lục bình', description: 'Tìm hiểu nghề thủ công và tự tay đan sản phẩm từ lục bình.' },
      { title: 'Làng gốm truyền thống', description: 'Quan sát quy trình, thử tạo hình và trang trí sản phẩm đất sét.' },
      { title: 'Hầm thủy đạo Rạch Đáy', description: 'Tham quan và tìm hiểu lịch sử, đời sống địa phương qua hoạt động học tập thực tế.' },
    ],
  },
  7: {
    status: 'Đề xuất sự kiện · chưa có giá và địa điểm xác nhận',
    place: 'Nhà vườn tại Bình Mỹ · cần xác nhận cơ sở đăng cai',
    time: 'Lịch mẫu 08:00–15:30 · ưu tiên hoạt động ngoài trời buổi sáng',
    message: 'Trại hè xanh “Nông dân nhí Bình Mỹ” với thông điệp “Một ngày về quê – Ngàn điều để học”.',
    audience: 'Gia đình có trẻ 6–14 tuổi, trường học và câu lạc bộ thiếu nhi.',
    pricingNote: 'Tài liệu chưa cung cấp giá vé, địa chỉ cụ thể, hotline hoặc lịch tổ chức đã xác nhận.',
    activities: [
      { title: 'Một ngày làm nông dân', description: 'Nhận nón lá, giỏ và dụng cụ; học gieo hạt, chăm rau, thu hoạch và mang về chậu cây tự trồng.' },
      { title: 'Gian bếp nông dân nhí', description: 'Sơ chế nguyên liệu và làm bánh dân gian dưới sự giám sát của người lớn.' },
      { title: 'Bàn tay khéo léo & trò chơi miền quê', description: 'Đan lục bình, vẽ túi vải, trang trí nón lá và tham gia thử thách đồng đội.' },
      { title: 'Hộ chiếu nông dân nhí', description: 'Mỗi trẻ nhận hộ chiếu có tên và mã QR cá nhân; tích đủ dấu qua bốn thử thách để nhận giấy chứng nhận và quà nhỏ.' },
    ],
    schedule: [
      { time: '08:00–08:30', activity: 'Đón khách, nhận hộ chiếu, phổ biến nội quy' },
      { time: '08:30–10:00', activity: 'Trồng cây và thu hoạch rau' },
      { time: '10:00–11:30', activity: 'Workshop làm bánh dân gian' },
      { time: '11:30–13:00', activity: 'Ăn trưa, nghỉ ngơi' },
      { time: '13:00–14:00', activity: 'Trải nghiệm thủ công' },
      { time: '14:00–15:00', activity: 'Trò chơi dân gian và thử thách đồng đội' },
      { time: '15:00–15:30', activity: 'Trao chứng nhận, chụp ảnh và nhận quà' },
    ],
    operationNotes: [
      'Tháng 7 thường có mưa: bố trí workshop có mái che và điều chỉnh hoạt động ngoài trời theo thời tiết.',
      'Cần người hướng dẫn theo nhóm tuổi, dụng cụ an toàn và giám sát trẻ; không để trẻ tự tiếp cận ao, hồ hoặc kênh rạch.',
    ],
  },
  8: {
    status: 'Đề xuất lễ hội · chưa có giá và địa điểm xác nhận',
    place: 'Không gian lễ hội tại Bình Mỹ · cần xác nhận cơ sở đăng cai',
    time: 'Lịch mẫu 09:00–17:00 · có thể tổ chức trong hai ngày cuối tuần',
    message: 'Lễ hội ẩm thực Nam Bộ “Bếp quê Bình Mỹ” với thông điệp “Về Bình Mỹ – Thưởng thức vị quê”.',
    audience: 'Gia đình, nhóm bạn trẻ, người yêu ẩm thực và du khách quốc tế.',
    pricingNote: 'Tài liệu chưa cung cấp giá vé, giá workshop, menu, hotline hoặc ngày tổ chức xác nhận.',
    activities: [
      { title: 'Phiên chợ hương vị quê nhà', description: 'Dự kiến có bánh xèo, bánh ít, bánh dân gian, món kho, món canh và rau củ theo mùa; thực đơn cần xác nhận với các hộ tham gia.' },
      { title: 'Workshop “Vào bếp cùng người Bình Mỹ”', description: 'Tìm hiểu nguyên liệu, tự chế biến món dân gian và nhận công thức mang về.' },
      { title: 'Từ khu vườn đến bàn ăn', description: 'Tham quan nhà vườn, tìm hiểu cây trồng và thu hoạch nguyên liệu cho khu bếp.' },
      { title: 'Mâm cơm đoàn viên Bình Mỹ', description: 'Bữa ăn chung phong cách gia đình Nam Bộ, đi kèm câu chuyện về món ăn và đời sống địa phương.' },
      { title: 'Cuộc thi “Một món quê – Một câu chuyện”', description: 'Các hộ dân, gia đình hoặc nhóm khách giới thiệu món ăn gắn với ký ức và đời sống địa phương.' },
    ],
    schedule: [
      { time: '09:00–10:00', activity: 'Khai mạc phiên chợ ẩm thực' },
      { time: '10:00–11:30', activity: 'Tham quan nhà vườn, tìm hiểu nguyên liệu' },
      { time: '11:30–13:00', activity: 'Thưởng thức mâm cơm quê' },
      { time: '13:00–14:30', activity: 'Workshop làm bánh, chế biến món dân gian' },
      { time: '14:30–16:00', activity: 'Cuộc thi nấu ăn và giao lưu' },
      { time: '16:00–17:00', activity: 'Trao giải, tham quan gian hàng, mua nông sản' },
    ],
    operationNotes: [
      'Bố trí khu chế biến và ăn uống có mái che, điểm rửa tay, thu gom rác hữu cơ và phân loại bao bì.',
      'Xác nhận món ăn với các hộ địa phương để nội dung giới thiệu phản ánh đúng sản vật và văn hóa Bình Mỹ.',
    ],
  },
  9: {
    status: 'Đề xuất sự kiện · chưa có giá và địa điểm xác nhận',
    place: 'Vườn hoặc không gian tổ chức tại Bình Mỹ · cần xác nhận cơ sở đăng cai',
    time: 'Lịch mẫu 16:00–20:30 · ngày dương lịch thay đổi theo Rằm tháng 8 âm lịch',
    message: 'Đêm hội Trung thu “Trăng về Bình Mỹ” với thông điệp “Trăng sáng miền quê – Đong đầy ký ức”.',
    audience: 'Gia đình có trẻ nhỏ, cặp đôi, nhóm bạn và du khách yêu văn hóa truyền thống.',
    pricingNote: 'Tài liệu chưa cung cấp giá vé, giá workshop, hotline hoặc ngày tổ chức xác nhận.',
    activities: [
      { title: 'Workshop “Tự tay làm ánh trăng”', description: 'Tự làm đèn ông sao hoặc đèn giấy, trang trí họa tiết dân gian và mang thành phẩm về.' },
      { title: 'Con đường ánh trăng & Vườn trăng ký ức', description: 'Dạo tuyến vườn trang trí đèn lồng, tiểu cảnh trăng rằm và góc kể chuyện dưới trăng.' },
      { title: 'Đêm hội múa lân & phá cỗ', description: 'Dự kiến có múa lân, trò chơi dân gian, giao lưu trẻ em và phá cỗ Trung thu.' },
      { title: 'Góc bếp đêm trăng', description: 'Làm bánh Trung thu đơn giản, pha trà và tìm hiểu mâm cỗ truyền thống.' },
    ],
    schedule: [
      { time: '16:00–17:00', activity: 'Đón khách, check-in vườn trăng' },
      { time: '17:00–18:00', activity: 'Workshop làm đèn lồng, bánh Trung thu' },
      { time: '18:00–18:30', activity: 'Khai mạc, biểu diễn múa lân' },
      { time: '18:30–19:15', activity: 'Rước đèn theo con đường ánh trăng' },
      { time: '19:15–20:00', activity: 'Phá cỗ, kể chuyện dưới trăng' },
      { time: '20:00–20:30', activity: 'Chụp ảnh, giao lưu, kết thúc' },
    ],
    dateNote: 'Tài liệu lấy năm 2026 làm ví dụ: Rằm tháng 8 rơi vào 25/09/2026 (đã qua tính đến 14/10/2026). Các năm sau cần đối chiếu lịch âm; nếu ngày lễ rơi vào tháng 10 thì chuyển chương trình sang tháng 10.',
    operationNotes: [
      'Ưu tiên đèn LED cho trẻ nhỏ; không thả đèn xuống sông hoặc thả đèn trời.',
      'Bố trí tuyến rước đèn xa mép nước, hệ thống điện ngoài trời an toàn, lối thoát hiểm và phương án trú mưa.',
    ],
  },
};

// The supplied plan says to move the Mid-Autumn event into October when its
// lunar date falls there, so keep the same run-of-show available for that case.
CAMPAIGN_DETAILS[10] = {
  ...CAMPAIGN_DETAILS[9]!,
  status: 'Chỉ chuyển sang tháng 10 nếu Rằm tháng 8 âm lịch rơi vào tháng này',
  time: 'Dùng lịch trình mẫu 16:00–20:30; đối chiếu ngày dương lịch theo lịch âm từng năm',
  dateNote: 'Theo tài liệu, nếu ngày Trung thu dương lịch rơi vào tháng 10 thì chuyển đêm hội từ tháng 9 sang tháng 10. Xác nhận ngày và lịch tổ chức cho từng năm.',
};
