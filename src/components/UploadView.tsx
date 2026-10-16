import React, { useState } from 'react';
import {
  EvaluationRecord,
  AppSettings,
  PhotoData,
  CategoryScores,
  StatusFlag,
} from '../types';
import { AIMascot } from './AIMascot';
import {
  generateSampleConstructionImage,
  PROVINCES_LIST,
  CONTRACTORS_LIST,
  DEFAULT_SCURVE_10_WEEKS,
} from '../utils/sampleData';
import { compressImageFile } from '../utils/imageCompressor';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  Layers,
  ArrowRight,
  Info,
  Send,
  Calendar,
  Clock,
} from 'lucide-react';

interface UploadViewProps {
  settings: AppSettings;
  onEvaluationComplete: (newRecord: EvaluationRecord) => void;
  onNavigateDashboard?: () => void;
  canNavigateDashboard?: boolean;
}

const PHOTO_FIELDS = [
  {
    key: 'facade' as const,
    num: '1.1',
    name: 'รูปด้านหน้าอาคาร (Facade)',
    weightKey: 'front' as const,
    desc: 'ป้ายร้าน, กระจกหน้าหน้าร้าน, โครงสร้างเสา/คานด้านหน้า, ประตูทางเข้าหลัก, สีและวัสดุปิดผิว',
    icon: '🏢',
  },
  {
    key: 'interior' as const,
    num: '1.2',
    name: 'รูปภายในอาคาร (Interior)',
    weightKey: 'interior' as const,
    desc: 'งานฝ้าเพดาน, ระบบไฟฟ้า/เครื่องปรับอากาศ, งานปูพื้น, การกั้นผนังห้อง, เฟอร์นิเจอร์ Built-in',
    icon: '🛠️',
  },
  {
    key: 'rear' as const,
    num: '1.3',
    name: 'รูปด้านหลังอาคาร (Rear)',
    weightKey: 'rear' as const,
    desc: 'ประตูทางออกหลังร้าน, พื้นที่เก็บของ, ระบบบำบัด/งานสุขาภิบาล, โครงสร้างผนังด้านหลัง',
    icon: '🚪',
  },
  {
    key: 'parking' as const,
    num: '1.4',
    name: 'รูปพื้นลานจอดรถ (Parking Area)',
    weightKey: 'parking' as const,
    desc: 'งานเทคอนกรีต/แอสฟัลต์, เส้นจราจร/ช่องจอด, ไฟส่องสว่าง, ระบบระบายน้ำลานจอด',
    icon: '🚗',
  },
];

