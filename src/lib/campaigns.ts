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

export const ACTIVE_CAMPAIGN_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

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
        serviceId: 's10',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Hoạt động trải nghiệm tại khu du lịch sinh thái Bình Mỹ' }],
      },
    ],
  },
  {
    month: 2,
    theme: 'Valentine & Hẹn hò',
    title: 'Valentine bên sông Bình Mỹ',
    summary: 'Hai khu du lịch tại Bình Mỹ; chương trình Valentine cần cơ sở xác nhận trước khi đặt.',
    spots: [
      {
        name: 'KDL Sinh thái ven sông Bình Mỹ',
        location: 'Mã vị trí XJ7X+258, Xã Bình Mỹ, TP.HCM',
        activity: 'Không gian sinh thái ven sông; set menu Valentine và đêm nhạc acoustic là đề xuất, cần cơ sở xác nhận.',
        audience: 'Cặp đôi, gia đình, nhóm bạn',
        kind: 'nature',
        serviceId: 's11',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Không gian nhà chòi ven hồ tại khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Tham quan vườn, chèo xuồng và dùng dịch vụ tại điểm. Hoạt động riêng dịp Valentine cần xác nhận.',
        audience: 'Cặp đôi yêu thiên nhiên',
        kind: 'nature',
        serviceId: 's12',
        images: [{ src: '/assets/KDL_Binh_My_cau_go.jpg', alt: 'Cầu gỗ bắc qua ao tại khu du lịch sinh thái Bình Mỹ' }],
      },
    ],
  },
  {
    month: 3,
    theme: 'Tháng Thanh niên',
    title: 'Tháng Thanh niên: Trải nghiệm làng nghề',
    summary: 'Điểm đón du lịch và bến Rạch Đáy có địa chỉ; lịch workshop cần xác nhận trước chuyến đi.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Workshop thủ công',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Điểm đến có workshop khoai mì, gốm và hoạt động tìm hiểu địa phương; nội dung cụ thể theo lịch cơ sở xác nhận.',
        audience: 'Học sinh, sinh viên, gia đình',
        kind: 'craft',
        serviceId: 's13',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Du khách trải nghiệm tại khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Điểm chèo xuồng Rạch Đáy',
        location: 'Cầu Rạch Đáy, Đường Đỗ Thị Nhặt, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Chèo xuồng Rạch Đáy theo tour đã đặt; liên hệ điểm đón để được hướng dẫn vị trí tập trung.',
        audience: 'Học sinh, sinh viên, gia đình, nhóm bạn',
        kind: 'nature',
        serviceId: 's14',
        images: [{ src: '/assets/KDL_Binh_My_cheo_xuong.jpg', alt: 'Chèo xuồng trên tuyến Rạch Đáy tại Bình Mỹ' }],
      },
    ],
  },
  {
    month: 4,
    theme: 'Mùa trái chín đầu mùa',
    title: 'Bình Mỹ – Mùa trái chín',
    summary: 'Tham quan nhà vườn, tìm hiểu trái cây theo mùa và thưởng thức đặc sản; loại quả và lịch hái cần nhà vườn xác nhận.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Vườn Ký Ức BM',
        location: 'Số 298 Đường Sông Lu, Ấp An Hòa, Bình Mỹ · điểm tham khảo, chương trình tháng 4 chưa được xác nhận',
        activity: 'Tham quan vườn cây, tìm hiểu trái theo mùa, hái quả khi nhà vườn cho phép, chụp ảnh và ghé phiên chợ trái cây.',
        audience: 'Gia đình, nhóm bạn, khách yêu trải nghiệm miệt vườn',
        kind: 'farm',
        serviceId: 's18',
        imageCaption: 'Mùa trái chín Bình Mỹ',
        images: [{ src: '/assets/word/thang-04/image1.png', alt: 'Poster chủ đề Mùa trái chín Bình Mỹ, minh họa trải nghiệm miệt vườn' }],
      },
    ],
  },
  {
    month: 5,
    theme: 'Gia đình & gắn kết',
    title: 'Bình Mỹ – Ngày hội gia đình',
    summary: 'Một ngày vui chơi, làm bánh, đi bộ hoặc chạy nhẹ, picnic và lưu giữ ảnh gia đình tại nhà vườn liên kết.',
    spots: [
      {
        name: 'KDL Sinh thái ven sông Bình Mỹ',
        location: 'Số 22 Đường Nguyễn Thị Da, Bình Mỹ · điểm tham khảo, cần xác nhận đơn vị đăng cai',
        activity: 'Ngày hội gồm trò chơi đồng đội, workshop bánh dân gian, đi bộ/chạy 1–2 km, góc ảnh gia đình, picnic và hoạt động cho trẻ.',
        audience: 'Gia đình nhiều thế hệ, nhóm bạn có trẻ em',
        kind: 'farm',
        serviceId: 's19',
        imageCaption: 'Ngày hội gia đình Bình Mỹ',
        images: [{ src: '/assets/word/thang-05/image1.png', alt: 'Poster minh họa Ngày hội gia đình Bình Mỹ với trò chơi, picnic và hoạt động cho trẻ' }],
      },
    ],
  },
  {
    month: 6,
    theme: 'Hè xanh & khám phá thiên nhiên',
    title: 'Hè xanh Bình Mỹ – Khám phá thiên nhiên',
    summary: 'Trải nghiệm nông dân nhí, trò chơi giải nhiệt, workshop gieo trồng và picnic; hoạt động nước cần cơ sở xác nhận an toàn.',
    spots: [
      {
        name: 'KDL Sinh thái ven sông Bình Mỹ',
        location: 'Số 22 Đường Nguyễn Thị Da, Bình Mỹ · điểm tham khảo, cần xác nhận nơi đón và khu vực hoạt động nước',
        activity: 'Gieo trồng, chăm và thu hoạch nông sản, trò chơi mùa hè, workshop chậu cây tái chế, buffet trái cây và picnic.',
        audience: 'Gia đình có trẻ em, trường học và nhóm thiếu nhi',
        kind: 'farm',
        serviceId: 's20',
        imageCaption: 'Hè xanh Bình Mỹ',
        images: [{ src: '/assets/word/thang-06/image1.png', alt: 'Poster minh họa Hè xanh Bình Mỹ với nông dân nhí, trò chơi nước và picnic' }],
      },
    ],
  },
  {
    month: 7,
    theme: 'Trại hè xanh · Nông dân nhí',
    title: 'Trại hè xanh: Nông dân nhí Bình Mỹ',
    summary: 'Trại hè gợi ý tại Vườn Làng nghề sáng tạo; vị trí chính xác, ngày và sức chứa cần xác nhận.',
    spots: [
      {
        name: 'Vườn Làng nghề sáng tạo Bình Mỹ · Trại hè xanh',
        location: 'Vườn Làng nghề sáng tạo, Xã Bình Mỹ · cần xác nhận vị trí chính xác',
        activity: 'Kế hoạch gồm làm vườn, vào bếp và trò chơi cho trẻ; cần cơ sở xác nhận hoạt động, ngày tổ chức và sức chứa.',
        audience: 'Trẻ 6–14 tuổi cùng gia đình hoặc trường học',
        kind: 'farm',
        serviceId: 's15',
        imageCaption: 'Trại hè xanh',
        images: [
          { src: '/assets/word/thang-07-09/image2.jpg', alt: 'Trẻ em trồng cây tại vườn trong trại hè' },
          { src: '/assets/word/thang-07-09/image6.jpg', alt: 'Trẻ em chơi trò chơi đồng đội ngoài trời' },
        ],
      },
    ],
  },
  {
    month: 8,
    theme: 'Lễ hội ẩm thực Nam Bộ',
    title: 'Bếp quê Bình Mỹ: Về Bình Mỹ – Thưởng thức vị quê',
    summary: 'Lễ hội ẩm thực dự kiến tại Khu Du lịch Sinh thái Bình Mỹ; ngày tổ chức và hộ tham gia chưa được xác nhận.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Bếp quê',
        location: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
        activity: 'Kế hoạch gồm phiên chợ món quê, workshop nấu ăn và trải nghiệm từ vườn đến bàn ăn; cần xác nhận ngày và đơn vị tham gia.',
        audience: 'Gia đình, nhóm bạn, du khách yêu ẩm thực',
        kind: 'food',
        serviceId: 's16',
        imageCaption: 'Bếp quê Bình Mỹ',
        images: [
          { src: '/assets/word/thang-07-09/image8.jpg', alt: 'Không gian gian hàng ẩm thực trong nhà vườn' },
          { src: '/assets/word/thang-07-09/image10.jpg', alt: 'Khách tham gia workshop nấu món dân gian' },
        ],
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
        name: 'Vườn Ký Ức BM · Đêm hội Trung thu',
        location: 'Vườn Ký Ức BM, Xã Bình Mỹ · điểm hỗ trợ du lịch tại số 298 Đường Sông Lu',
        activity: 'Kế hoạch gồm làm lồng đèn, rước đèn, múa lân và phá cỗ; cần xác nhận lịch và hoạt động với điểm đến.',
        audience: 'Trẻ em, gia đình, nhóm bạn',
        kind: 'heritage',
        serviceId: 's17',
        imageCaption: 'Đêm hội Trung thu',
        images: [
          { src: '/assets/word/thang-07-09/image14.jpg', alt: 'Trẻ em tham gia rước đèn Trung thu buổi tối' },
          { src: '/assets/word/thang-07-09/image17.jpg', alt: 'Múa lân cho thiếu nhi trong đêm hội' },
        ],
      },
    ],
  },
  {
    month: 10,
    theme: 'Halloween & hoài niệm',
    title: 'Tháng 10 Bình Mỹ · Halloween giữa miền vườn',
    summary: 'Kết hợp không gian Halloween, dạo vườn mùa thu, nông sản theo mùa và góc hoài niệm; hoạt động tối cần nhà vườn xác nhận.',
    spots: [
      {
        name: 'Vườn Làng nghề sáng tạo Bình Mỹ · Halloween & hoài niệm',
        location: 'Xã Bình Mỹ · điểm tham khảo; cần xác nhận lối vào và cơ sở đăng cai',
        activity: 'Trang trí bí ngô, đèn lồng và góc ảnh Halloween; dạo vườn, ngắm hoa theo mùa, thu hoạch nếu nhà vườn tổ chức, thưởng thức món quê và thư giãn ở không gian mộc mạc.',
        audience: 'Gia đình, nhóm bạn và trẻ em đi cùng người giám hộ',
        kind: 'farm',
        serviceId: 's21',
        imageCaption: 'Halloween & hoài niệm',
        images: [
          { src: '/assets/word/thang-10-12/image1.jpeg', alt: 'Poster ý tưởng Halloween và hoài niệm giữa nhà vườn Bình Mỹ' },
          { src: '/assets/word/thang-10-12/image2.jpeg', alt: 'Infographic mức vé đề xuất tháng 10 theo độ tuổi' },
        ],
      },
    ],
  },
  {
    month: 11,
    theme: 'Gieo trồng & Đất lành',
    title: 'Đất lành gieo hạt',
    summary: 'Gieo hạt, chăm cây, tìm hiểu nông sản và gặp gỡ người làm vườn trong nhịp sống xanh của Bình Mỹ.',
    spots: [
      {
        name: 'Vườn Làng nghề sáng tạo Bình Mỹ · Gieo trồng & Đất lành',
        location: 'Xã Bình Mỹ · điểm tham khảo cho trải nghiệm vườn; lịch và lối vào cần xác nhận',
        activity: 'Gieo hạt, trồng cây con, tưới và chăm vườn theo mùa; tìm hiểu kỹ thuật canh tác, thu hoạch nếu có và mang chậu cây lưu niệm về.',
        audience: 'Gia đình, sinh viên, nhóm bạn',
        kind: 'farm',
        serviceId: 's22',
        imageCaption: 'Gieo trồng & Đất lành',
        images: [
          { src: '/assets/word/thang-10-12/image3.jpeg', alt: 'Poster ý tưởng gieo trồng và trải nghiệm nông nghiệp tháng 11' },
          { src: '/assets/word/thang-10-12/image4.jpeg', alt: 'Infographic mức vé đề xuất tháng 11 theo độ tuổi' },
        ],
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Ẩm thực & nông sản',
        location: 'Số 298 Đường Sông Lu, Ấp An Hòa, Bình Mỹ · điểm tham khảo; hoạt động tháng 11 chưa xác nhận',
        activity: 'Tham khảo thêm khu ăn uống, vườn cây và trải nghiệm địa phương; hỏi cơ sở về workshop nông sản, phiên chợ và lịch thu hoạch trước khi đi.',
        audience: 'Gia đình, đoàn học tập và khách yêu nông nghiệp',
        kind: 'food',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Không gian vườn tại Khu Du lịch Sinh thái Bình Mỹ' }],
      },
    ],
  },
  {
    month: 12,
    theme: 'Giáng sinh & Đón năm mới',
    title: 'Bình Mỹ cuối năm',
    summary: 'Đón mùa lễ hội ở nhà vườn, mua nông sản làm quà, sum họp cùng gia đình và tổ chức buổi tổng kết cuối năm.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ · Mùa lễ hội',
        location: 'Số 298 Đường Sông Lu, Ấp An Hòa, Bình Mỹ · điểm tham khảo; trang trí và sự kiện Noel cần xác nhận',
        activity: 'Tham quan vườn, chụp ảnh mùa lễ hội, dùng bữa, mua nông sản làm quà hoặc tổ chức picnic nếu cơ sở có dịch vụ phù hợp.',
        audience: 'Gia đình, nhóm bạn, nhóm công ty nhỏ',
        kind: 'nature',
        serviceId: 's23',
        imageCaption: 'Giáng sinh & Năm mới',
        images: [
          { src: '/assets/word/thang-10-12/image5.jpeg', alt: 'Poster ý tưởng Giáng sinh và Năm mới tại nhà vườn Bình Mỹ' },
          { src: '/assets/word/thang-10-12/image6.jpeg', alt: 'Infographic mức vé đề xuất tháng 12 theo độ tuổi' },
        ],
      },
      {
        name: 'KDL Sinh thái ven sông Bình Mỹ · Picnic & hoàng hôn',
        location: 'Số 22 Đường Nguyễn Thị Da, Bình Mỹ · điểm tham khảo; cần hỏi lịch và dịch vụ',
        activity: 'Có thể tham khảo không gian sông nước cho picnic, bữa ăn nhóm và ngắm chiều; chương trình Giáng sinh hoặc đón năm mới chưa được cơ sở xác nhận.',
        audience: 'Gia đình, nhóm bạn và đoàn nhỏ',
        kind: 'nature',
      },
      {
        name: 'Hai Châu Bình Mỹ · Bữa ăn tổng kết năm',
        location: '8/1 Đường 162, Ấp 5, Bình Mỹ · xác nhận giờ mở cửa và nhận đoàn',
        activity: 'Gợi ý một điểm ăn uống địa phương để kết hợp sau chuyến tham quan; menu, đặt bàn và dịch vụ dịp lễ cần hỏi trực tiếp.',
        audience: 'Gia đình, nhóm bạn và nhóm công ty nhỏ',
        kind: 'food',
      },
    ],
  },
];

