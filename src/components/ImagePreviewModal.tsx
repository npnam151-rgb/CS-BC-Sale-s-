import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Smartphone, 
  Check, 
  Copy, 
  AlertTriangle,
  ZoomIn,
  ExternalLink,
  Globe
} from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  fileName: string;
  isBlockedWarning?: boolean;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  isBlockedWarning = false,
}: ImagePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  // Manual download trigger using Blob URL
  const handleDownloadAgain = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      // Fallback to data URL
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const isZalo = typeof navigator !== 'undefined' && /Zalo/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Mở ảnh trực tiếp trong tab mới (giúp xem và tải ảnh trên Zalo mà không bị đơ app)
  const handleOpenInNewTab = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  // Mở link trực tiếp sang Chrome đối với thiết bị Android trong Zalo
  const handleOpenInChrome = () => {
    try {
      const host = window.location.host;
      const path = window.location.pathname;
      const search = window.location.search;
      window.location.href = `intent://${host}${path}${search}#Intent;scheme=https;package=com.android.chrome;end`;
    } catch (e) {
      console.error(e);
    }
  };

  // Web Share API (especially useful on iOS / Android standalone browsers)
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    if (canShare) {
      try {
        setIsSharing(true);
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Báo cáo Sale sỉ',
            text: 'Ảnh Báo cáo Sale sỉ',
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        } else {
          await navigator.share({
            title: 'Báo cáo Sale sỉ',
            text: 'Ảnh Báo cáo Sale sỉ',
            url: window.location.href,
          });
        }
      } catch (err) {
        // User cancelled share or not allowed
        console.log('Share error or cancelled', err);
      } finally {
        setIsSharing(false);
      }
    } else {
      // In Zalo or browsers without Web Share API
      alert('Trình duyệt Zalo / In-app chặn tính năng chia sẻ tự động.\n\n👉 Bạn hãy chạm và giữ (long-press) vào ảnh bên dưới rồi chọn "Chia sẻ" hoặc "Lưu vào Ảnh" nhé!');
    }
  };

  // Copy Image to Clipboard if supported
  const handleCopyImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      // ClipboardItem png
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div 
      id="image-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="image-preview-modal-container"
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ảnh Báo Cáo Đã Tạo
              </h3>
              <p className="text-xs text-slate-500">
                {fileName}
              </p>
            </div>
          </div>

          <button
            id="modal-close-button"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Guideline Box for Mobile Long-Press */}
        <div className="px-4 sm:px-6 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-2.5">
            {isZalo ? (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            ) : isBlockedWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <Smartphone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm text-amber-900 w-full">
              <p className="font-bold">
                {isZalo 
                  ? 'Đang mở trong Zalo (Trình duyệt Zalo có thể bị đơ khi quét mã QR ảnh dài):' 
                  : isBlockedWarning 
                  ? 'Trình duyệt chặn tải xuống tự động! Hãy lưu trực tiếp:'
                  : 'Hướng dẫn lưu ảnh vào điện thoại:'}
              </p>
              
              <p className="mt-0.5 leading-relaxed text-amber-800">
                👉 <strong>Chạm và giữ (long-press)</strong> vào ảnh bên dưới → chọn <span className="bg-amber-200/80 px-1.5 py-0.5 rounded font-bold text-amber-950">"Lưu vào Ảnh" (Save to Photos)</span> hoặc <span className="bg-amber-200/80 px-1.5 py-0.5 rounded font-bold text-amber-950">"Chia sẻ"</span>.
              </p>

              {isZalo ? (
                <div className="mt-2 pt-2 border-t border-amber-200/80 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="zalo-open-direct-button"
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở ảnh riêng (Khắc phục đơ Zalo)</span>
                    </button>

                    {isAndroid && (
                      <button
                        id="zalo-open-chrome-button"
                        type="button"
                        onClick={handleOpenInChrome}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Mở sang Google Chrome</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                    💡 <strong>Tại sao Zalo bị treo?</strong> Trình duyệt Zalo tự động quét mã QR trên ảnh. Báo cáo dài có nhiều ô chi tiết khiến Zalo quét bị quá tải CPU. Hãy bấm nút <strong>"Mở ảnh riêng"</strong> ở trên hoặc bấm dấu <strong>(•••)</strong> góc trên bên phải Zalo → chọn <strong>"Mở bằng trình duyệt"</strong> (Safari / Chrome).
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 mt-1">
                  (Trên máy tính: Nhấp chuột phải vào ảnh → chọn "Lưu hình ảnh thành..." hoặc bấm nút "Tải về máy")
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/80 flex items-center justify-center">
          <div className="relative max-w-full bg-white rounded-xl shadow-md p-1 sm:p-2 border border-slate-300">
            {/* The Image itself with context menu & long-press enabled */}
            <img
              id="preview-rendered-report-image"
              src={imageUrl}
              alt="Báo cáo Sale sỉ"
              loading="eager"
              decoding="async"
              className="max-h-[56vh] sm:max-h-[62vh] w-auto max-w-full object-contain mx-auto rounded block cursor-pointer"
              style={{
                userSelect: 'auto',
                WebkitUserSelect: 'auto',
                WebkitTouchCallout: 'default',
                touchAction: 'manipulation',
              }}
              title="Chạm giữ để lưu ảnh vào điện thoại"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Chất lượng cao PNG (Scale 1.25x tối ưu)</span>
            <span className="sm:hidden">Ảnh sắc nét tối ưu</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Direct Open Button */}
            <button
              id="modal-open-direct-footer-button"
              type="button"
              onClick={handleOpenInNewTab}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              title="Mở ảnh trong tab mới"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở ảnh</span>
            </button>

            {/* Share button (native Web Share or guided fallback) */}
            <button
              id="modal-share-button"
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              title="Chia sẻ ảnh"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareSuccess ? 'Đã chia sẻ' : 'Chia sẻ'}</span>
            </button>

            {/* Copy image if supported */}
            {typeof ClipboardItem !== 'undefined' && (
              <button
                id="modal-copy-button"
                type="button"
                onClick={handleCopyImage}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                title="Sao chép ảnh vào bộ nhớ tạm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            )}

            {/* Download Button */}
            <button
              id="modal-download-again-button"
              type="button"
              onClick={handleDownloadAgain}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải về máy</span>
            </button>

            {/* Close Button */}
            <button
              id="modal-cancel-button"
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
