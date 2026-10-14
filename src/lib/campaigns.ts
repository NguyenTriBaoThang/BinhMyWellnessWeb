export type CampaignSpotKind = 'nature' | 'heritage' | 'food' | 'cafe' | 'farm' | 'craft';

export interface CampaignSpot {
  name: string;
  location: string;
  activity: string;
  audience: string;
  kind: CampaignSpotKind;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
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
  studentAmount?: number;
  includes?: string[];
  audience?: string;
}

export interface CampaignMediaItem {
  src: string;
  alt: string;
  title: string;
  orientation: 'portrait' | 'landscape';
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
  media?: CampaignMediaItem[];
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
    summary: 'Điểm đến có địa chỉ xác định; lịch và hoạt động chủ đề Tết cần được cơ sở xác nhận.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Vườn Ký Ức BM',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Tham quan Vườn Ký Ức BM, trải nghiệm khoai mì và hoạt động du xuân theo lịch cơ sở xác nhận.',
        audience: 'Gia đình, nhóm bạn, đoàn học sinh',
        kind: 'farm',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Hoạt động trải nghiệm tại khu du lịch sinh thái Bình Mỹ' }],
      },
    ],
  },
  {
    month: 2,
    theme: 'Valentine & Hẹn hò',
    title: 'Valentine bên sông Bình Mỹ',
    summary: 'Hai khu du lịch có địa chỉ công khai; chương trình Valentine trong tài liệu vẫn cần xác nhận.',
    spots: [
      {
        name: 'KDL Sinh thái ven sông Bình Mỹ',
        location: 'Số 22 Đường Nguyễn Thị Da, Xã Bình Mỹ, TP.HCM',
        activity: 'Không gian sinh thái ven sông; set menu Valentine và đêm nhạc acoustic là đề xuất, cần cơ sở xác nhận.',
        audience: 'Cặp đôi, gia đình, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Không gian nhà chòi ven hồ tại khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Tham quan vườn, chèo xuồng và dùng dịch vụ tại điểm. Hoạt động riêng dịp Valentine cần xác nhận.',
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
    summary: 'Dùng điểm đón và workshop có địa chỉ công khai; lịch trải nghiệm cần xác nhận trước chuyến đi.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Workshop thủ công',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Điểm đến có workshop khoai mì, gốm và hoạt động tìm hiểu địa phương; nội dung cụ thể theo lịch cơ sở xác nhận.',
        audience: 'Học sinh, sinh viên, gia đình',
        kind: 'craft',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Du khách trải nghiệm tại khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Điểm chèo xuồng Rạch Đáy',
        location: 'Cầu Rạch Đáy, Đường Đỗ Thị Nhặt, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Chèo xuồng Rạch Đáy theo tour đã đặt; liên hệ điểm đón để được hướng dẫn vị trí tập trung.',
        audience: 'Học sinh, sinh viên, gia đình, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Chèo xuồng trên tuyến Rạch Đáy tại Bình Mỹ' }],
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
    summary: 'Kế hoạch trại hè tại điểm du lịch có địa chỉ; cơ sở cần xác nhận ngày và sức chứa đoàn.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Trại hè xanh',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Kế hoạch gồm làm vườn, vào bếp và trò chơi cho trẻ; cần cơ sở xác nhận hoạt động, ngày tổ chức và sức chứa.',
        audience: 'Trẻ 6–14 tuổi cùng gia đình hoặc trường học',
        kind: 'farm',
        imageCaption: 'Ảnh tham khảo trong tài liệu',
        images: [{ src: '/assets/word/thang-07-09/image2.jpg', alt: 'Trẻ em trồng cây tại vườn trong trại hè' }],
      },
    ],
  },
  {
    month: 8,
    theme: 'Lễ hội ẩm thực Nam Bộ',
    title: 'Bếp quê Bình Mỹ: Về Bình Mỹ – Thưởng thức vị quê',
    summary: 'Kế hoạch lễ hội ẩm thực tại một địa điểm thật; lịch tổ chức và hộ tham gia chưa được xác nhận.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Lễ hội ẩm thực',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Kế hoạch gồm phiên chợ món quê, workshop nấu ăn và trải nghiệm từ vườn đến bàn ăn; cần xác nhận ngày và đơn vị tham gia.',
        audience: 'Gia đình, nhóm bạn, du khách yêu ẩm thực',
        kind: 'food',
        imageCaption: 'Ảnh tham khảo trong tài liệu',
        images: [{ src: '/assets/word/thang-07-09/image8.jpg', alt: 'Gian hàng ẩm thực trong không gian nhà vườn' }],
      },
    ],
  },
  {
    month: 9,
    theme: 'Đêm hội Trung thu',
    title: 'Trăng về Bình Mỹ: Trăng sáng miền quê – Đong đầy ký ức',
    summary: 'Kế hoạch Trung thu tại địa điểm thật; ngày tổ chức và chương trình sân khấu cần được xác nhận.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Đêm hội Trung thu',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Kế hoạch gồm làm lồng đèn, rước đèn, múa lân và phá cỗ; cần xác nhận lịch và hoạt động với điểm đến.',
        audience: 'Trẻ em, gia đình, nhóm bạn',
        kind: 'heritage',
        imageCaption: 'Ảnh tham khảo trong tài liệu',
        images: [{ src: '/assets/word/thang-07-09/image15.jpg', alt: 'Trẻ em tự tay làm lồng đèn Trung thu' }],
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

// Details and media are drawn from the supplied monthly documents. Draft events
// and poster prices remain labeled as proposals or references until confirmed.
export const CAMPAIGN_DETAILS: Partial<Record<number, CampaignDetails>> = {
  1: {
    status: 'Giá theo tài liệu · cần nhà vườn xác nhận',
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
    time: '08:00–17:00 · từ mùng 2 đến hết Rằm tháng Giêng âm lịch',
    organizer: 'Lịch chương trình Tết cần được xác nhận với đơn vị vận hành Du lịch Bình Mỹ.',
    message: 'Địa chỉ điểm đến đã xác định. Các hoạt động check-in, hái lộc và hội xuân là đề xuất trong tài liệu, chưa phải lịch đã được cơ sở xác nhận.',
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
    pricingNote: 'Poster có thêm quyền lợi bản đồ hành trình, trong khi phần mô tả gói ghi tặng trà thảo mộc; cần chốt quyền lợi cuối cùng với nhà vườn. Hotline 09xx.xxx.xxx là số mẫu, không phải số liên hệ dùng được.',
    media: [
      { src: '/assets/word/thang-01/image1.png', alt: 'Poster Du xuân Bình Mỹ và hái lộc đầu năm', title: 'Poster Du xuân Bình Mỹ', orientation: 'portrait' },
      { src: '/assets/word/thang-01/image2.png', alt: 'Poster các hoạt động du xuân tại Bình Mỹ', title: 'Hoạt động du xuân', orientation: 'portrait' },
      { src: '/assets/word/thang-01/image3.png', alt: 'Infographic giá ba gói trải nghiệm tháng 1', title: 'Các gói và giá tham khảo', orientation: 'landscape' },
    ],
    activities: [
      { title: 'Check-in vườn hoa & hái lộc', description: 'Tản bộ, chụp ảnh áo dài và nhận lộc đầu năm.' },
      { title: 'Trải nghiệm nhà vườn', description: 'Tham quan cây ăn trái, tự hái trái chín theo mùa và thưởng thức đặc sản quê.' },
      { title: 'Hội xuân truyền thống', description: 'Xin chữ, trò chơi dân gian và chợ Tết Bình Mỹ.' },
    ],
  },
  2: {
    status: 'Giá theo tài liệu · cần điểm đến xác nhận',
    place: 'KDL Sinh thái ven sông Bình Mỹ, số 22 Nguyễn Thị Da; hoặc Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu',
    time: '17:00–22:00 · chương trình dự kiến trong tháng 2',
    organizer: 'Đơn vị tổ chức chương trình Valentine chưa được xác nhận.',
    message: 'Hai địa chỉ khu du lịch có thật được liệt kê ở trên. Set menu, góc check-in và đêm nhạc acoustic là đề xuất trong tài liệu; xác nhận dịch vụ và lịch với điểm đến trước khi đặt.',
    audience: 'Cặp đôi, gia đình, nhóm bạn.',
    prices: [
      { name: 'Vé trải nghiệm Valentine', amount: 150000, unit: 'người' },
    ],
    media: [
      { src: '/assets/word/thang-02/image1.png', alt: 'Poster hoạt động Valentine và hẹn hò ven sông Bình Mỹ', title: 'Poster Valentine & hẹn hò', orientation: 'portrait' },
      { src: '/assets/word/thang-02/image2.png', alt: 'Poster giá 150.000 đồng mỗi người cho trải nghiệm Valentine', title: 'Giá và thông tin nhà hàng', orientation: 'portrait' },
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
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu; điểm chèo xuồng tại Cầu Rạch Đáy, Đường Đỗ Thị Nhặt, Ấp An Hòa',
    time: '07:30–17:00 · chương trình dự kiến trong tháng 3',
    organizer: 'Workshop và điểm đón cần được xác nhận trực tiếp với đơn vị vận hành Du lịch Bình Mỹ.',
    message: 'Điểm đón và điểm chèo xuồng Rạch Đáy có địa chỉ cụ thể. Giá, hoạt động làng nghề và nội dung tham quan trong tài liệu cần được cơ sở xác nhận trước khi quảng bá.',
    audience: 'Học sinh, sinh viên, câu lạc bộ và đoàn thể.',
    prices: [
      { name: 'Trải nghiệm làng nghề đan lục bình', amount: 100000, studentAmount: 50000, unit: 'người', includes: ['Tìm hiểu nghề và tự tay đan sản phẩm', 'Có quà mang về'] },
      { name: 'Khám phá làng gốm truyền thống', amount: 120000, studentAmount: 60000, unit: 'người', includes: ['Tạo hình và trang trí sản phẩm đất sét', 'Có quà mang về'] },
      { name: 'Tham quan hầm thủy đạo Rạch Đáy', amount: 80000, studentAmount: 40000, unit: 'người' },
    ],
    pricingNote: 'Poster ghi giá học sinh, sinh viên lần lượt 50.000đ, 60.000đ và 40.000đ; dòng ghi chú nêu áp dụng cho đoàn từ 10 người. Xác nhận điều kiện này với đơn vị tổ chức trước khi quảng bá. Hotline 09xx.xxx.xxx là số mẫu.',
    media: [
      { src: '/assets/word/thang-03/image1.png', alt: 'Poster Tháng 3 khám phá Bình Mỹ và ưu đãi học sinh sinh viên', title: 'Poster Tháng Thanh niên', orientation: 'portrait' },
      { src: '/assets/word/thang-03/image2.jpeg', alt: 'Infographic hoạt động và giá tham khảo tháng 3', title: 'Hoạt động và giá tham khảo', orientation: 'landscape' },
    ],
    activities: [
      { title: 'Làng nghề đan lục bình', description: 'Tìm hiểu nghề thủ công và tự tay đan sản phẩm từ lục bình.' },
      { title: 'Làng gốm truyền thống', description: 'Quan sát quy trình, thử tạo hình và trang trí sản phẩm đất sét.' },
      { title: 'Hầm thủy đạo Rạch Đáy', description: 'Tham quan và tìm hiểu lịch sử, đời sống địa phương qua hoạt động học tập thực tế.' },
    ],
  },
  7: {
    status: 'Giá tham khảo trên poster · cần đơn vị xác nhận',
    place: 'Điểm dự kiến: Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu, Ấp An Hòa',
    time: 'Lịch mẫu 08:00–15:30 · ưu tiên hoạt động ngoài trời buổi sáng',
    message: 'Trại hè xanh “Nông dân nhí Bình Mỹ” theo tài liệu. Cần xác nhận cơ sở đăng cai, ngày tổ chức, hoạt động và sức chứa đoàn.',
    audience: 'Gia đình có trẻ 6–14 tuổi, trường học và câu lạc bộ thiếu nhi.',
    prices: [
      { name: 'Gói Nửa Ngày', amount: 149000, unit: 'bé', includes: ['Trồng cây và thu hoạch rau cùng chủ vườn', 'Nón lá, giỏ nhỏ và dụng cụ làm vườn', 'Mang về chậu cây tự trồng và hộ chiếu nông dân nhí'] },
      { name: 'Gói Nông Dân Nhí Trọn Ngày', amount: 299000, unit: 'bé', includes: ['Vườn rau, gian bếp, thủ công và trò chơi', 'Làm bánh dân gian, ăn trưa và nước uống', 'Giấy chứng nhận “Nông dân nhí Bình Mỹ” và quà'] },
      { name: 'Combo Gia Đình', amount: 899000, unit: '2 người lớn + 2 bé', includes: ['Trọn gói hoạt động cho gia đình 2 người lớn và 2 bé', 'Ăn trưa và nước uống', '4 hộ chiếu, chứng nhận và quà lưu niệm'] },
    ],
    pricingNote: 'Mức giá trên poster được ghi là giá tham khảo. Địa điểm, hotline, lịch cuối tuần và giá cuối cùng cần được nhà vườn xác nhận.',
    media: [
      { src: '/assets/word/thang-07-09/image1.jpg', alt: 'Nhóm trẻ tham gia trải nghiệm nông nghiệp ngoài trời', title: 'Trải nghiệm tại vườn', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image2.jpg', alt: 'Trẻ em trồng cây và làm vườn', title: 'Một ngày làm nông dân', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image3.jpg', alt: 'Trẻ em học chuẩn bị món ăn dân gian', title: 'Gian bếp nông dân nhí', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image4.jpg', alt: 'Trẻ em tham gia hoạt động thủ công', title: 'Hoạt động thủ công', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image5.jpg', alt: 'Poster Trại hè xanh Nông dân nhí Bình Mỹ', title: 'Poster Trại hè xanh', orientation: 'portrait' },
      { src: '/assets/word/thang-07-09/image6.jpg', alt: 'Trẻ em chơi trò chơi đồng đội ngoài trời', title: 'Trò chơi miền quê', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image21.png', alt: 'Infographic ba gói giá tham khảo Trại hè xanh', title: 'Các gói và giá tham khảo', orientation: 'landscape' },
    ],
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
    status: 'Giá tham khảo trên poster · cần đơn vị xác nhận',
    place: 'Điểm dự kiến: Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu, Ấp An Hòa',
    time: 'Lịch mẫu 09:00–17:00 · có thể tổ chức trong hai ngày cuối tuần',
    message: 'Lễ hội ẩm thực Nam Bộ “Bếp quê Bình Mỹ” theo tài liệu. Cần xác nhận ngày, khu vực tổ chức và các hộ tham gia với cơ sở.',
    audience: 'Gia đình, nhóm bạn trẻ, người yêu ẩm thực và du khách quốc tế.',
    prices: [
      { name: 'Gói Chợ Quê', amount: 99000, unit: 'người', includes: ['Vào cổng chợ quê, tham quan gian hàng tre và lá dừa', 'Phiếu thưởng thức nhiều món truyền thống', 'Check-in không gian làng quê'] },
      { name: 'Gói Vào Bếp Cùng Người Bình Mỹ', amount: 249000, unit: 'người', includes: ['Tham quan vườn và chọn nguyên liệu', 'Tự tay chế biến, thưởng thức thành phẩm', 'Nhận công thức mang về'] },
      { name: 'Combo Mâm Cơm Đoàn Viên', amount: 999000, unit: 'nhóm 4 người', includes: ['Tham quan vườn và workshop nấu ăn', 'Mâm cơm quê và câu chuyện bếp quê', 'Phiếu chợ quê, tham gia cuộc thi “Một món quê – Một câu chuyện”'] },
    ],
    pricingNote: 'Poster ghi đây là giá tham khảo. Cần xác nhận giá, menu, ngày tổ chức, địa điểm và hotline với các hộ tham gia.',
    media: [
      { src: '/assets/word/thang-07-09/image7.jpg', alt: 'Người dân chuẩn bị nguyên liệu cho hoạt động ẩm thực', title: 'Chuẩn bị món quê', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image8.jpg', alt: 'Không gian gian hàng ẩm thực trong nhà vườn', title: 'Phiên chợ hương vị quê', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image10.jpg', alt: 'Khách tham gia workshop nấu món dân gian', title: 'Workshop vào bếp', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image11.jpg', alt: 'Nông sản và rau củ thu hoạch từ vườn', title: 'Từ vườn đến bàn ăn', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image12.jpg', alt: 'Mâm cơm quê với các món ăn truyền thống', title: 'Mâm cơm đoàn viên', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image13.jpg', alt: 'Poster Lễ hội ẩm thực Nam Bộ Bếp Quê Bình Mỹ', title: 'Poster Bếp quê Bình Mỹ', orientation: 'portrait' },
      { src: '/assets/word/thang-07-09/image22.png', alt: 'Infographic ba gói giá tham khảo Lễ hội Bếp quê', title: 'Các gói và giá tham khảo', orientation: 'landscape' },
    ],
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
    status: 'Giá tham khảo trên poster · cần đơn vị xác nhận',
    place: 'Điểm dự kiến: Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu, Ấp An Hòa',
    time: 'Lịch mẫu 16:00–20:30 · ngày dương lịch thay đổi theo Rằm tháng 8 âm lịch',
    message: 'Đêm hội Trung thu “Trăng về Bình Mỹ” theo tài liệu. Cần xác nhận ngày âm lịch tương ứng, địa điểm tổ chức và chương trình với cơ sở.',
    audience: 'Gia đình có trẻ nhỏ, cặp đôi, nhóm bạn và du khách yêu văn hóa truyền thống.',
    prices: [
      { name: 'Vé Đêm Hội', amount: 79000, unit: 'người', includes: ['Vào Vườn trăng ký ức và các góc chụp ảnh', 'Rước đèn theo con đường ánh trăng', 'Múa lân, phá cỗ và kể chuyện dưới trăng'] },
      { name: 'Gói Tự Tay Làm Ánh Trăng', amount: 199000, unit: 'người', includes: ['Vé đêm hội và workshop', 'Làm lồng đèn, bánh Trung thu đơn giản và đèn LED mang về', 'Gửi điều ước lên cây điều ước'] },
      { name: 'Combo Gia Đình', amount: 699000, unit: 'nhóm 4 người', includes: ['Vé đêm hội và workshop cho 4 người', 'Bàn trà và bánh tại nhà vườn', 'Quà lưu niệm nhỏ cho cả nhà'] },
    ],
    pricingNote: 'Poster ghi đây là giá tham khảo. Ngày 25/09/2026 đã qua; cần xác nhận lịch âm, ngày tổ chức, địa điểm và giá mới cho từng năm.',
    media: [
      { src: '/assets/word/thang-07-09/image14.jpg', alt: 'Trẻ em tham gia rước đèn Trung thu buổi tối', title: 'Đêm hội Trung thu', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image15.jpg', alt: 'Trẻ em tự làm lồng đèn Trung thu', title: 'Workshop làm đèn lồng', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image16.jpg', alt: 'Đoàn trẻ em cầm đèn lồng đi trong vườn', title: 'Con đường ánh trăng', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image17.jpg', alt: 'Múa lân cho thiếu nhi trong đêm hội', title: 'Múa lân và phá cỗ', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image18.jpg', alt: 'Gia đình cùng làm bánh Trung thu', title: 'Góc bếp đêm trăng', orientation: 'landscape' },
      { src: '/assets/word/thang-07-09/image20.jpg', alt: 'Poster Đêm hội Trung thu Trăng về Bình Mỹ', title: 'Poster Trăng về Bình Mỹ', orientation: 'portrait' },
      { src: '/assets/word/thang-07-09/image23.png', alt: 'Infographic ba gói giá tham khảo Đêm hội Trung thu', title: 'Các gói và giá tham khảo', orientation: 'landscape' },
    ],
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
