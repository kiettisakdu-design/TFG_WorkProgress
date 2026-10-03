import React, { useState } from 'react';
import { AppSettings, PhotoCategoryWeights, UserRole } from '../types';
import {
  Settings,
  Sliders,
  Calendar,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  ShieldAlert,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  currentRole: UserRole;
  onSaveSettings: (newSettings: AppSettings) => void;
  onAuthenticateAdmin?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentRole,
  onSaveSettings,
  onAuthenticateAdmin,
}) => {
  const [weights, setWeights] = useState<PhotoCategoryWeights>({ ...settings.weights });
  const [sCurveWeeks, setSCurveWeeks] = useState<number>(settings.sCurveWeeks);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(settings.confidenceThreshold);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Requirement 1: Only Admin can access and configure settings
  if (currentRole !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Only)</h3>
          <p className="text-xs text-slate-400 mt-1">
            คุณกำลังเข้าสู่ระบบด้วยสิทธิ์ <strong className="text-amber-400">{currentRole}</strong> การตั้งค่าระบบอนุญาตให้เฉพาะ Admin เท่านั้น
          </p>
        </div>
        {onAuthenticateAdmin && (
          <button
            onClick={onAuthenticateAdmin}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>เข้าสู่ระบบด้วยรหัสผ่าน Admin</span>
          </button>
        )}
      </div>
    );
  }

  const totalWeight = weights.front + weights.interior + weights.rear + weights.parking;
  const isWeightValid = totalWeight === 100;

  // Auto balance weights to 100%
  const handleAutoBalance = () => {
    if (totalWeight === 0) {
      setWeights({ front: 30, interior: 40, rear: 15, parking: 15 });
      return;
    }
    const factor = 100 / totalWeight;
    const f = Math.round(weights.front * factor);
    const i = Math.round(weights.interior * factor);
    const r = Math.round(weights.rear * factor);
    const p = 100 - (f + i + r);
    setWeights({ front: f, interior: i, rear: r, parking: p });
  };

  const handleResetDefaults = () => {
    setWeights({ front: 30, interior: 40, rear: 15, parking: 15 });
    setSCurveWeeks(12);
    setConfidenceThreshold(80);
  };

  const handleSave = () => {
    if (!isWeightValid) return;
    onSaveSettings({
      ...settings,
      weights,
      sCurveWeeks,
      confidenceThreshold,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              ตั้งค่าระบบผู้ดูแล (Admin Settings)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ปรับสัดส่วนการถ่วงน้ำหนักรูปภาพ, จำนวนสัปดาห์บนแกน S-Curve, และเกณฑ์ Confidence Score
            </p>
          </div>
        </div>
      </div>

      {/* 1. PHOTO WEIGHTS SETTING (Specification 5.4: สไลเดอร์ปรับสัดส่วน Weight % ของทั้ง 4 หมวด รวม 100%) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              1. สัดส่วนน้ำหนักการประเมินรูปภาพ 4 หมวดหลัก (Photo Category Weights)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                isWeightValid
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
              }`}
            >
              ผลรวมน้ำหนัก: {totalWeight}% {isWeightValid ? '✓ ถูกต้อง' : '✗ ต้องเท่ากับ 100%'}
            </span>
            {!isWeightValid && (
              <button
                onClick={handleAutoBalance}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                ปรับสมดุล 100%
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Facade */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">1.1 รูปด้านหน้าอาคาร (Facade)</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">{weights.front}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.front}
              onChange={(e) => setWeights({ ...weights, front: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              ป้ายร้าน, กระจกหน้าหน้าร้าน, โครงสร้างเสา/คานด้านหน้า, ประตูทางเข้าหลัก
            </p>
          </div>

          {/* Interior */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">1.2 รูปภายในอาคาร (Interior)</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">{weights.interior}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.interior}
              onChange={(e) => setWeights({ ...weights, interior: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              งานฝ้าเพดาน, ระบบไฟฟ้า/เครื่องปรับอากาศ, งานปูพื้น, การกั้นห้อง, Built-in
            </p>
          </div>

          {/* Rear */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">1.3 รูปด้านหลังอาคาร (Rear)</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">{weights.rear}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.rear}
              onChange={(e) => setWeights({ ...weights, rear: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              ประตูทางออกหลังร้าน, พื้นที่เก็บของ, ระบบบำบัด/งานสุขาภิบาล, โครงสร้างผนัง
            </p>
          </div>

          {/* Parking Area */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">1.4 รูปพื้นลานจอดรถ (Parking Area)</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">{weights.parking}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.parking}
              onChange={(e) => setWeights({ ...weights, parking: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              งานเทคอนกรีต/แอสฟัลต์, เส้นจราจร/ช่องจอด, ไฟส่องสว่าง, ระบบระบายน้ำ
            </p>
          </div>
        </div>
      </div>

      {/* 2. S-CURVE WEEKS & CONFIDENCE THRESHOLD SETTING (Specification 5.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* S-Curve Weeks Slider (4 - 52 weeks) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                จำนวนสัปดาห์บนแกน S-Curve
              </h3>
              <p className="text-[11px] text-slate-400">ช่วงเวลาถอยหลัง (4 - 52 สัปดาห์)</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">ความยาวแกนเวลา:</span>
              <span className="text-cyan-400 font-mono font-bold text-base">{sCurveWeeks} สัปดาห์</span>
            </div>
            <input
              type="range"
              min="4"
              max="52"
              value={sCurveWeeks}
              onChange={(e) => setSCurveWeeks(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4 สัปดาห์ (1 เดือน)</span>
              <span>12 สัปดาห์ (3 เดือน)</span>
              <span>52 สัปดาห์ (1 ปี)</span>
            </div>
          </div>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                เกณฑ์ AI Confidence Threshold
              </h3>
              <p className="text-[11px] text-slate-400">ตัดเข้าคิวอนุมัติอัตโนมัติ</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">เกณฑ์ความมั่นใจขั้นต่ำ:</span>
              <span className="text-cyan-400 font-mono font-bold text-base">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              หาก AI ประเมินได้คะแนน &ge; {confidenceThreshold}% ระบบจะเผยแพร่ผลทันที หาก &lt; {confidenceThreshold}% จะถูกส่งเข้า Approval Queue
            </p>
          </div>
        </div>
      </div>

      {/* Save / Reset Action Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handleResetDefaults}
          className="text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>คืนค่าเริ่มต้นตามสเปก (30/40/15/15, 12 สัปดาห์, 80%)</span>
        </button>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={!isWeightValid}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-xl transition-all flex items-center gap-2 ${
              isWeightValid
                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                : 'bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่า (Save Settings)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
