import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Building2,
  LayoutDashboard,
  UploadCloud,
  CheckSquare,
  Settings,
  Sheet,
  Shield,
  UserCheck,
  HardHat,
  Lock,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'upload' | 'queue' | 'settings' | 'sheets';
  setCurrentTab: (tab: 'dashboard' | 'upload' | 'queue' | 'settings' | 'sheets') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  pendingQueueCount: number;
  onSyncSheet?: () => void;
  isSyncingSheet?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  pendingQueueCount,
  onSyncSheet,
  isSyncingSheet,
}) => {
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'ADMIN' && currentRole !== 'ADMIN') {
      setShowAdminAuthModal(true);
      setAdminPasscode('');
      setAuthError('');
    } else {
      setCurrentRole(role);
    }
  };

  const verifyAdminPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '112224') {
      setCurrentRole('ADMIN');
      setShowAdminAuthModal(false);
      setAdminPasscode('');
      setAuthError('');
    } else {
      setAuthError('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">SHOP TFM</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-semibold">
                    AI TRACKER v2.0
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ระบบบริหารและติดตามความคืบหน้างานก่อสร้าง
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard ภาพรวม</span>
              </button>

              <button
                onClick={() => setCurrentTab('upload')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'upload'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>AI Upload</span>
              </button>

              <button
                onClick={() => setCurrentTab('queue')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  currentTab === 'queue'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>คิวอนุมัติ AI</span>
                {pendingQueueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                    {pendingQueueCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('sheets')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'sheets'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Sheet className="w-4 h-4 text-emerald-400" />
                <span>Google Sheet DB</span>
              </button>

              {currentRole === 'ADMIN' && (
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentTab === 'settings'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>ตั้งค่าระบบ</span>
                </button>
              )}
            </nav>

            {/* Role Switcher & RBAC */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleRoleSelect('CONTRACTOR')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    currentRole === 'CONTRACTOR'
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="ผู้รับเหมา: อัปโหลดรูปภาพและส่งข้อมูลเข้าระบบ"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ผู้รับเหมา</span>
                </button>

                <button
                  onClick={() => handleRoleSelect('SUPERVISOR')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    currentRole === 'SUPERVISOR'
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="ผู้ควบคุมงาน: ดูรายงานและอนุมัติคิว"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ผู้ควบคุมงาน</span>
                </button>

                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    currentRole === 'ADMIN'
                      ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Admin (ยืนยันรหัสความปลอดภัย)"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Live Google Sheet Fetch Button */}
              {onSyncSheet && (
                <button
                  onClick={onSyncSheet}
                  disabled={isSyncingSheet}
                  title="ดึงข้อมูลล่าสุดจาก Google Sheet ผ่าน fetch() GET"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">ดึงข้อมูล Sheet (GET)</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`p-1.5 rounded-lg ${currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('upload')}
              className={`p-1.5 rounded-lg ${currentTab === 'upload' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
            >
              Upload
            </button>
            <button
              onClick={() => setCurrentTab('queue')}
              className={`p-1.5 rounded-lg relative ${currentTab === 'queue' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
            >
              Queue {pendingQueueCount > 0 && `(${pendingQueueCount})`}
            </button>
            <button
              onClick={() => setCurrentTab('sheets')}
              className={`p-1.5 rounded-lg ${currentTab === 'sheets' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              Sheets DB
            </button>
            {currentRole === 'ADMIN' && (
              <button
                onClick={() => setCurrentTab('settings')}
                className={`p-1.5 rounded-lg ${currentTab === 'settings' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
              >
                Settings
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin Passcode Modal (Rule 5: Admin ยืนยันรหัสผ่าน 191225) */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">เข้าสู่ระบบ Admin</h3>
                  <p className="text-[11px] text-slate-400">ยืนยันสิทธิ์ผู้ดูแลระบบสูงสุด</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminAuthModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={verifyAdminPasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  รหัสผ่าน Admin Passcode (6 หลัก)
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  autoFocus
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono tracking-widest text-center"
                />
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/60">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  ยืนยันสิทธิ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
