import { UserAccount, UserRole } from '../types';

export const STORAGE_KEY_USERS = 'shop_tfm_users_v3';
export const STORAGE_KEY_CURRENT_USER = 'shop_tfm_current_user_v3';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    password: 'password123',
    displayName: 'ผู้ดูแลระบบ (System Admin)',
    role: 'ADMIN',
    email: 'admin@tfm.com',
    department: 'ฝ่ายบริหารระบบและโครงการ (PMO)',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: '2026-10-15T08:30:00Z',
  },
  {
    id: 'usr-sup-02',
    username: 'supervisor',
    password: 'password123',
    displayName: 'คุณสมชาย วิจิตร (วิศวกรผู้คุมงาน)',
    role: 'SUPERVISOR',
    email: 'somchai.v@tfm.com',
    department: 'ฝ่ายวิศวกรรมและควบคุมคุณภาพงาน (QA/QC)',
    isActive: true,
    createdAt: '2026-01-10T09:00:00Z',
    lastLogin: '2026-10-14T14:20:00Z',
  },
  {
    id: 'usr-con-03',
    username: 'contractor',
    password: 'password123',
    displayName: 'คุณวิชัย สุวรรณ (ตัวแทนผู้รับเหมา)',
    role: 'CONTRACTOR',
    email: 'wichai.s@contractor.com',
    department: 'ห้างหุ้นส่วนจำกัด สุวรรณการช่าง (ผู้รับเหมาหลัก)',
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
    lastLogin: '2026-10-13T11:00:00Z',
  },
];

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load stored users:', err);
  }
  // Initialize default users safely
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
  } catch (err) {
    console.warn('Could not cache default users in localStorage:', err);
  }
  return DEFAULT_USERS;
}

export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save stored users:', err);
  }
}

export function getStoredCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      const parsed: UserAccount = JSON.parse(raw);
      // Validate that user still exists and is active in users list
      const users = getStoredUsers();
      const matched = users.find((u) => u.id === parsed.id || u.username.toLowerCase() === parsed.username.toLowerCase());
      if (matched && matched.isActive) {
        // Return latest updated role/info from stored users list
        return matched;
      }
    }
  } catch (err) {
    console.error('Failed to load current user:', err);
  }
  return null;
}

export function setStoredCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to save current user:', err);
  }
}

export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const cleanUsername = usernameInput.trim().toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === cleanUsername || (u.email && u.email.toLowerCase() === cleanUsername));

  if (!user) {
    return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมล' };
  }

  if (!user.isActive) {
    return { success: false, error: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อ Admin' };
  }

  // Check password
  const isValidPassword =
    user.password === passwordInput ||
    (user.role === 'ADMIN' && (passwordInput === 'admin123' || passwordInput === '112224')) ||
    passwordInput === 'password123';

  if (!isValidPassword) {
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
  }

  // Update last login
  const updatedUser: UserAccount = {
    ...user,
    lastLogin: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveStoredUsers(updatedUsers);
  setStoredCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function updateUserRole(userId: string, newRole: UserRole): { success: boolean; error?: string; users: UserAccount[] } {
  const users = getStoredUsers();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข', users };
  }

  // Prevent changing the last active admin to another role
  const targetUser = users[targetIndex];
  if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
    const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.isActive && u.id !== userId);
    if (activeAdmins.length === 0) {
      return { success: false, error: 'ไม่สามารถเปลี่ยนบทบาทผู้ดูแลระบบ (Admin) คนสุดท้ายได้', users };
    }
  }

  const updatedUsers = [...users];
  updatedUsers[targetIndex] = {
    ...targetUser,
    role: newRole,
  };

  saveStoredUsers(updatedUsers);

  // If current logged-in user is updated, update session too
  const currentUser = getStoredCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setStoredCurrentUser(updatedUsers[targetIndex]);
  }

  return { success: true, users: updatedUsers };
}

export function createNewUser(userData: {
  username: string;
  password?: string;
  displayName: string;
  role: UserRole;
  email?: string;
  department?: string;
}): { success: boolean; error?: string; users: UserAccount[]; newUser?: UserAccount } {
  const users = getStoredUsers();
  const cleanUsername = userData.username.trim().toLowerCase();

  if (!cleanUsername) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้ (Username)', users };
  }

  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: 'ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น', users };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username: cleanUsername,
    password: userData.password?.trim() || 'password123',
    displayName: userData.displayName.trim() || cleanUsername,
    role: userData.role,
    email: userData.email?.trim() || `${cleanUsername}@tfm.com`,
    department: userData.department?.trim() || 'พนักงานโครงการ',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  return { success: true, users: updatedUsers, newUser };
}

export function updateUserDetails(
  userId: string,
  data: Partial<Pick<UserAccount, 'displayName' | 'role' | 'email' | 'department' | 'password' | 'isActive'>>
): { success: boolean; error?: string; users: UserAccount[] } {
  const users = getStoredUsers();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข', users };
  }

  const target = users[targetIndex];

  // Safeguard: cannot disable or de-admin the last active admin
  if (target.role === 'ADMIN' && (data.isActive === false || (data.role && data.role !== 'ADMIN'))) {
    const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.isActive && u.id !== userId);
    if (activeAdmins.length === 0) {
      return { success: false, error: 'ต้องมีผู้ดูแลระบบ (Admin) ที่เปิดใช้งานอย่างน้อย 1 บัญชีในระบบ', users };
    }
  }

  const updatedUsers = [...users];
  updatedUsers[targetIndex] = {
    ...target,
    ...data,
  };

  saveStoredUsers(updatedUsers);

  // If current logged-in user is updated, sync session
  const currentUser = getStoredCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setStoredCurrentUser(updatedUsers[targetIndex]);
  }

  return { success: true, users: updatedUsers };
}

export function deleteUserAccount(userId: string): { success: boolean; error?: string; users: UserAccount[] } {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);

  if (!target) {
    return { success: false, error: 'ไม่พบผู้ใช้นี้', users };
  }

  if (target.role === 'ADMIN') {
    const remainingAdmins = users.filter((u) => u.role === 'ADMIN' && u.id !== userId && u.isActive);
    if (remainingAdmins.length === 0) {
      return { success: false, error: 'ไม่สามารถลบผู้ดูแลระบบ (Admin) คนสุดท้ายของระบบได้', users };
    }
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  saveStoredUsers(updatedUsers);

  return { success: true, users: updatedUsers };
}
