export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export type SeasonTheme = {
  id: SeasonId;
  label: string;
  title: string;
  intro: string;
  categoryId: string;
  accent: string;
  surface: string;
};

export const seasonThemes: SeasonTheme[] = [
  { id: 'spring', label: 'Xuân', title: 'Sông nước & Ký ức', intro: 'Nhìn Bình Mỹ từ dòng sông và những câu chuyện ven bờ.', categoryId: 'song-nuoc-ky-uc', accent: '#40916C', surface: '#EAF4EB' },
  { id: 'summer', label: 'Hạ', title: 'Hương vị miệt vườn', intro: 'Dạo qua không gian vườn cây và nhịp sống nhà vườn.', categoryId: 'vuon-trai-cay', accent: '#A9761F', surface: '#FFF4D9' },
  { id: 'autumn', label: 'Thu', title: 'Chạm nghề quê', intro: 'Tìm hiểu nghề thủ công qua câu chuyện và đôi tay người làm.', categoryId: 'trai-nghiem-lam-nghe', accent: '#C77952', surface: '#F8EAE2' },
  { id: 'winter', label: 'Đông', title: 'Gắn kết nông trại', intro: 'Khám phá nông nghiệp và những trải nghiệm gần gũi với thiên nhiên.', categoryId: 'trang-trai', accent: '#35858B', surface: '#E6F2F2' },
];

export function getSeasonTheme(id: string | null | undefined): SeasonTheme | undefined {
  return seasonThemes.find((season) => season.id === id);
}
