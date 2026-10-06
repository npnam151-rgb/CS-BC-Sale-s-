export type OutletType = 'Điểm cũ' | 'Điểm mới';

export interface SingleVisitReportData {
  date: string;
  reporter: string;
  visitOrder: string; // Điểm đi thứ mấy trong ngày (1, 2, 3...)
  outletType: OutletType; // Điểm cũ / Điểm mới
  restaurantName: string; // Tên điểm bán
  address: string; // Địa chỉ điểm bán
  evaluationOrProposal: string; // Đánh giá/ Đề xuất
  stockBom30L: string; // Tồn kho Bom 30L
  stockBom50L: string; // Tồn kho Bom 50L
  stockKeg1L: string; // Tồn kho Keg 1L
  orderBom30L: string; // Đặt hàng Bom 30L
  orderBom50L: string; // Đặt hàng Bom 50L
  orderKeg1L: string; // Đặt hàng Keg 1L
}

export const createDefaultVisitReport = (
  reporter: string = '',
  visitOrder: string = '1'
): SingleVisitReportData => ({
  date: new Date().toISOString().split('T')[0],
  reporter,
  visitOrder,
  outletType: 'Điểm cũ',
  restaurantName: '',
  address: '',
  evaluationOrProposal: '',
  stockBom30L: '',
  stockBom50L: '',
  stockKeg1L: '',
  orderBom30L: '',
  orderBom50L: '',
  orderKeg1L: '',
});

export const SAMPLE_VISIT_DATA: SingleVisitReportData = {
  date: new Date().toISOString().split('T')[0],
  reporter: 'Phạm Ngọc Thương',
  visitOrder: '1',
  outletType: 'Điểm cũ',
  restaurantName: 'Cơm Thảo',
  address: '72 Nguyễn Khang, Cầu Giấy, Hà Nội',
  evaluationOrProposal: 'Khách đông, bia tiêu thụ đều, chủ quán đề xuất cấp thêm 2 khay đựng cốc',
  stockBom30L: '',
  stockBom50L: '6',
  stockKeg1L: '',
  orderBom30L: '',
  orderBom50L: '',
  orderKeg1L: '6',
};
