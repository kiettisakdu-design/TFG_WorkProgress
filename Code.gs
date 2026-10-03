/**
 * =========================================================================
 * SHOP TFM - AI CONSTRUCTION TRACKER v2.0
 * Google Apps Script Backend (Code.gs)
 * วันที่ปรับปรุง: ตุลาคม 2026
 * =========================================================================
 * วิธีการติดตั้งและ Deploy:
 * 1. เปิด Google Sheets เปล่าใหม่
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. วางโค้ดนี้ในไฟล์ Code.gs
 * 4. สร้างไฟล์ HTML ชื่อ "Index" (Index.html) แล้ววางโค้ดจากไฟล์ Index.html
 * 5. เลือกฟังก์ชัน setupTFMDatabase() แล้วกด "เรียกใช้" (Run) เพื่อสร้างตาราง
 * 6. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้ใหม่" (New deployment)
 *    - ประเภท: เว็บแอป (Web app)
 *    - ดำเนินการในฐานะ: ฉัน (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)
 * 7. คัดลอก Web App URL เพื่อนำไปใช้งาน
 * =========================================================================
 */

const SHEET_EVALUATIONS = 'Evaluations';
const SHEET_SETTINGS = 'Settings';
const SHEET_PROJECTS = 'Projects';

/**
 * 1. ฟังก์ชันสร้างตารางเริ่มต้น (Run Once Setup)
 */
function setupTFMDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1.1 สร้างชีต Evaluations
  let evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
  if (!evalSheet) {
    evalSheet = ss.insertSheet(SHEET_EVALUATIONS);
  }
  evalSheet.clear();
  const evalHeaders = [
    'Evaluation ID', 'Branch Name', 'Evaluated Date', 'Delivery Date', 'Total Weeks',
    'Current Week Index', 'Province', 'Contractor', 'Supervisor', 'Confidence Score',
    'Front Facade (%)', 'Interior (%)', 'Rear Building (%)', 'Parking Area (%)',
    'Calculated Actual (%)', 'Baseline Plan (%)', 'Variance Diff (%)', 'Status Flag',
    'Approval Status', 'Summary Reasoning', 'Created At'
  ];
  evalSheet.appendRow(evalHeaders);
  evalSheet.getRange(1, 1, 1, evalHeaders.length)
    .setBackground('#0284c7')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  evalSheet.setFrozenRows(1);

  // 1.2 สร้างชีต Settings
  let setSheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!setSheet) {
    setSheet = ss.insertSheet(SHEET_SETTINGS);
  }
  setSheet.clear();
  setSheet.appendRow(['Setting Key', 'Setting Value', 'Description']);
  setSheet.getRange(1, 1, 1, 3).setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  setSheet.appendRow(['weight_facade', '30', 'น้ำหนักรูปด้านหน้าอาคาร (%)']);
  setSheet.appendRow(['weight_interior', '40', 'น้ำหนักรูปภายในอาคาร (%)']);
  setSheet.appendRow(['weight_rear', '15', 'น้ำหนักรูปด้านหลังอาคาร (%)']);
  setSheet.appendRow(['weight_parking', '15', 'น้ำหนักรูปพื้นลานจอดรถ (%)']);
  setSheet.appendRow(['confidence_threshold', '80', 'เกณฑ์ Confidence Score สำหรับ Auto-approve (%)']);
  setSheet.appendRow(['scurve_weeks', '12', 'จำนวนสัปดาห์บนแกนกราฟ S-Curve']);

  // 1.3 บันทึกข้อมูลตัวอย่างตั้งต้น
  evalSheet.appendRow([
    'TFM-2026-001', 'สาขา สยามสแควร์', '2026-10-02', '2026-11-15', 12,
    7, 'กรุงเทพฯ', 'บจก. สยาม คอนสตรัคชั่น บิลเดอร์', 'วิศวกร ธนกร ชัยมงคล', 94,
    88, 85, 80, 82, 84.7, 78.0, 6.7, 'EXCELLENT', 'APPROVED',
    'งานตกแต่งหน้าร้านและงานระบบไฟส่องสว่างเสร็จสมบูรณ์ เฟอร์นิเจอร์ Built-in ติดตั้งเรียบร้อย เร็วกว่าแผนงาน 6.7%',
    new Date().toISOString()
  ]);

  return 'Shop TFM Database initialized successfully!';
}

