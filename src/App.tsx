import React, { useState, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Store
} from 'lucide-react';
import { ReportForm } from './components/ReportForm';
import { ReportPreview } from './components/ReportPreview';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { 
  SingleVisitReportData, 
  createDefaultVisitReport 
} from './types';

// Webhook Google Apps Script URL
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxWKIm74psex5-61MTbeSZKTyA5_K8GBE2MzZ3iOcn7bu1ekM7NqvGXDOJLmz88iDGQ/exec";

export default function App() {
  const [reportData, setReportData] = useState<SingleVisitReportData>(() => {
    const savedReporter = typeof window !== 'undefined' ? localStorage.getItem('sale_si_reporter') || '' : '';
    return createDefaultVisitReport(savedReporter);
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Modal Popup states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalFileName, setModalFileName] = useState<string>('BaoCao_SaleSi.png');
  const [isBlockedWarning, setIsBlockedWarning] = useState(false);

  // Reset toàn bộ thông tin điểm để nhập lại từ đầu hoặc nhập điểm khác
  const handleResetForm = () => {
    setReportData({
      ...createDefaultVisitReport(reportData.reporter, reportData.visitOrder || '1'),
      date: reportData.date,
    });
    setExportSuccess(false);
  };

  // Chuyển sang điểm tiếp theo sau khi báo cáo xong
  const handleNextPoint = () => {
    const currentNum = parseInt(reportData.visitOrder || '1', 10);
    const nextOrder = !isNaN(currentNum) ? String(currentNum + 1) : '2';

    setReportData({
      ...createDefaultVisitReport(reportData.reporter, nextOrder),
      date: reportData.date,
    });
    setExportSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveToGoogleSheets = async (data: SingleVisitReportData) => {
    const payload = {
      sheetName: "BC sale sỉ",
      date: data.date,
      reporter: data.reporter,
      visitOrder: data.visitOrder ? String(data.visitOrder).trim() : '1',
      outletType: data.outletType || 'Điểm cũ',
      restaurantName: data.restaurantName ? data.restaurantName.trim() : '',
      address: data.address ? data.address.trim() : '',
      evaluationOrProposal: data.evaluationOrProposal ? data.evaluationOrProposal.trim() : '',
      stockBom30L: data.stockBom30L || '',
      stockBom50L: data.stockBom50L || '',
      stockKeg1L: data.stockKeg1L || '',
      orderBom30L: data.orderBom30L || '',
      orderBom50L: data.orderBom50L || '',
      orderKeg1L: data.orderKeg1L || '',
    };

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.log("Chưa cấu hình Google Sheets Webhook URL. Bỏ qua bước lưu dữ liệu.");
      return false;
    }

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
      
      console.log("Đã gửi dữ liệu lượt đi lên Google Sheets (sheet BC sale sỉ)");
      setSheetStatus('success');
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu vào Google Sheets:", error);
      setSheetStatus('error');
      return false;
    }
  };

  const currentBlobUrlRef = useRef<string | null>(null);

  // Tạo ảnh chất lượng cao dạng Data URL (tự chứa hoàn toàn, không bị thu hồi hay chặn trong iframe)
  const generateReportImageDataUrl = async (): Promise<string | null> => {
    if (!previewRef.current) return null;

    const isMobile = typeof navigator !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Zalo/i.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );

    // Chiến lược 1: toPng chất lượng cao (ưu tiên hàng đầu)
    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.98,
        pixelRatio: isMobile ? 1.5 : 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        cacheBust: true,
      });
      if (dataUrl && dataUrl.length > 200) {
        return dataUrl;
      }
    } catch (e1) {
      console.warn('Lần 1 capture toPng lỗi, thử chế độ tương thích...', e1);
    }

    // Chiến lược 2: toPng chế độ nhẹ tương thích cao
    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.92,
        pixelRatio: 1,
        backgroundColor: '#ffffff',
        skipFonts: true,
        cacheBust: false,
      });
      if (dataUrl && dataUrl.length > 200) {
        return dataUrl;
      }
    } catch (e2) {
      console.warn('Lần 2 capture toPng lỗi, thử fallback toBlob...', e2);
    }

    // Chiến lược 3: toBlob fallback
    try {
      const blob = await toBlob(previewRef.current, {
        quality: 0.95,
        pixelRatio: 1.25,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (e3) {
      console.error('Tất cả phương thức capture ảnh đều thất bại:', e3);
    }

    return null;
  };



  const handleExportImage = async () => {
    // Nếu chưa nhập tên điểm bán: nhắc nhở trực tiếp trên giao diện và focus vào ô nhập
    if (!reportData.restaurantName.trim()) {
      setValidationError('Vui lòng nhập "Tên điểm bán" trước khi xuất ảnh báo cáo!');
      const inputEl = document.getElementById('restaurant-name-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!previewRef.current) return;
    
    setIsExporting(true);
    setExportSuccess(false);
    setValidationError(null);
    setSheetStatus('idle');

    try {
      // 1. TẠO ẢNH TRƯỚC TIÊN ĐỂ HIỂN THỊ TỨC THÌ CHO NGƯỜI DÙNG
      const dataUrl = await generateReportImageDataUrl();
      if (!dataUrl) throw new Error('Không thể tạo ảnh');

      const dateStr = reportData.date || new Date().toISOString().split('T')[0];
      const cleanName = reportData.restaurantName.trim().replace(/\s+/g, '_');
      const orderPrefix = reportData.visitOrder ? `Diem${reportData.visitOrder}_` : '';
      const fileName = `BaoCao_SaleSi_${orderPrefix}${cleanName}_${dateStr}.png`;

      setModalImageUrl(dataUrl);
      setModalFileName(fileName);

      // Kiểm tra môi trường di động / iframe
      const isMobile = typeof navigator !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Zalo/i.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      );
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;

      let downloadTriggered = false;
      try {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloadTriggered = true;
      } catch (downloadErr) {
        console.warn('Direct download link click failed or blocked:', downloadErr);
        downloadTriggered = false;
      }

      // Mở modal ảnh ngay để người dùng thấy ảnh ngay lập tức
      setIsBlockedWarning(!downloadTriggered || isMobile || isIframe);
      setIsModalOpen(true);
      setExportSuccess(true);

      // 2. LƯU DỮ LIỆU LÊN GOOGLE SHEETS TRONG NỀN (không làm đơ giao diện người dùng)
      saveToGoogleSheets(reportData);

    } catch (err) {
      console.error('Failed to export image', err);
      setValidationError('Có lỗi xảy ra khi tạo ảnh. Vui lòng bấm thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Báo cáo sale sỉ
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Mỗi lần gửi là 1 record trực tiếp vào sheet
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                id="header-export-button"
                onClick={handleExportImage}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
        </div>
      </header>

      {/* Zalo In-App Browser Guidance Banner */}
      {typeof navigator !== 'undefined' && /Zalo/i.test(navigator.userAgent) && (
        <div className="bg-blue-600 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="bg-white text-blue-700 font-bold px-1.5 py-0.5 rounded text-[11px] shrink-0">
              Zalo
            </span>
            <span className="leading-snug">
              Vui lòng bấm dấu <strong>(•••)</strong> ở góc trên bên phải → chọn <strong>"Mở bằng trình duyệt"</strong> (Safari / Chrome) để tải ảnh về máy.
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8">
        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl border bg-amber-50 border-amber-300 text-amber-900 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="font-bold text-sm text-amber-950">{validationError}</p>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-100 rounded-md cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* Status Notification & Next Point Banner */}
        {exportSuccess && (
          <div className="mb-6 p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 animate-in fade-in slide-in-from-top-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-900">
                  {sheetStatus === 'error' 
                    ? 'Đã tạo ảnh thành công! (Lưu ý: Chưa gửi được dữ liệu lên Google Sheets)' 
                    : 'Đã lưu 1 record vào Google Sheets & xuất ảnh thành công!'}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Ảnh đã sẵn sàng để gửi vào nhóm chat. Bạn có thể bấm tiếp tục để nhập điểm kế tiếp.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextPoint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <span>Nhập điểm tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <ReportForm 
              data={reportData} 
              onChange={setReportData}
              onReset={handleResetForm}
            />
          </div>

          {/* Right Column: Preview Slip (5 cols on lg) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Ảnh phiếu báo cáo</h2>
                <p className="text-xs text-slate-500">Mẫu ảnh lưu cho điểm này</p>
              </div>
            </div>
            
            <div className="bg-slate-200/90 p-2 sm:p-3 rounded-xl overflow-x-auto shadow-inner border border-slate-300">
              <div className="w-[720px] min-w-[720px] mx-auto bg-white rounded-lg shadow-sm">
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] z-30">
        <button
          id="mobile-export-button"
          onClick={handleExportImage}
          disabled={isExporting}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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

      {/* Popup ảnh xem trước dạng Modal (Chạm giữ để lưu vào Ảnh) */}
      <ImagePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={modalImageUrl}
        fileName={modalFileName}
        isBlockedWarning={isBlockedWarning}
      />
    </div>
  );
}
