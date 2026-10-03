import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { SettingsView } from './components/SettingsView';
import { GoogleSheetHub } from './components/GoogleSheetHub';
import { EvaluationRecord, AppSettings, UserRole } from './types';
import { INITIAL_EVALUATIONS } from './utils/sampleData';
import {
  Building2,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';

const STORAGE_KEY_EVALUATIONS = 'shop_tfm_evaluations_v2';
const STORAGE_KEY_SETTINGS = 'shop_tfm_settings_v2';
const STORAGE_KEY_ROLE = 'shop_tfm_role_v2';

const DEFAULT_SETTINGS: AppSettings = {
  weights: {
    front: 30,
    interior: 40,
    rear: 15,
    parking: 15,
  },
  sCurveWeeks: 12,
  confidenceThreshold: 80,
  googleSheetId: '',
  googleWebAppUrl: '',
  autoSyncToSheets: false,
};

export default function App() {
  // Evaluations state (persisted)
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EVALUATIONS;
  });

  // Settings state (persisted)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  // Role state (persisted)
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved) return saved as UserRole;
    } catch (e) {
      console.error(e);
    }
    return 'ADMIN';
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'upload' | 'queue' | 'settings' | 'sheets'>('dashboard');

  // Active target evaluation ID to focus on dashboard
  const [targetEvalId, setTargetEvalId] = useState<string>('');

  // Toast / Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
    } catch (e) {
      console.error(e);
    }
  }, [evaluations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
    } catch (e) {
      console.error(e);
    }
  }, [currentRole]);

  // Handle new evaluation completed in UploadView
  const handleEvaluationComplete = (newRecord: EvaluationRecord) => {
    setEvaluations((prev) => [newRecord, ...prev.filter((item) => item.id !== newRecord.id)]);
    if (newRecord.approval_status === 'APPROVED') {
      showToast(`ผลประเมิน ${newRecord.branch_name} อนุมัติอัตโนมัติ (Confidence ${newRecord.confidence_score}%)`, 'success');
    } else {
      showToast(`ผลประเมิน ${newRecord.branch_name} ส่งเข้าคิวอนุมัติแล้ว (Confidence ${newRecord.confidence_score}% < ${settings.confidenceThreshold}%)`, 'info');
    }
  };

  // Approve queue item
  const handleApprove = (id: string, updatedFields?: Partial<EvaluationRecord>) => {
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            approval_status: 'APPROVED',
            approved_by: updatedFields?.approved_by || `${currentRole} (${new Date().toLocaleTimeString('th-TH')})`,
            approved_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showToast('อนุมัติผลประเมินโครงการและเผยแพร่สู่ Dashboard แล้ว', 'success');
  };

  // Reject queue item
  const handleReject = (id: string, reason: string) => {
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            approval_status: 'REJECTED',
            summary_reasoning: `${item.summary_reasoning} [ส่งกลับแก้ไข: ${reason}]`,
          };
        }
        return item;
      })
    );
    showToast('ส่งกลับแก้ไขรายการเรียบร้อยแล้ว', 'warn');
  };

  // Count pending items for badge
  const pendingCount = evaluations.filter((item) => item.approval_status === 'PENDING_APPROVAL').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        pendingQueueCount={pendingCount}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                : toast.type === 'warn'
                ? 'bg-rose-950/90 border-rose-700 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-700 text-cyan-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Info className="w-4 h-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            evaluations={evaluations.filter((i) => i.approval_status === 'APPROVED' || currentRole !== 'CONTRACTOR')}
            settings={settings}
            onNavigateUpload={() => setCurrentTab('upload')}
          />
        )}

        {currentTab === 'upload' && (
          <UploadView
            settings={settings}
            onEvaluationComplete={handleEvaluationComplete}
            onNavigateDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'queue' && (
          <ApprovalQueueView
            evaluations={evaluations}
            currentRole={currentRole}
            settings={settings}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewInDashboard={(id) => {
              setTargetEvalId(id);
              setCurrentTab('dashboard');
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            currentRole={currentRole}
            onSaveSettings={(newSettings) => {
              setSettings(newSettings);
              showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success');
            }}
            onAuthenticateAdmin={() => {
              const pass = window.prompt('กรุณากรอกรหัสผ่าน Admin:');
              if (pass === '112224') {
                setCurrentRole('ADMIN');
                showToast('เข้าสู่ระบบสิทธิ์ Admin สำเร็จ', 'success');
              } else if (pass !== null) {
                showToast('รหัสผ่านไม่ถูกต้อง', 'warn');
              }
            }}
          />
        )}

        {currentTab === 'sheets' && (
          <GoogleSheetHub
            settings={settings}
            evaluations={evaluations}
            onSaveSettings={(newSettings) => {
              setSettings(newSettings);
              showToast('บันทึกการเชื่อมต่อ Google Sheets แล้ว', 'success');
            }}
            onImportEvaluations={(imported) => {
              setEvaluations(imported);
              showToast(`นำเข้าข้อมูลจาก Google Sheets สำเร็จ (${imported.length} รายการ)`, 'success');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">Shop TFM Construction Tracker</span>
            <span>•</span>
            <span>เวอร์ชัน 2.0 (ตุลาคม 2026)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ระบบปัญญาประดิษฐ์ AI Vision ร่วมกับ Google Sheets Database</span>
            <span>•</span>
            <span className="text-cyan-400">Google Apps Script Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
