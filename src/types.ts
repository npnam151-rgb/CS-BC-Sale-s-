export interface OutletItem {
  id: number; // 1 to 15
  restaurantName: string; // Tên NH
  stockBom30L: string; // Tồn kho Bom 30L
  stockBom50L: string; // Tồn kho Bom 50L
  stockKeg1L: string; // Tồn kho Keg 1L
  orderBom30L?: string; // Đặt hàng nếu có
  orderBom50L?: string;
  orderKeg1L?: string;
  notes?: string;
}

export interface SaleSiReportData {
  date: string;
  reporter: string;
  // Điểm mở mới
  newOutletsCount: string;
  newOutletsList: string;
  // Phát sinh / Đề xuất
  issuesOrProposals: string;
  // Tổng số điểm đến chăm sóc
  visitedOutletsCount: string;
  visitedOutletsList: string;
  // Tổng số đơn đặt hàng
  ordersCount: string;
  ordersBom30L: string;
  ordersBom50L: string;
  ordersKeg1L: string;
  // 15 Điểm bán
  outlets: OutletItem[];
}

export const DEFAULT_OUTLETS: OutletItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  restaurantName: '',
  stockBom30L: '',
  stockBom50L: '',
  stockKeg1L: '',
  orderBom30L: '',
  orderBom50L: '',
  orderKeg1L: '',
  notes: '',
}));

export const SAMPLE_SALE_SI_DATA: SaleSiReportData = {
  date: new Date().toISOString().split('T')[0],
  reporter: 'Nguyễn Văn Nam',
  newOutletsCount: '2',
  newOutletsList: 'Vân Hồ quán, Minh Khai Quán',
  issuesOrProposals: 'Điểm bán số 3 đề xuất hỗ trợ thêm biển bảng POSM và kiểm tra lại van vòi rót.',
  visitedOutletsCount: '5',
  visitedOutletsList: 'Quýt quán, 72 NK, Quán nhỏ, TD MK, TD NT',
  ordersCount: '10',
  ordersBom30L: '20',
  ordersBom50L: '30',
  ordersKeg1L: '100',
  outlets: [
    { id: 1, restaurantName: 'Quýt quán', stockBom30L: '2', stockBom50L: '1', stockKeg1L: '10' },
    { id: 2, restaurantName: '72 NK', stockBom30L: '4', stockBom50L: '2', stockKeg1L: '15' },
    { id: 3, restaurantName: 'Quán nhỏ', stockBom30L: '1', stockBom50L: '0', stockKeg1L: '5' },
    { id: 4, restaurantName: 'TD MK', stockBom30L: '3', stockBom50L: '3', stockKeg1L: '20' },
    { id: 5, restaurantName: 'TD NT', stockBom30L: '2', stockBom50L: '1', stockKeg1L: '8' },
    { id: 6, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 7, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 8, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 9, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 10, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 11, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 12, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 13, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 14, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
    { id: 15, restaurantName: '', stockBom30L: '', stockBom50L: '', stockKeg1L: '' },
  ],
};

// Formatters for Google Sheets cells matching the image layout
export function formatNewOutletsText(count: string, list: string): string {
  const parts: string[] = [];
  if (count.trim()) {
    parts.push(`SL: ${count.trim()}`);
  }
  if (list.trim()) {
    parts.push(list.trim());
  }
  return parts.join('\n');
}

export function formatVisitedOutletsText(count: string, list: string): string {
  const parts: string[] = [];
  if (count.trim()) {
    parts.push(`SL: ${count.trim()}`);
  }
  if (list.trim()) {
    const trimmed = list.trim();
    parts.push(trimmed.startsWith('Gồm:') ? trimmed : `Gồm: ${trimmed}`);
  }
  return parts.join('\n');
}

export function formatTotalOrdersText(count: string, b30: string, b50: string, k1: string): string {
  const parts: string[] = [];
  if (count.trim()) {
    const c = count.trim();
    parts.push(c.toLowerCase().includes('nhà') ? `SL: ${c}` : `SL: ${c} nhà`);
  }
  if (b30.trim()) {
    parts.push(`Bom30L: ${b30.trim()}`);
  }
  if (b50.trim()) {
    parts.push(`Bom50L: ${b50.trim()}`);
  }
  if (k1.trim()) {
    parts.push(`Keg1L: ${k1.trim()}`);
  }
  return parts.join('\n');
}

export function formatOutletCellText(outlet: OutletItem): string {
  if (!outlet.restaurantName.trim() && !outlet.stockBom30L.trim() && !outlet.stockBom50L.trim() && !outlet.stockKeg1L.trim()) {
    return '';
  }
  return [
    `Tên NH: ${outlet.restaurantName.trim()}`,
    'Tồn kho:',
    `Bom30L: ${outlet.stockBom30L.trim()}`,
    `Bom50L: ${outlet.stockBom50L.trim()}`,
    `Keg1L: ${outlet.stockKeg1L.trim()}`,
  ].join('\n');
}
