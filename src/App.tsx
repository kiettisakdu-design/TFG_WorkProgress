import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { SettingsView } from './components/SettingsView';
import { GoogleSheetHub } from './components/GoogleSheetHub';
import { EvaluationRecord, AppSettings, UserRole, UserAccount } from './types';
import { INITIAL_EVALUATIONS, DEFAULT_SCURVE_10_WEEKS } from './utils/sampleData';
import {
  DEFAULT_GOOGLE_WEBAPP_URL,
  fetchEvaluationsFromSheets,
  saveEvaluationToSheets,
  updateStatusInSheets,
} from './utils/googleSheetsIntegration';
import {
  getStoredCurrentUser,
  setStoredCurrentUser,
  getStoredUsers,
  updateUserRole,
  createNewUser,
  updateUserDetails,
  deleteUserAccount,
} from './utils/auth';
import {
  safeLoadEvaluations,
  safeSaveEvaluations,
  STORAGE_KEY_SETTINGS,
} from './utils/safeStorage';
import {
  Building2,
  CheckCircle2,
  Info,
} from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  weights: {
    front: 30,
    interior: 40,
    rear: 15,
    parking: 15,
  },
  sCurveWeeks: 10,
  sCurveBaselinePlan: DEFAULT_SCURVE_10_WEEKS,
  confidenceThreshold: 80,
  googleSheetId: '1lmqQ3y7IPv0zB3tH_QoyFebMlZxflhfJ8nIhTM3NscY',
  googleWebAppUrl: DEFAULT_GOOGLE_WEBAPP_URL,
  autoSyncToSheets: true,
};

