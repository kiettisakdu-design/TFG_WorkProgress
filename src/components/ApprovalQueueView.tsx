import React, { useState } from 'react';
import { EvaluationRecord, UserRole, AppSettings } from '../types';
import { AIMascot } from './AIMascot';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Clock,
  User,
  Calendar,
  Layers,
} from 'lucide-react';

interface ApprovalQueueViewProps {
  evaluations: EvaluationRecord[];
  currentRole: UserRole;
  settings: AppSettings;
  onApprove: (id: string, updatedRecord?: Partial<EvaluationRecord>) => void;
  onReject: (id: string, reason: string) => void;
  onViewInDashboard: (id: string) => void;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  evaluations,
  currentRole,
  settings,
  onApprove,
  onReject,
  onViewInDashboard,
}) => {
  const [filterTab, setFilterTab] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<{
    front_facade: number;
    interior: number;
    rear_building: number;
    parking_area: number;
  }>({ front_facade: 0, interior: 0, rear_building: 0, parking_area: 0 });

  // Filter items
  const queueItems = evaluations.filter((item) => {
    if (filterTab === 'PENDING') return item.approval_status === 'PENDING_APPROVAL';
    if (filterTab === 'APPROVED') return item.approval_status === 'APPROVED';
    if (filterTab === 'REJECTED') return item.approval_status === 'REJECTED';
    return true;
  });

  const pendingCount = evaluations.filter((i) => i.approval_status === 'PENDING_APPROVAL').length;
  const canApprove = currentRole === 'ADMIN' || currentRole === 'SUPERVISOR';

  const handleStartEdit = (item: EvaluationRecord) => {
    setEditingId(item.id);
    setEditScores({
      front_facade: item.category_scores.front_facade,
      interior: item.category_scores.interior,
      rear_building: item.category_scores.rear_building,
      parking_area: item.category_scores.parking_area,
    });
  };

  const handleSaveEditAndApprove = (item: EvaluationRecord) => {
    // Recalculate
    const wFront = settings.weights.front / 100;
    const wInt = settings.weights.interior / 100;
    const wRear = settings.weights.rear / 100;
    const wPark = settings.weights.parking / 100;

    const newActual = parseFloat(
      (
        editScores.front_facade * wFront +
        editScores.interior * wInt +
        editScores.rear_building * wRear +
        editScores.parking_area * wPark
      ).toFixed(1)
    );
    const newDiff = parseFloat((newActual - item.baseline_plan_progress).toFixed(1));

    let newStatus = 'ON_TRACK';
    if (newDiff >= 5) newStatus = 'EXCELLENT';
    else if (newDiff >= -5) newStatus = 'ON_TRACK';
    else if (newDiff >= -15) newStatus = 'WARNING';
    else newStatus = 'CRITICAL';

    onApprove(item.id, {
      category_scores: editScores,
      calculated_actual_progress: newActual,
      variance_diff: newDiff,
      status_flag: newStatus as any,
      confidence_score: Math.max(item.confidence_score, 85), // calibrated by human
      approved_by: `${currentRole === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ควบคุมงาน (Supervisor)'} [ปรับจูนค่าคะแนน]`,
      approved_at: new Date().toISOString(),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                <CheckSquare className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                คิวอนุมัติผลประเมิน AI (Confidence Approval Queue)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ระบบส่งผลประเมินที่ AI Confidence Score &lt; {settings.confidenceThreshold}% มายังคิวนี้เพื่อรอการยืนยันจาก Admin/Supervisor
            </p>
          </div>

          {/* Role Status Tag */}
          <div className="flex items-center gap-2">
            {!canApprove ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-medium">
                <ShieldAlert className="w-4 h-4" />
                <span>โหมดดูอย่างเดียว (ผู้รับเหมาไม่มีสิทธิ์อนุมัติ)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>คุณมีสิทธิ์อนุมัติ ({currentRole})</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterTab === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>รอการอนุมัติ (Pending)</span>
            {pendingCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterTab === 'PENDING' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === 'ALL'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด ({evaluations.length})
          </button>

          <button
            onClick={() => setFilterTab('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            อนุมัติแล้ว ({evaluations.filter((i) => i.approval_status === 'APPROVED').length})
          </button>

          <button
            onClick={() => setFilterTab('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            ส่งกลับแก้ไข ({evaluations.filter((i) => i.approval_status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {/* Queue List */}
      {queueItems.length > 0 ? (
        <div className="space-y-4">
          {queueItems.map((item) => {
            const isPending = item.approval_status === 'PENDING_APPROVAL';
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 transition-all shadow-lg bg-slate-900/90 ${
                  isPending ? 'border-amber-500/50 bg-slate-900/95 shadow-amber-950/20' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Item Info */}
                  <div className="space-y-1.5 flex-1 min-w-[280px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                          item.approval_status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : item.approval_status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                        }`}
                      >
                        {item.approval_status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {item.approval_status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                        {item.approval_status === 'PENDING_APPROVAL' && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>
                          {item.approval_status === 'APPROVED'
                            ? 'อนุมัติแล้ว'
                            : item.approval_status === 'REJECTED'
                            ? 'ส่งกลับแก้ไขแล้ว'
                            : `รออนุมัติ (Confidence ${item.confidence_score}% < ${settings.confidenceThreshold}%)`}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        จังหวัด {item.province}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.branch_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span>ผู้รับเหมา: <strong className="text-slate-200">{item.contractor}</strong></span>
                      <span>•</span>
                      <span>ผู้ควบคุมงาน: <strong className="text-slate-200">{item.supervisor}</strong></span>
                      <span>•</span>
                      <span>วันที่ส่งมอบ: <strong className="text-slate-200">{item.delivery_date}</strong></span>
                    </div>
                  </div>

                  {/* Mascot mini preview */}
                  <div className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <AIMascot diff={item.variance_diff} size="sm" showDetails={false} />
                    <div className="text-left ml-2">
                      <div className="text-[10px] text-slate-400">ความคืบหน้าจริง</div>
                      <div className="text-base font-bold font-mono text-emerald-400">
                        {item.calculated_actual_progress}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        แผน {item.baseline_plan_progress}% (Diff {item.variance_diff > 0 ? '+' : ''}{item.variance_diff}%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Previews */}
                <div className="grid grid-cols-4 gap-2 my-4">
                  {(['facade', 'interior', 'rear', 'parking'] as const).map((key) => {
                    const url = item.photos[key];
                    const label = {
                      facade: 'หน้าร้าน 30%',
                      interior: 'ภายใน 40%',
                      rear: 'หลังร้าน 15%',
                      parking: 'ลานจอด 15%',
                    }[key];
                    const scoreKey = {
                      facade: 'front_facade',
                      interior: 'interior',
                      rear: 'rear_building',
                      parking: 'parking_area',
                    }[key] as keyof typeof item.category_scores;

                    return (
                      <div key={key} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                        <div className="aspect-[4/3] bg-slate-900">
                          {url ? (
                            <img src={url} alt={label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                              ไม่มีรูป
                            </div>
                          )}
                        </div>
                        <div className="p-1.5 bg-slate-950/90 text-[10px] flex justify-between items-center">
                          <span className="text-slate-400 truncate">{label}</span>
                          <span className="font-mono font-bold text-cyan-400">{item.category_scores[scoreKey]}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reasoning summary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 mb-4 leading-relaxed">
                  <span className="text-cyan-400 font-semibold mr-1">🤖 เหตุผลการวิเคราะห์ AI:</span>
                  {item.summary_reasoning}
                  {item.approved_by && (
                    <div className="mt-1 pt-1 border-t border-slate-800/60 text-[11px] text-emerald-400">
                      ✓ อนุมัติโดย: {item.approved_by}
                    </div>
                  )}
                </div>

                {/* Score Adjustment Editor (If Admin/Supervisor clicked Edit) */}
                {isEditing && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-cyan-700/60 mb-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                      <span>🛠️ ปรับแก้คะแนนการประเมินด้วยตนเอง (Manual Override):</span>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        ยกเลิก
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">หน้าร้าน (Facade 30%):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editScores.front_facade}
                          onChange={(e) =>
                            setEditScores({ ...editScores, front_facade: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">ภายใน (Interior 40%):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editScores.interior}
                          onChange={(e) =>
                            setEditScores({ ...editScores, interior: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">หลังร้าน (Rear 15%):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editScores.rear_building}
                          onChange={(e) =>
                            setEditScores({ ...editScores, rear_building: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">ลานจอด (Parking 15%):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editScores.parking_area}
                          onChange={(e) =>
                            setEditScores({ ...editScores, parking_area: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleSaveEditAndApprove(item)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        บันทึกการปรับแก้และอนุมัติทันที
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Supervisor & Admin */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => onViewInDashboard(item.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    <span>ดูรายละเอียดใน Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {canApprove && isPending && (
                      <>
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>ปรับจูน %</span>
                        </button>
                        <button
                          onClick={() => onReject(item.id, 'ภาพไม่ชัดเจน หรือไม่ตรงตามจุดตรวจ')}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ส่งกลับแก้ไข</span>
                        </button>
                        <button
                          onClick={() =>
                            onApprove(item.id, {
                              approved_by: currentRole === 'ADMIN' ? 'Admin (191225)' : 'Supervisor',
                              approved_at: new Date().toISOString(),
                            })
                          }
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>อนุมัติและเผยแพร่</span>
                        </button>
                      </>
                    )}

                    {!canApprove && isPending && (
                      <span className="text-[11px] text-slate-500 italic">
                        * รอผู้ควบคุมงาน (Supervisor) หรือ Admin ดำเนินการอนุมัติ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
          <div className="text-4xl">✨</div>
          <h3 className="text-base font-semibold text-slate-200">ไม่มีรายการในคิว</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ผลการประเมินทั้งหมดได้รับการอนุมัติเรียบร้อย หรือยังไม่มีรายการที่ AI มีค่าความมั่นใจต่ำกว่า {settings.confidenceThreshold}%
          </p>
        </div>
      )}
    </div>
  );
};
