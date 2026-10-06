import React, { forwardRef } from 'react';
import { SingleVisitReportData } from '../types';
import { Store, Layers, Package, MapPin, MessageSquareQuote, Calendar, User, Clock } from 'lucide-react';

interface ReportPreviewProps {
  data: SingleVisitReportData;
}

export const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  ({ data }, ref) => {
    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '...';

    const isNew = data.outletType === 'Điểm mới';

    return (
      <div
        ref={ref}
        className="bg-white text-slate-900 w-[720px] min-w-[720px] mx-auto p-7 shadow-xs border border-slate-200"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-2 border-indigo-900 pb-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                BÁO CÁO SALE SỈ
              </h1>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Ngày gửi
              </div>
              <div className="text-base font-bold text-slate-900">
                {formattedDate}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Người báo cáo:</span>
              <span className="font-bold text-slate-900 text-base">
                {data.reporter || '(Chưa nhập tên)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {data.visitOrder && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-300">
                  Điểm thứ {data.visitOrder}
                </span>
              )}
              {/* Badge Điểm cũ / Điểm mới */}
              <span
                className={`px-3 py-1 text-xs font-extrabold rounded-md border ${
                  isNew
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                {data.outletType}
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin Điểm bán */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 mb-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Tên điểm bán
              </div>
              <div className="text-xl font-black text-slate-900 leading-tight">
                {data.restaurantName || '(Chưa nhập tên quán)'}
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/70 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-slate-500 font-medium mr-1.5">Địa chỉ:</span>
              <span className="font-semibold text-slate-800">
                {data.address || '(Chưa có địa chỉ)'}
              </span>
            </div>
          </div>

          {/* Đánh giá / Đề xuất */}
          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/70 text-sm">
            <MessageSquareQuote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-slate-500 font-medium block mb-1">Đánh giá / Đề xuất:</span>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 font-normal leading-relaxed whitespace-pre-line text-xs">
                {data.evaluationOrProposal || '(Không có phát sinh/đề xuất nào)'}
              </div>
            </div>
          </div>
        </div>

        {/* Bảng TỒN KHO & ĐẶT HÀNG (Chuẩn format cột) */}
        <div className="mb-5">
          <div className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-xs"></span>
            TÌNH HÌNH TỒN KHO & ĐƠN ĐẶT HÀNG
          </div>

          <div className="rounded-xl border border-slate-300 overflow-hidden shadow-2xs">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[11px] tracking-wide">
                  <th colSpan={3} className="py-2 px-3 border-r border-slate-300 bg-blue-100/70 text-blue-900">
                    <div className="flex items-center justify-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-700" />
                      TỒN KHO
                    </div>
                  </th>
                  <th colSpan={3} className="py-2 px-3 bg-amber-100/70 text-amber-900">
                    <div className="flex items-center justify-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      ĐẶT HÀNG
                    </div>
                  </th>
                </tr>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-300 font-bold text-[11px]">
                  <th className="py-2 px-2 border-r border-slate-200 bg-blue-50/60">Bom 30L</th>
                  <th className="py-2 px-2 border-r border-slate-200 bg-blue-50/60">Bom 50L</th>
                  <th className="py-2 px-2 border-r border-slate-300 bg-blue-50/60">Keg 1L</th>
                  <th className="py-2 px-2 border-r border-slate-200 bg-amber-50/60">Bom 30L</th>
                  <th className="py-2 px-2 border-r border-slate-200 bg-amber-50/60">Bom 50L</th>
                  <th className="py-2 px-2 bg-amber-50/60">Keg 1L</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white text-base font-bold">
                  {/* Tồn kho */}
                  <td className="py-3 px-2 border-r border-slate-200 text-blue-950">
                    {data.stockBom30L || '0'}
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 text-blue-950">
                    {data.stockBom50L || '0'}
                  </td>
                  <td className="py-3 px-2 border-r border-slate-300 text-blue-950">
                    {data.stockKeg1L || '0'}
                  </td>
                  {/* Đặt hàng */}
                  <td className="py-3 px-2 border-r border-slate-200 text-amber-950 bg-amber-50/20">
                    {data.orderBom30L || '0'}
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 text-amber-950 bg-amber-50/20">
                    {data.orderBom50L || '0'}
                  </td>
                  <td className="py-3 px-2 text-amber-950 bg-amber-50/20">
                    {data.orderKeg1L || '0'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


      </div>
    );
  }
);

ReportPreview.displayName = 'ReportPreview';
