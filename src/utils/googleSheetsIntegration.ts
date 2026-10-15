// Google Apps Script source code and utilities for Google Sheets Database

export const DEFAULT_GOOGLE_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycby4MEv9_boOGHjByMp_xjFCfi5x0tVhzNmmdOQLaOBZslfeWqWS2tHeY29VmpK5xR9M/exec';

export const APPS_SCRIPT_CODE_GS = `/**
 * =========================================================================
 * SHOP TFM - AI CONSTRUCTION TRACKER v2.0
 * Google Apps Script Backend (Code.gs)
 * วันที่ปรับปรุง: ตุลาคม 2026
 * =========================================================================
 * รองรับการทำงานทั้งแบบ Web App และ Google Sheets Database API (GET/POST)
 * =========================================================================
 */

const SHEET_EVALUATIONS = 'Evaluations';
const SHEET_SETTINGS = 'Settings';
const SPREADSHEET_ID = ''; // ใส่ ID เฉพาะเมื่อใช้ Standalone script มิฉะนั้นจะใช้ ActiveSpreadsheet อัตโนมัติ

// Helper to get spreadsheet (prioritizes Active Spreadsheet for container-bound scripts)
function getTargetSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    console.warn('getActiveSpreadsheet failed: ' + e.toString());
  }
  try {
    if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID && SPREADSHEET_ID.length > 10) {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    }
  } catch (e) {
    console.warn('openById failed: ' + e.toString());
  }
  return null;
}

/**
 * 1. ฟังก์ชันสร้างตารางเริ่มต้น (Run Once Setup)
 */
function setupTFMDatabase() {
  const ss = getTargetSpreadsheet();
  if (!ss) throw new Error('No spreadsheet found. Please run this script from inside Google Sheets (Extensions > Apps Script).');
  
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
 * - ส่งข้อมูล JSON เมื่อเรียกด้วย fetch() หรือ parameter ?action=getData
 * - แสดงหน้าเว็บ Index.html เมื่อเปิดผ่าน Browser ทั่วไป
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getData';

    // ถ้าเรียกขอข้อมูลแบบ JSON (หรือเมื่อเรียกผ่าน API)
    if (action === 'getData' || action === 'getAll' || action === 'sync' || (e && e.parameter && e.parameter.format === 'json')) {
      const ss = getTargetSpreadsheet();
      if (!ss) return createJsonResponse({ success: false, error: 'Spreadsheet not found' });

      let evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
      if (!evalSheet) {
        // อัตโนมัติสร้างชีตถ้ายังไม่มี
        setupTFMDatabase();
        evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
      }

      const data = evalSheet ? evalSheet.getDataRange().getValues() : [];
      if (!data || data.length <= 1) {
        return createJsonResponse({ success: true, count: 0, data: [] });
      }

      const rows = data.slice(1);
      const evaluations = rows.map(r => ({
        id: String(r[0] || ''),
        branch_name: String(r[1] || ''),
        evaluated_date: String(r[2] || ''),
        delivery_date: String(r[3] || ''),
        total_weeks: Number(r[4]) || 12,
        current_week_index: Number(r[5]) || 0,
        province: String(r[6] || ''),
        contractor: String(r[7] || ''),
        supervisor: String(r[8] || ''),
        confidence_score: Number(r[9]) || 80,
        category_scores: {
          front_facade: Number(r[10]) || 0,
          interior: Number(r[11]) || 0,
          rear_building: Number(r[12]) || 0,
          parking_area: Number(r[13]) || 0
        },
        calculated_actual_progress: Number(r[14]) || 0,
        baseline_plan_progress: Number(r[15]) || 0,
        variance_diff: Number(r[16]) || 0,
        status_flag: String(r[17] || 'ON_TRACK'),
        approval_status: String(r[18] || 'PENDING_APPROVAL'),
        summary_reasoning: String(r[19] || ''),
        created_at: String(r[20] || new Date().toISOString())
      }));

      return createJsonResponse({ success: true, count: evaluations.length, data: evaluations });
    }

    if (action === 'ping') {
      return createJsonResponse({ success: true, message: 'Shop TFM Apps Script Backend Connected!', timestamp: new Date() });
    }

    // แสดงหน้าเว็บ HTML จากไฟล์ Index.html ถ้าเปิดผ่านเบราว์เซอร์
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Shop TFM - AI Construction Tracker v2.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * 3. WEB APP POST REQUEST (doPost)
 * รองรับการบันทึกข้อมูลโครงการ (action: 'addEvaluation') และการอัปเดตสถานะ (action: 'updateStatus')
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        postData = { action: 'raw', contents: e.postData.contents };
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action || 'addEvaluation';
    const ss = getTargetSpreadsheet();
    if (!ss) return createJsonResponse({ success: false, error: 'Spreadsheet not found' });

    let evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
    if (!evalSheet) {
      setupTFMDatabase();
      evalSheet = ss.getSheetByName(SHEET_EVALUATIONS);
    }

    if (action === 'addEvaluation') {
      const rec = postData.data || postData.payload || postData;
      const row = [
        rec.id || ('TFM-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss')),
        rec.branch_name || 'สาขาใหม่',
        rec.evaluated_date || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
        rec.delivery_date || '',
        rec.total_weeks || 12,
        rec.current_week_index || 0,
        rec.province || '',
        rec.contractor || '',
        rec.supervisor || '',
        rec.confidence_score ?? 85,
        rec.category_scores?.front_facade ?? 0,
        rec.category_scores?.interior ?? 0,
        rec.category_scores?.rear_building ?? 0,
        rec.category_scores?.parking_area ?? 0,
        rec.calculated_actual_progress ?? 0,
        rec.baseline_plan_progress ?? 0,
        rec.variance_diff ?? 0,
        rec.status_flag || 'ON_TRACK',
        rec.approval_status || 'PENDING_APPROVAL',
        rec.summary_reasoning || '',
        rec.created_at || new Date().toISOString()
      ];
      evalSheet.appendRow(row);
      return createJsonResponse({ success: true, message: 'Record saved to Google Sheet', id: row[0] });
    }

    if (action === 'updateStatus') {
      const dataPayload = postData.data || postData.payload || {};
      const id = dataPayload.id || postData.id;
      const approval_status = dataPayload.approval_status || postData.approval_status || 'APPROVED';
      const data = evalSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          evalSheet.getRange(i + 1, 19).setValue(approval_status); // Column 19 is Approval Status
          return createJsonResponse({ success: true, message: 'Status updated to ' + approval_status });
        }
      }
      return createJsonResponse({ success: false, error: 'Evaluation ID not found' });
    }

    if (action === 'ping') {
      return createJsonResponse({ success: true, message: 'PONG from Google Apps Script', timestamp: new Date() });
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

/**
 * Helper to parse various Google Sheet response formats (JSON object, array, or 2D spreadsheet matrix)
 */
export function parseGoogleSheetsResponse(raw: any): { evaluations: any[]; isEmpty: boolean } {
  if (!raw) return { evaluations: [], isEmpty: true };

  // Case 1: Already wrapped { success: true, data: [...] }
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
    return { evaluations: raw.data, isEmpty: raw.data.length === 0 };
  }

  // Case 2: Array of objects
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object' && !Array.isArray(raw[0])) {
    return { evaluations: raw, isEmpty: false };
  }

  // Case 3: 2D Array from SpreadsheetApp.getDataRange().getValues()
  // e.g. [[""]] or [["Evaluation ID", "Branch Name", ...], ["TFM-1", "สาขา สยาม", ...]]
  if (Array.isArray(raw)) {
    if (raw.length === 0 || (raw.length === 1 && (!raw[0][0] || raw[0][0] === ''))) {
      return { evaluations: [], isEmpty: true };
    }

    // Check if first row is header
    const firstRow = raw[0];
    const hasHeader =
      Array.isArray(firstRow) &&
      firstRow.some((col: any) => typeof col === 'string' && (col.includes('ID') || col.includes('Branch')));

    const dataRows = hasHeader ? raw.slice(1) : raw;
    const parsed = dataRows
      .filter((r: any[]) => Array.isArray(r) && r.some((cell) => cell !== ''))
      .map((r: any[], idx: number) => ({
        id: String(r[0] || `TFM-ROW-${idx + 1}`),
        branch_name: String(r[1] || 'สาขา Shop TFM'),
        evaluated_date: String(r[2] || new Date().toISOString().split('T')[0]),
        delivery_date: String(r[3] || '2026-12-31'),
        total_weeks: Number(r[4]) || 12,
        current_week_index: Number(r[5]) || 0,
        province: String(r[6] || 'กรุงเทพฯ'),
        contractor: String(r[7] || 'ผู้รับเหมา Shop TFM'),
        supervisor: String(r[8] || 'ผู้ควบคุมงาน'),
        confidence_score: Number(r[9]) || 85,
        category_scores: {
          front_facade: Number(r[10]) || 0,
          interior: Number(r[11]) || 0,
          rear_building: Number(r[12]) || 0,
          parking_area: Number(r[13]) || 0,
        },
        calculated_actual_progress: Number(r[14]) || 0,
        baseline_plan_progress: Number(r[15]) || 0,
        variance_diff: Number(r[16]) || 0,
        status_flag: String(r[17] || 'ON_TRACK'),
        approval_status: String(r[18] || 'APPROVED'),
        summary_reasoning: String(r[19] || ''),
        created_at: String(r[20] || new Date().toISOString()),
      }));

    return { evaluations: parsed, isEmpty: parsed.length === 0 };
  }

  return { evaluations: [], isEmpty: true };
}

/**
 * Client-side fetch helper for GET request from Google Sheet Web App
 * Uses fetch() directly, falling back to server proxy if browser CORS restricts it
 */
export async function fetchEvaluationsFromSheets(webAppUrl: string = DEFAULT_GOOGLE_WEBAPP_URL): Promise<{
  success: boolean;
  data?: any[];
  count?: number;
  isEmpty?: boolean;
  error?: string;
  source?: string;
}> {
  try {
    // 1. First attempt: Direct fetch() via GET from Google Apps Script Web App
    try {
      const targetUrl = new URL(webAppUrl);
      targetUrl.searchParams.set('action', 'getData');
      targetUrl.searchParams.set('format', 'json');
      targetUrl.searchParams.set('_t', Date.now().toString());

      const res = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      });

      if (res.ok) {
        const text = await res.text();
        let parsedJson;
        try {
          parsedJson = JSON.parse(text);
        } catch {
          parsedJson = null;
        }

        if (parsedJson) {
          const { evaluations, isEmpty } = parseGoogleSheetsResponse(parsedJson);
          return {
            success: true,
            data: evaluations,
            count: evaluations.length,
            isEmpty,
            source: 'direct_fetch_get',
          };
        }
      }
    } catch (directErr) {
      // Browser CORS in iframe or sandbox might reject direct cross-origin fetch
      console.warn('Direct GET fetch to Apps Script failed, falling back to proxy:', directErr);
    }

    // 2. Second attempt: Fetch via server proxy (which runs fetch() on the Node server)
    const proxyUrl = `/api/sheets-fetch?webAppUrl=${encodeURIComponent(webAppUrl)}&action=getData&_t=${Date.now()}`;
    const proxyRes = await fetch(proxyUrl, { method: 'GET' });
    let proxyJson: any = null;
    try {
      proxyJson = await proxyRes.json();
    } catch {
      // response was not JSON
    }

    if (proxyRes.ok && proxyJson && proxyJson.success) {
      const { evaluations, isEmpty } = parseGoogleSheetsResponse(proxyJson.data);
      return {
        success: true,
        data: evaluations,
        count: evaluations.length,
        isEmpty,
        source: 'proxy_fetch_get',
      };
    }

    return {
      success: false,
      error: proxyJson?.error || `เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (HTTP ${proxyRes.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch from Google Sheet via GET',
    };
  }
}

