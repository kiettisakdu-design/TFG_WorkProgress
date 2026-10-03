// Google Apps Script source code and utilities for Google Sheets Database

export const APPS_SCRIPT_CODE_GS = `/**
 * @name Shop TFM Construction Tracker - Google Apps Script Backend (v2.0)
 * @description Google Sheets Database & Web App API for Shop TFM Construction Tracker
 * @last_updated October 2026
 */

const SHEET_EVALUATIONS = 'Evaluations';
const SHEET_SETTINGS = 'Settings';
const SHEET_PROJECTS = 'Projects';

/**
 * 1. INITIAL SETUP FUNCTION
 * Run this function once from the Apps Script editor to auto-create all required sheets & headers.
 */
function setupTFMDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Evaluations Sheet
  let evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
  if (!evalSheet) {
    evalSheet = ss.insertSheet(SHEET_EVALUATIONS);
  }
  evalSheet.clear();
  const evalHeaders = [
    'Evaluation ID', 'Branch Name', 'Evaluated Date', 'Delivery Date', 'Province',
    'Contractor', 'Supervisor', 'Confidence Score', 'Front Facade (%)', 'Interior (%)',
    'Rear Building (%)', 'Parking Area (%)', 'Calculated Actual (%)', 'Baseline Plan (%)',
    'Variance Diff (%)', 'Status Flag', 'Approval Status', 'Summary Reasoning', 'Created At'
  ];
  evalSheet.appendRow(evalHeaders);
  evalSheet.getRange(1, 1, 1, evalHeaders.length)
    .setBackground('#0284c7')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  evalSheet.setFrozenRows(1);

  // 2. Setup Settings Sheet
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

  // 3. Setup Sample Project Record
  evalSheet.appendRow([
    'TFM-2026-001', 'สาขา สยามสแควร์', '2026-10-02', '2026-11-15', 'กรุงเทพฯ',
    'บจก. สยาม คอนสตรัคชั่น บิลเดอร์', 'วิศวกร ธนกร ชัยมงคล', 94, 88, 85,
    80, 82, 84.7, 78.0, 6.7, 'EXCELLENT', 'APPROVED',
    'งานตกแต่งหน้าร้านและงานระบบไฟส่องสว่างเสร็จสมบูรณ์ เร็วกว่าแผนงาน 6.7%',
    new Date().toISOString()
  ]);

  return 'Shop TFM Database initialized successfully!';
}

/**
 * 2. WEB APP GET REQUEST (doGet)
 * Fetches database records as JSON
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', message: 'Shop TFM Google Apps Script Connected!', timestamp: new Date() });
    }

    const evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
    if (!evalSheet) {
      return createJsonResponse({ error: 'Evaluations sheet not found. Please run setupTFMDatabase() first.' });
    }

    const data = evalSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    const evaluations = rows.map(r => ({
      id: r[0],
      branch_name: r[1],
      evaluated_date: r[2],
      delivery_date: r[3],
      province: r[4],
      contractor: r[5],
      supervisor: r[6],
      confidence_score: Number(r[7]),
      category_scores: {
        front_facade: Number(r[8]),
        interior: Number(r[9]),
        rear_building: Number(r[10]),
        parking_area: Number(r[11])
      },
      calculated_actual_progress: Number(r[12]),
      baseline_plan_progress: Number(r[13]),
      variance_diff: Number(r[14]),
      status_flag: r[15],
      approval_status: r[16],
      summary_reasoning: r[17],
      created_at: r[18]
    }));

    return createJsonResponse({ success: true, count: evaluations.length, data: evaluations });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * 3. WEB APP POST REQUEST (doPost)
 * Handles incoming uploads and approvals
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
          evalSheet.getRange(i + 1, 17).setValue(approval_status); // Column 17 is Approval Status
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

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

// Helper to export CSV format for manual Google Sheets import
export function exportToGoogleSheetCsv(evaluations: any[]): string {
  const headers = [
    'Evaluation ID',
    'Branch Name',
    'Evaluated Date',
    'Delivery Date',
    'Province',
    'Contractor',
    'Supervisor',
    'Confidence Score',
    'Front Facade (%)',
    'Interior (%)',
    'Rear Building (%)',
    'Parking Area (%)',
    'Calculated Actual (%)',
    'Baseline Plan (%)',
    'Variance Diff (%)',
    'Status Flag',
    'Approval Status',
    'Summary Reasoning',
    'Created At',
  ];

  const rows = evaluations.map((e) => [
    `"${e.id || ''}"`,
    `"${(e.branch_name || '').replace(/"/g, '""')}"`,
    `"${e.evaluated_date || ''}"`,
    `"${e.delivery_date || ''}"`,
    `"${e.province || ''}"`,
    `"${(e.contractor || '').replace(/"/g, '""')}"`,
    `"${(e.supervisor || '').replace(/"/g, '""')}"`,
    e.confidence_score ?? 0,
    e.category_scores?.front_facade ?? 0,
    e.category_scores?.interior ?? 0,
    e.category_scores?.rear_building ?? 0,
    e.category_scores?.parking_area ?? 0,
    e.calculated_actual_progress ?? 0,
    e.baseline_plan_progress ?? 0,
    e.variance_diff ?? 0,
    `"${e.status_flag || ''}"`,
    `"${e.approval_status || ''}"`,
    `"${(e.summary_reasoning || '').replace(/"/g, '""')}"`,
    `"${e.created_at || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
