export type HistoryItem = {
  id: string;
  image: any;
  caption: string;
  location: string;
  date: string;
};

export const historyData: HistoryItem[] = [
  { id: '1', image: require('@/assets/images/3-1.png'), caption: '3年1組', location: '大阪市、北区', date: '2026-05-30' },
  { id: '2', image: require('@/assets/images/taikukan.png'), caption: '体育館', location: '大阪市、北区', date: '2026-05-28' },
];

export function getHistoryById(id: string) {
  return historyData.find((h) => h.id === id) || null;
}