/**
 * Client-side fetch helper for POST request to Google Sheet Web App
 * Uses fetch() with method: 'POST'
 */
export async function saveEvaluationToSheets(
  record: any,
  webAppUrl: string = DEFAULT_GOOGLE_WEBAPP_URL
): Promise<{ success: boolean; result?: any; error?: string; method?: string }> {
  const payload = {
    action: 'addEvaluation',
    data: record,
    timestamp: new Date().toISOString(),
  };

  let directErrorMessage = '';

  // 1. Direct POST fetch() with text/plain (CORS simple request to prevent preflight)
  try {
    const directRes = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await directRes.text();

    if (directRes.ok) {
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { raw: text };
      }
      return { success: true, result, method: 'direct_fetch_post' };
    } else {
      // Extract human-readable error from Google Apps Script HTML error page
      const match = text.match(/<div style="text-align:center;font-family:monospace[^>]*>(.*?)<\/div>/s);
      directErrorMessage = match ? match[1].replace(/<[^>]*>/g, '').trim() : `Apps Script status ${directRes.status}`;
      console.warn('Apps Script direct POST response not OK:', directErrorMessage);
    }
  } catch (clientErr: any) {
    directErrorMessage = clientErr.message || 'CORS / Network error';
    console.warn('Direct POST fetch encountered CORS/network barrier, routing via server proxy:', clientErr);
  }

  // 2. Server proxy POST fetch()
  try {
    const proxyEndpoint = typeof window !== 'undefined' ? '/api/sync-sheets' : 'http://localhost:3000/api/sync-sheets';
    const res = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl,
        action: 'addEvaluation',
        payload: record,
      }),
    });
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // response was not JSON
    }
    if (res.ok && json && json.success) {
      return { success: true, result: json.result, method: 'proxy_fetch_post' };
    } else {
      return {
        success: false,
        error: json?.error || directErrorMessage || `ไม่สามารถบันทึกไปยัง Google Sheet ได้ (HTTP ${res.status})`,
        method: 'proxy_fetch_post',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: directErrorMessage ? `${directErrorMessage} (Proxy: ${err.message})` : (err.message || 'Failed to POST to Google Sheet'),
    };
  }
}

