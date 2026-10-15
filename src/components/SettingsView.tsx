import React, { useState } from 'react';
import { AppSettings, PhotoCategoryWeights, UserAccount, UserRole } from '../types';
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
  Users,
  UserCheck,
  HardHat,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  X,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  currentRole: UserRole;
  currentUser?: UserAccount | null;
  users: UserAccount[];
  onSaveSettings: (newSettings: AppSettings) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (userData: {
    username: string;
    password?: string;
    displayName: string;
    role: UserRole;
    email?: string;
    department?: string;
  }) => { success: boolean; error?: string };
  onEditUser: (userId: string, data: Partial<UserAccount>) => { success: boolean; error?: string };
  onDeleteUser: (userId: string) => { success: boolean; error?: string };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentRole,
  currentUser,
  users,
  onSaveSettings,
  onUpdateUserRole,
  onAddUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [weights, setWeights] = useState<PhotoCategoryWeights>({ ...settings.weights });
  const [sCurveWeeks, setSCurveWeeks] = useState<number>(settings.sCurveWeeks);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(settings.confidenceThreshold);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [roleChangeNotice, setRoleChangeNotice] = useState<string>('');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<UserRole>('CONTRACTOR');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [addModalError, setAddModalError] = useState('');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('CONTRACTOR');
  const [editDept, setEditDept] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editModalError, setEditModalError] = useState('');

  // Requirement: Only Admin can access and configure settings
  if (currentRole !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Only)</h3>
          <p className="text-xs text-slate-400 mt-1">
            คุณกำลังเข้าสู่ระบบด้วยสิทธิ์ <strong className="text-amber-400">{currentRole}</strong> การตั้งค่าระบบและการกำหนดบทบาทอนุญาตให้เฉพาะ Admin เท่านั้น
          </p>
        </div>
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

  const handleRoleChange = (userId: string, newSelectedRole: UserRole) => {
    onUpdateUserRole(userId, newSelectedRole);
    const target = users.find((u) => u.id === userId);
    setRoleChangeNotice(
      `ปรับบทบาทของ ${target?.displayName || target?.username} เป็น ${newSelectedRole} เรียบร้อยแล้ว`
    );
    setTimeout(() => setRoleChangeNotice(''), 3000);
  };

  const handleOpenAddModal = () => {
    setNewUsername('');
    setNewDisplayName('');
    setNewPassword('password123');
    setNewRole('CONTRACTOR');
    setNewEmail('');
    setNewDept('');
    setAddModalError('');
    setShowAddModal(true);
  };

  const handleSubmitAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError('');
    if (!newUsername.trim()) {
      setAddModalError('กรุณาระบุ Username');
      return;
    }
    const res = onAddUser({
      username: newUsername,
      displayName: newDisplayName || newUsername,
      password: newPassword,
      role: newRole,
      email: newEmail,
      department: newDept,
    });
    if (res.success) {
      setShowAddModal(false);
      setRoleChangeNotice(`เพิ่มผู้ใช้งาน ${newUsername} เรียบร้อยแล้ว`);
      setTimeout(() => setRoleChangeNotice(''), 3000);
    } else {
      setAddModalError(res.error || 'ไม่สามารถเพิ่มผู้ใช้ได้');
    }
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName);
    setEditRole(user.role);
    setEditDept(user.department || '');
    setEditEmail(user.email || '');
    setEditNewPassword('');
    setEditIsActive(user.isActive);
    setEditModalError('');
  };

  const handleSubmitEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditModalError('');

    const payload: Partial<UserAccount> = {
      displayName: editDisplayName.trim() || editingUser.username,
      role: editRole,
      department: editDept.trim(),
      email: editEmail.trim(),
      isActive: editIsActive,
    };
    if (editNewPassword.trim()) {
      payload.password = editNewPassword.trim();
    }

    const res = onEditUser(editingUser.id, payload);
    if (res.success) {
      setEditingUser(null);
      setRoleChangeNotice(`แก้ไขข้อมูลผู้ใช้ ${editingUser.username} เรียบร้อยแล้ว`);
      setTimeout(() => setRoleChangeNotice(''), 3000);
    } else {
      setEditModalError(res.error || 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (window.confirm(`ยืนยันการลบบัญชีผู้ใช้ "${user.displayName} (${user.username})"?`)) {
      const res = onDeleteUser(user.id);
      if (res.success) {
        setRoleChangeNotice(`ลบบัญชี ${user.username} สำเร็จ`);
        setTimeout(() => setRoleChangeNotice(''), 3000);
      } else {
        alert(res.error || 'ไม่สามารถลบผู้ใช้ได้');
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin',
          bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
          icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'SUPERVISOR':
        return {
          label: 'Supervisor',
          bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
          icon: <UserCheck className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'CONTRACTOR':
        return {
          label: 'Contractor',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          icon: <HardHat className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800 shadow-md">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  ตั้งค่าระบบผู้ดูแล (Admin Control Center)
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-900/80 text-cyan-200 border border-cyan-700 font-mono font-bold">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                กำหนดบทบาทและสิทธิ์ผู้ใช้งานจริง, สัดส่วนน้ำหนักรูปภาพ, Timeline S-Curve และเกณฑ์ Confidence AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ล็อกอินโดย:</span>
            <span className="font-bold text-cyan-300 font-mono">
              {currentUser?.displayName || 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Change Notification Banner */}
      {roleChangeNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{roleChangeNotice}</span>
        </div>
      )}

      {/* SECTION 1: USER & ROLE MANAGEMENT BY ADMIN (User Request 2) */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                1. การจัดการผู้ใช้งานและกำหนดสิทธิ์บทบาท (User & Role Management)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin สามารถกำหนดได้ว่า User แต่ละคนเป็นบทบาทใด (Admin, Supervisor, หรือ Contractor)
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>เพิ่มผู้ใช้งานใหม่ (Add User)</span>
          </button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">ผู้ใช้งาน (User Account)</th>
                <th className="py-3 px-3">สังกัด / แผนก</th>
                <th className="py-3 px-3">กำหนดบทบาทโดย Admin</th>
                <th className="py-3 px-3">สถานะ</th>
                <th className="py-3 px-3">เข้าสู่ระบบล่าสุด</th>
                <th className="py-3 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {users.map((u) => {
                const roleBadge = getRoleBadge(u.role);
                const isCurrent = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{u.displayName}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                            คุณ (Current)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        @{u.username} • {u.email}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-slate-400 text-xs">
                      {u.department || '-'}
                    </td>

                    {/* Admin Role Selector (Requirement 2) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-1 transition-all ${
                            u.role === 'ADMIN'
                              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700 focus:border-cyan-400 focus:ring-cyan-400'
                              : u.role === 'SUPERVISOR'
                              ? 'bg-blue-950/90 text-blue-300 border-blue-700 focus:border-blue-400 focus:ring-blue-400'
                              : 'bg-amber-950/90 text-amber-300 border-amber-700 focus:border-amber-400 focus:ring-amber-400'
                          }`}
                        >
                          <option value="ADMIN">🛡️ Admin (ผู้ดูแลระบบ)</option>
                          <option value="SUPERVISOR">📋 Supervisor (ผู้ควบคุมงาน)</option>
                          <option value="CONTRACTOR">👷 Contractor (ผู้รับเหมา)</option>
                        </select>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.isActive
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}
                        />
                        <span>{u.isActive ? 'เปิดใช้งาน' : 'ระงับชั่วคราว'}</span>
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">
                      {u.lastLogin ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(u.lastLogin).toLocaleDateString('th-TH')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="แก้ไขข้อมูล / เปลี่ยนรหัสผ่าน"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.role === 'ADMIN' && users.filter((x) => x.role === 'ADMIN').length <= 1}
                          title="ลบผู้ใช้งาน"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Roles Policy Callout */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>สิทธิ์การใช้งานของแต่ละบทบาท (Role Privileges):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400">
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
              <strong className="text-cyan-300 block mb-1">🛡️ Admin (ผู้ดูแลระบบ):</strong>
              สิทธิ์สูงสุด สามารถกำหนดบทบาทผู้ใช้งานทุกคน, ปรับจูนค่าน้ำหนักรูปภาพและเกณฑ์ AI, อนุมัติคิว และเชื่อมต่อ Google Sheets
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40">
              <strong className="text-blue-300 block mb-1">📋 Supervisor (ผู้ควบคุมงาน):</strong>
              ตรวจรับและอนุมัติผลงานใน Approval Queue, ปรับจูนคะแนนหมวดงานหน้างาน และดูรายงาน Dashboard ทุกสาขา
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
              <strong className="text-amber-300 block mb-1">👷 Contractor (ผู้รับเหมา):</strong>
              อัปโหลดรูปภาพ 4 หมวดและส่งรายงานความคืบหน้าเข้าสู่ระบบ และดู Dashboard เฉพาะผลงานที่ได้รับอนุมัติแล้ว
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PHOTO WEIGHTS SETTING (สไลเดอร์ปรับสัดส่วน Weight % รวม 100%) */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              2. สัดส่วนน้ำหนักการประเมินรูปภาพ 4 หมวดหลัก (Photo Category Weights)
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Front Facade */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">หมวดที่ 1: ป้ายและหน้าร้าน (Front Facade)</span>
              <span className="text-cyan-400 font-mono font-bold">{weights.front}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.front}
              onChange={(e) => setWeights({ ...weights, front: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">ค่าเริ่มต้นมาตรฐาน: 30%</p>
          </div>

          {/* Interior */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">หมวดที่ 2: โถงในร้าน/ชั้นวาง (Interior Area)</span>
              <span className="text-cyan-400 font-mono font-bold">{weights.interior}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.interior}
              onChange={(e) => setWeights({ ...weights, interior: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">ค่าเริ่มต้นมาตรฐาน: 40%</p>
          </div>

          {/* Rear Building */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">หมวดที่ 3: หลังร้าน/ห้องเย็น (Rear & Storage)</span>
              <span className="text-cyan-400 font-mono font-bold">{weights.rear}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.rear}
              onChange={(e) => setWeights({ ...weights, rear: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">ค่าเริ่มต้นมาตรฐาน: 15%</p>
          </div>

          {/* Parking Area */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">หมวดที่ 4: ลานจอดรถ/ภายนอก (Parking & Landscape)</span>
              <span className="text-cyan-400 font-mono font-bold">{weights.parking}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.parking}
              onChange={(e) => setWeights({ ...weights, parking: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[11px] text-slate-500">ค่าเริ่มต้นมาตรฐาน: 15%</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: S-CURVE & CONFIDENCE THRESHOLD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* S-Curve Weeks Slider */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                3. จำนวนสัปดาห์บนแกน S-Curve
              </h3>
              <p className="text-[11px] text-slate-400">กำหนดระยะเวลาโครงการมาตรฐาน</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">ระยะเวลาโครงการทั้งหมด:</span>
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
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                4. เกณฑ์ AI Confidence Threshold
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
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
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

      {/* MODAL 1: ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">เพิ่มผู้ใช้งานใหม่ (Add User)</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addModalError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addModalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ชื่อผู้ใช้ (Username) *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. korn_qc, tfm_eng01"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ชื่อ-นามสกุล / ชื่อแสดง (Display Name) *
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. คุณกร วัฒนา (QC Engineer)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  รหัสผ่านเริ่มต้น (Default Password)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  บทบาทที่ Admin กำหนดให้ (Role) *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none font-bold"
                >
                  <option value="ADMIN">🛡️ Admin (ผู้ดูแลระบบสูงสุด)</option>
                  <option value="SUPERVISOR">📋 Supervisor (ผู้ควบคุมงาน/QC)</option>
                  <option value="CONTRACTOR">👷 Contractor (ผู้รับเหมา)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  แผนก / สังกัด (Department)
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. บริษัท สุวรรณการช่าง จำกัด"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. user@tfm.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  บันทึกผู้ใช้ใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  แก้ไขข้อมูลผู้ใช้: @{editingUser.username}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editModalError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{editModalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ชื่อแสดง (Display Name)
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  กำหนดบทบาทโดย Admin (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none font-bold"
                >
                  <option value="ADMIN">🛡️ Admin (ผู้ดูแลระบบสูงสุด)</option>
                  <option value="SUPERVISOR">📋 Supervisor (ผู้ควบคุมงาน/QC)</option>
                  <option value="CONTRACTOR">👷 Contractor (ผู้รับเหมา)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  แผนก / สังกัด (Department)
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>เปลี่ยนรหัสผ่านใหม่ (Reset Password)</span>
                  <span className="text-slate-500 text-[10px]">เว้นว่างหากไม่เปลี่ยน</span>
                </label>
                <input
                  type="text"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่ที่ต้องการ"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0"
                />
                <label htmlFor="editIsActive" className="text-slate-300 cursor-pointer">
                  เปิดให้บัญชีนี้ใช้งานในระบบได้ (Active Account)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