/**
 * 2. WEB APP GET REQUEST (doGet)
 * - แสดงหน้าเว็บ Index.html เมื่อเปิดผ่าน Browser
 * - หรือส่ง JSON ข้อมูลโครงการเมื่อส่ง parameter ?action=getData
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'webpage';

    // ถ้าเรียก API ข้อมูล JSON
    if (action === 'getData' || action === 'getAll') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
      if (!evalSheet) {
        return createJsonResponse({ success: false, error: 'Database not initialized' });
      }
      const data = evalSheet.getDataRange().getValues();
      const rows = data.slice(1);
      const evaluations = rows.map(r => ({
        id: r[0],
        branch_name: r[1],
        evaluated_date: r[2],
        delivery_date: r[3],
        total_weeks: Number(r[4]) || 12,
        current_week_index: Number(r[5]) || 0,
        province: r[6],
        contractor: r[7],
        supervisor: r[8],
        confidence_score: Number(r[9]),
        category_scores: {
          front_facade: Number(r[10]),
          interior: Number(r[11]),
          rear_building: Number(r[12]),
          parking_area: Number(r[13])
        },
        calculated_actual_progress: Number(r[14]),
        baseline_plan_progress: Number(r[15]),
        variance_diff: Number(r[16]),
        status_flag: r[17],
        approval_status: r[18],
        summary_reasoning: r[19],
        created_at: r[20]
      }));
      return createJsonResponse({ success: true, count: evaluations.length, data: evaluations });
    }

    if (action === 'ping') {
      return createJsonResponse({ success: true, message: 'Shop TFM Apps Script Backend Connected!', timestamp: new Date() });
    }

    // แสดงหน้าเว็บ HTML จากไฟล์ Index.html
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Shop TFM - AI Construction Tracker v2.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return HtmlService.createHtmlOutput('<h3>Error: ' + err.toString() + '</h3>');
  }
}

/**
 * 3. WEB APP POST REQUEST (doPost)
 * รองรับการบันทึกข้อมูลโครงการและการอนุมัติ
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'addEvaluation';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);

    if (!evalSheet) {
      return createJsonResponse({ success: false, error: 'Database sheet not initialized' });
    }

    if (action === 'addEvaluation') {
      const rec = postData.data;
      const row = [
        rec.id || ('TFM-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss')),
        rec.branch_name,
        rec.evaluated_date,
        rec.delivery_date,
        rec.total_weeks || 12,
        rec.current_week_index || 0,
        rec.province,
        rec.contractor,
        rec.supervisor,
        rec.confidence_score,
        rec.category_scores.front_facade,
        rec.category_scores.interior,
        rec.category_scores.rear_building,
        rec.category_scores.parking_area,
        rec.calculated_actual_progress,
        rec.baseline_plan_progress,
        rec.variance_diff,
        rec.status_flag,
        rec.approval_status || 'PENDING_APPROVAL',
        rec.summary_reasoning,
        rec.created_at || new Date().toISOString()
      ];
      evalSheet.appendRow(row);
      return createJsonResponse({ success: true, message: 'Record saved to Google Sheet', id: row[0] });
    }

    if (action === 'updateStatus') {
      const { id, approval_status, approved_by } = postData.data;
      const data = evalSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          evalSheet.getRange(i + 1, 19).setValue(approval_status); // Column 19 is Approval Status
          return createJsonResponse({ success: true, message: 'Status updated to ' + approval_status });
        }
      }
      return createJsonResponse({ success: false, error: 'Evaluation ID not found' });
    }

    return createJsonResponse({ success: true, message: 'Handled action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * 4. ฟังก์ชันสำหรับ google.script.run เมื่อใช้งานภายใน Web App
 */
function getDatabaseRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
  if (!evalSheet) return [];
  const data = evalSheet.getDataRange().getValues();
  const rows = data.slice(1);
  return rows.map(r => ({
    id: r[0],
    branch_name: r[1],
    evaluated_date: r[2],
    delivery_date: r[3],
    total_weeks: Number(r[4]) || 12,
    current_week_index: Number(r[5]) || 0,
    province: r[6],
    contractor: r[7],
    supervisor: r[8],
    confidence_score: Number(r[9]),
    category_scores: {
      front_facade: Number(r[10]),
      interior: Number(r[11]),
      rear_building: Number(r[12]),
      parking_area: Number(r[13])
    },
    calculated_actual_progress: Number(r[14]),
    baseline_plan_progress: Number(r[15]),
    variance_diff: Number(r[16]),
    status_flag: r[17],
    approval_status: r[18],
    summary_reasoning: r[19],
    created_at: r[20]
  }));
}

function saveEvaluationRecord(rec) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
  if (!evalSheet) return { success: false, error: 'Sheet not found' };
  const row = [
    rec.id || ('TFM-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss')),
    rec.branch_name,
    rec.evaluated_date,
    rec.delivery_date,
    rec.total_weeks || 12,
    rec.current_week_index || 0,
    rec.province,
    rec.contractor,
    rec.supervisor,
    rec.confidence_score,
    rec.category_scores.front_facade,
    rec.category_scores.interior,
    rec.category_scores.rear_building,
    rec.category_scores.parking_area,
    rec.calculated_actual_progress,
    rec.baseline_plan_progress,
    rec.variance_diff,
    rec.status_flag,
    rec.approval_status || 'PENDING_APPROVAL',
    rec.summary_reasoning,
    rec.created_at || new Date().toISOString()
  ];
  evalSheet.appendRow(row);
  return { success: true, id: row[0] };
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