/**
 * Client-side fetch helper for POST request to update status in Google Sheet Web App
 */
export async function updateStatusInSheets(
  id: string,
  approval_status: string,
  webAppUrl: string = DEFAULT_GOOGLE_WEBAPP_URL
): Promise<{ success: boolean; result?: any; error?: string }> {
  const payload = {
    action: 'updateStatus',
    data: { id, approval_status },
    timestamp: new Date().toISOString(),
  };

  try {
    // Try direct fetch() first
    const directRes = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    if (directRes.ok) {
      const text = await directRes.text();
      return { success: true, result: text };
    }
  } catch (e) {
    // ignore and fallback
  }

  try {
    const res = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl,
        action: 'updateStatus',
        payload: { id, approval_status },
      }),
    });
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // response was not JSON
    }
    return { success: Boolean(res.ok && json?.success), result: json?.result, error: json?.error || (res.ok ? undefined : `HTTP ${res.status}`) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status in Google Sheet' };
  }
}

// Helper to export CSV format for manual Google Sheets import
export function exportToGoogleSheetCsv(evaluations: any[]): string {
  const headers = [
    'Evaluation ID',
    'Branch Name',
    'Evaluated Date',
    'Delivery Date',
    'Total Weeks',
    'Current Week Index',
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
    e.total_weeks ?? 12,
    e.current_week_index ?? 0,
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

