import React, { useState } from 'react';
import { 
  SaleSiReportData, 
  OutletItem, 
  DEFAULT_OUTLETS 
} from '../types';
import { 
  Store, 
  Calendar, 
  User, 
  TrendingUp, 
  Package, 
  FileText, 
  RotateCcw, 
  PlusCircle, 
  CheckCircle2, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

interface ReportFormProps {
  data: SaleSiReportData;
  onChange: (data: SaleSiReportData) => void;
}

export function ReportForm({ data, onChange }: ReportFormProps) {
  const [selectedOutletTab, setSelectedOutletTab] = useState<number | 'all'>('all');

  const handleOutletChange = (id: number, field: keyof OutletItem, value: string) => {
    const updatedOutlets = data.outlets.map(outlet => {
      if (outlet.id === id) {
        return { ...outlet, [field]: value };
      }
      return outlet;
    });
    onChange({ ...data, outlets: updatedOutlets });
  };

  const handleClearOutlet = (id: number) => {
    const updatedOutlets = data.outlets.map(outlet => {
      if (outlet.id === id) {
        return {
          ...outlet,
          restaurantName: '',
          stockBom30L: '',
          stockBom50L: '',
          stockKeg1L: '',
          orderBom30L: '',
          orderBom50L: '',
          orderKeg1L: '',
          notes: ''
        };
      }
      return outlet;
    });
    onChange({ ...data, outlets: updatedOutlets });
  };

  // Tự động tổng hợp điểm chăm sóc từ các điểm bán đã nhập tên
  const handleAutoFillVisitedOutlets = () => {
    const activeOutlets = data.outlets.filter(o => o.restaurantName.trim().length > 0);
    const count = activeOutlets.length;
    const names = activeOutlets.map(o => o.restaurantName.trim()).join(', ');
    onChange({
      ...data,
      visitedOutletsCount: count > 0 ? count.toString() : data.visitedOutletsCount,
      visitedOutletsList: names || data.visitedOutletsList
    });
  };

  // Đếm số điểm bán đã nhập dữ liệu
  const filledOutletsCount = data.outlets.filter(o => o.restaurantName.trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* Quick Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
            Báo cáo Sale Sỉ
          </span>
          <span className="text-xs text-slate-500">
            {filledOutletsCount}/15 điểm đã ghi nhận
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({
              date: data.date,
              reporter: data.reporter,
              newOutletsCount: '',
              newOutletsList: '',
              issuesOrProposals: '',
              visitedOutletsCount: '',
              visitedOutletsList: '',
              ordersCount: '',
              ordersBom30L: '',
              ordersBom50L: '',
              ordersKeg1L: '',
              outlets: DEFAULT_OUTLETS.map(o => ({ ...o })),
            })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      {/* 1. Thông tin chung */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800">1. Thông tin chung</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Ngày báo cáo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={data.date}
                onChange={(e) => onChange({ ...data, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Người báo cáo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.reporter}
              onChange={(e) => onChange({ ...data, reporter: e.target.value })}
              placeholder="VD: Nguyễn Văn Nam"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Chỉ số tổng quan (Điểm mở mới, Điểm chăm sóc, Đơn đặt hàng, Đề xuất) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800">2. Chỉ số tổng hợp ngày</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Điểm mở mới */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Điểm mở mới
              </span>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Số lượng (SL)</label>
              <input
                type="text"
                value={data.newOutletsCount}
                onChange={(e) => onChange({ ...data, newOutletsCount: e.target.value })}
                placeholder="VD: 2"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Danh sách tên điểm mở mới</label>
              <textarea
                rows={2}
                value={data.newOutletsList}
                onChange={(e) => onChange({ ...data, newOutletsList: e.target.value })}
                placeholder="VD: Vân Hồ quán, Minh Khai Quán"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Tổng số điểm đến chăm sóc */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                Tổng số điểm đến chăm sóc
              </span>
              <button
                type="button"
                onClick={handleAutoFillVisitedOutlets}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
                title="Tự động đếm và lấy tên các điểm bán đã nhập bên dưới"
              >
                ⚡ Lấy từ 15 điểm
              </button>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Số lượng (SL)</label>
              <input
                type="text"
                value={data.visitedOutletsCount}
                onChange={(e) => onChange({ ...data, visitedOutletsCount: e.target.value })}
                placeholder="VD: 5"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Danh sách gồm các điểm</label>
              <textarea
                rows={2}
                value={data.visitedOutletsList}
                onChange={(e) => onChange({ ...data, visitedOutletsList: e.target.value })}
                placeholder="VD: Quýt quán, 72 NK, Quán nhỏ, TD MK, TD NT"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Tổng số đơn đặt hàng */}
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-3">
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Tổng số đơn đặt hàng
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Số nhà đặt (SL)</label>
              <input
                type="text"
                value={data.ordersCount}
                onChange={(e) => onChange({ ...data, ordersCount: e.target.value })}
                placeholder="VD: 10 nhà"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Bom 30L</label>
              <input
                type="text"
                value={data.ordersBom30L}
                onChange={(e) => onChange({ ...data, ordersBom30L: e.target.value })}
                placeholder="VD: 20"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Bom 50L</label>
              <input
                type="text"
                value={data.ordersBom50L}
                onChange={(e) => onChange({ ...data, ordersBom50L: e.target.value })}
                placeholder="VD: 30"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Keg 1L</label>
              <input
                type="text"
                value={data.ordersKeg1L}
                onChange={(e) => onChange({ ...data, ordersKeg1L: e.target.value })}
                placeholder="VD: 100"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Phát sinh / Đề xuất */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Phát sinh / Đề xuất
          </label>
          <textarea
            rows={3}
            value={data.issuesOrProposals}
            onChange={(e) => onChange({ ...data, issuesOrProposals: e.target.value })}
            placeholder="Ghi nhận các vấn đề phát sinh tại điểm bán, khiếu nại khách hàng, đề xuất cung cấp trang thiết bị POSM, hỗ trợ kỹ thuật rót bia..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* 3. Chi tiết 15 Điểm bán */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                3. Chi tiết 15 Điểm bán (Điểm bán số 1 → 15)
              </h2>
              <p className="text-xs text-slate-500">
                Ghi nhận Tên Nhà hàng và tình hình Tồn kho tại từng điểm bán
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
            {filledOutletsCount}/15 Điểm đã nhập
          </span>
        </div>

        {/* Fast Selector / Quick Nav Tabs for 15 Outlets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedOutletTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedOutletTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả (1-15)
          </button>
          {data.outlets.map((outlet) => {
            const hasData = outlet.restaurantName.trim().length > 0;
            const isSelected = selectedOutletTab === outlet.id;
            return (
              <button
                key={outlet.id}
                type="button"
                onClick={() => setSelectedOutletTab(outlet.id)}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : hasData
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>#{outlet.id}</span>
                {hasData && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Outlets Cards Grid */}
        <div className="space-y-4 pt-2">
          {data.outlets
            .filter((outlet) => selectedOutletTab === 'all' || selectedOutletTab === outlet.id)
            .map((outlet) => {
              const hasData = outlet.restaurantName.trim().length > 0;

              return (
                <div
                  key={outlet.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasData
                      ? 'bg-slate-50/70 border-slate-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                        {outlet.id}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        Điểm bán số {outlet.id}
                      </span>
                      {hasData && (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã điền
                        </span>
                      )}
                    </div>
                    {hasData && (
                      <button
                        type="button"
                        onClick={() => handleClearOutlet(outlet.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:underline"
                      >
                        Xóa điểm này
                      </button>
                    )}
                  </div>

                  {/* Inputs for Outlet */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Tên NH */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Tên NH (Nhà hàng)
                      </label>
                      <input
                        type="text"
                        value={outlet.restaurantName}
                        onChange={(e) => handleOutletChange(outlet.id, 'restaurantName', e.target.value)}
                        placeholder={`VD: Quýt quán`}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* Tồn kho Bom 30L */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Tồn kho Bom 30L
                      </label>
                      <input
                        type="text"
                        value={outlet.stockBom30L}
                        onChange={(e) => handleOutletChange(outlet.id, 'stockBom30L', e.target.value)}
                        placeholder="Số lượng"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* Tồn kho Bom 50L */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Tồn kho Bom 50L
                      </label>
                      <input
                        type="text"
                        value={outlet.stockBom50L}
                        onChange={(e) => handleOutletChange(outlet.id, 'stockBom50L', e.target.value)}
                        placeholder="Số lượng"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* Tồn kho Keg 1L */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Tồn kho Keg 1L
                      </label>
                      <input
                        type="text"
                        value={outlet.stockKeg1L}
                        onChange={(e) => handleOutletChange(outlet.id, 'stockKeg1L', e.target.value)}
                        placeholder="Số lượng"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
