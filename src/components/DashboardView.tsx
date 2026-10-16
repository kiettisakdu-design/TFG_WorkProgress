import React, { useState, useMemo, useEffect } from 'react';
import { EvaluationRecord, AppSettings, UserRole } from '../types';
import { AIMascot } from './AIMascot';
import { SCurveChart } from './SCurveChart';
import { PhotoGallery } from './PhotoGallery';
import { generateSCurveData, PROVINCES_LIST, CONTRACTORS_LIST } from '../utils/sampleData';
import {
  Calendar,
  MapPin,
  Building,
  UserCheck,
  TrendingUp,
  Percent,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';

interface DashboardViewProps {
  evaluations: EvaluationRecord[];
  settings: AppSettings;
  onNavigateUpload: () => void;
  currentRole?: UserRole;
  onDeleteEvaluation?: (id: string) => void;
  activeId?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  evaluations,
  settings,
  onNavigateUpload,
  currentRole,
  onDeleteEvaluation,
  activeId,
}) => {
  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedContractor, setSelectedContractor] = useState<string>('ALL');
  const [selectedUploadDate, setSelectedUploadDate] = useState<string>('ALL');

  // Selected Active Evaluation for Deep Inspection
  const [activeEvalId, setActiveEvalId] = useState<string>(activeId || evaluations[0]?.id || '');

  // Delete confirmation modal state (Admin feature for Requirement 1)
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState<EvaluationRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');

  // Sync activeId if parent passes a new target ID
  useEffect(() => {
    if (activeId) {
      setActiveEvalId(activeId);
    }
  }, [activeId]);

  // Extract unique branches, provinces, contractors, and upload dates from current evaluations
  const branchOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.branch_name)));
  }, [evaluations]);

  const provinceOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.province)));
  }, [evaluations]);

  const contractorOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.contractor)));
  }, [evaluations]);

  // Requirement 1: Unique Upload Dates for filtering
  const uploadDateOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.evaluated_date))).sort().reverse();
  }, [evaluations]);

  // Filtered evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => {
      const matchBranch = selectedBranch === 'ALL' || e.branch_name === selectedBranch;
      const matchProvince = selectedProvince === 'ALL' || e.province === selectedProvince;
      const matchContractor = selectedContractor === 'ALL' || e.contractor === selectedContractor;
      const matchUploadDate = selectedUploadDate === 'ALL' || e.evaluated_date === selectedUploadDate;
      return matchBranch && matchProvince && matchContractor && matchUploadDate;
    });
  }, [evaluations, selectedBranch, selectedProvince, selectedContractor, selectedUploadDate]);

  // Current active evaluation record
  const currentRecord = useMemo(() => {
    const found = filteredEvaluations.find((e) => e.id === activeEvalId);
    return found || filteredEvaluations[0] || evaluations[0];
  }, [filteredEvaluations, activeEvalId, evaluations]);

  // Dynamic S-Curve dataset for current record using 10-week standard and Admin baseline plan
  const sCurveData = useMemo(() => {
    if (!currentRecord) return [];
    return generateSCurveData(
      currentRecord.total_weeks || settings.sCurveWeeks || 10,
      currentRecord.calculated_actual_progress,
      currentRecord.baseline_plan_progress,
      currentRecord.evaluated_date,
      currentRecord.delivery_date,
      settings.sCurveBaselinePlan
    );
  }, [currentRecord, settings.sCurveWeeks, settings.sCurveBaselinePlan]);

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    if (!currentRecord?.delivery_date) return null;
    const today = new Date();
    const delivery = new Date(currentRecord.delivery_date);
    const diffTime = delivery.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [currentRecord]);

  return (
    <div className="space-y-6">
      {/* 1. FILTER BAR (Specification 5.1 & User Request 1: กรองข้อมูลตาม สาขา, จังหวัด, ผู้รับเหมา, และวันที่อัปโหลดข้อมูล) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Filter className="w-4 h-4" />
            </div>
            <span>ตัวกรองข้อมูลโครงการ (Project Filters):</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
            {/* 1. Filter วันที่อัปโหลดข้อมูล (User Request 1) */}
            <div className="flex items-center gap-1.5 min-w-[170px]">
              <label className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>วันที่อัปโหลด:</span>
              </label>
              <select
                value={selectedUploadDate}
                onChange={(e) => setSelectedUploadDate(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ALL">ทุกวันที่ ({uploadDateOptions.length})</option>
                {uploadDateOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 min-w-[160px]">
              <label className="text-xs text-slate-400 whitespace-nowrap">สาขา:</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  if (e.target.value !== 'ALL') {
                    const match = evaluations.find((item) => item.branch_name === e.target.value);
                    if (match) setActiveEvalId(match.id);
                  }
                }}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">ทุกสาขา ({branchOptions.length})</option>
                {branchOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Filter */}
            <div className="flex items-center gap-1.5 min-w-[140px]">
              <label className="text-xs text-slate-400 whitespace-nowrap">จังหวัด:</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">ทุกจังหวัด</option>
                {provinceOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Contractor Filter */}
            <div className="flex items-center gap-1.5 min-w-[170px]">
              <label className="text-xs text-slate-400 whitespace-nowrap">ผู้รับเหมา:</label>
              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 truncate"
              >
                <option value="ALL">ทุกผู้รับเหมา</option>
                {contractorOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filter */}
            {(selectedBranch !== 'ALL' ||
              selectedProvince !== 'ALL' ||
              selectedContractor !== 'ALL' ||
              selectedUploadDate !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedBranch('ALL');
                  setSelectedProvince('ALL');
                  setSelectedContractor('ALL');
                  setSelectedUploadDate('ALL');
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Branch Quick Switcher Tags */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 overflow-x-auto scrollbar-thin pb-1">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">เลือกโครงการด่วน:</span>
          {filteredEvaluations.map((item) => {
            const isSelected = item.id === currentRecord?.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveEvalId(item.id)}
                className={`text-xs px-3 py-1 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 font-semibold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.status_flag === 'EXCELLENT'
                      ? 'bg-emerald-400'
                      : item.status_flag === 'ON_TRACK'
                      ? 'bg-sky-400'
                      : item.status_flag === 'WARNING'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span>{item.branch_name}</span>
                <span className="font-mono text-[10px] text-slate-400">({item.calculated_actual_progress}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentRecord ? (
        <>
          {/* 2. TOP HIGHLIGHT & MASCOT HERO CARD (Section 4 Specification) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            {/* Background subtle radial ambient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Project Metadata & Key Metrics */}
            <div className="lg:col-span-8 space-y-5">
              {/* Branch Header & Badges */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                    {currentRecord.id}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentRecord.province}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>ประเมินเมื่อ {currentRecord.evaluated_date}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>สถานะ: {currentRecord.approval_status === 'APPROVED' ? 'อนุมัติเรียบร้อย' : 'รอการตรวจสอบ'}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {currentRecord.branch_name}
                  </h2>
                  {currentRole === 'ADMIN' && onDeleteEvaluation && (
                    <button
                      onClick={() => {
                        setConfirmDeleteRecord(currentRecord);
                        setDeleteReason('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-950/40 active:scale-95 group"
                      title="ลบข้อมูลโครงการที่ได้รับการอนุมัตินี้ (เฉพาะ Admin หากพิจารณาว่าไม่เหมาะสม)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>ลบข้อมูลโครงการนี้ (Admin Only)</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>ผู้รับเหมา: <strong className="text-slate-200">{currentRecord.contractor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ผู้ควบคุมงาน: <strong className="text-slate-200">{currentRecord.supervisor}</strong></span>
                  </div>
                </div>
              </div>

              {/* 4 Primary KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* 1. Actual Progress */}
                <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-3.5 shadow-sm">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                    <span>ความคืบหน้าจริง (Actual)</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {currentRecord.calculated_actual_progress}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    คำนวณจากรูป 4 หมวด
                  </div>
                </div>

                {/* 2. Baseline Plan */}
                <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-3.5 shadow-sm">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                    <span>แผนงานสะสม (Plan)</span>
                    <Percent className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-sky-300">
                    {currentRecord.baseline_plan_progress}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    กำหนดการมาตรฐานสัปดาห์นี้
                  </div>
                </div>

                {/* 3. Variance Diff */}
                <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-3.5 shadow-sm">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                    <span>ส่วนต่างความคืบหน้า</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      currentRecord.variance_diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {currentRecord.variance_diff >= 0 ? '+' : ''}
                    {currentRecord.variance_diff}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Actual - Baseline
                  </div>
                </div>

                {/* 4. AI Confidence Score */}
                <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-3.5 shadow-sm">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                    <span>ความมั่นใจ AI Vision</span>
                    <span className="text-xs">⚡</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {currentRecord.confidence_score}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {currentRecord.confidence_score >= settings.confidenceThreshold
                      ? 'อนุมัติอัตโนมัติ (≥80%)'
                      : 'ผ่านคิวตรวจสอบ (<80%)'}
                  </div>
                </div>
              </div>

              {/* AI Reasoning Summary Callout */}
              <div className="bg-slate-950/80 rounded-xl border border-cyan-900/40 p-3.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-semibold mr-1">🤖 สรุปวิเคราะห์โดย AI PM:</span>
                {currentRecord.summary_reasoning}
              </div>

              {/* Delivery Milestone & Countdown */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>กำหนดส่งมอบงาน: <strong className="text-slate-200">{currentRecord.delivery_date}</strong></span>
                </div>
                {daysRemaining !== null && (
                  <div className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {daysRemaining > 0 ? `เหลือเวลาอีก ${daysRemaining} วัน` : 'ครบกำหนดส่งมอบแล้ว'}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI MASCOT DISPLAY (Section 4: Minimalist 3D Geometric Engineer Mascot) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800 p-5 backdrop-blur-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>👷 AI Engineer Mascot</span>
              </div>

              {/* Render dynamic mascot based on currentRecord.variance_diff */}
              <AIMascot diff={currentRecord.variance_diff} size="lg" showDetails={true} />

              {/* Quick Status Legend Help */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-semibold text-xs">
                  <span>สถานะปัจจุบัน:</span>
                  <span className="font-mono text-cyan-400">{currentRecord.status_flag} ({currentRecord.variance_diff >= 0 ? '+' : ''}{currentRecord.variance_diff.toFixed(1)}%)</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-left pt-1">
                  <div className="bg-emerald-950/40 border border-emerald-900/60 p-1.5 rounded-lg text-emerald-300">
                    <span className="font-bold">≥ +5%:</span> ถ้วยรางวัลสีทอง + ออร่า Emerald
                  </div>
                  <div className="bg-sky-950/40 border border-sky-900/60 p-1.5 rounded-lg text-sky-300">
                    <span className="font-bold">-5% ถึง +5%:</span> ยืนกอดอก + แท็บเล็ต Blueprint
                  </div>
                  <div className="bg-amber-950/40 border border-amber-900/60 p-1.5 rounded-lg text-amber-300">
                    <span className="font-bold">-15% ถึง -5%:</span> กล้อง Cyber เลนส์อำพัน + ป้ายเตือน
                  </div>
                  <div className="bg-rose-950/40 border border-rose-900/60 p-1.5 rounded-lg text-rose-300">
                    <span className="font-bold">&lt; -15%:</span> ธงแดงแหลมคม + คลื่นเตือนภัย
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. S-CURVE GRAPH (Section 5.1: เรียงแกนเวลาสัปดาห์ถอยหลัง Week 0 ขวาสุด) */}
          <SCurveChart
            data={sCurveData}
            currentWeekDiff={currentRecord.variance_diff}
          />

          {/* 4. 4-CATEGORY PHOTO GALLERY (Section 5.1 & Section 2) */}
          <PhotoGallery
            photos={currentRecord.photos}
            scores={currentRecord.category_scores}
            weights={settings.weights}
          />
        </>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center space-y-4">
          <div className="text-4xl">📂</div>
          <h3 className="text-base font-semibold text-slate-200">ยังไม่มีข้อมูลโครงการที่ตรงกับตัวกรอง</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            คุณสามารถเปลี่ยนตัวกรอง หรืออัปโหลดรูปภาพไซต์งานใหม่เพื่อเริ่มวิเคราะห์ความคืบหน้าด้วยระบบ AI
          </p>
          <button
            onClick={onNavigateUpload}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
          >
            ไปที่หน้าอัปโหลดรูปภาพ (AI Upload)
          </button>
        </div>
      )}

      {/* Admin Delete Confirmation Modal (Requirement 1: อนุญาตให้ Admin ลบข้อมูลที่ได้รับอนุมัติแล้วได้ ถ้าพิจารณาว่าไม่เหมาะสม) */}
      {confirmDeleteRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                <span className="p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <span>ยืนยันการลบข้อมูลโครงการ (เฉพาะ Admin)</span>
              </div>
              <button
                onClick={() => setConfirmDeleteRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>คำเตือน: คุณกำลังจะลบข้อมูลโครงการที่ได้รับการอนุมัติแล้ว</span>
              </div>
              <p className="text-rose-200/80 leading-relaxed">
                การลบข้อมูลนี้จะนำผลการประเมินออกจากระบบ Dashboard ทันที เหมาะสำหรับกรณีที่ตรวจสอบพบว่าข้อมูลไม่ถูกต้อง ส่งซ้ำ หรือพิจารณาแล้วว่าไม่เหมาะสมตามดุลยพินิจของ Admin
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500 font-medium">ชื่อสาขาโครงการ:</span>
                <strong className="text-white text-sm">{confirmDeleteRecord.branch_name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500 font-medium">รหัสอ้างอิง:</span>
                <span className="font-mono text-cyan-300">{confirmDeleteRecord.id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500 font-medium">วันที่อัปโหลด:</span>
                <span className="text-slate-200">{confirmDeleteRecord.evaluated_date}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500 font-medium">ความคืบหน้าจริง (Actual):</span>
                <span className="font-bold text-emerald-400">{confirmDeleteRecord.calculated_actual_progress}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500 font-medium">สถานะปัจจุบัน:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {confirmDeleteRecord.approval_status === 'APPROVED' ? 'อนุมัติเรียบร้อยแล้ว' : confirmDeleteRecord.approval_status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ระบุเหตุผลในการลบ (ถ้ามี):
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="เช่น ข้อมูลไม่ถูกต้องตามมาตรฐาน, รูปภาพผิดหมวด, ไม่เหมาะสม"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteEvaluation && confirmDeleteRecord) {
                    onDeleteEvaluation(confirmDeleteRecord.id);
                    setConfirmDeleteRecord(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันการลบข้อมูลโครงการ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
