import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { ReportForm } from './components/ReportForm';
import { ReportPreview } from './components/ReportPreview';
import { 
  SaleSiReportData, 
  DEFAULT_OUTLETS, 
  formatNewOutletsText, 
  formatVisitedOutletsText, 
  formatTotalOrdersText, 
  formatOutletCellText 
} from './types';

// Webhook Google Apps Script URL
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxWKIm74psex5-61MTbeSZKTyA5_K8GBE2MzZ3iOcn7bu1ekM7NqvGXDOJLmz88iDGQ/exec";

export default function App() {
  const [reportData, setReportData] = useState<SaleSiReportData>({
    date: new Date().toISOString().split('T')[0],
    reporter: '',
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
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const previewRef = useRef<HTMLDivElement>(null);

  const saveToGoogleSheets = async (data: SaleSiReportData) => {
    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.log("Chưa cấu hình Google Sheets Webhook URL. Bỏ qua bước lưu dữ liệu.");
      return false;
    }

    const newOutletsFormatted = formatNewOutletsText(data.newOutletsCount, data.newOutletsList);
    const visitedOutletsFormatted = formatVisitedOutletsText(data.visitedOutletsCount, data.visitedOutletsList);
    const totalOrdersFormatted = formatTotalOrdersText(data.ordersCount, data.ordersBom30L, data.ordersBom50L, data.ordersKeg1L);
    const outletsFormatted = data.outlets.map(o => formatOutletCellText(o));

    const payload = {
      sheetName: "BC sale sỉ",
      date: data.date,
      reporter: data.reporter,
      newOutlets: newOutletsFormatted,
      issuesOrProposals: data.issuesOrProposals,
      visitedOutlets: visitedOutletsFormatted,
      totalOrders: totalOrdersFormatted,
      outlets: outletsFormatted,
      items: data.outlets.map(o => ({
        id: o.id,
        title: `Điểm bán số ${o.id}`,
        value: formatOutletCellText(o)
      }))
    };

    try {
      setSheetStatus('saving');
      
      const fetchPromise = fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log("Đã gửi dữ liệu lên Google Sheets (sheet BC sale sỉ)");
      setSheetStatus('success');
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu vào Google Sheets:", error);
      setSheetStatus('error');
      return false;
    }
  };

  const handleExportImage = async () => {
    if (!previewRef.current) return;
    
    setIsExporting(true);
    setExportSuccess(false);
    setSheetStatus('idle');

    try {
      // 1. Lưu dữ liệu lên Google Sheets vào sheet "BC sale sỉ"
      await saveToGoogleSheets(reportData);

      // Đợi một chút để UI cập nhật trạng thái
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // 2. Xuất ảnh
      const dataUrl = await toPng(previewRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      const dateStr = reportData.date || new Date().toISOString().split('T')[0];
      const reporterStr = reportData.reporter ? reportData.reporter.trim().replace(/\s+/g, '_') : 'Sale';
      const fileName = `BaoCao_SaleSi_${reporterStr}_${dateStr}.png`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to export image', err);
      try {
        const dataUrl = await toPng(previewRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        });
        const link = document.createElement('a');
        const dateStr = reportData.date || new Date().toISOString().split('T')[0];
        const reporterStr = reportData.reporter ? reportData.reporter.trim().replace(/\s+/g, '_') : 'Sale';
        const fileName = `BaoCao_SaleSi_${reporterStr}_${dateStr}.png`;
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        setExportSuccess(true);
      } catch (innerErr) {
        alert('Có lỗi xảy ra khi xuất ảnh. Vui lòng thử lại.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header: Chỉ tên ứng dụng và nút xuất báo cáo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Báo cáo Sale sỉ
            </h1>
            
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xuất...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Xuất báo cáo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8">
        {/* Status Notification */}
        {exportSuccess && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${sheetStatus === 'error' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
            {sheetStatus === 'error' ? <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            <div>
              <p className="font-semibold text-sm">
                {sheetStatus === 'error' 
                  ? 'Đã tải ảnh thành công! (Lưu ý: Chưa gửi được dữ liệu lên Google Sheets)' 
                  : 'Đã xuất ảnh báo cáo và lưu vào Google Sheets thành công!'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <ReportForm 
              data={reportData} 
              onChange={setReportData} 
            />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Bản xem trước ảnh báo cáo</h2>
                <p className="text-xs text-slate-500">Hình ảnh hiển thị đúng như file PNG khi tải về</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Tự động cập nhật
              </span>
            </div>
            
            <div className="bg-slate-200 p-2 sm:p-4 rounded-xl sm:rounded-2xl overflow-x-auto shadow-inner border border-slate-300">
              <div className="w-[920px] min-w-[920px] mx-auto bg-white rounded-lg shadow-sm">
                <ReportPreview 
                  data={reportData} 
                  ref={previewRef} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] z-30">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang xuất...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Xuất báo cáo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
