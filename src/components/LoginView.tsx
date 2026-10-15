import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { authenticateUser } from '../utils/auth';
import { AIMascot } from './AIMascot';
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  UserCheck,
  HardHat,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authenticateUser(username, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    }, 250);
  };

  const handleQuickLogin = (quickUser: string, quickPass: string) => {
    setUsername(quickUser);
    setPassword(quickPass);
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      const res = authenticateUser(quickUser, quickPass);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Brand & Minimalist Geometric Mascot */}
        <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-xl shadow-cyan-500/25 text-white font-bold">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SHOP TFM</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-semibold">
                  PRO v2.0
                </span>
              </div>
              <div className="text-xs text-slate-400">
                ระบบติดตามและบริหารงานก่อสร้าง
              </div>
            </div>
          </div>

          {/* Minimalist Geometric Engineer Mascot Preview */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full max-w-sm flex flex-col items-center">
            <AIMascot diff={6.5} size="lg" showDetails={true} />
            <div className="mt-4 pt-3 border-t border-slate-800 w-full text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Vision & Google Sheets Database</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                ระบบจัดการสิทธิ์ผู้ใช้งานจริงตามบทบาทที่ Admin กำหนด
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Login Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบเพื่อเริ่มใช้งาน</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                ยินดีต้อนรับสู่ Shop TFM
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                กรอกข้อมูลประจำตัวของคุณ บทบาทและสิทธิ์จะถูกดึงตามที่ Admin ตั้งค่าไว้
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  ชื่อผู้ใช้ หรือ อีเมล (Username / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin, supervisor, contractor"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ (Sign In)</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Preset Buttons */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">เข้าสู่ระบบด่วน (เลือกทดสอบสิทธิ์ตามบทบาท):</span>
                <span className="text-[11px] text-slate-500">คลิกเพื่อล็อกอินทันที</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'password123')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 hover:bg-cyan-950/40 border border-cyan-800/50 hover:border-cyan-500 text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-900/60 text-cyan-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">Admin</div>
                    <div className="text-[10px] text-slate-500">จัดการทุกอย่าง & Role</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('supervisor', 'password123')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 hover:bg-blue-950/40 border border-blue-800/50 hover:border-blue-500 text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-900/60 text-blue-300 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200">Supervisor</div>
                    <div className="text-[10px] text-slate-500">ตรวจอนุมัติคิว & ผล</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('contractor', 'password123')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 hover:bg-amber-950/40 border border-amber-800/50 hover:border-amber-500 text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">Contractor</div>
                    <div className="text-[10px] text-slate-500">อัปโหลดภาพหน้างาน</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
