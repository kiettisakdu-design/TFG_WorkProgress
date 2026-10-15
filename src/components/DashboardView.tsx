import React, { useState, useMemo } from 'react';
import { EvaluationRecord, AppSettings } from '../types';
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
} from 'lucide-react';

interface DashboardViewProps {
  evaluations: EvaluationRecord[];
  settings: AppSettings;
  onNavigateUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  evaluations,
  settings,
  onNavigateUpload,
}) => {
  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedContractor, setSelectedContractor] = useState<string>('ALL');

  // Selected Active Evaluation for Deep Inspection
  const [activeEvalId, setActiveEvalId] = useState<string>(evaluations[0]?.id || '');

  // Extract unique branches, provinces, contractors from current evaluations
  const branchOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.branch_name)));
  }, [evaluations]);

  const provinceOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.province)));
  }, [evaluations]);

  const contractorOptions = useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.contractor)));
  }, [evaluations]);

  // Filtered evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => {
      const matchBranch = selectedBranch === 'ALL' || e.branch_name === selectedBranch;
      const matchProvince = selectedProvince === 'ALL' || e.province === selectedProvince;
      const matchContractor = selectedContractor === 'ALL' || e.contractor === selectedContractor;
      return matchBranch && matchProvince && matchContractor;
    });
  }, [evaluations, selectedBranch, selectedProvince, selectedContractor]);

  // Current active evaluation record
  const currentRecord = useMemo(() => {
    const found = filteredEvaluations.find((e) => e.id === activeEvalId);
    return found || filteredEvaluations[0] || evaluations[0];
  }, [filteredEvaluations, activeEvalId, evaluations]);

  // Dynamic S-Curve dataset for current record
  const sCurveData = useMemo(() => {
    if (!currentRecord) return [];
    return generateSCurveData(
      currentRecord.total_weeks || settings.sCurveWeeks || 12,
      currentRecord.calculated_actual_progress,
      currentRecord.baseline_plan_progress,
      currentRecord.evaluated_date,
      currentRecord.delivery_date
    );
  }, [currentRecord, settings.sCurveWeeks]);

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
      {/* 1. FILTER BAR (Specification 5.1: สามารถกรองข้อมูลตาม สาขา, จังหวัด, และ ผู้รับเหมา ได้) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Filter className="w-4 h-4" />
            </div>
            <span>ตัวกรองข้อมูลโครงการ (Project Filters):</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 min-w-[160px]">
              <label className="text-xs text-slate-400">สาขา:</label>
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
              <label className="text-xs text-slate-400">จังหวัด:</label>
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
              <label className="text-xs text-slate-400">ผู้รับเหมา:</label>
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
            {(selectedBranch !== 'ALL' || selectedProvince !== 'ALL' || selectedContractor !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedBranch('ALL');
                  setSelectedProvince('ALL');
                  setSelectedContractor('ALL');
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
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

                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentRecord.branch_name}
                </h2>
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
    </div>
  );
};
