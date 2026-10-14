export type CampaignSpotKind = 'nature' | 'heritage' | 'food' | 'cafe' | 'farm';

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

export const CAMPAIGNS_365: MonthlyCampaign[] = [
  {
    month: 1,
    theme: 'Tết & Xuân',
    title: 'Xuân ghé Bình Mỹ',
    summary: 'Du xuân gần thành phố giữa không gian vườn, sông nước và ẩm thực quê.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Du xuân, chèo xuồng, làm bánh dân gian và thưởng thức ẩm thực đồng quê.',
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
    title: 'Hẹn nhau ở Bình Mỹ',
    summary: 'Một chuyến đi nhẹ nhàng kết hợp cà phê, thiên nhiên, hoàng hôn và ẩm thực.',
    spots: [
      {
        name: 'Cafe Hẹn Củ Chi',
        location: '477 Bình Mỹ, TP.HCM',
        activity: 'Gợi ý buổi hẹn cà phê, trò chuyện và chụp ảnh; có thể phát triển lịch trình hai giờ.',
        audience: 'Cặp đôi, nhóm bạn trẻ',
        kind: 'cafe',
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
    title: 'Tuổi trẻ về Bình Mỹ',
    summary: 'Kết hợp trải nghiệm, giáo dục truyền thống và hoạt động cộng đồng theo lịch phối hợp.',
    spots: [
      {
        name: 'Võ đường Đất Thép, Củ Chi',
        location: 'Bình Mỹ – Củ Chi; cần xác nhận địa chỉ và khung giờ với võ đường',
        activity: 'Gợi ý giao lưu võ thuật và câu chuyện truyền thống. Hoạt động với sinh viên chỉ tổ chức khi võ đường đồng ý.',
        audience: 'Sinh viên, câu lạc bộ, Đoàn – Hội',
        kind: 'heritage',
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Có thể đề xuất Chủ nhật xanh, dọn rác hoặc trồng cây khi đơn vị và địa phương chấp thuận.',
        audience: 'Đoàn viên, sinh viên, nhóm tình nguyện',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cau_go.jpg', alt: 'Cầu gỗ trong khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Nghĩa trang Liệt sĩ Củ Chi',
        location: 'Đường Tỉnh lộ 15, khu vực An Nhơn Tây, TP.HCM',
        activity: 'Hành trình tri ân, dâng hương và tìm hiểu lịch sử; hoạt động cần phối hợp, đăng ký trước.',
        audience: 'Đoàn – Hội, sinh viên, câu lạc bộ',
        kind: 'heritage',
        images: [{ src: '/assets/Nghia_trang_Liet_si_Cu_Chi_dang_huong.jpg', alt: 'Dâng hương tại Nghĩa trang Liệt sĩ Củ Chi' }],
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
    theme: 'Mùa mưa & Chill sinh thái',
    title: 'Nghe mưa ở Bình Mỹ',
    summary: 'Ưu tiên cà phê, workshop có mái che và ẩm thực; hoạt động ngoài trời tùy thời tiết.',
    spots: [
      {
        name: 'Cafe Hẹn Củ Chi',
        location: '477 Bình Mỹ, TP.HCM',
        activity: 'Gợi ý một buổi cà phê ngày mưa để đọc sách, trò chuyện hoặc chụp ảnh.',
        audience: 'Cặp đôi, sinh viên',
        kind: 'cafe',
      },
      {
        name: 'Zi Coffee & Tea',
        location: '142 Bình Mỹ, TP.HCM',
        activity: 'Điểm dừng uống cà phê hoặc trà, phù hợp với lịch trình linh hoạt khi mưa.',
        audience: 'Nhóm bạn, người trẻ',
        kind: 'cafe',
        image: '/assets/zi_coffee_binh_my.jpg',
        imageAlt: 'Ảnh minh họa quán cà phê sân vườn Bình Mỹ',
        serviceId: 's5',
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Ưu tiên workshop có mái che, ẩm thực hoặc cà phê; chỉ đi ngoài trời khi thời tiết phù hợp.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Chòi lá bên mặt nước tại khu du lịch Bình Mỹ' }],
      },
    ],
  },
  {
    month: 8,
    theme: 'Vu Lan & Gia đình',
    title: 'Về cùng ba mẹ',
    summary: 'Một chuyến đi chậm để gợi chuyện, dùng bữa và dành thời gian cho gia đình.',
    spots: [
      {
        name: 'Vườn Ký Ức BM (Tư Huỳnh)',
        location: 'Trong hệ sinh thái Bình Mỹ Tourism',
        activity: 'Gợi lại ký ức quê và tuổi thơ qua câu chuyện, trải nghiệm dân gian.',
        audience: 'Gia đình nhiều thế hệ',
        kind: 'farm',
      },
      {
        name: 'Võ đường Đất Thép',
        location: 'Bình Mỹ – Củ Chi; cần xác nhận thông tin với võ đường',
        activity: 'Gợi ý buổi giao lưu về tinh thần thượng võ; cần võ đường đồng ý trước khi tổ chức.',
        audience: 'Cha mẹ và con, nhóm gia đình',
        kind: 'heritage',
      },
      {
        name: 'Quán Ăn Bờ Sông Tư Dần',
        location: 'Bình Mỹ, TP.HCM',
        activity: 'Dùng bữa gia đình sau chuyến đi gần thành phố.',
        audience: 'Gia đình',
        kind: 'food',
      },
    ],
  },
  {
    month: 9,
    theme: 'Tựu trường & Hành trình xanh',
    title: 'Học ngoài lớp học',
    summary: 'Khám phá thiên nhiên, nông nghiệp, văn hóa và kỹ năng qua trải nghiệm thực tế.',
    spots: [
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Gợi ý buổi học ngoài trời về sinh thái, kênh rạch, workshop và giữ gìn cảnh quan.',
        audience: 'Học sinh, sinh viên, câu lạc bộ',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_cau_go.jpg', alt: 'Cầu gỗ trong khu du lịch sinh thái Bình Mỹ' }],
      },
      {
        name: 'Vườn Ký Ức BM (Tư Huỳnh)',
        location: 'Trong hệ sinh thái Bình Mỹ Tourism',
        activity: 'Tìm hiểu đời sống nông thôn, cây khoai mì, ký ức địa phương và hoạt động dân gian.',
        audience: 'Học sinh, sinh viên',
        kind: 'farm',
      },
      {
        name: 'Võ đường Đất Thép',
        location: 'Bình Mỹ – Củ Chi; cần xác nhận thông tin với võ đường',
        activity: 'Gợi ý trải nghiệm văn hóa võ thuật, kỷ luật và tinh thần thượng võ.',
        audience: 'Sinh viên, học sinh lớn',
        kind: 'heritage',
      },
    ],
  },
  {
    month: 10,
    theme: 'Trung thu & Hoài niệm',
    title: 'Trăng về Bình Mỹ',
    summary: 'Gợi không khí hoài niệm qua chuyện xưa, món quê và hoạt động thủ công.',
    spots: [
      {
        name: 'Vườn Ký Ức BM (Tư Huỳnh)',
        location: 'Trong hệ sinh thái Bình Mỹ Tourism',
        activity: 'Chụp ảnh hoài niệm, kể chuyện tuổi thơ và trải nghiệm hoạt động dân gian.',
        audience: 'Gia đình, người trẻ thích phong cách retro',
        kind: 'farm',
      },
      {
        name: 'Khu Du lịch Sinh thái Bình Mỹ',
        location: '298 Đường Sông Lu, Ấp An Hòa, xã Bình Mỹ',
        activity: 'Gợi ý workshop gốm, khoai mì hoặc làm bánh. Chỉ giới thiệu đêm trăng hay lồng đèn khi có lịch xác nhận.',
        audience: 'Gia đình, nhóm bạn',
        kind: 'nature',
        images: [{ src: '/assets/KDL_Binh_My_choi_la.jpg', alt: 'Chòi lá ven hồ tại khu du lịch Bình Mỹ' }],
      },
      {
        name: 'Võ đường Đất Thép',
        location: 'Bình Mỹ – Củ Chi; cần xác nhận thông tin với võ đường',
        activity: 'Có thể bổ sung giao lưu hoặc biểu diễn võ thuật theo lịch của võ đường.',
        audience: 'Thanh thiếu niên, gia đình',
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
