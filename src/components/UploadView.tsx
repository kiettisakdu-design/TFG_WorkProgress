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
  const [branchName, setBranchName] = useState('สาขา พัทยา บีช');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('2026-12-15');
  const [totalWeeks, setTotalWeeks] = useState(settings.sCurveWeeks || 12);
  const [province, setProvince] = useState('ชลบุรี');
  const [contractor, setContractor] = useState('บจก. สยาม คอนสตรัคชั่น บิลเดอร์');
  const [supervisor, setSupervisor] = useState('วิศวกร ภานุวัฒน์ สินธุเดชา (วศ.บ. โยธา)');
  const [baselinePlanProgress, setBaselinePlanProgress] = useState(70);

  // Automatic Timeline Calculation (Requirement 5):
  // Calculate Start Date backward from Delivery Date by TotalWeeks
  const totalDays = totalWeeks * 7;
  const delivery = new Date(deliveryDate);
  const startDate = new Date(delivery.getTime() - totalDays * 24 * 60 * 60 * 1000);
  const upload = new Date(uploadDate);
  const daysRemaining = Math.ceil((delivery.getTime() - upload.getTime()) / (24 * 60 * 60 * 1000));
  const daysElapsed = Math.max(0, totalDays - daysRemaining);
  const calculatedCurrentWeek = Math.min(totalWeeks, Math.max(0, Math.round(daysElapsed / 7)));
  const startDateFormatted = !isNaN(startDate.getTime()) ? startDate.toISOString().split('T')[0] : '';

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [compressingKey, setCompressingKey] = useState<keyof PhotoData | null>(null);

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

    if (presetType === 'EXCELLENT') {
      setBranchName('สาขา สยามสแควร์ (อัปเดตใหม่)');
      setProvince('กรุงเทพฯ');
      setBaselinePlanProgress(75);
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'หน้าร้านสยามสแควร์ ป้ายไฟและกระจกพร้อม', 92),
        interior: generateSampleConstructionImage('interior', 'ห้องโถงหลัก ปูพื้นแกรนิตโต้และแอร์ทำงานได้', 90),
        rear: generateSampleConstructionImage('rear', 'ด้านหลังอาคาร ถังบำบัดน้ำและประตูนิรภัย', 85),
        parking: generateSampleConstructionImage('parking', 'ลานจอดรถ ตีเส้นช่องจอดและติดตั้งเสาไฟโซลาร์', 88),
      });
    } else if (presetType === 'ON_TRACK') {
      setBranchName('สาขา หาดใหญ่ เซ็นทรัล');
      setProvince('สงขลา');
      setBaselinePlanProgress(60);
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'ด้านหน้าอาคารสาขาหาดใหญ่ ติดตั้งกรอบกระจก', 62),
        interior: generateSampleConstructionImage('interior', 'งานเดินท่อร้อยสายไฟและติดตั้งฝ้าฉาบเรียบ', 60),
        rear: generateSampleConstructionImage('rear', 'ผนังด้านหลังก่ออิฐมวลเบาเสร็จสิ้น', 64),
        parking: generateSampleConstructionImage('parking', 'บดอัดหินคลุกเตรียมเทคอนกรีตลานจอด', 58),
      });
    } else if (presetType === 'WARNING') {
      setBranchName('สาขา หัวหิน มาร์เก็ต');
      setProvince('ประจวบคีรีขันธ์');
      setBaselinePlanProgress(70);
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'หน้าร้านหัวหิน ติดตั้งโครงเหล็กค้างอยู่', 60),
        interior: generateSampleConstructionImage('interior', 'งานฝ้าภายในรอยิปซั่มบอร์ดและช่างแอร์', 55),
        rear: generateSampleConstructionImage('rear', 'ประตูหลังร้านยังไม่ได้ติดบาน', 62),
        parking: generateSampleConstructionImage('parking', 'ลานจอดรถมีน้ำขังจากฝนตก รอแห้ง', 50),
      });
    } else {
      setBranchName('สาขา เชียงราย เมืองใหม่');
      setProvince('เชียงราย');
      setBaselinePlanProgress(65);
      setPhotos({
        facade: generateSampleConstructionImage('facade', 'หน้าร้านโครงสร้างคานเปล่า ยังไม่ได้มุงหลังคา', 35),
        interior: generateSampleConstructionImage('interior', 'ภายในไม่มีการเดินสายไฟ กองอิฐกระจัดกระจาย', 30),
        rear: generateSampleConstructionImage('rear', 'ผนังหลังร้านรื้อถอนยังไม่เสร็จ', 40),
        parking: generateSampleConstructionImage('parking', 'ลานจอดรถยังเป็นดินโคลน รถเข้าไม่ได้', 25),
      });
    }
  };

  // Run AI Vision Evaluation
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
          baseline_plan_progress: baselinePlanProgress,
          weights: settings.weights,
          confidence_threshold: settings.confidenceThreshold,
          photos,
        }),
      });

      setAnalysisStep('3/4 คำนวณความคืบหน้ารวมแบบถ่วงน้ำหนัก และเปรียบเทียบกับ Baseline Plan...');
      await new Promise((r) => setTimeout(r, 400));

      // Safe HTTP response parsing to prevent "Unexpected token 'T', 'The page c...' is not valid JSON"
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

      setAnalysisStep('4/4 ประเมินเกณฑ์ความมั่นใจ AI และบันทึกผลเข้าระบบ...');
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
        baseline_plan_progress: evalData.baseline_plan_progress,
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
      onEvaluationComplete(record);

      // Optional: Auto sync to Google Sheets if configured
      if (settings.autoSyncToSheets && settings.googleWebAppUrl) {
        fetch('/api/sync-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webAppUrl: settings.googleWebAppUrl,
            action: 'addEvaluation',
            payload: record,
          }),
        }).catch((err) => console.error('Auto sync to sheet failed:', err));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประเมินด้วย AI Vision');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
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

      {/* 2.2 PROJECT METADATA FORM (1.5 - 1.10) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>📋</span> 2.2 ข้อมูลกำกับโครงการ (Project Metadata 1.5 - 1.10)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
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

          {/* 1.6 วันที่อัปโหลดข้อมูล */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.6 วันที่อัปโหลดข้อมูล (YYYY-MM-DD) <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 1.7 วันที่ส่งมอบงาน */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.7 วันที่ส่งมอบงาน (YYYY-MM-DD) <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* ระยะเวลารวมของโครงการ (TotalWeeks) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              ระยะเวลารวมโครงการ (Total Weeks) <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="4"
                max="52"
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(Math.max(4, Math.min(52, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-slate-400 text-xs whitespace-nowrap">สัปดาห์</span>
            </div>
          </div>

          {/* 1.8 พิกัดตำแหน่ง */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1.8 พิกัดตำแหน่ง (ชื่อจังหวัดในไทย) <span className="text-rose-400">*</span>
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

          {/* Baseline Plan Progress % */}
          <div className="sm:col-span-2 lg:col-span-3 pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-medium">
                แผนงานสะสมตามเป้าหมาย (Baseline Plan Progress %): <span className="text-cyan-400 font-mono font-bold">{baselinePlanProgress}%</span>
              </label>
              <span className="text-[11px] text-slate-400">สำหรับนำมาคำนวณส่วนต่าง Diff = Actual - Plan</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={baselinePlanProgress}
              onChange={(e) => setBaselinePlanProgress(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Dynamic Project Timeline Calculation Banner (Requirement 5) */}
          <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span>⏱️</span>
                <span>การคำนวณตารางเวลาโครงการและสัปดาห์อัตโนมัติ (Project Timeline):</span>
              </span>
              <span className="font-mono text-[11px] bg-cyan-900/60 px-2 py-0.5 rounded text-cyan-200">
                สัปดาห์ปัจจุบัน: Week {calculatedCurrentWeek} / {totalWeeks}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">วันเริ่มงาน (Week 0):</span>
                <strong className="text-slate-200 font-mono">{startDateFormatted || 'คำนวณอัตโนมัติ'}</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">วันที่อัปโหลดข้อมูลประเมิน:</span>
                <strong className="text-cyan-300 font-mono">{uploadDate} (Week {calculatedCurrentWeek})</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">วันส่งมอบงาน (Week {totalWeeks} ขวาสุด):</span>
                <strong className="text-emerald-300 font-mono">{deliveryDate} (เหลือ {daysRemaining} วัน)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit / Trigger Button */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>
              ระบบจะประเมินคะแนนความมั่นใจ (Confidence Score): หาก &ge; {settings.confidenceThreshold}% จะอนุมัติอัตโนมัติ หาก &lt; {settings.confidenceThreshold}% จะถูกส่งเข้าคิวรอการตรวจสอบ
            </span>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30'
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

      {/* EVALUATION RESULT REPORT CARD */}
      {evaluationResult && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border-2 border-cyan-500/50 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                      ? 'อนุมัติอัตโนมัติ (Auto-Approved) เผยแพร่ทันที'
                      : 'รอตรวจสอบในคิวอนุมัติ (Pending Supervisor Review)'}
                  </span>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                ผลการประเมิน: {evaluationResult.branch_name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {canNavigateDashboard && onNavigateDashboard ? (
                <button
                  onClick={onNavigateDashboard}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>ดูใน Dashboard และกราฟ S-Curve</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>บันทึกผลงานสำเร็จ (ผู้รับเหมา)</span>
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
                  <span>แผนงานสะสม: {evaluationResult.baseline_plan_progress}%</span>
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
