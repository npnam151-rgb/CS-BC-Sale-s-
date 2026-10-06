import React, { useEffect } from 'react';
import { 
  SingleVisitReportData, 
  createDefaultVisitReport 
} from '../types';
import { 
  Store, 
  Calendar, 
  User, 
  Layers, 
  Package, 
  RotateCcw, 
  MapPin, 
  MessageSquareQuote,
} from 'lucide-react';

interface ReportFormProps {
  data: SingleVisitReportData;
  onChange: (data: SingleVisitReportData) => void;
  onReset: () => void;
}

export function ReportForm({ data, onChange, onReset }: ReportFormProps) {
  // Ghi nhớ tên người báo cáo vào localStorage để không phải nhập lại mỗi lần
  useEffect(() => {
    if (!data.reporter) {
      const savedReporter = localStorage.getItem('sale_si_reporter');
      if (savedReporter) {
        onChange({ ...data, reporter: savedReporter });
      }
    }
  }, []);

  const handleReporterChange = (val: string) => {
    localStorage.setItem('sale_si_reporter', val);
    onChange({ ...data, reporter: val });
  };

  return (
    <div className="space-y-5">
      {/* Top Action Toolbar with prominent Reset Form Button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full flex items-center gap-1.5 border border-indigo-200">
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            Báo cáo sale sỉ
          </span>
        </div>

        {/* Nút Reset form */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors shadow-2xs cursor-pointer"
          title="Xóa trắng toàn bộ dữ liệu của điểm này để nhập lại từ đầu"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Reset form</span>
        </button>
      </div>

      {/* 1. Thông tin chuyến ghé thăm */}
      <div className="bg-white p-5 rounded-xl shadow-2xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">1. Thông tin chung</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Người báo cáo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.reporter}
              onChange={(e) => handleReporterChange(e.target.value)}
              placeholder="VD: Phạm Ngọc Thương, Nam..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold transition-all"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Tự động ghi nhớ cho các lần nhập sau</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Ngày báo cáo <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => onChange({ ...data, date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
            />
          </div>
        </div>

        {/* Phân loại Điểm cũ/mới */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phân loại điểm bán <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => onChange({ ...data, outletType: 'Điểm cũ' })}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                data.outletType === 'Điểm cũ'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>🏢 Điểm cũ</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...data, outletType: 'Điểm mới' })}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                data.outletType === 'Điểm mới'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>✨ Điểm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Thông tin Điểm bán */}
      <div className="bg-white p-5 rounded-xl shadow-2xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Store className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">2. Thông tin Điểm bán</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên điểm bán <span className="text-rose-500">*</span>
          </label>
          <input
            id="restaurant-name-input"
            type="text"
            value={data.restaurantName}
            onChange={(e) => onChange({ ...data, restaurantName: e.target.value })}
            placeholder="VD: Cơm Thảo, Bia Doan, Tăng High..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Địa chỉ điểm bán
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="VD: 72 Nguyễn Khang, Cầu Giấy, Hà Nội"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
            Đánh giá / Đề xuất
          </label>
          <textarea
            rows={3}
            value={data.evaluationOrProposal}
            onChange={(e) => onChange({ ...data, evaluationOrProposal: e.target.value })}
            placeholder="Tình hình tại điểm bán: khách đông không, bia bán chạy không, có khiếu nại hay đề xuất hỗ trợ vòi rót/cốc/áo..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 3. TỒN KHO & ĐẶT HÀNG */}
      <div className="bg-white p-5 rounded-xl shadow-2xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Package className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">3. Số lượng Tồn kho & Đặt hàng</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Khối TỒN KHO */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              TỒN KHO
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bom 30L</label>
                <input
                  type="text"
                  value={data.stockBom30L}
                  onChange={(e) => onChange({ ...data, stockBom30L: e.target.value })}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-white border border-blue-300 rounded-lg text-sm font-bold text-center text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bom 50L</label>
                <input
                  type="text"
                  value={data.stockBom50L}
                  onChange={(e) => onChange({ ...data, stockBom50L: e.target.value })}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-white border border-blue-300 rounded-lg text-sm font-bold text-center text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Keg 1L</label>
                <input
                  type="text"
                  value={data.stockKeg1L}
                  onChange={(e) => onChange({ ...data, stockKeg1L: e.target.value })}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-white border border-blue-300 rounded-lg text-sm font-bold text-center text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Khối ĐẶT HÀNG */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              ĐẶT HÀNG
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bom 30L</label>
                <input
                  type="text"
                  value={data.orderBom30L}
                  onChange={(e) => onChange({ ...data, orderBom30L: e.target.value })}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-center text-amber-950 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bom 50L</label>
                <input
                  type="text"
                  value={data.orderBom50L}
                  onChange={(e) => onChange({ ...data, orderBom50L: e.target.value })}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-center text-amber-950 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Keg 1L</label>
                <input
                  type="text"
                  value={data.orderKeg1L}
                  onChange={(e) => onChange({ ...data, orderKeg1L: e.target.value })}
                  placeholder="0"
                  className="w-full px-2.5 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-center text-amber-950 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nút Reset form phụ ở chân biểu mẫu */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset form (Xóa trắng để nhập điểm khác)</span>
        </button>
      </div>
    </div>
  );
}
