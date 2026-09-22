import React, { useState, useRef } from 'react';
import { toBlob } from 'html-to-image';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Smartphone
} from 'lucide-react';
import { ReportForm } from './components/ReportForm';
import { ReportPreview } from './components/ReportPreview';
import { ImagePreviewModal } from './components/ImagePreviewModal';
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

  // Modal Popup states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalFileName, setModalFileName] = useState<string>('BaoCao_SaleSi.png');
  const [isBlockedWarning, setIsBlockedWarning] = useState(false);

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

  const currentBlobUrlRef = useRef<string | null>(null);

  // Tạo ảnh chất lượng cao dạng Blob Object URL (nhẹ, không làm đơ Zalo/di động)
  const generateReportImageBlob = async (): Promise<{ blob: Blob; objectUrl: string } | null> => {
    if (!previewRef.current) return null;
    
    // Thu hồi URL cũ để giải phóng bộ nhớ
    if (currentBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      } catch (e) {
        // ignore
      }
    }

    const isMobile = typeof navigator !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Zalo/i.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );

    // pixelRatio 1.25 trên mobile tạo ảnh sắc nét ~1150px mà không bị tràn RAM gây đơ Zalo
    const blob = await toBlob(previewRef.current, {
      quality: 0.95,
      pixelRatio: isMobile ? 1.25 : 1.5,
      backgroundColor: '#ffffff',
      skipFonts: true,
      cacheBust: true,
    });

    if (!blob) return null;

    const objectUrl = URL.createObjectURL(blob);
    currentBlobUrlRef.current = objectUrl;
    return { blob, objectUrl };
  };

  // Mở Popup ảnh để chạm giữ lưu vào điện thoại
  const handleOpenModalPreview = async () => {
    if (!previewRef.current) return;
    try {
      setIsExporting(true);
      const result = await generateReportImageBlob();
      if (!result) throw new Error('Không thể tạo ảnh');

      const dateStr = reportData.date || new Date().toISOString().split('T')[0];
      const reporterStr = reportData.reporter ? reportData.reporter.trim().replace(/\s+/g, '_') : 'Sale';
      const fileName = `BaoCao_SaleSi_${reporterStr}_${dateStr}.png`;

      setModalImageUrl(result.objectUrl);
      setModalFileName(fileName);
      setIsBlockedWarning(false);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to generate image preview modal', err);
      alert('Không thể tạo ảnh xem trước. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!previewRef.current) return;
    
    setIsExporting(true);
    setExportSuccess(false);
    setSheetStatus('idle');

    let generatedObjectUrl: string | null = null;
    let fileName = '';

    try {
      // 1. Lưu dữ liệu lên Google Sheets vào sheet "BC sale sỉ"
      await saveToGoogleSheets(reportData);

      // Đợi một chút để UI cập nhật trạng thái
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 2. Xuất ảnh chất lượng cao
      const result = await generateReportImageBlob();
      if (!result) throw new Error('Không thể tạo ảnh');
      generatedObjectUrl = result.objectUrl;

      const dateStr = reportData.date || new Date().toISOString().split('T')[0];
      const reporterStr = reportData.reporter ? reportData.reporter.trim().replace(/\s+/g, '_') : 'Sale';
      fileName = `BaoCao_SaleSi_${reporterStr}_${dateStr}.png`;

      setModalImageUrl(result.objectUrl);
      setModalFileName(fileName);

      // Kiểm tra môi trường di động / iframe hoặc browser chặn download
      const isMobile = typeof navigator !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Zalo/i.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      );
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;

      let downloadTriggered = false;
      try {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = result.objectUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloadTriggered = true;
      } catch (downloadErr) {
        console.warn('Direct download link click failed or blocked:', downloadErr);
        downloadTriggered = false;
      }

      // Nếu trình duyệt chặn tải xuống hoặc trên mobile/iframe (nơi download attribute không hoạt động để lưu vào Photos)
      if (!downloadTriggered || isMobile || isIframe) {
        setIsBlockedWarning(!downloadTriggered);
        setIsModalOpen(true);
      }
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 8000);
    } catch (err) {
      console.error('Failed to export image', err);
      try {
        if (!generatedObjectUrl && previewRef.current) {
          const fallback = await generateReportImageBlob();
          if (fallback) {
            generatedObjectUrl = fallback.objectUrl;
          }
        }
        if (generatedObjectUrl) {
          setModalImageUrl(generatedObjectUrl);
          setModalFileName(fileName || 'BaoCao_SaleSi.png');
          setIsBlockedWarning(true);
          setIsModalOpen(true);
          setExportSuccess(true);
        }
      } catch (innerErr) {
        alert('Có lỗi xảy ra khi xuất ảnh. Vui lòng thử lại.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header: Tên ứng dụng và nút hành động */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Báo cáo Sale sỉ
            </h1>
            
            <div className="flex items-center gap-2">
              <button
                id="header-preview-modal-button"
                onClick={handleOpenModalPreview}
                disabled={isExporting}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                title="Mở popup ảnh để chạm và giữ lưu vào điện thoại"
              >
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Xem ảnh (Popup)</span>
              </button>

              <button
                id="header-export-button"
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
        </div>
      </header>

      {/* Zalo In-App Browser Guidance Banner */}
      {typeof navigator !== 'undefined' && /Zalo/i.test(navigator.userAgent) && (
        <div className="bg-blue-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-700 font-bold px-1.5 py-0.5 rounded text-[11px] shrink-0">
                Zalo
              </span>
              <span className="leading-snug">
                Trình duyệt Zalo dễ bị đơ khi chạm giữ ảnh. Bạn nên bấm <strong>(•••)</strong> góc trên bên phải → chọn <strong>"Mở bằng trình duyệt"</strong> (Safari / Chrome) để dùng mượt nhất.
              </span>
            </div>
            {/Android/i.test(navigator.userAgent) && (
              <button
                type="button"
                onClick={() => {
                  try {
                    window.location.href = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`;
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded text-xs transition-colors shrink-0"
              >
                Mở sang Chrome
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8">
        {/* Status Notification */}
        {exportSuccess && (
          <div className={`mb-6 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 ${sheetStatus === 'error' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
            <div className="flex items-center gap-3">
              {sheetStatus === 'error' ? <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              <div>
                <p className="font-semibold text-sm">
                  {sheetStatus === 'error' 
                    ? 'Đã tạo ảnh thành công! (Lưu ý: Chưa gửi được dữ liệu lên Google Sheets)' 
                    : 'Đã xuất ảnh báo cáo và lưu vào Google Sheets thành công!'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bạn có thể mở Popup ảnh để chạm giữ và chọn "Lưu vào Ảnh" (Save to Photos).
                </p>
              </div>
            </div>

            {modalImageUrl && (
              <button
                id="banner-open-modal-button"
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-xs transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mở ảnh để lưu (Nhấn giữ)</span>
              </button>
            )}
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
              <div className="flex items-center gap-2">
                <button
                  id="preview-section-modal-button"
                  type="button"
                  onClick={handleOpenModalPreview}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 shadow-xs transition-colors"
                  title="Mở ảnh dạng Popup để chạm giữ lưu vào máy"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mở popup lưu ảnh</span>
                </button>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  Tự động cập nhật
                </span>
              </div>
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] z-30 flex items-center gap-2">
        <button
          id="mobile-preview-modal-button"
          type="button"
          onClick={handleOpenModalPreview}
          disabled={isExporting}
          className="flex-1 flex justify-center items-center gap-1.5 px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>Xem ảnh (Popup)</span>
        </button>

        <button
          id="mobile-export-button"
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex-2 flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