// Details and media are drawn from the supplied monthly documents. Draft events
// and poster prices remain labeled as proposals or references until confirmed.
export const CAMPAIGN_DETAILS: Partial<Record<number, CampaignDetails>> = {
  1: {
    status: 'Giá đề xuất · cần nhà vườn xác nhận',
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, TP.HCM',
    time: '08:00–17:00 · từ mùng 2 đến hết Rằm tháng Giêng âm lịch',
    organizer: 'Lịch chương trình Tết cần được xác nhận với đơn vị vận hành Du lịch Bình Mỹ.',
    message: 'Địa chỉ điểm đến đã xác định. Các hoạt động check-in, hái lộc và hội xuân đang ở dạng đề xuất, chưa phải lịch đã được cơ sở xác nhận.',
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
    pricingNote: 'Quyền lợi các gói cần được nhà vườn thống nhất trước khi nhận đặt chỗ. Số hotline 09xx.xxx.xxx chưa phải số liên hệ sử dụng được.',
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
    status: 'Giá đề xuất · cần điểm đến xác nhận',
    place: 'KDL Sinh thái ven sông Bình Mỹ (mã vị trí XJ7X+258); hoặc Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu',
    time: '17:00–22:00 · chương trình dự kiến trong tháng 2',
    organizer: 'Đơn vị tổ chức chương trình Valentine chưa được xác nhận.',
    message: 'Hai địa chỉ khu du lịch được liệt kê ở trên. Set menu, góc check-in và đêm nhạc acoustic cần điểm đến xác nhận trước khi đặt.',
    audience: 'Cặp đôi, gia đình, nhóm bạn.',
    prices: [
      { name: 'Vé trải nghiệm Valentine', amount: 150000, unit: 'người' },
    ],
    media: [
      { src: '/assets/word/thang-02/image1.png', alt: 'Poster hoạt động Valentine và hẹn hò ven sông Bình Mỹ', title: 'Poster Valentine & hẹn hò', orientation: 'portrait' },
      { src: '/assets/word/thang-02/image2.png', alt: 'Poster giá 150.000 đồng mỗi người cho trải nghiệm Valentine', title: 'Giá và thông tin nhà hàng', orientation: 'portrait' },
    ],
    pricingNote: 'Quyền lợi trong vé chưa được xác nhận. Hãy hỏi nhà hàng về giá, menu, lịch biểu diễn và số liên hệ trước khi đặt.',
    activities: [
      { title: 'Check-in & lưu giữ khoảnh khắc', description: 'Cổng trái tim, góc chụp ảnh bên sông, tiểu cảnh hoa xuân và mini game ảnh đôi.' },
      { title: 'Thưởng thức ẩm thực ven sông', description: 'Đề xuất set menu cho hai người; ưu đãi đặt bàn sớm hoặc món tráng miệng là phương án cần nhà hàng xác nhận.' },
      { title: 'Đêm nhạc acoustic', description: 'Dự kiến biểu diễn nhạc tình yêu buổi tối và giao lưu lời nhắn yêu thương.' },
    ],
  },
  3: {
    status: 'Giá đề xuất · cần đơn vị tổ chức xác nhận',
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu; điểm chèo xuồng tại Cầu Rạch Đáy, Đường Đỗ Thị Nhặt, Ấp An Hòa',
    time: '07:30–17:00 · chương trình dự kiến trong tháng 3',
    organizer: 'Workshop và điểm đón cần được xác nhận trực tiếp với đơn vị vận hành Du lịch Bình Mỹ.',
    message: 'Điểm đón và điểm chèo xuồng Rạch Đáy có địa chỉ cụ thể. Giá, hoạt động làng nghề và nội dung tham quan cần được đơn vị tổ chức xác nhận.',
    audience: 'Học sinh, sinh viên, câu lạc bộ và đoàn thể.',
    prices: [
      { name: 'Trải nghiệm làng nghề đan lục bình', amount: 100000, studentAmount: 50000, unit: 'người', includes: ['Tìm hiểu nghề và tự tay đan sản phẩm', 'Có quà mang về'] },
      { name: 'Khám phá làng gốm truyền thống', amount: 120000, studentAmount: 60000, unit: 'người', includes: ['Tạo hình và trang trí sản phẩm đất sét', 'Có quà mang về'] },
      { name: 'Tham quan hầm thủy đạo Rạch Đáy', amount: 80000, studentAmount: 40000, unit: 'người' },
    ],
    pricingNote: 'Giá học sinh, sinh viên và điều kiện đoàn từ 10 người cần được đơn vị tổ chức xác nhận trước khi đặt.',
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
  4: {
    status: 'Chương trình và giá đề xuất · cần nhà vườn xác nhận',
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Sông Lu · điểm tham khảo có Vườn Ký Ức BM; chưa xác nhận tổ chức chương trình tháng 4 tại đây',
    time: 'Khung giờ dự kiến 08:00–17:00 trong tháng 4 · ngày cụ thể cần xác nhận',
    organizer: 'Tài liệu đề xuất phối hợp với nhà vườn tại Bình Mỹ; đơn vị đăng cai chưa xác nhận.',
    message: 'Địa chỉ 298 Sông Lu và Vườn Ký Ức BM là điểm tham khảo thật để tra cứu. Nhà vườn chưa xác nhận đăng cai hoạt động mùa trái chín.',
    audience: 'Gia đình, nhóm bạn và khách muốn trải nghiệm miệt vườn.',
    prices: [
      { name: 'Gói tham quan vườn', amount: 99000, unit: 'người', includes: ['Tham quan vườn', 'Thưởng thức trái cây đầu mùa và nước uống'] },
      { name: 'Gói trải nghiệm hái trái', amount: 249000, unit: 'người', includes: ['Các quyền lợi gói tham quan', 'Hái và mang về 1 kg trái cây nếu nhà vườn cho phép', 'Phiên chợ trái cây, trò chơi và nón'] },
      { name: 'Combo gia đình', amount: 1199000, unit: 'nhóm 4 người', includes: ['Gói trải nghiệm cho 4 người', 'Bữa ăn quê', 'Chòi riêng ven sông'] },
    ],
    pricingNote: 'Các mức giá và quyền lợi trên là đề xuất thể hiện trong infographic; tài liệu chưa có giá được nhà vườn xác nhận. Mùa trái, loại quả, quyền hái và địa điểm cần xác nhận trước khi đi.',
    media: [
      { src: '/assets/word/thang-04/image1.png', alt: 'Poster đề xuất chương trình Bình Mỹ mùa trái chín', title: 'Poster mùa trái chín', orientation: 'portrait' },
      { src: '/assets/word/thang-04/image2.png', alt: 'Infographic các gói giá đề xuất cho trải nghiệm mùa trái chín', title: 'Gói giá đề xuất', orientation: 'portrait' },
    ],
    activities: [
      { title: 'Tham quan vườn theo mùa', description: 'Tìm hiểu cây ăn trái và mùa vụ tại nhà vườn đăng cai sau khi được xác nhận.' },
      { title: 'Hái trái và thưởng thức tại vườn', description: 'Chỉ hái trái khi nhà vườn cho phép; loại quả và sản lượng tùy mùa thực tế.' },
      { title: 'Phiên chợ trái cây và trò chơi', description: 'Ghé gian hàng nông sản địa phương, chụp ảnh và tham gia trò chơi theo chương trình.' },
    ],
    dateNote: 'Chưa có ngày tổ chức cụ thể. Tháng 4 là khung thời gian kế hoạch; cần đối chiếu mùa trái và lịch mở cửa của nhà vườn.',
    operationNotes: [
      'Xác nhận tên nhà vườn, địa chỉ đón khách, loại trái đang vào mùa, giá vé và quyền hái trước khi nhận đặt chỗ.',
      'Chuẩn bị nước uống, nón và khu vực nghỉ; điều chỉnh hoạt động ngoài trời nếu nắng nóng hoặc mưa.',
    ],
  },
  5: {
    status: 'Chương trình và giá đề xuất · cần đơn vị đăng cai xác nhận',
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Sông Lu hoặc KDL Sinh thái ven sông Bình Mỹ, số 22 Nguyễn Thị Da · điểm tham khảo, chưa xác nhận nơi đăng cai',
    time: 'Khung giờ dự kiến 08:00–17:00 trong tháng 5 · ngày cụ thể cần xác nhận',
    organizer: 'Ngày hội gia đình đang là kế hoạch; đơn vị đăng cai và các hộ hướng dẫn workshop chưa xác nhận.',
    message: 'Hai địa chỉ trên là điểm đến thật tại Bình Mỹ để tham khảo; tài liệu chưa chốt cơ sở đăng cai. Cần xác nhận nơi tổ chức và đường chạy trước khi đi.',
    audience: 'Gia đình nhiều thế hệ, nhóm bạn và trẻ em đi cùng người giám hộ.',
    prices: [
      { name: 'Vé ngày hội gia đình', amount: 99000, unit: 'người', includes: ['Vào cổng và trò chơi gia đình', 'Nước uống'] },
      { name: 'Gói làm bánh cùng gia đình', amount: 249000, unit: 'người', includes: ['Các quyền lợi vé ngày hội', 'Workshop làm bánh và nếm thành phẩm', 'Một ảnh gia đình in'] },
      { name: 'Combo gia đình', amount: 1299000, unit: 'nhóm 4 người', includes: ['Vé, trò chơi và workshop cho nhóm 4', 'Bữa ăn gia đình', 'Thuê đồ bà ba và quà nông trại'] },
    ],
    pricingNote: 'Giá và quyền lợi lấy từ infographic đề xuất trong tài liệu, chưa được nhà vườn xác nhận. Hoạt động chạy/đi bộ 1–2 km và workshop cần điều chỉnh theo mặt bằng, thời tiết và sức khỏe người tham gia.',
    media: [
      { src: '/assets/word/thang-05/image1.png', alt: 'Poster đề xuất Ngày hội gia đình Bình Mỹ', title: 'Poster Ngày hội gia đình', orientation: 'portrait' },
      { src: '/assets/word/thang-05/image2.png', alt: 'Infographic các gói giá đề xuất cho Ngày hội gia đình', title: 'Gói giá đề xuất', orientation: 'portrait' },
    ],
    activities: [
      { title: 'Trò chơi gia đình', description: 'Trò chơi đồng đội và kéo co, bố trí theo độ tuổi và không gian của điểm đăng cai.' },
      { title: 'Cùng làm bánh dân gian', description: 'Đề xuất làm bánh xèo, bánh ít lá gai hoặc bánh khọt cùng người hướng dẫn địa phương.' },
      { title: 'Đi bộ hoặc chạy nhẹ ven sông', description: 'Cự ly kế hoạch 1–2 km; tuyến đường cần khảo sát và xác nhận an toàn trước chương trình.' },
      { title: 'Góc ảnh, picnic và hoạt động cho trẻ', description: 'Dành thời gian chụp ảnh, nghỉ ngơi và tham gia hoạt động thủ công hoặc trò chơi phù hợp lứa tuổi.' },
    ],
    dateNote: 'Chưa có ngày tổ chức cụ thể; lịch trong tháng 5 phụ thuộc xác nhận của đơn vị đăng cai.',
    operationNotes: [
      'Cần xác nhận khu vực tổ chức, người hướng dẫn làm bánh, suất ăn, nhà vệ sinh và phương án che mưa nắng.',
      'Đường chạy cần có người điều phối; trẻ em phải đi cùng người giám hộ và không chạy sát mép sông/kênh.',
    ],
  },
  6: {
    status: 'Chương trình và giá đề xuất · cần nhà vườn xác nhận',
    place: 'KDL Sinh thái ven sông Bình Mỹ, số 22 Nguyễn Thị Da · điểm tham khảo có hoạt động tát đìa; chưa xác nhận đăng cai chương trình hè xanh',
    time: 'Khung giờ dự kiến 08:00–17:00 trong tháng 6 · ngày cụ thể cần xác nhận',
    organizer: 'Chương trình hè xanh là kế hoạch; nhà vườn đăng cai và người phụ trách hoạt động cho trẻ chưa xác nhận.',
    message: 'Đây là địa điểm tham khảo có hoạt động ao vườn; cơ sở chưa xác nhận chương trình hè xanh. Đặt chỗ thử nghiệm chưa phải đăng ký dịch vụ thật.',
    audience: 'Trẻ em đi cùng gia đình, trường học và nhóm thiếu nhi có người phụ trách.',
    prices: [
      { name: 'Gói hè xanh', amount: 119000, unit: 'người', includes: ['Vé vào cổng', 'Buffet trái cây và picnic'] },
      { name: 'Gói nông dân nhí', amount: 279000, unit: 'bé', includes: ['Các quyền lợi gói hè xanh', 'Trải nghiệm tát đìa bắt cá nếu cơ sở cho phép', 'Workshop ươm cây và thuê đồ bà ba'] },
      { name: 'Combo gia đình', amount: 1099000, unit: 'nhóm 4 người', includes: ['Vé chương trình cho nhóm 4', 'Tiệc BBQ/cá lóc nướng', 'Chòi riêng ven sông'] },
    ],
    pricingNote: 'Mức giá và quyền lợi trên là đề xuất từ infographic, chưa được nhà vườn xác nhận. Buffet, BBQ, bắt cá và khu vực ven sông có thể thay đổi theo điều kiện thực tế.',
    media: [
      { src: '/assets/word/thang-06/image1.png', alt: 'Poster đề xuất chương trình Hè xanh Bình Mỹ', title: 'Poster Hè xanh Bình Mỹ', orientation: 'portrait' },
      { src: '/assets/word/thang-06/image2.png', alt: 'Infographic các gói giá đề xuất cho chương trình Hè xanh', title: 'Gói giá đề xuất', orientation: 'portrait' },
    ],
    activities: [
      { title: 'Nông dân nhí', description: 'Tìm hiểu vườn, gieo trồng và thu hoạch rau hoặc trái cây theo hoạt động được nhà vườn cho phép.' },
      { title: 'Hoạt động ao vườn', description: 'Tát đìa bắt cá chỉ tổ chức khi cơ sở xác nhận khu vực, dụng cụ và người giám sát phù hợp.' },
      { title: 'Trò chơi hè và buffet trái cây', description: 'Trò chơi giải nhiệt, thưởng thức trái cây theo mùa và nghỉ picnic theo điều kiện của điểm đến.' },
      { title: 'Ươm cây từ vật liệu tái chế', description: 'Trang trí chậu, gieo hạt và mang cây nhỏ về sau buổi trải nghiệm.' },
    ],
    dateNote: 'Chưa có ngày tổ chức cụ thể; cần xác nhận lịch trong tháng 6 với nhà vườn và đơn vị phụ trách trẻ em.',
    operationNotes: [
      'Chỉ công bố hoạt động dưới nước khi có khu vực an toàn, áo phao phù hợp, người giám sát và quy trình ứng phó sự cố.',
      'Xác nhận độ tuổi, dị ứng thực phẩm, thành phần buffet, thời tiết và phương án trú mưa trước chuyến đi.',
    ],
  },
  7: {
    status: 'Giá đề xuất · cần đơn vị xác nhận',
    place: 'Điểm dự kiến: Vườn Làng nghề sáng tạo Bình Mỹ; cần xác nhận vị trí cụ thể với đơn vị phụ trách',
    time: 'Lịch mẫu 08:00–15:30 · ưu tiên hoạt động ngoài trời buổi sáng',
    message: 'Trại hè xanh “Nông dân nhí Bình Mỹ” đang ở dạng kế hoạch. Cần xác nhận cơ sở đăng cai, ngày tổ chức, hoạt động và sức chứa đoàn.',
    audience: 'Gia đình có trẻ 6–14 tuổi, trường học và câu lạc bộ thiếu nhi.',
    prices: [
      { name: 'Gói Nửa Ngày', amount: 149000, unit: 'bé', includes: ['Trồng cây và thu hoạch rau cùng chủ vườn', 'Nón lá, giỏ nhỏ và dụng cụ làm vườn', 'Mang về chậu cây tự trồng và hộ chiếu nông dân nhí'] },
      { name: 'Gói Nông Dân Nhí Trọn Ngày', amount: 299000, unit: 'bé', includes: ['Vườn rau, gian bếp, thủ công và trò chơi', 'Làm bánh dân gian, ăn trưa và nước uống', 'Giấy chứng nhận “Nông dân nhí Bình Mỹ” và quà'] },
      { name: 'Combo Gia Đình', amount: 899000, unit: '2 người lớn + 2 bé', includes: ['Trọn gói hoạt động cho gia đình 2 người lớn và 2 bé', 'Ăn trưa và nước uống', '4 hộ chiếu, chứng nhận và quà lưu niệm'] },
    ],
    pricingNote: 'Địa điểm, ngày tổ chức và giá cuối cùng cần được nhà vườn xác nhận.',
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
    status: 'Giá đề xuất · cần đơn vị xác nhận',
    place: 'Khu Du lịch Sinh thái Bình Mỹ, số 298 Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ',
    time: 'Lịch mẫu 09:00–17:00 · có thể tổ chức trong hai ngày cuối tuần',
    message: 'Lễ hội ẩm thực Nam Bộ “Bếp quê Bình Mỹ” đang ở dạng kế hoạch. Cần xác nhận ngày, khu vực tổ chức và các hộ tham gia với cơ sở.',
    audience: 'Gia đình, nhóm bạn trẻ, người yêu ẩm thực và du khách quốc tế.',
    prices: [
      { name: 'Gói Chợ Quê', amount: 99000, unit: 'người', includes: ['Vào cổng chợ quê, tham quan gian hàng tre và lá dừa', 'Phiếu thưởng thức nhiều món truyền thống', 'Check-in không gian làng quê'] },
      { name: 'Gói Vào Bếp Cùng Người Bình Mỹ', amount: 249000, unit: 'người', includes: ['Tham quan vườn và chọn nguyên liệu', 'Tự tay chế biến, thưởng thức thành phẩm', 'Nhận công thức mang về'] },
      { name: 'Combo Mâm Cơm Đoàn Viên', amount: 999000, unit: 'nhóm 4 người', includes: ['Tham quan vườn và workshop nấu ăn', 'Mâm cơm quê và câu chuyện bếp quê', 'Phiếu chợ quê, tham gia cuộc thi “Một món quê – Một câu chuyện”'] },
    ],
    pricingNote: 'Giá, menu, ngày tổ chức và địa điểm cần được xác nhận với các hộ tham gia.',
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
    status: 'Giá đề xuất · cần đơn vị xác nhận',
    place: 'Điểm hỗ trợ du lịch: số 298 Đường Sông Lu, Ấp An Hòa; chương trình dự kiến tại Vườn Ký Ức BM',
    time: 'Lịch mẫu 16:00–20:30 · ngày dương lịch thay đổi theo Rằm tháng 8 âm lịch',
    message: 'Đêm hội Trung thu “Trăng về Bình Mỹ” đang ở dạng kế hoạch. Cần xác nhận ngày âm lịch tương ứng, địa điểm tổ chức và chương trình với cơ sở.',
    audience: 'Gia đình có trẻ nhỏ, cặp đôi, nhóm bạn và du khách yêu văn hóa truyền thống.',
    prices: [
      { name: 'Vé Đêm Hội', amount: 79000, unit: 'người', includes: ['Vào Vườn trăng ký ức và các góc chụp ảnh', 'Rước đèn theo con đường ánh trăng', 'Múa lân, phá cỗ và kể chuyện dưới trăng'] },
      { name: 'Gói Tự Tay Làm Ánh Trăng', amount: 199000, unit: 'người', includes: ['Vé đêm hội và workshop', 'Làm lồng đèn, bánh Trung thu đơn giản và đèn LED mang về', 'Gửi điều ước lên cây điều ước'] },
      { name: 'Combo Gia Đình', amount: 699000, unit: 'nhóm 4 người', includes: ['Vé đêm hội và workshop cho 4 người', 'Bàn trà và bánh tại nhà vườn', 'Quà lưu niệm nhỏ cho cả nhà'] },
    ],
    pricingNote: 'Ngày dự kiến 25/09/2026 đã qua; cần xác nhận lịch âm, ngày tổ chức, địa điểm và giá mới cho từng năm.',
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
    dateNote: 'Rằm tháng 8 năm 2026 rơi vào 25/09/2026 (đã qua). Các năm sau cần đối chiếu lịch âm; nếu ngày lễ rơi vào tháng 10 thì chuyển chương trình sang tháng 10.',
    operationNotes: [
      'Ưu tiên đèn LED cho trẻ nhỏ; không thả đèn xuống sông hoặc thả đèn trời.',
      'Bố trí tuyến rước đèn xa mép nước, hệ thống điện ngoài trời an toàn, lối thoát hiểm và phương án trú mưa.',
    ],
  },
};

CAMPAIGN_DETAILS[10] = {
  status: 'Giá theo infographic · chương trình và giá cần cơ sở xác nhận',
  place: 'Vườn Làng nghề sáng tạo Bình Mỹ là điểm tham khảo; tài liệu chưa xác nhận nhà vườn đăng cai Halloween.',
  time: '01–31/10 hằng năm · tham quan gợi ý 07:00–10:00 hoặc 15:00–17:30 · 2–4 giờ; hoạt động tối chỉ khi cơ sở tổ chức',
  organizer: 'Ban quản lý Bình Mỹ Wellness Web (theo kế hoạch); địa điểm và đơn vị vận hành từng hoạt động cần xác nhận.',
  message: 'Tháng 10 được cập nhật theo chủ đề Halloween & Hoài niệm trong tài liệu mới. Trang trí, thu hoạch, ăn uống và tiệc tối đều phụ thuộc chương trình thực tế của nhà vườn.',
  audience: 'Gia đình, nhóm bạn; trẻ em đi cùng người giám hộ.',
  prices: [
    { name: 'Dưới 4 tuổi', amount: 0, unit: 'người' },
    { name: '4–6 tuổi', amount: 30000, unit: 'người' },
    { name: '7–12 tuổi', amount: 50000, unit: 'người' },
    { name: '13–17 tuổi', amount: 70000, unit: 'người' },
    { name: '18–59 tuổi', amount: 90000, unit: 'người' },
    { name: 'Từ 60 tuổi', amount: 0, unit: 'người' },
  ],
  pricingNote: 'Mức vé theo độ tuổi được ghi trong infographic, chưa phải giá được nhà vườn xác nhận; quyền lợi vé và giấy tờ/điều kiện miễn phí cần hỏi trước khi đặt.',
  media: [
    { src: '/assets/word/thang-10-12/image1.jpeg', alt: 'Poster ý tưởng Halloween, hoa mùa thu, nông sản và không gian hoài niệm tại Bình Mỹ', title: 'Halloween & Hoài niệm', orientation: 'landscape' },
    { src: '/assets/word/thang-10-12/image2.jpeg', alt: 'Infographic giá vé đề xuất tháng 10 theo độ tuổi', title: 'Vé theo độ tuổi · giá đề xuất', orientation: 'landscape' },
  ],
  activities: [
    { title: 'Góc Halloween tại nhà vườn', description: 'Trang trí bí ngô, đèn lồng và dây đèn; góc chụp ảnh chỉ mở nếu nhà vườn triển khai.' },
    { title: 'Dạo vườn mùa thu', description: 'Tham quan cây xanh, ngắm hoa theo mùa và chụp ảnh trong không gian ngoài trời.' },
    { title: 'Thu hoạch và thưởng thức nông sản', description: 'Tìm hiểu cách trồng cây, hái trái hoặc mua nông sản khi nhà vườn có tổ chức và đúng mùa.' },
    { title: 'Ẩm thực dân dã & không gian hoài niệm', description: 'Thưởng thức món địa phương, trái cây theo mùa; khám phá nhà gỗ, bàn trà và góc vườn mộc mạc nếu có tại điểm đến.' },
    { title: 'Trải nghiệm buổi tối', description: 'Tiệc sân vườn hoặc lửa trại chỉ tổ chức khi cơ sở có chương trình, giấy phép/điều kiện phù hợp và phương án an toàn.' },
  ],
  dateNote: 'Halloween 30–31/10 là ngày gợi ý trong tài liệu, không phải lịch sự kiện đã xác nhận. Nếu Rằm tháng 8 âm lịch rơi vào tháng 10 trong năm khác, cần cập nhật lịch Trung thu riêng cho năm đó.',
  operationNotes: [
    'Xác nhận địa chỉ đón khách, giờ mở cửa, giá theo độ tuổi, tình trạng trang trí và quyền lợi vé trước khi đi.',
    'Trẻ em cần có người giám hộ; không tự ý đốt lửa, dùng nến hoặc đặt đồ trang trí gần vật liệu dễ cháy.',
  ],
};

CAMPAIGN_DETAILS[11] = {
  status: 'Giá theo infographic · chương trình và giá cần nhà vườn xác nhận',
  place: 'Vườn Làng nghề sáng tạo Bình Mỹ và Khu Du lịch Sinh thái Bình Mỹ là các điểm tham khảo; chưa xác nhận nơi đăng cai hoạt động tháng 11.',
  time: '01–30/11 hằng năm · sáng 07:00–10:00 hoặc chiều 15:00–17:00 · 2–4 giờ; lịch cuối tuần theo nhà vườn',
  organizer: 'Ban quản lý Bình Mỹ Wellness Web (theo kế hoạch); nhà vườn và hộ hướng dẫn cần xác nhận.',
  message: 'Chủ đề tháng 11 tập trung gieo trồng, chăm vườn, tìm hiểu mùa vụ, nông sản và câu chuyện người làm vườn. Thu hoạch tùy mùa, không cam kết có sẵn.',
  audience: 'Gia đình, học sinh, sinh viên, nhóm bạn và khách yêu trải nghiệm nông nghiệp.',
  prices: [
    { name: 'Dưới 4 tuổi', amount: 0, unit: 'người' },
    { name: '4–6 tuổi', amount: 20000, unit: 'người' },
    { name: '7–12 tuổi', amount: 30000, unit: 'người' },
    { name: '13–17 tuổi', amount: 50000, unit: 'người' },
    { name: '18–59 tuổi', amount: 60000, unit: 'người' },
    { name: 'Từ 60 tuổi', amount: 0, unit: 'người' },
  ],
  pricingNote: 'Giá theo infographic trong kế hoạch, chưa được nhà vườn xác nhận; chưa rõ vé bao gồm hoạt động nào và điều kiện miễn phí. Hãy hỏi giá cuối cùng, lịch và sản phẩm theo mùa trước khi đặt.',
  media: [
    { src: '/assets/word/thang-10-12/image3.jpeg', alt: 'Poster chủ đề Gieo trồng và Đất lành tháng 11', title: 'Gieo trồng & Đất lành', orientation: 'landscape' },
    { src: '/assets/word/thang-10-12/image4.jpeg', alt: 'Infographic giá vé đề xuất tháng 11 theo độ tuổi', title: 'Vé theo độ tuổi · giá đề xuất', orientation: 'landscape' },
  ],
  activities: [
    { title: 'Một buổi làm nông dân', description: 'Gieo hạt, trồng cây con, tưới nước và học cách chăm vườn cùng người làm vườn nếu có hướng dẫn.' },
    { title: 'Khám phá vườn rau và cây ăn trái', description: 'Tìm hiểu cách trồng trọt, chăm cây và bảo vệ đất; loại cây thực tế tùy nhà vườn.' },
    { title: 'Thu hoạch và mua nông sản', description: 'Hái rau hoặc trái đúng mùa nếu được nhà vườn cho phép; có thể mua sản phẩm đang được cung cấp.' },
    { title: 'Workshop xanh & chợ phiên', description: 'Kế hoạch gợi ý làm bánh, nước ép từ trái cây vườn và giới thiệu nông sản địa phương.' },
    { title: 'Không gian thư giãn', description: 'Dạo vườn, thưởng thức món địa phương, chụp ảnh; yoga hoặc hoạt động ngoài trời chỉ khi cơ sở có tổ chức.' },
    { title: 'Tour đêm nhà vườn', description: 'Chỉ thêm vào lịch khi có điểm đến nhận tổ chức buổi tối và công bố lịch cụ thể.' },
  ],
  schedule: [
    { time: '07:00–10:00', activity: 'Tham quan vườn, gieo trồng và tìm hiểu kỹ thuật nông nghiệp' },
    { time: '11:30–13:00', activity: 'Thưởng thức ẩm thực địa phương nếu đã đặt với cơ sở' },
    { time: '15:00–17:00', activity: 'Chụp ảnh, nghỉ ngơi, tìm hiểu và mua nông sản theo mùa' },
    { time: 'Buổi tối', activity: 'Tour đêm hoặc giao lưu chỉ khi nhà vườn xác nhận có chương trình' },
  ],
  dateNote: 'Lịch trên là khung gợi ý theo tài liệu; ngày cuối tuần, sức chứa, hoạt động thu hoạch và tour đêm do từng nhà vườn quyết định.',
  operationNotes: [
    'Xác nhận hoạt động phù hợp với mùa vụ, dụng cụ, khu vực rửa tay và cách xử lý nông sản trước khi cho khách dùng.',
    'Nếu có hoạt động tối, cần hỏi rõ giờ kết thúc, ánh sáng lối đi và phương án đưa đón.',
  ],
};

CAMPAIGN_DETAILS[12] = {
  status: 'Giá theo infographic · chương trình và giá cần cơ sở xác nhận',
  place: 'Khu Du lịch Sinh thái Bình Mỹ (298 Sông Lu), KDL Sinh thái ven sông Bình Mỹ (22 Nguyễn Thị Da) và Hai Châu Bình Mỹ (8/1 Đường 162) là các điểm tham khảo; chưa xác nhận tổ chức sự kiện.',
  time: '01–31/12 hằng năm · Giáng sinh khoảng 20–25/12, tổng kết năm khoảng 26–31/12; giờ sáng 07:00–10:00, chiều 15:00–17:30, buổi tối theo lịch cơ sở',
  organizer: 'Ban quản lý Bình Mỹ Wellness Web (theo kế hoạch); mỗi nhà vườn, quán ăn hoặc điểm đến cần xác nhận dịch vụ riêng.',
  message: 'Kết hợp tham quan, ảnh mùa lễ hội, nông sản làm quà, bữa ăn sum họp và hoạt động cuối năm. Trang trí Noel, tiệc và chương trình đón năm mới chỉ có nếu địa điểm thực sự tổ chức.',
  audience: 'Gia đình, nhóm bạn, đoàn công ty nhỏ và khách tham quan trong ngày.',
  prices: [
    { name: 'Dưới 4 tuổi (< 1 m)', amount: 0, unit: 'người' },
    { name: '4–6 tuổi (1–1,3 m)', amount: 30000, unit: 'người' },
    { name: '7–12 tuổi (1,3–1,5 m)', amount: 60000, unit: 'người' },
    { name: '13–17 tuổi (1,5–1,7 m)', amount: 80000, unit: 'người' },
    { name: '18–59 tuổi', amount: 100000, unit: 'người' },
    { name: 'Từ 60 tuổi', amount: 0, unit: 'người' },
  ],
  pricingNote: 'Mức vé và mốc chiều cao lấy từ infographic đề xuất, chưa được điểm đến xác nhận. Hỏi cách áp dụng độ tuổi/chiều cao, quyền lợi đi kèm và điều kiện miễn phí; bữa ăn, picnic và tiệc tính theo báo giá riêng nếu có.',
  media: [
    { src: '/assets/word/thang-10-12/image5.jpeg', alt: 'Poster ý tưởng Giáng sinh, Năm mới và hoạt động cuối năm tại Bình Mỹ', title: 'Giáng sinh & Năm mới', orientation: 'landscape' },
    { src: '/assets/word/thang-10-12/image6.jpeg', alt: 'Infographic giá vé đề xuất tháng 12 theo độ tuổi và chiều cao', title: 'Vé theo độ tuổi · giá đề xuất', orientation: 'landscape' },
  ],
  activities: [
    { title: 'Không gian Giáng sinh', description: 'Cây thông, đèn, vòng nguyệt quế và góc chụp ảnh chỉ giới thiệu tại điểm có trang trí thực tế.' },
    { title: 'Thưởng thức món quê và tiệc nhóm', description: 'Hỏi trước thực đơn, số lượng khách, mức giá và khả năng nhận tiệc tại nhà vườn hoặc quán ăn.' },
    { title: 'Nông sản và quà quê cuối năm', description: 'Tìm hiểu, mua trái cây, rau củ và sản phẩm địa phương đang có tại điểm bán.' },
    { title: 'Trải nghiệm nông nghiệp và picnic', description: 'Dạo vườn, chăm cây hoặc thu hoạch khi phù hợp mùa vụ; picnic theo quy định của địa điểm.' },
    { title: 'Tổng kết năm & chào năm mới', description: 'Bữa ăn nhóm, giao lưu hoặc chương trình đón năm mới chỉ khi cơ sở công bố lịch.' },
    { title: 'Cà phê, ngắm chiều và chụp ảnh', description: 'Kết hợp một điểm dừng thư giãn gần vườn; kiểm tra giờ mở cửa và dịch vụ trước chuyến đi.' },
  ],
  schedule: [
    { time: '07:00–10:00', activity: 'Tham quan vườn và tìm hiểu nông sản' },
    { time: '11:30–13:00', activity: 'Dùng bữa hoặc picnic theo đặt chỗ đã xác nhận' },
    { time: '15:00–17:30', activity: 'Chụp ảnh, thư giãn, mua nông sản và quà quê' },
    { time: 'Buổi tối', activity: 'Tiệc Giáng sinh, tổng kết hoặc đón năm mới nếu điểm đến có tổ chức' },
  ],
  dateNote: 'Các khoảng 20–25/12 và 26–31/12 là mốc gợi ý trong kế hoạch, không phải lịch hoạt động đã xác nhận. Hãy liên hệ từng điểm trước khi đến.',
  operationNotes: [
    'Đặt bàn/tiệc trước cho đoàn; xác nhận menu, giá, giờ phục vụ và chính sách trang trí với từng địa điểm.',
    'Kiểm tra điều kiện tổ chức ngoài trời, mưa gió, điện trang trí và lối đi an toàn cho trẻ em.',
  ],
};
