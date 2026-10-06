// ============================================================================
// CẤU HÌNH FILE THỨ 2 (LƯU ĐỒNG THỜI VÀO 2 FILE GOOGLE SHEETS)
// Dán ID của file thứ 2 vào đây (chuỗi ký tự nằm giữa /d/ và /edit trên link của file 2)
// Ví dụ: var SECOND_SPREADSHEET_ID = "1a2b3c4d5e6f7g8h9i...";
// Nếu để trống "" thì script chỉ ghi vào file hiện tại.
// ============================================================================
var SECOND_SPREADSHEET_ID = "";

function doGet(e) {
  return ContentService.createTextOutput("Web App is running!").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Tên sheet gửi từ app (Mặc định là BC TQL nếu không truyền)
    var sheetName = data.sheetName || "BC TQL"; 
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    // Tìm kiếm sheet không phân biệt chữ hoa/thường
    if (!sheet) {
      var sheets = spreadsheet.getSheets();
      for (var s = 0; s < sheets.length; s++) {
        if (sheets[s].getName().trim().toLowerCase() === sheetName.trim().toLowerCase()) {
          sheet = sheets[s];
          break;
        }
      }
    }
    
    // Tự động tạo sheet nếu chưa có
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    var row = [];

    // =========================================================================
    // XỬ LÝ THEO TỪNG LOẠI BẢNG
    // =========================================================================

    // 1. BÁO CÁO SALE SỈ
    if (sheetName === "BC sale sỉ" || sheetName === "BC Sale sỉ" || sheetName === "BC Sale Sỉ") {
      // KIỂM TRA ĐÂY LÀ APP MỚI (1 ĐIỂM BÁN) HAY APP CŨ (15 ĐIỂM BÁN)
      var isSingleVisitApp = (data.restaurantName !== undefined);

      if (isSingleVisitApp) {
        // --- CHẾ ĐỘ MỚI: 1 RECORD CHO MỖI ĐIỂM BÁN ---
        if (sheet.getLastRow() === 0) {
          var headerRow1 = [
            "Thời gian gửi",
            "Ngày",
            "Người báo cáo",
            "Điểm thứ mấy đi trong ngày",
            "Điểm cũ/ Điểm mới",
            "Tên điểm bán",
            "Địa chỉ điểm bán",
            "Đánh giá/ Đề xuất",
            "TỒN KHO", "", "",
            "ĐẶT HÀNG", "", ""
          ];
          var headerRow2 = [
            "", "", "", "", "", "", "", "",
            "Bom 30L", "Bom 50L", "Keg1L",
            "Bom 30L", "Bom 50L", "Keg1L"
          ];
          sheet.appendRow(headerRow1);
          sheet.appendRow(headerRow2);
          for (var c = 1; c <= 8; c++) {
            sheet.getRange(1, c, 2, 1).merge();
          }
          sheet.getRange(1, 9, 1, 3).merge();
          sheet.getRange(1, 12, 1, 3).merge();
          sheet.getRange(1, 1, 2, 14)
            .setFontWeight("bold")
            .setBackground("#f3f4f6")
            .setHorizontalAlignment("center")
            .setVerticalAlignment("middle");
          sheet.setFrozenRows(2);
        } else if (sheet.getLastRow() >= 2) {
          // Tự động kiểm tra nếu sheet cũ đang thiếu cột "Điểm thứ mấy đi trong ngày" (ở cột 4 đang là "Điểm cũ/ Điểm mới")
          var firstRowCol4 = sheet.getRange(1, 4).getValue();
          if (firstRowCol4 && firstRowCol4.toString().indexOf("Điểm cũ") !== -1) {
            sheet.insertColumnAfter(3);
            sheet.getRange(1, 4, 2, 1).merge().setValue("Điểm thứ mấy đi trong ngày");
            sheet.getRange(1, 4, 2, 1)
              .setFontWeight("bold")
              .setBackground("#f3f4f6")
              .setHorizontalAlignment("center")
              .setVerticalAlignment("middle");
          }
        }

        row.push(
          new Date(),
          data.date || "",
          data.reporter || "",
          data.visitOrder || "",
          data.outletType || "Điểm cũ",
          data.restaurantName || "",
          data.address || "",
          data.evaluationOrProposal || "",
          data.stockBom30L || "",
          data.stockBom50L || "",
          data.stockKeg1L || "",
          data.orderBom30L || "",
          data.orderBom50L || "",
          data.orderKeg1L || ""
        );

        // --- ĐỒNG THỜI GHI VÀO FILE THỨ 2 (NẾU CÓ CẤU HÌNH SECOND_SPREADSHEET_ID) ---
        if (typeof SECOND_SPREADSHEET_ID !== "undefined" && SECOND_SPREADSHEET_ID && SECOND_SPREADSHEET_ID.trim() !== "") {
          try {
            var ss2 = SpreadsheetApp.openById(SECOND_SPREADSHEET_ID.trim());
            var sheet2 = ss2.getSheetByName("BC sale sỉ") || ss2.getSheetByName("BC Sale sỉ") || ss2.getSheets()[0];
            if (sheet2) {
              // Tự động tính số thứ tự điểm đi trong ngày cho File 2 (cột 4)
              var autoVisitOrder2 = 1;
              var lastRow2 = sheet2.getLastRow();
              if (lastRow2 >= 3) {
                var todayStr = data.date || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
                var datesData2 = sheet2.getRange(3, 2, lastRow2 - 2, 1).getValues();
                var dayCount2 = 0;
                for (var d2 = 0; d2 < datesData2.length; d2++) {
                  var cellVal = datesData2[d2][0];
                  if (cellVal) {
                    var cellStr = (cellVal instanceof Date) ? Utilities.formatDate(cellVal, "GMT+7", "yyyy-MM-dd") : cellVal.toString();
                    if (cellStr.indexOf(todayStr) !== -1 || todayStr.indexOf(cellStr) !== -1) {
                      dayCount2++;
                    }
                  }
                }
                autoVisitOrder2 = dayCount2 + 1;
              } else if (lastRow2 === 2) {
                autoVisitOrder2 = 1;
              }

              var visitOrder2 = data.visitOrder || autoVisitOrder2;
              var typeVal2 = "cũ";
              if (data.outletType) {
                if (data.outletType.indexOf("mới") !== -1 || data.outletType.indexOf("Mới") !== -1) {
                  typeVal2 = "mới";
                } else {
                  typeVal2 = "cũ";
                }
              }

              sheet2.appendRow([
                new Date(),
                data.date || "",
                data.reporter || "",
                visitOrder2,
                typeVal2,
                data.restaurantName || "",
                data.address || "",
                data.evaluationOrProposal || "",
                data.stockBom30L || "",
                data.stockBom50L || "",
                data.stockKeg1L || "",
                data.orderBom30L || "",
                data.orderBom50L || "",
                data.orderKeg1L || ""
              ]);
            }
          } catch (err2) {
            console.error("Lỗi khi ghi File 2: " + err2);
          }
        }

      } else {
        // --- CHẾ ĐỘ CŨ (15 ĐIỂM BÁN) - GIỮ NGUYÊN HOÀN TOÀN ĐỂ TƯƠNG THÍCH NGƯỢC ---
        if (sheet.getLastRow() === 0) {
          var headersSaleSi = [
            "Thời gian gửi",            // Cột A
            "Ngày",                     // Cột B
            "Người báo cáo",            // Cột C
            "Điểm mở mới",              // Cột D
            "Phát sinh/ Đề xuất",       // Cột E
            "Tổng số điểm đến chăm sóc", // Cột F
            "Tổng số đơn đặt hàng"      // Cột G
          ];
          for (var i = 1; i <= 15; i++) {
            headersSaleSi.push("Điểm bán số " + i);
          }
          sheet.appendRow(headersSaleSi);
          sheet.getRange(1, 1, 1, headersSaleSi.length).setFontWeight("bold").setBackground("#f3f4f6");
          sheet.setFrozenRows(1);
        }
        
        row.push(
          new Date(),
          data.date || "",
          data.reporter || "",
          data.newOutlets || "",
          data.issuesOrProposals || "",
          data.visitedOutlets || "", 
          data.totalOrders || ""     
        );
        
        if (data.outlets && Array.isArray(data.outlets)) {
          for (var i = 0; i < 15; i++) {
            row.push(data.outlets[i] !== undefined ? data.outlets[i] : "");
          }
        } else if (data.items && Array.isArray(data.items)) {
          for (var i = 0; i < 15; i++) {
            row.push(data.items[i] ? (data.items[i].value || "") : "");
          }
        }
      }
    } 

    // 2. BÁO CÁO CX (GIỮ NGUYÊN 100%)
    else if (sheetName === "BC CX") {
      if (sheet.getLastRow() === 0) {
        var headers = ["Thời gian gửi", "Cơ sở", "Ngày", "Người báo cáo", "Tổng điểm"];
        if (data.items && data.items.length > 0) {
          data.items.forEach(function(item) {
            headers.push(item.title + " (Đánh giá)");
            headers.push(item.title + " (Ghi chú)");
          });
        }
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
        sheet.setFrozenRows(1);
      }
      row.push(new Date(), data.location, data.date, data.reporter, data.totalScore);
      if (data.items && data.items.length > 0) {
        data.items.forEach(function(item) {
          row.push(item.value); 
          row.push(item.notes);
        });
      }
    } 

    // 3. BÁO CÁO BAR (GIỮ NGUYÊN 100%)
    else if (sheetName === "BC Bar" || sheetName === "BC Bar 1") {
      if (sheet.getLastRow() === 0) {
        var headersBar = ["Thời gian gửi", "Cơ sở", "Ngày", "Người báo cáo"];
        if (data.items && data.items.length > 0) {
          data.items.forEach(function(item) {
            headersBar.push(item.title);
          });
        }
        sheet.appendRow(headersBar);
        sheet.getRange(1, 1, 1, headersBar.length).setFontWeight("bold").setBackground("#f3f4f6");
        sheet.setFrozenRows(1);
      }
      row.push(new Date(), data.location, data.date, data.reporter);
      if (data.items && data.items.length > 0) {
        data.items.forEach(function(item) {
          row.push(item.value);
        });
      }
    }

    // 4. BÁO CÁO TỔNG BAR (GIỮ NGUYÊN 100%)
    else if (sheetName === "BC Tổng Bar") {
      if (sheet.getLastRow() === 0) {
        var headersLam = ["Thời gian gửi", "Cơ sở"];
        if (data.items && data.items.length > 0) {
          data.items.forEach(function(item) {
            headersLam.push(item.title);
          });
        }
        sheet.appendRow(headersLam);
        sheet.getRange(1, 1, 1, headersLam.length).setFontWeight("bold").setBackground("#f3f4f6");
        sheet.setFrozenRows(1);
      }
      row.push(new Date(), data.location);
      if (data.items && data.items.length > 0) {
        data.items.forEach(function(item) {
          row.push(item.value);
        });
      }
    }

    // 5. BÁO CÁO TQL (6 CƠ SỞ - PHƯƠNG ÁN 1: 38 CỘT CHUẨN) (GIỮ NGUYÊN 100%)
    else if (sheetName === "BC TQL" || sheetName === "BC TQL 1" || sheetName === "Sheet17") {
      if (sheet.getLastRow() === 0) {
        var headersTQL = [
          "Thời gian gửi", "Ngày", "Người báo cáo",
          // ĐÁNH GIÁ CHUNG TOÀN CHUỖI (7 cột - chỉ dòng đầu tiên 01 DD có giá trị)
          "DT toàn hệ thống:", "Mục tiêu ngày:", "Tăng/giảm so với hôm trc:", "Tổng lượt khách:", "Số bàn phục vụ:", "DT TB/khách:", "Xếp hạng DT:",
          // CH lv chính (Đưa về sau Đánh giá chung toàn chuỗi theo Phương án 1)
          "CH lv chính",
          // PHỤC VỤ (8 cột)
          "Xếp bàn và đón tiếp:", "Order & tư vấn món:", "Chăm sóc KH & upsell:", "Tốc độ ra đồ:", "Chương trình KM:", "Vệ sinh:", "Vđ phát sinh:", "Cách giải quyết ps:",
          // NHÂN SỰ (5 cột)
          "Tổng NS bàn đi làm:", "NS nghỉ đột xuất:", "NS nghỉ hẳn:", "NS mới:", "NS hỗ trợ:",
          // BIA (4 cột)
          "Phản hồi của khách:", "Vđ phát sinh:", "Cách giải quyết ps:", "Xuất bán tiệc:",
          // MÓN ĂN (5 cột)
          "Món đẩy:", "Món bán chạy:", "Phản hồi của khách:", "Vđ phát sinh:", "Cách giải quyết ps:",
          // SỬA CHỮA (2 cột)
          "Hỏng hóc cần sửa:", "Hạng mục sửa trong ngày:",
          // ĐÀO TẠO (1 cột)
          "Đào tạo:",
          // ĐỐI NGOẠI (1 cột)
          "Đối ngoại:",
          // Ý KIẾN KHÁC (1 cột - thuộc phần Chung toàn chuỗi, đặt ở cuối)
          "Ý KIẾN KHÁC"
        ];
        sheet.appendRow(headersTQL);
        sheet.getRange(1, 1, 1, headersTQL.length).setFontWeight("bold").setBackground("#f3f4f6");
        sheet.setFrozenRows(1);
      }
      
      var timeVal = data.time || Utilities.formatDate(new Date(), "GMT+7", "HH:mm");
      var dateVal = data.date || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
      var reporterVal = data.reporter || "";

      if (data.storesList && Array.isArray(data.storesList) && data.storesList.length > 0) {
        data.storesList.forEach(function(st) {
          var storeRow = [
            timeVal,
            dateVal,
            reporterVal
          ];
          
          if (st.systemValues && Array.isArray(st.systemValues)) {
            st.systemValues.forEach(function(val) {
              storeRow.push(val !== undefined && val !== null ? String(val) : "");
            });
          } else {
            for (var s = 0; s < 7; s++) storeRow.push("");
          }
          
          storeRow.push(st.storeCode || st.storeName || "");
          
          if (st.storeValues && Array.isArray(st.storeValues)) {
            st.storeValues.forEach(function(val) {
              storeRow.push(val !== undefined && val !== null ? String(val) : "");
            });
          } else if (st.values && Array.isArray(st.values)) {
            for (var v = 7; v < st.values.length - 1; v++) {
              storeRow.push(st.values[v] !== undefined && st.values[v] !== null ? String(st.values[v]) : "");
            }
          } else {
            for (var stc = 0; stc < 26; stc++) storeRow.push("");
          }

          storeRow.push(st.otherOpinionValue !== undefined && st.otherOpinionValue !== null ? String(st.otherOpinionValue) : "");

          sheet.appendRow(storeRow);
        });
      } else if (data.stores) {
        var storeCodes = ["01 DD", "03 NVH", "12 ĐT", "94 LĐ", "96 HT", "98 VTP"];
        var systemKeys = [
          "dt_toan_he_thong", "muc_tieu_ngay", "tang_giam_hom_truoc", "tong_luot_khach", "so_ban_phuc_vu", "dt_tb_khach", "xep_hang_dt"
        ];
        var storeKeys = [
          "xep_ban", "order_tu_van", "cham_soc_upsell", "toc_do_ra_do", "chuong_trinh_km", "ve_sinh", "vd_phat_sinh_pv", "cach_giai_quyet_pv",
          "tong_ns_di_lam", "ns_nghi_dot_xuat", "ns_nghi_han", "ns_moi", "ns_ho_tro",
          "phan_hoi_khach_bia", "vd_phat_sinh_bia", "cach_giai_quyet_bia", "xuat_ban_tiec",
          "mon_day", "mon_ban_chay", "phan_hoi_khach_mon", "vd_phat_sinh_mon", "cach_giai_quyet_mon",
          "hong_hoc_can_sua", "hang_muc_sua_trong_ngay",
          "dao_tao", "doi_ngoai"
        ];
        var sysVals = data.systemEvaluation || {};
        storeCodes.forEach(function(code, idx) {
          var storeVals = data.stores[code] || {};
          var storeRow = [timeVal, dateVal, reporterVal];
          
          systemKeys.forEach(function(k) {
            if (idx === 0) {
              var val = sysVals[k] !== undefined ? sysVals[k] : (storeVals[k] !== undefined ? storeVals[k] : "");
              storeRow.push(String(val || ""));
            } else {
              storeRow.push("");
            }
          });

          storeRow.push(code);

          storeKeys.forEach(function(k) {
            storeRow.push(storeVals[k] !== undefined ? String(storeVals[k]) : "");
          });

          if (idx === 0) {
            storeRow.push(sysVals.y_kien_khac ? String(sysVals.y_kien_khac) : "");
          } else {
            storeRow.push("");
          }

          sheet.appendRow(storeRow);
        });
      } else if (data.items && Array.isArray(data.items)) {
        var legacyRow = [new Date(), data.date || "", data.reporter || "", data.location || ""];
        data.items.forEach(function(item) {
          legacyRow.push(item.value || "");
        });
        sheet.appendRow(legacyRow);
      }

      return ContentService.createTextOutput(JSON.stringify({
        "status": "success",
        "message": "Đã lưu 6 cơ sở vào " + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. BÁO CÁO BẾP (GIỮ NGUYÊN 100%)
    else if (sheetName === "BC Bếp") {
      if (sheet.getLastRow() === 0) {
        var headersBep = [
          "Thời gian gửi", "Cơ sở", "Ngày", "Người báo cáo",
          "Có đủ nv làm việc (Có/Không)", "Có đủ nv làm việc (Diễn giải)",
          "Có nv xin nghỉ hẳn (Có/Không)", "Có nv xin nghỉ hẳn (Diễn giải)",
          "NV mới đi làm",
          "Hàng đặt có về đủ không (Có/Không)", "Hàng đặt có về đủ không (Diễn giải)",
          "Sự cố xảy ra trong ngày không?",
          "Món bán chạy trong ngày",
          "CCDC, thiết bị hỏng trong ngày",
          "CCDC, thiết bị được sửa trong ngày",
          "Đề xuất"
        ];
        sheet.appendRow(headersBep);
        sheet.getRange(1, 1, 1, headersBep.length).setFontWeight("bold").setBackground("#f3f4f6");
        sheet.setFrozenRows(1);
      }
      
      row.push(new Date(), data.location, data.date || "", data.reporter || "");
      
      if (data.items && data.items.length > 0) {
        data.items.forEach(function(item) {
          if (item.id === 201 || item.id === 202 || item.id === 204) {
            var val = (item.value || "").trim();
            var separatorIndex = val.search(/[\\.\\,\\-\\n]/);
            
            if (separatorIndex !== -1 && separatorIndex < 15) { 
               var answer = val.substring(0, separatorIndex).trim();
               var explanation = val.substring(separatorIndex + 1).trim();
               row.push(answer);
               row.push(explanation);
            } else {
               row.push(val);
               row.push("");
            }
          } else {
            row.push(item.value);
          }
        });
      }
    }

    // 7. BÁO CÁO VẬN HÀNH (BC Vận hành) - 22 CỘT CHUẨN (A -> V) (GIỮ NGUYÊN 100%)
    else if (sheetName === "BC Vận hành" || sheetName === "BC vận hành") {
      if (sheet.getLastRow() === 0) {
        var row1 = ["", "", "", "", "NHÂN SỰ", "", "", "", "", "", "SỬA CHỮA", "", "KINH DOANH", "", "", "", "", "", "", "", "", ""];
        sheet.appendRow(row1);
        
        sheet.getRange("E1:J1").mergeAcross().setHorizontalAlignment("center").setFontWeight("bold").setBackground("#fff2cc");
        sheet.getRange("K1:L1").mergeAcross().setHorizontalAlignment("center").setFontWeight("bold").setBackground("#ffe599");
        sheet.getRange("M1:V1").mergeAcross().setHorizontalAlignment("center").setFontWeight("bold").setBackground("#fff2cc");
        
        var row2 = [
          "Thời gian gửi", "Cơ Sở", "Ngày", "Người báo cáo",
          "Nhân viên mới", "Nhân viên nghỉ việc (đột xuất/nghỉ hẳn/cho nghỉ)", "Số lượng nhân viên làm trong ngày", "Nhân viên vi phạm quy định", "Số lượng nv ngủ tại CH", "Đào tạo nhân viên",
          "Thiết bị, hạng mục cần sửa chữa", "Thiết bị đã sửa trong ngày",
          "Món ăn bán chạy trong ngày", "Món lên chậm nhất", "Phản hồi không tốt của KH", "Số bill chênh lệch tạm tính và thanh toán", "CTKM áp dụng trong ngày", 
          "Hoạt động offline trong ngày", "Xuất bán đơn khách tiệc", "Số lượng Thành viên tích điểm/ tổng bill",
          "Phát sinh bất thường trong ngày", "Đề xuất"
        ];
        sheet.appendRow(row2);
        
        var headerRange = sheet.getRange("A2:V2");
        headerRange.setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
        
        sheet.getRange("A1:A2").merge().setVerticalAlignment("middle").setHorizontalAlignment("center").setFontWeight("bold");
        sheet.getRange("B1:B2").merge().setVerticalAlignment("middle").setHorizontalAlignment("center").setFontWeight("bold");
        sheet.getRange("C1:C2").merge().setVerticalAlignment("middle").setHorizontalAlignment("center").setFontWeight("bold");
        sheet.getRange("D1:D2").merge().setVerticalAlignment("middle").setHorizontalAlignment("center").setFontWeight("bold");
        sheet.setFrozenRows(2);
      }

      row.push(new Date(), data.location, data.date || "", data.reporter || "");
      if (data.items && data.items.length > 0) {
        data.items.forEach(function(item) {
          row.push(item.value);
        });
      }
    }

    // Ghi dữ liệu dòng mới vào bảng tính nếu có (cho các báo cáo đơn)
    if (row && row.length > 0) {
      sheet.appendRow(row);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
