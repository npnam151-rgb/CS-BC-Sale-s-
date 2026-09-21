import React, { forwardRef } from 'react';
import { SaleSiReportData } from '../types';
import { Store, TrendingUp, Package, AlertCircle } from 'lucide-react';

interface ReportPreviewProps {
  data: SaleSiReportData;
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

    // Đếm số điểm bán có nhập tên
    const activeOutlets = data.outlets.filter((o) => o.restaurantName.trim().length > 0);

    return (
      <div
        ref={ref}
        className="bg-white text-slate-900 w-[920px] min-w-[920px] mx-auto p-8 shadow-sm border border-slate-200"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-2 border-indigo-900 pb-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                BÁO CÁO HOẠT ĐỘNG KINH DOANH
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mt-1.5">
                BÁO CÁO SALE SỈ
              </h1>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Ngày gửi báo cáo
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
          </div>
        </div>

        {/* Section 1: 4 Key Metric Blocks */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Block 1: Điểm mở mới */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Điểm mở mới
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                SL: {data.newOutletsCount || '0'}
              </span>
            </div>
            <div className="text-sm text-slate-800 font-medium min-h-[42px] whitespace-pre-line leading-relaxed">
              {data.newOutletsList || (
                <span className="text-slate-400 italic text-xs">Không có điểm mở mới</span>
              )}
            </div>
          </div>

          {/* Block 2: Tổng số điểm đến chăm sóc */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                Tổng số điểm đến chăm sóc
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                SL: {data.visitedOutletsCount || activeOutlets.length || '0'}
              </span>
            </div>
            <div className="text-sm text-slate-800 font-medium min-h-[42px] whitespace-pre-line leading-relaxed">
              {data.visitedOutletsList ? (
                data.visitedOutletsList.startsWith('Gồm:')
                  ? data.visitedOutletsList
                  : `Gồm: ${data.visitedOutletsList}`
              ) : (
                <span className="text-slate-400 italic text-xs">Chưa có danh sách điểm</span>
              )}
            </div>
          </div>

          {/* Block 3: Tổng số đơn đặt hàng */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                Tổng số đơn đặt hàng
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                {data.ordersCount
                  ? data.ordersCount.toLowerCase().includes('nhà')
                    ? `SL: ${data.ordersCount}`
                    : `SL: ${data.ordersCount} nhà`
                  : 'SL: 0 nhà'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-amber-200/60 text-xs">
              <div className="bg-white/80 p-1.5 rounded border border-amber-200/80 text-center">
                <div className="text-slate-500 text-[10px] font-medium">Bom 30L</div>
                <div className="text-sm font-bold text-slate-900">{data.ordersBom30L || '0'}</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded border border-amber-200/80 text-center">
                <div className="text-slate-500 text-[10px] font-medium">Bom 50L</div>
                <div className="text-sm font-bold text-slate-900">{data.ordersBom50L || '0'}</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded border border-amber-200/80 text-center">
                <div className="text-slate-500 text-[10px] font-medium">Keg 1L</div>
                <div className="text-sm font-bold text-slate-900">{data.ordersKeg1L || '0'}</div>
              </div>
            </div>
          </div>

          {/* Block 4: Phát sinh / Đề xuất */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
              Phát sinh / Đề xuất
            </div>
            <div className="text-sm text-slate-800 font-normal min-h-[42px] whitespace-pre-line leading-relaxed">
              {data.issuesOrProposals || (
                <span className="text-slate-400 italic text-xs">Không có phát sinh/đề xuất</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Bảng Chi Tiết 15 Điểm Bán */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-sm"></span>
              CHI TIẾT 15 ĐIỂM BÁN (TỒN KHO & ĐIỂM CHĂM SÓC)
            </h2>
            <span className="text-xs text-slate-500">
              Đã ghi nhận: <strong className="text-slate-900">{activeOutlets.length}/15</strong> điểm
            </span>
          </div>

          <div className="rounded-lg border border-slate-300 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[11px] tracking-wide">
                  <th className="py-2.5 px-3 text-center w-14 border-r border-slate-300">STT</th>
                  <th className="py-2.5 px-4 border-r border-slate-300">Tên Nhà Hàng</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300 w-36">Tồn Bom 30L</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300 w-36">Tồn Bom 50L</th>
                  <th className="py-2.5 px-3 text-center w-36">Tồn Keg 1L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.outlets.map((outlet) => {
                  const hasData = outlet.restaurantName.trim().length > 0;

                  return (
                    <tr
                      key={outlet.id}
                      className={
                        hasData
                          ? 'bg-white hover:bg-slate-50/70 transition-colors'
                          : 'bg-slate-50/40 text-slate-400'
                      }
                    >
                      <td className="py-2 px-3 text-center font-bold text-slate-700 border-r border-slate-200">
                        {outlet.id}
                      </td>
                      <td className="py-2 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        {outlet.restaurantName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{outlet.restaurantName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-normal italic">Điểm bán số {outlet.id}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200 text-slate-800">
                        {outlet.stockBom30L || (hasData ? '0' : '-')}
                      </td>
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200 text-slate-800">
                        {outlet.stockBom50L || (hasData ? '0' : '-')}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">
                        {outlet.stockKeg1L || (hasData ? '0' : '-')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-end text-xs text-slate-500">
          <div className="text-center pr-6">
            <div className="font-semibold text-slate-800">Người lập báo cáo</div>
            <div className="h-10"></div>
            <div className="font-bold text-slate-900">
              {data.reporter || '................................'}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReportPreview.displayName = 'ReportPreview';