export const UploadView: React.FC<UploadViewProps> = ({
  settings,
  onEvaluationComplete,
  onNavigateDashboard,
  canNavigateDashboard = true,
}) => {
  // Photos state
  const [photos, setPhotos] = useState<PhotoData>({});

  // Metadata state (1.5 - 1.10)
  // Requirement 2.2: User can select Upload Date and Delivery Date
  // Requirement 2.3: Total Weeks input removed, standardized to 10 weeks
  // Requirement 2.4: Baseline plan % manual selection removed, automatically derived from 10-week S-curve
  const [branchName, setBranchName] = useState('สาขา พัทยา บีช');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('2026-12-15');
  const totalWeeks = 10; // Standard 10 weeks for all projects as per Requirement 3
  const [province, setProvince] = useState('ชลบุรี');
  const [contractor, setContractor] = useState('บจก. สยาม คอนสตรัคชั่น บิลเดอร์');
  const [supervisor, setSupervisor] = useState('วิศวกร ภานุวัฒน์ สินธุเดชา (วศ.บ. โยธา)');

  // Automatic Timeline & Week Calculation (Standard 10 Weeks = 70 Days):
  const totalDays = totalWeeks * 7;
  const delivery = new Date(deliveryDate);
  const startDate = new Date(delivery.getTime() - totalDays * 24 * 60 * 60 * 1000);
  const upload = new Date(uploadDate);
  const daysRemaining = Math.ceil((delivery.getTime() - upload.getTime()) / (24 * 60 * 60 * 1000));
  const daysElapsed = Math.max(0, totalDays - daysRemaining);
  const calculatedCurrentWeek = Math.min(totalWeeks, Math.max(0, Math.round(daysElapsed / 7)));
  const startDateFormatted = !isNaN(startDate.getTime()) ? startDate.toISOString().split('T')[0] : '';

  // Automatic S-Curve Baseline Plan % looked up from Admin settings (or standard default)
  const baselinePlanTable = settings.sCurveBaselinePlan || DEFAULT_SCURVE_10_WEEKS;
  const autoBaselinePlanProgress = baselinePlanTable[calculatedCurrentWeek] !== undefined
    ? baselinePlanTable[calculatedCurrentWeek]
    : Math.round((calculatedCurrentWeek / 10) * 100);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [compressingKey, setCompressingKey] = useState<keyof PhotoData | null>(null);

  // Submission State (Requirement 2.1: Separate AI Evaluation button from Submit button)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  // Helper to sync updated dates to draft evaluation result if already evaluated
  const syncDatesToEvaluationResult = (newUploadDate: string, newDeliveryDate: string) => {
    if (!evaluationResult || isSubmitted) return;
    const u = new Date(newUploadDate);
    const d = new Date(newDeliveryDate);
    const rem = Math.ceil((d.getTime() - u.getTime()) / (24 * 60 * 60 * 1000));
    const el = Math.max(0, totalDays - rem);
    const wk = Math.min(totalWeeks, Math.max(0, Math.round(el / 7)));
    const basePlan = baselinePlanTable[wk] !== undefined ? baselinePlanTable[wk] : Math.round((wk / 10) * 100);
    const diff = parseFloat((evaluationResult.calculated_actual_progress - basePlan).toFixed(1));
    let flag: 'EXCELLENT' | 'ON_TRACK' | 'WARNING' | 'CRITICAL' = 'ON_TRACK';
    if (diff >= 5) flag = 'EXCELLENT';
    else if (diff >= -5) flag = 'ON_TRACK';
    else if (diff >= -15) flag = 'WARNING';
    else flag = 'CRITICAL';

    setEvaluationResult((prev) =>
      prev
        ? {
            ...prev,
            evaluated_date: newUploadDate,
            delivery_date: newDeliveryDate,
            current_week_index: wk,
            baseline_plan_progress: basePlan,
            variance_diff: diff,
            status_flag: flag,
          }
        : null
    );
  };

  const handleUploadDateChange = (newDate: string) => {
    setUploadDate(newDate);
    syncDatesToEvaluationResult(newDate, deliveryDate);
  };

  const handleDeliveryDateChange = (newDate: string) => {
    setDeliveryDate(newDate);
    syncDatesToEvaluationResult(uploadDate, newDate);
  };

  // Quick Preset Date Helpers (User Request 2: เลือกวันที่อัปโหลด และ วันที่ส่งมอบ ได้เอง)
  const setUploadToday = () => {
    const today = new Date().toISOString().split('T')[0];
    handleUploadDateChange(today);
  };

  const setUploadYesterday = () => {
    const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    handleUploadDateChange(y);
  };

  const setUploadMinus7Days = () => {
    const d = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    handleUploadDateChange(d);
  };

  const setDeliveryPlus10Weeks = () => {
    const u = new Date(uploadDate);
    const d = new Date(u.getTime() + 70 * 24 * 60 * 60 * 1000);
    if (!isNaN(d.getTime())) {
      handleDeliveryDateChange(d.toISOString().split('T')[0]);
    }
  };

  const setDeliveryPlus30Days = () => {
    const u = new Date(uploadDate);
    const d = new Date(u.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (!isNaN(d.getTime())) {
      handleDeliveryDateChange(d.toISOString().split('T')[0]);
    }
  };

  const setDeliveryPlus60Days = () => {
    const u = new Date(uploadDate);
    const d = new Date(u.getTime() + 60 * 24 * 60 * 60 * 1000);
    if (!isNaN(d.getTime())) {
      handleDeliveryDateChange(d.toISOString().split('T')[0]);
    }
  };

  const setDeliveryEndOfMonth = () => {
    const u = new Date(uploadDate);
    const end = new Date(u.getFullYear(), u.getMonth() + 2, 0);
    handleDeliveryDateChange(end.toISOString().split('T')[0]);
  };

  // Handle single photo upload with automated client-side downscaling and compression
  const handlePhotoUpload = async (key: keyof PhotoData, file: File) => {
    try {
      setCompressingKey(key);
      setErrorMsg('');
      const compressed = await compressImageFile(file, 1280, 0.82);
      setPhotos((prev) => ({
        ...prev,
        [key]: compressed.dataUrl,
      }));
    } catch (err: any) {
      console.warn('Auto compression fell back to reader:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos((prev) => ({
          ...prev,
          [key]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressingKey(null);
    }
  };

  // Load Presets for rapid demo
  const loadPreset = (presetType: 'EXCELLENT' | 'ON_TRACK' | 'WARNING' | 'CRITICAL') => {
    setErrorMsg('');
    setEvaluationResult(null);
    setIsSubmitted(false);
    setSubmitSuccessMsg('');

    if (presetType === 'EXCELLENT') {
      setBranchName('สาขา สยามสแควร์ (อัปเดตใหม่)');
      setProvince('กรุงเทพฯ');
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'หน้าร้านสยามสแควร์ ป้ายไฟและกระจกพร้อม', 92),
        interior: generateSampleConstructionImage('interior', 'ห้องโถงหลัก ปูพื้นแกรนิตโต้และแอร์ทำงานได้', 90),
        rear: generateSampleConstructionImage('rear', 'ด้านหลังอาคาร ถังบำบัดน้ำและประตูนิรภัย', 85),
        parking: generateSampleConstructionImage('parking', 'ลานจอดรถ ตีเส้นช่องจอดและติดตั้งเสาไฟโซลาร์', 88),
      });
    } else if (presetType === 'ON_TRACK') {
      setBranchName('สาขา หาดใหญ่ เซ็นทรัล');
      setProvince('สงขลา');
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'ด้านหน้าอาคารสาขาหาดใหญ่ ติดตั้งกรอบกระจก', 62),
        interior: generateSampleConstructionImage('interior', 'งานเดินท่อร้อยสายไฟและติดตั้งฝ้าฉาบเรียบ', 60),
        rear: generateSampleConstructionImage('rear', 'ผนังด้านหลังก่ออิฐมวลเบาเสร็จสิ้น', 64),
        parking: generateSampleConstructionImage('parking', 'บดอัดหินคลุกเตรียมเทคอนกรีตลานจอด', 58),
      });
    } else if (presetType === 'WARNING') {
      setBranchName('สาขา หัวหิน มาร์เก็ต');
      setProvince('ประจวบคีรีขันธ์');
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'หน้าร้านหัวหิน ติดตั้งโครงเหล็กค้างอยู่', 60),
        interior: generateSampleConstructionImage('interior', 'งานฝ้าภายในรอยิปซั่มบอร์ดและช่างแอร์', 55),
        rear: generateSampleConstructionImage('rear', 'ประตูหลังร้านยังไม่ได้ติดบาน', 62),
        parking: generateSampleConstructionImage('parking', 'ลานจอดรถมีน้ำขังจากฝนตก รอแห้ง', 50),
      });
    } else {
      setBranchName('สาขา เชียงราย เมืองใหม่');
      setProvince('เชียงราย');
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'หน้าร้านโครงสร้างคานเปล่า ยังไม่ได้มุงหลังคา', 35),
        interior: generateSampleConstructionImage('interior', 'ภายในไม่มีการเดินสายไฟ กองอิฐกระจัดกระจาย', 30),
        rear: generateSampleConstructionImage('rear', 'ผนังหลังร้านรื้อถอนยังไม่เสร็จ', 40),
        parking: generateSampleConstructionImage('parking', 'ลานจอดรถยังเป็นดินโคลน รถเข้าไม่ได้', 25),
      });
    }
  };

  // 1. Run AI Vision Evaluation (Button 1: ประเมินความคืบหน้าด้วย AI Vision เพื่อตรวจสอบผลก่อน)
  const handleRunEvaluation = async () => {
    // Check if at least 1 photo is attached
    const photoCount = Object.values(photos).filter(Boolean).length;
    if (photoCount === 0) {
      setErrorMsg('กรุณาแนบรูปภาพอย่างน้อย 1 มุมมอง หรือกดเลือก "โหลดชุดภาพตัวอย่าง" เพื่อทดสอบ');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setEvaluationResult(null);
    setIsSubmitted(false);
    setSubmitSuccessMsg('');

    try {
      setAnalysisStep('1/4 กำลังตรวจสอบภาพถ่ายทั้ง 4 หมวดตามจุดตรวจมาตรฐาน Shop TFM...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('2/4 เรียกใช้งาน Gemini Vision AI Model เพื่อประเมินเปอร์เซ็นต์งานเสร็จแต่ละหมวด...');

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_name: branchName,
          evaluated_date: uploadDate,
          delivery_date: deliveryDate,
          province,
          contractor,
          supervisor,
          baseline_plan_progress: autoBaselinePlanProgress,
          weights: settings.weights,
          confidence_threshold: settings.confidenceThreshold,
          photos,
        }),
      });

      setAnalysisStep('3/4 คำนวณความคืบหน้ารวมแบบถ่วงน้ำหนัก และเปรียบเทียบกับ Baseline Plan S-Curve...');
      await new Promise((r) => setTimeout(r, 400));

      // Safe HTTP response parsing
      const contentType = response.headers.get('content-type') || '';
      let result: any = null;

      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonErr) {
          console.error('JSON parse error from evaluate response:', jsonErr);
        }
      }

      if (!response.ok || !result) {
        let cleanError = '';
        if (response.status === 413) {
          cleanError = 'ขนาดไฟล์ภาพหรือข้อมูลที่ส่งใหญ่เกินขีดจำกัด (HTTP 413 Payload Too Large) ระบบบีบอัดรูปภาพให้อัตโนมัติแล้ว กรุณาลองอัปโหลดใหม่อีกครั้ง';
        } else if (response.status === 502 || response.status === 503 || response.status === 504) {
          cleanError = `เกตเวย์หรือระบบเซิร์ฟเวอร์ใช้เวลาตอบกลับนานเกินไป (HTTP ${response.status}) กรุณากดลองอีกครั้ง`;
        } else {
          try {
            const rawText = await response.text();
            if (rawText.includes('The page') || rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
              cleanError = `เซิร์ฟเวอร์ตอบกลับด้วยหน้าเว็บข้อผิดพลาด (HTTP ${response.status}) แทนที่ข้อมูลการวิเคราะห์ AI`;
            } else {
              cleanError = rawText.slice(0, 160);
            }
          } catch {
            cleanError = `การเชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (HTTP ${response.status})`;
          }
        }

        throw new Error(result?.error || cleanError || `การประเมินผลล้มเหลว (HTTP ${response.status})`);
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Evaluation returned unsuccessful response');
      }

      setAnalysisStep('4/4 ประเมินเกณฑ์ความมั่นใจ AI และพร้อมตรวจสอบรายงานผล...');
      await new Promise((r) => setTimeout(r, 400));

      const evalData = result.data;
      const isApproved = evalData.confidence_score >= settings.confidenceThreshold;

      const record: EvaluationRecord = {
        id: `TFM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        branch_name: branchName,
        evaluated_date: uploadDate,
        delivery_date: deliveryDate,
        total_weeks: totalWeeks,
        current_week_index: calculatedCurrentWeek,
        province,
        contractor,
        supervisor,
        confidence_score: evalData.confidence_score,
        category_scores: evalData.category_scores,
        calculated_actual_progress: evalData.calculated_actual_progress,
        baseline_plan_progress: autoBaselinePlanProgress,
        variance_diff: evalData.variance_diff,
        status_flag: evalData.status_flag,
        summary_reasoning: evalData.summary_reasoning,
        photos,
        approval_status: isApproved ? 'APPROVED' : 'PENDING_APPROVAL',
        approved_by: isApproved ? 'ระบบ AI อัตโนมัติ (Confidence ≥ 80%)' : undefined,
        approved_at: isApproved ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
      };

      setEvaluationResult(record);
      setIsSubmitted(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประเมินด้วย AI Vision');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // 2. Submit to System (Button 2: ส่งเข้าระบบ เพื่อบันทึกผลงานและซิงก์ Google Sheets)
  const handleSubmitToSystem = async () => {
    if (!evaluationResult) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      onEvaluationComplete(evaluationResult);
      setIsSubmitted(true);
      setSubmitSuccessMsg(
        `บันทึกและส่งรายงานโครงการ ${evaluationResult.branch_name} เข้าระบบเรียบร้อยแล้ว!`
      );

      // Optional: Auto sync to Google Sheets if configured
      if (settings.autoSyncToSheets && settings.googleWebAppUrl) {
        fetch('/api/sync-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webAppUrl: settings.googleWebAppUrl,
            action: 'addEvaluation',
            payload: evaluationResult,
          }),
        }).catch((err) => console.error('Auto sync to sheet failed:', err));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'บันทึกข้อมูลเข้าระบบไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setEvaluationResult(null);
    setIsSubmitted(false);
    setSubmitSuccessMsg('');
    setErrorMsg('');
    setPhotos({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                <UploadCloud className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                หน้าอัปโหลดรูปภาพไซต์งาน (AI Photo Evaluation)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              แนบภาพถ่ายไซต์งาน 4 มุมมองหลัก พร้อมกรอกข้อมูลกำกับโครงการ 1.5 - 1.10 เพื่อให้ AI วิเคราะห์
            </p>
          </div>

          {/* Preset Buttons for Demo */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">โหลดชุดภาพตัวอย่าง:</span>
            <button
              onClick={() => loadPreset('EXCELLENT')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors"
            >
              🏆 สยามสแควร์ (เร็วกว่าแผน)
            </button>
            <button
              onClick={() => loadPreset('ON_TRACK')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800 hover:bg-sky-900 transition-colors"
            >
              💪 หาดใหญ่ (ตามแผน)
            </button>
            <button
              onClick={() => loadPreset('WARNING')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-colors"
            >
              🔭 หัวหิน (เฝ้าระวัง)
            </button>
            <button
              onClick={() => loadPreset('CRITICAL')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors"
            >
              🚩 เชียงราย (วิกฤต)
            </button>
          </div>
        </div>
      </div>

      {/* 2.1 4-CATEGORY PHOTO UPLOAD SLOTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>2.1 แนบรูปภาพ 4 มุมมองหลักตามข้อกำหนด (Photo Categories)</span>
          </h3>
          <span className="text-xs text-slate-400">
            น้ำหนักปัจจุบัน: หน้าอาคาร {settings.weights.front}%, ภายใน {settings.weights.interior}%, หลังอาคาร {settings.weights.rear}%, ลานจอด {settings.weights.parking}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PHOTO_FIELDS.map((cat) => {
            const hasPhoto = Boolean(photos[cat.key]);
            const weightVal = settings.weights[cat.weightKey];

            return (
              <div
                key={cat.key}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Header */}
                <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                    <span>{cat.icon}</span>
                    <span className="text-cyan-400 font-mono">{cat.num}</span>
                    <span className="truncate">{cat.name.split(' ')[0]}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-semibold border border-cyan-800">
                    น้ำหนัก {weightVal}%
                  </span>
                </div>

                {/* Upload Slot / Image Preview */}
                <div className="relative aspect-[4/3] bg-slate-950 flex flex-col items-center justify-center p-3 text-center group">
                  {compressingKey === cat.key ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-4 text-cyan-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span className="text-xs font-medium">กำลังบีบอัดและปรับขนาดรูปภาพ...</span>
                      <span className="text-[10px] text-slate-400">ปรับให้เหมาะกับการประมวลผล AI</span>
                    </div>
                  ) : hasPhoto ? (
                    <>
                      <img
                        src={photos[cat.key]}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-2 rounded-lg bg-slate-800 text-white cursor-pointer hover:bg-slate-700 text-xs flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>เปลี่ยนรูป</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handlePhotoUpload(cat.key, e.target.files[0]);
                            }}
                          />
                        </label>
                        <button
                          onClick={() => setPhotos((prev) => ({ ...prev, [cat.key]: undefined }))}
                          className="p-2 rounded-lg bg-rose-900/80 text-rose-200 hover:bg-rose-800 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบ</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors p-4">
                      <ImageIcon className="w-8 h-8 text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-xs font-medium text-slate-300">คลิกเพื่ออัปโหลด</span>
                      <span className="text-[10px] text-slate-500 mt-1">PNG, JPG (บีบอัดอัตโนมัติ)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handlePhotoUpload(cat.key, e.target.files[0]);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Inspection Points Hint */}
                <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-500 font-semibold">จุดตรวจ: </span>
                  {cat.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.2 PROJECT METADATA & CUSTOM DATE SELECTION (1.5 - 1.10) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>📋</span>
            <span>2.2 ข้อมูลกำกับโครงการและเลือกวันที่ (Project Metadata 1.5 - 1.10)</span>
          </h3>
          <span className="text-xs text-cyan-300 bg-cyan-950/70 border border-cyan-800/80 px-2.5 py-0.5 rounded-full font-medium">
            ✨ สามารถเลือกวันที่อัปโหลด และ วันที่ส่งมอบงาน ได้เองอย่างอิสระ
          </span>
        </div>

        {/* PROMINENT DEDICATED DATE PICKER CARD (Requirement 2: สามารถเลือก วันที่อัปโหลด และ วันที่ส่งมอบงาน ได้เอง) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 border-2 border-cyan-500/40 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>กำหนดวันที่ประเมิน (Upload Date) & วันที่ส่งมอบงาน (Delivery Date):</span>
            </div>
            <span className="text-[11px] text-slate-400">
              ระบบจะคำนวณสัปดาห์ (Week 0-10) และเป้าหมายสะสมตาม S-Curve อัตโนมัติทันที
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1.6 วันที่อัปโหลดข้อมูล */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-800/60 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <span>1.6 วันที่อัปโหลดข้อมูล (Upload Date)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">วันที่ถ่าย/ส่งตรวจภาพ</span>
              </div>

              <input
                type="date"
                value={uploadDate}
                onChange={(e) => handleUploadDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-cyan-600/60 hover:border-cyan-400 focus:border-cyan-400 text-white font-mono text-sm shadow-inner focus:outline-none transition-colors cursor-pointer"
              />

              {/* Quick Preset Buttons for Upload Date */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">เลือกด่วน:</span>
                <button
                  type="button"
                  onClick={setUploadToday}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900 hover:text-cyan-200 border border-slate-700 text-slate-200 transition-colors font-medium"
                >
                  📅 วันนี้
                </button>
                <button
                  type="button"
                  onClick={setUploadYesterday}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900 hover:text-cyan-200 border border-slate-700 text-slate-200 transition-colors"
                >
                  เมื่อวาน
                </button>
                <button
                  type="button"
                  onClick={setUploadMinus7Days}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900 hover:text-cyan-200 border border-slate-700 text-slate-200 transition-colors"
                >
                  ย้อนหลัง 7 วัน
                </button>
              </div>
            </div>

            {/* 1.7 วันที่ส่งมอบงาน */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-800/60 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <span>1.7 วันที่ส่งมอบงาน (Delivery Date)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">วันกำหนดเสร็จสิ้นสัญญา</span>
              </div>

              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => handleDeliveryDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-emerald-600/60 hover:border-emerald-400 focus:border-emerald-400 text-white font-mono text-sm shadow-inner focus:outline-none transition-colors cursor-pointer"
              />

              {/* Quick Preset Buttons for Delivery Date */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">เลือกด่วน:</span>
                <button
                  type="button"
                  onClick={setDeliveryPlus10Weeks}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors font-medium"
                >
                  🎯 มาตรฐาน 10 สัปดาห์ (+70 วัน)
                </button>
                <button
                  type="button"
                  onClick={setDeliveryPlus30Days}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                >
                  +30 วัน
                </button>
                <button
                  type="button"
                  onClick={setDeliveryPlus60Days}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                >
                  +60 วัน
                </button>
                <button
                  type="button"
                  onClick={setDeliveryEndOfMonth}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                >
                  สิ้นเดือนถัดไป
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Real-time Calculations Based on Chosen Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] pt-1">
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">สัปดาห์ประเมินปัจจุบัน:</span>
              <strong className="text-cyan-300 text-sm font-mono">Week {calculatedCurrentWeek}</strong>
              <span className="text-slate-500 text-[10px] block">จากระยะเวลามาตรฐาน 10 สัปดาห์</span>
            </div>
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">เป้าหมายแผนงานสะสม (S-Curve):</span>
              <strong className="text-emerald-400 text-sm font-mono">{autoBaselinePlanProgress}%</strong>
              <span className="text-slate-500 text-[10px] block">คำนวณตามสูตร Week {calculatedCurrentWeek}</span>
            </div>
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">วันเริ่มงานคำนวณ (Week 0):</span>
              <strong className="text-slate-200 text-sm font-mono">{startDateFormatted || '-'}</strong>
              <span className="text-slate-500 text-[10px] block">ย้อนหลังจากวันส่งมอบ 70 วัน</span>
            </div>
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ระยะเวลาคงเหลือส่งมอบ:</span>
              <strong className={`text-sm font-mono ${daysRemaining > 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                {daysRemaining > 0 ? `${daysRemaining} วัน` : 'ครบกำหนดแล้ว'}
              </strong>
              <span className="text-slate-500 text-[10px] block">นับจากวันอัปโหลดถึงวันส่งมอบ</span>
            </div>
          </div>
        </div>

        {/* OTHER PROJECT METADATA FIELDS (1.5, 1.8, 1.9, 1.10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1.5 ชื่อสาขา */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.5 ชื่อสาขา (Branch Name) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="เช่น สาขา สยามสแควร์"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 1.8 พิกัดตำแหน่ง */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.8 พิกัดตำแหน่ง (จังหวัด) <span className="text-rose-400">*</span>
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {PROVINCES_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 1.9 ผู้รับเหมา */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.9 ผู้รับเหมา (Contractor) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              placeholder="ชื่อบริษัทผู้รับเหมา"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 1.10 ผู้ควบคุมงาน */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.10 ผู้ควบคุมงาน (Supervisor/Engineer) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="ชื่อวิศวกรหรือผู้คุมงาน"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* BUTTON 1: RUN AI VISION EVALUATION (Requirement 2.1) */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>ขั้นตอนที่ 1:</strong> กดปุ่มประเมินเพื่อวิเคราะห์ภาพถ่ายทั้ง 4 หมวดด้วย AI Vision และตรวจสอบผลก่อนส่งเข้าระบบ
            </span>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30 active:scale-[0.98]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>กำลังวิเคราะห์ด้วย AI Vision...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>เริ่มประเมินความคืบหน้าด้วย AI Vision</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Loading Progress Details */}
        {isAnalyzing && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>{analysisStep}</span>
              <span className="font-mono">Processing...</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-2/3 animate-indeterminate" />
            </div>
          </div>
        )}
      </div>

      {/* EVALUATION RESULT REPORT CARD (Requirement 2.1: Inspection Review & Separate Submit Button) */}
      {evaluationResult && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border-2 border-cyan-500/50 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Submission Notice Banner */}
          {!isSubmitted ? (
            <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-700 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>AI Vision ประเมินผลเสร็จสิ้น:</strong> โปรดตรวจสอบความคืบหน้า คะแนน 4 หมวด และ Mascot ด้านล่าง เมื่อถูกต้องแล้วให้กดปุ่ม <strong>"กดส่งเข้าระบบ"</strong>
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900 text-amber-100 font-mono">
                รอส่งเข้าระบบ (Draft Ready)
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{submitSuccessMsg || 'บันทึกและส่งรายงานเข้าระบบสำเร็จแล้ว!'}</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700 font-mono font-bold">
                SUBMITTED TO SYSTEM
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                  {evaluationResult.id}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
                    evaluationResult.approval_status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {evaluationResult.approval_status === 'APPROVED'
                      ? 'เกณฑ์ความมั่นใจผ่าน (Confidence ≥ 80%)'
                      : 'ความมั่นใจ < 80% (รอ Supervisor ตรวจรับ)'}
                  </span>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                ผลการประเมิน: {evaluationResult.branch_name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>วันที่อัปโหลด: <strong className="text-cyan-300 font-mono">{evaluationResult.evaluated_date}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>วันที่ส่งมอบ: <strong className="text-emerald-300 font-mono">{evaluationResult.delivery_date}</strong></span>
                </span>
                <span className="bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg text-cyan-300 text-[11px] font-mono">
                  สัปดาห์ที่ {evaluationResult.current_week_index} / 10 (เป้าหมาย S-Curve: {evaluationResult.baseline_plan_progress}%)
                </span>
              </div>
            </div>

            {/* BUTTON 2: SUBMIT TO SYSTEM (Requirement 2.1) */}
            <div className="flex flex-wrap items-center gap-3">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitToSystem}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/40 transition-all flex items-center gap-2 active:scale-95 animate-pulse"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>กำลังบันทึกและส่งรายงาน...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-emerald-100" />
                      <span>กดส่งเข้าระบบ (Submit to System)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ส่งรายงานเรียบร้อยแล้ว</span>
                  </div>
                  {canNavigateDashboard && onNavigateDashboard && (
                    <button
                      onClick={onNavigateDashboard}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
                    >
                      <span>ดูใน Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={handleResetForm}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    ประเมินสาขาใหม่
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Category breakdown (Col 8) */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">หน้าร้าน (Facade 30%)</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {evaluationResult.category_scores.front_facade}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">ภายใน (Interior 40%)</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {evaluationResult.category_scores.interior}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">หลังร้าน (Rear 15%)</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {evaluationResult.category_scores.rear_building}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">ลานจอด (Parking 15%)</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {evaluationResult.category_scores.parking_area}%
                  </div>
                </div>
              </div>

              {/* Formula explanation */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="font-semibold text-slate-300">สูตรคำนวณความคืบหน้ารวม:</div>
                <div className="font-mono text-[11px] text-slate-400">
                  Actual = ({evaluationResult.category_scores.front_facade} × 0.30) + (
                  {evaluationResult.category_scores.interior} × 0.40) + (
                  {evaluationResult.category_scores.rear_building} × 0.15) + (
                  {evaluationResult.category_scores.parking_area} × 0.15) ={' '}
                  <strong className="text-emerald-400 text-sm">{evaluationResult.calculated_actual_progress}%</strong>
                </div>
                <div className="text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800">
                  <span>แผนงานสะสมตาม S-Curve: <strong className="text-slate-200">{evaluationResult.baseline_plan_progress}%</strong></span>
                  <span>•</span>
                  <span>
                    ส่วนต่าง: <strong className={evaluationResult.variance_diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {evaluationResult.variance_diff >= 0 ? '+' : ''}{evaluationResult.variance_diff}%
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Confidence: <strong className="text-cyan-300">{evaluationResult.confidence_score}%</strong></span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-cyan-400">ข้อคิดเห็นและการวิเคราะห์ AI: </strong>
                {evaluationResult.summary_reasoning}
              </div>
            </div>

            {/* Mascot in Upload Result (Col 4) */}
            <div className="md:col-span-4 bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center text-center">
              <AIMascot diff={evaluationResult.variance_diff} size="md" showDetails={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