export default function App() {
  // Current logged in user (null = show Login screen)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getStoredCurrentUser();
  });

  // All registered users (managed by Admin in Settings)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    return getStoredUsers();
  });

  // Effective role derived from currentUser (or fallback 'CONTRACTOR')
  const currentRole: UserRole = currentUser ? currentUser.role : 'CONTRACTOR';

  // Evaluations state (persisted safely without quota exceeded errors)
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    return safeLoadEvaluations(INITIAL_EVALUATIONS);
  });

  // Settings state (persisted)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          sCurveWeeks: 10, // Requirement 3: กำหนดระยะเวลามาตรฐานของทุกโครงการเป็น 10 week
          sCurveBaselinePlan:
            Array.isArray(parsed.sCurveBaselinePlan) && parsed.sCurveBaselinePlan.length === 11
              ? parsed.sCurveBaselinePlan
              : DEFAULT_SCURVE_10_WEEKS,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  // Navigation tab (Contractor default to 'upload')
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'upload' | 'queue' | 'settings' | 'sheets'>(() => {
    const user = getStoredCurrentUser();
    return user?.role === 'CONTRACTOR' ? 'upload' : 'dashboard';
  });

  // Strict RBAC: Force contractor to only ever be on 'upload'
  useEffect(() => {
    if (currentRole === 'CONTRACTOR' && currentTab !== 'upload') {
      setCurrentTab('upload');
    }
  }, [currentRole, currentTab]);

  // Active target evaluation ID to focus on dashboard
  const [targetEvalId, setTargetEvalId] = useState<string>('');

  // Toast / Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Login handler
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setStoredCurrentUser(user);
    setUsers(getStoredUsers());
    if (user.role === 'CONTRACTOR') {
      setCurrentTab('upload');
    } else {
      setCurrentTab('dashboard');
    }
    showToast(`ยินดีต้อนรับ ${user.displayName} เข้าสู่ระบบ (บทบาท: ${user.role})`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setStoredCurrentUser(null);
    setCurrentUser(null);
    setCurrentTab('dashboard');
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // Admin user management handlers (User Request 2)
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const res = updateUserRole(userId, newRole);
    if (res.success) {
      setUsers(res.users);
      // If current logged-in user role changed, sync currentUser state
      if (currentUser && currentUser.id === userId) {
        const updatedSelf = res.users.find((u) => u.id === userId);
        if (updatedSelf) setCurrentUser(updatedSelf);
      }
      showToast(`เปลี่ยนบทบาทผู้ใช้เป็น ${newRole} สำเร็จ`, 'success');
    } else {
      showToast(res.error || 'ไม่สามารถเปลี่ยนบทบาทได้', 'warn');
    }
  };

  const handleAddUser = (userData: {
    username: string;
    password?: string;
    displayName: string;
    role: UserRole;
    email?: string;
    department?: string;
  }) => {
    const res = createNewUser(userData);
    if (res.success) {
      setUsers(res.users);
      showToast(`เพิ่มผู้ใช้ @${userData.username} เรียบร้อยแล้ว`, 'success');
    }
    return res;
  };

  const handleEditUser = (userId: string, data: Partial<UserAccount>) => {
    const res = updateUserDetails(userId, data);
    if (res.success) {
      setUsers(res.users);
      if (currentUser && currentUser.id === userId) {
        const updatedSelf = res.users.find((u) => u.id === userId);
        if (updatedSelf) setCurrentUser(updatedSelf);
      }
      showToast('บันทึกข้อมูลผู้ใช้เรียบร้อยแล้ว', 'success');
    }
    return res;
  };

  const handleDeleteUser = (userId: string) => {
    const res = deleteUserAccount(userId);
    if (res.success) {
      setUsers(res.users);
      showToast('ลบผู้ใช้งานสำเร็จ', 'success');
    }
    return res;
  };

  // GET data from Google Apps Script Web App
  const fetchFromGoogleSheet = async (showNotification: boolean = false) => {
    if (!settings.googleWebAppUrl) return;
    setIsFetchingSheet(true);
    try {
      const res = await fetchEvaluationsFromSheets(settings.googleWebAppUrl);
      if (res.success && res.data && res.data.length > 0) {
        setEvaluations(res.data);
        if (showNotification) {
          showToast(`ดึงข้อมูลสำเร็จจาก Google Sheet (${res.data.length} รายการ)`, 'success');
        }
      } else if (showNotification) {
        showToast('เชื่อมต่อ Google Sheet แล้ว (ไม่พบแถวข้อมูลใหม่ หรือยังไม่ได้สร้างชีต)', 'info');
      }
    } catch (e: any) {
      if (showNotification) {
        showToast(`ดึงข้อมูลไม่สำเร็จ: ${e.message}`, 'warn');
      }
    } finally {
      setIsFetchingSheet(false);
    }
  };

  // On first mount, attempt to fetch from Google Sheet
  useEffect(() => {
    fetchFromGoogleSheet(false);
  }, []);

  // Sync evaluations to local storage safely (protects against QuotaExceededError)
  useEffect(() => {
    safeSaveEvaluations(evaluations);
  }, [evaluations]);

  // Sync settings to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
  }, [settings]);

  // Handle new evaluation completed in UploadView (POST to Google Sheet)
  const handleEvaluationComplete = (newRecord: EvaluationRecord) => {
    setEvaluations((prev) => [newRecord, ...prev.filter((item) => item.id !== newRecord.id)]);
    if (newRecord.approval_status === 'APPROVED') {
      showToast(`ผลประเมิน ${newRecord.branch_name} อนุมัติอัตโนมัติ (Confidence ${newRecord.confidence_score}%)`, 'success');
    } else {
      showToast(`ผลประเมิน ${newRecord.branch_name} ส่งเข้าคิวอนุมัติแล้ว (Confidence ${newRecord.confidence_score}% < ${settings.confidenceThreshold}%)`, 'info');
    }

    // POST to Google Apps Script Web App
    if (settings.autoSyncToSheets && settings.googleWebAppUrl) {
      saveEvaluationToSheets(newRecord, settings.googleWebAppUrl)
        .then((res) => {
          if (res.success) {
            console.log('Saved to Google Sheet successfully via POST fetch()');
            showToast(`บันทึกโครงการ ${newRecord.branch_name} ลง Google Sheet สำเร็จ (POST 200 OK)`, 'success');
          }
        })
        .catch((err) => console.warn('Could not post to Google Sheet:', err));
    }
  };

  // Approve queue item (POST updateStatus to Google Sheet)
  const handleApprove = (id: string, updatedFields?: Partial<EvaluationRecord>) => {
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            approval_status: 'APPROVED',
            approved_by: updatedFields?.approved_by || `${currentUser?.displayName || currentRole} (${new Date().toLocaleTimeString('th-TH')})`,
            approved_at: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showToast('อนุมัติผลประเมินโครงการและเผยแพร่สู่ Dashboard แล้ว', 'success');

    // POST updateStatus to Google Apps Script Web App
    if (settings.autoSyncToSheets && settings.googleWebAppUrl) {
      updateStatusInSheets(id, 'APPROVED', settings.googleWebAppUrl)
        .then((res) => {
          if (res.success) {
            console.log('Approval status updated in Google Sheet');
          }
        })
        .catch((err) => console.warn('Could not update status in Google Sheet:', err));
    }
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

  // If user is not logged in, render the Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
        pendingQueueCount={pendingCount}
        onSyncSheet={() => fetchFromGoogleSheet(true)}
        isSyncingSheet={isFetchingSheet}
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

      {/* Main Content Area: Enforce Contractor only accesses AI upload */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'CONTRACTOR' ? (
          <UploadView
            settings={settings}
            onEvaluationComplete={handleEvaluationComplete}
            canNavigateDashboard={false}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                evaluations={evaluations}
                settings={settings}
                onNavigateUpload={() => setCurrentTab('upload')}
              />
            )}

            {currentTab === 'upload' && (
              <UploadView
                settings={settings}
                onEvaluationComplete={handleEvaluationComplete}
                onNavigateDashboard={() => setCurrentTab('dashboard')}
                canNavigateDashboard={true}
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

            {currentTab === 'settings' && currentRole === 'ADMIN' && (
              <SettingsView
                settings={settings}
                currentRole={currentRole}
                currentUser={currentUser}
                users={users}
                onSaveSettings={(newSettings) => {
                  setSettings(newSettings);
                  showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success');
                }}
                onUpdateUserRole={handleUpdateUserRole}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
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
          </>
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
            <span className="text-cyan-400">Minimalist Geometric Mascot & Role-Based Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
