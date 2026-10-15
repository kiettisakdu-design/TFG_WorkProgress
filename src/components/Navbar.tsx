import React from 'react';
import { UserAccount, UserRole } from '../types';
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
  LogOut,
  RefreshCw,
  User,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'upload' | 'queue' | 'settings' | 'sheets';
  setCurrentTab: (tab: 'dashboard' | 'upload' | 'queue' | 'settings' | 'sheets') => void;
  currentUser: UserAccount | null;
  currentRole: UserRole;
  onLogout: () => void;
  pendingQueueCount: number;
  onSyncSheet?: () => void;
  isSyncingSheet?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  currentRole,
  onLogout,
  pendingQueueCount,
  onSyncSheet,
  isSyncingSheet,
}) => {
  const isContractor = currentRole === 'CONTRACTOR';

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'ผู้ดูแลระบบ (Admin)',
          bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
          icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'SUPERVISOR':
        return {
          label: 'ผู้ควบคุมงาน (Supervisor)',
          bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
          icon: <UserCheck className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'CONTRACTOR':
        return {
          label: 'ผู้รับเหมา (Contractor)',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          icon: <HardHat className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  };

  const roleInfo = getRoleBadge(currentRole);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab(isContractor ? 'upload' : 'dashboard')}
            title={isContractor ? 'หน้า AI Upload ของผู้รับเหมา' : 'ไปที่ Dashboard ภาพรวม'}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">SHOP TFM</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-semibold">
                  AI TRACKER v2.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                ระบบบริหารและติดตามความคืบหน้างานก่อสร้าง
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Strict RBAC: User ผู้รับเหมา ให้สามารถเข้าหน้า เมนู ได้เฉพาะหน้า Ai upload เท่านั้น */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {/* Dashboard: Restricted from Contractor */}
            {!isContractor && (
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
            )}

            {/* AI Upload: Accessible by Contractor and all roles */}
            <button
              onClick={() => setCurrentTab('upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'upload'
                  ? 'bg-cyan-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>AI Upload</span>
              {isContractor && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
                  เฉพาะเมนูนี้
                </span>
              )}
            </button>

            {/* Approval Queue: Restricted from Contractor */}
            {!isContractor && (
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
            )}

            {/* Google Sheets DB Hub: Restricted from Contractor */}
            {!isContractor && (
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
            )}

            {/* Settings & User Management: Only Admin */}
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
                <span>ตั้งค่าระบบ & สิทธิ์</span>
              </button>
            )}
          </nav>

          {/* Right Header: Logged-in User Info & Logout (No public role switch buttons) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Google Sheet Fetch Button (Only for Admin / Supervisor) */}
            {!isContractor && onSyncSheet && (
              <button
                onClick={onSyncSheet}
                disabled={isSyncingSheet}
                title="ดึงข้อมูลล่าสุดจาก Google Sheet ผ่าน fetch() GET"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">ดึงข้อมูล Sheet (GET)</span>
              </button>
            )}

            {/* Logged-In User Profile Card */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-950/80 pl-2.5 pr-1.5 py-1 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-white leading-tight line-clamp-1 max-w-[130px]">
                      {currentUser.displayName}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${roleInfo.bg}`}
                      >
                        {roleInfo.icon}
                        <span>{roleInfo.label.split(' ')[0]}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-colors flex items-center gap-1 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">ออก</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar: Enforcing Contractor only gets Upload */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          {!isContractor && (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`p-1.5 rounded-lg ${currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => setCurrentTab('upload')}
            className={`p-1.5 rounded-lg ${
              currentTab === 'upload' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            AI Upload {isContractor && '(เฉพาะเมนูนี้)'}
          </button>

          {!isContractor && (
            <button
              onClick={() => setCurrentTab('queue')}
              className={`p-1.5 rounded-lg relative ${currentTab === 'queue' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
            >
              Queue {pendingQueueCount > 0 && `(${pendingQueueCount})`}
            </button>
          )}

          {!isContractor && (
            <button
              onClick={() => setCurrentTab('sheets')}
              className={`p-1.5 rounded-lg ${currentTab === 'sheets' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              Sheets DB
            </button>
          )}

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
  );
};
