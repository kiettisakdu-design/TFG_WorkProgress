import React, { useState } from 'react';
import { AppSettings, EvaluationRecord } from '../types';
import {
  APPS_SCRIPT_CODE_GS,
  exportToGoogleSheetCsv,
} from '../utils/googleSheetsIntegration';
import {
  Sheet,
  Copy,
  Check,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Terminal,
  Server,
  Database,
  ArrowRight,
} from 'lucide-react';

interface GoogleSheetHubProps {
  settings: AppSettings;
  evaluations: EvaluationRecord[];
  onSaveSettings: (settings: AppSettings) => void;
  onImportEvaluations: (imported: EvaluationRecord[]) => void;
}

export const GoogleSheetHub: React.FC<GoogleSheetHubProps> = ({
  settings,
  evaluations,
  onSaveSettings,
  onImportEvaluations,
}) => {
  const [webAppUrl, setWebAppUrl] = useState(settings.googleWebAppUrl || '');
  const [sheetId, setSheetId] = useState(settings.googleSheetId || '');
  const [autoSync, setAutoSync] = useState(settings.autoSyncToSheets);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'code_gs' | 'index_html'>('code_gs');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [isFetchingGet, setIsFetchingGet] = useState(false);
  const [lastFetchResult, setLastFetchResult] = useState<{
    method: 'GET' | 'POST' | 'PING';
    status: 'success' | 'error';
    statusCode?: number;
    latencyMs?: number;
    message: string;
    details?: any;
  } | null>(null);

  const handleCopyCurrentCode = () => {
    const textToCopy = activeCodeTab === 'code_gs' ? APPS_SCRIPT_CODE_GS : (window as any).__INDEX_HTML_CONTENT__ || '<!-- Index.html available in file Index.html -->';
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConnection = () => {
    onSaveSettings({
      ...settings,
      googleWebAppUrl: webAppUrl,
      googleSheetId: sheetId,
      autoSyncToSheets: autoSync,
    });
    setTestResult({ success: true, msg: 'บันทึกการตั้งค่าการเชื่อมต่อ Google Sheets แล้ว' });
    setTimeout(() => setTestResult(null), 3000);
  };

  // Test Ping via POST
  const handleTestConnection = async () => {
    if (!webAppUrl) {
      setTestResult({ success: false, msg: 'กรุณากรอก Google Apps Script Web App URL ก่อนทดสอบ' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl,
          action: 'ping',
        }),
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (data.success) {
        setTestResult({
          success: true,
          msg: `เชื่อมต่อสำเร็จ! (Response ${elapsed}ms) Google Apps Script พร้อมทำงาน`,
        });
        setLastFetchResult({
          method: 'PING',
          status: 'success',
          latencyMs: elapsed,
          message: 'Google Apps Script ตอบกลับ 200 OK',
          details: data.result,
        });
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setTestResult({
        success: false,
        msg: `เชื่อมต่อไม่สำเร็จ: ${err.message || 'โปรดตรวจสอบการ Deploy Web App เป็น Anyone'}`,
      });
      setLastFetchResult({
        method: 'PING',
        status: 'error',
        latencyMs: elapsed,
        message: err.message || 'Failed to ping Google Apps Script',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Fetch data using GET fetch()
  const handleFetchViaGet = async () => {
    if (!webAppUrl) {
      setTestResult({ success: false, msg: 'กรุณากรอก Web App URL ก่อนเรียก GET' });
      return;
    }

    setIsFetchingGet(true);
    const startTime = performance.now();

    try {
      const { fetchEvaluationsFromSheets } = await import('../utils/googleSheetsIntegration');
      const res = await fetchEvaluationsFromSheets(webAppUrl);
      const elapsed = Math.round(performance.now() - startTime);

      if (res.success) {
        if (res.data && res.data.length > 0) {
          onImportEvaluations(res.data);
          setTestResult({
            success: true,
            msg: `ดึงข้อมูลด้วย GET fetch() สำเร็จ! พบ ${res.data.length} รายการ (${elapsed}ms)`,
          });
          setLastFetchResult({
            method: 'GET',
            status: 'success',
            latencyMs: elapsed,
            message: `ดึงข้อมูลสำเร็จ ${res.data.length} รายการจาก Google Sheet`,
            details: { count: res.data.length, source: res.source, sample: res.data.slice(0, 2) },
          });
        } else {
          setTestResult({
            success: true,
            msg: `ดึงข้อมูลด้วย GET fetch() สำเร็จ (สถานะชีตยังว่างเปล่า หรือเพิ่งสร้างใหม่) (${elapsed}ms)`,
          });
          setLastFetchResult({
            method: 'GET',
            status: 'success',
            latencyMs: elapsed,
            message: 'เชื่อมต่อชีตสำเร็จ 200 OK (แต่ยังไม่มีข้อมูลโครงการ)',
            details: { count: 0, note: 'สามารถกดปุ่ม POST ด้านล่างเพื่อส่งข้อมูลโครงการขึ้นชีตได้ทันที' },
          });
        }
      } else {
        throw new Error(res.error || 'GET fetch failed');
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setTestResult({
        success: false,
        msg: `ดึงข้อมูลด้วย GET ไม่สำเร็จ: ${err.message}`,
      });
      setLastFetchResult({
        method: 'GET',
        status: 'error',
        latencyMs: elapsed,
        message: err.message,
      });
    } finally {
      setIsFetchingGet(false);
    }
  };

  // Sync data using POST fetch()
  const handleSyncToSheets = async () => {
    if (!webAppUrl) {
      setSyncStatus('กรุณากรอก Web App URL ก่อน');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('กำลังส่งข้อมูลโครงการไปยัง Google Sheet ผ่าน fetch() POST...');
    const startTime = performance.now();

    try {
      const { saveEvaluationToSheets } = await import('../utils/googleSheetsIntegration');
      let count = 0;
      let lastResultObj = null;

      for (const ev of evaluations) {
        const res = await saveEvaluationToSheets(ev, webAppUrl);
        if (res.success) {
          count++;
          lastResultObj = res.result;
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setSyncStatus(`ส่งข้อมูลสำเร็จเรียบร้อย (${count}/${evaluations.length} รายการ) ใน ${elapsed}ms`);
      setLastFetchResult({
        method: 'POST',
        status: 'success',
        latencyMs: elapsed,
        message: `ส่งข้อมูลผ่าน fetch() POST สำเร็จทั้งหมด ${count} รายการ`,
        details: lastResultObj,
      });
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setSyncStatus(`การส่งข้อมูลขัดข้อง: ${err.message}`);
      setLastFetchResult({
        method: 'POST',
        status: 'error',
        latencyMs: elapsed,
        message: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadCsv = () => {
    const csvContent = exportToGoogleSheetCsv(evaluations);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shop_TFM_Database_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Sheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Google Sheet Database & Google Apps Script Hub
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                  SERVERLESS DB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                เชื่อมต่อและใช้งาน Google Sheets เป็นฐานข้อมูลหลัก พร้อมสคริปต์ Google Apps Script (Code.gs) สำหรับ Deploy
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>ดาวน์โหลด CSV สำหรับเปิดใน Google Sheet</span>
          </button>
        </div>
      </div>

      {/* 1. Connection Config Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100 text-sm">
            การเชื่อมต่อ Google Apps Script Web App Endpoint
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Google Apps Script Web App URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                <span>ทดสอบเชื่อมต่อ (Ping)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * ได้จากการกด Deploy &gt; New deployment &gt; Web app ใน Apps Script Editor
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <span>ซิงค์ผลการประเมินลง Google Sheet อัตโนมัติทุกครั้งเมื่อบันทึก (Auto-Sync)</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleFetchViaGet}
                disabled={isFetchingGet || !webAppUrl}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isFetchingGet || !webAppUrl
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingGet ? 'animate-spin' : ''}`} />
                <span>{isFetchingGet ? 'กำลังดึงข้อมูล (GET)...' : 'ดึงข้อมูลจากชีต (GET fetch)'}</span>
              </button>

              <button
                onClick={handleSyncToSheets}
                disabled={isSyncing || !webAppUrl}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSyncing || !webAppUrl
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isSyncing ? 'กำลังส่งข้อมูล (POST)...' : `ส่งข้อมูลไปชีต (POST fetch) (${evaluations.length} รายการ)`}</span>
              </button>

              <button
                onClick={handleSaveConnection}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                บันทึก URL
              </button>
            </div>
          </div>

          {/* Test & Sync Alerts */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{testResult.msg}</span>
            </div>
          )}

          {syncStatus && (
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* HTTP fetch() Telemetry & Inspector */}
          {lastFetchResult && (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      lastFetchResult.method === 'GET'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : lastFetchResult.method === 'POST'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    fetch() {lastFetchResult.method}
                  </span>
                  <span className="font-semibold text-slate-300">{lastFetchResult.message}</span>
                </div>
                {lastFetchResult.latencyMs !== undefined && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    ⚡ {lastFetchResult.latencyMs} ms
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                Target: {webAppUrl}
              </div>
              {lastFetchResult.details && (
                <pre className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto max-h-32">
                  {JSON.stringify(lastFetchResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Step-by-Step Deployment Guide */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
          <span>🚀</span> ขั้นตอนการตั้งค่า Google Sheet และ Deploy ด้วย Google Apps Script
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold font-mono">
              1
            </div>
            <div className="font-semibold text-slate-200">สร้าง Google Sheet</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ไปที่ sheets.google.com สร้าง Spreadsheet เปล่าใหม่ แล้วไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold font-mono">
              2
            </div>
            <div className="font-semibold text-slate-200">วางโค้ด Code.gs</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              คัดลอกโค้ดด้านล่าง วางแทนที่ไฟล์ Code.gs ทั้งหมดในโปรเจกต์ Apps Script แล้วกด Save (บันทึก)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold font-mono">
              3
            </div>
            <div className="font-semibold text-slate-200">รัน setupTFMDatabase</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              เลือกฟังก์ชัน <strong>setupTFMDatabase</strong> แล้วกด Run เพื่อสร้างตาราง Evaluations และ Settings พร้อมหัวคอลัมน์อัตโนมัติ
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold font-mono">
              4
            </div>
            <div className="font-semibold text-slate-200">Deploy as Web App</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              กด <strong>Deploy &gt; New deployment</strong> &gt; เลือก Web app &gt; Execute as: <strong>Me</strong> &gt; Who has access: <strong>Anyone</strong> นำ URL มาใส่ข้างบน!
            </p>
          </div>
        </div>
      </div>

      {/* 3. Apps Script Code.gs & Index.html Viewer & Copy */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('code_gs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCodeTab === 'code_gs'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Code.gs (Backend)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('index_html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeCodeTab === 'index_html'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Index.html (Web App)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeCodeTab === 'code_gs') {
                  handleDownloadFile('Code.gs', APPS_SCRIPT_CODE_GS, 'text/javascript');
                } else {
                  // Fetch or trigger download of /Index.html
                  fetch('/Index.html')
                    .then((r) => r.text())
                    .then((txt) => handleDownloadFile('Index.html', txt, 'text/html'))
                    .catch(() => alert('กำลังดาวน์โหลดไฟล์ Index.html'));
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>ดาวน์โหลดไฟล์ {activeCodeTab === 'code_gs' ? 'Code.gs' : 'Index.html'}</span>
            </button>

            <button
              onClick={handleCopyCurrentCode}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'คัดลอกแล้ว!' : `คัดลอก ${activeCodeTab === 'code_gs' ? 'Code.gs' : 'Index.html'}`}</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
          {activeCodeTab === 'code_gs' ? (
            <pre>{APPS_SCRIPT_CODE_GS}</pre>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
                <span>ไฟล์ standalone Index.html พร้อมสำหรับนำไปวางใน Apps Script Editor แล้ว (ขนาดสมบูรณ์รวม UI ทั้งหมด)</span>
                <a
                  href="/Index.html"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-emerald-800 text-white hover:bg-emerald-700 transition-colors font-sans text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>เปิดดูไฟล์ Index.html โดยตรง</span>
                </a>
              </div>
              <p className="text-slate-400 text-xs">
                * วิธีใช้งานใน Google Apps Script: ในหน้า Apps Script Editor กดเครื่องหมาย + ข้างไฟล์ แล้วเลือก "HTML" ตั้งชื่อว่า <strong>Index</strong> จากนั้นคัดลอกโค้ดจากปุ่มด้านบนไปวางแทนที่ทั้งหมด
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
