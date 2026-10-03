export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'CONTRACTOR';

export interface PhotoCategoryWeights {
  front: number; // default 30%
  interior: number; // default 40%
  rear: number; // default 15%
  parking: number; // default 15%
}

export interface PhotoData {
  facade?: string; // Data URL or Image URL
  interior?: string;
  rear?: string;
  parking?: string;
}

export interface ProjectMetadata {
  branchName: string; // 1.5 ชื่อสาขา
  uploadDate: string; // 1.6 วันที่อัปโหลด YYYY-MM-DD
  deliveryDate: string; // 1.7 วันที่ส่งมอบ YYYY-MM-DD
  province: string; // 1.8 พิกัดตำแหน่ง (ชื่อจังหวัดในไทย)
  contractor: string; // 1.9 ผู้รับเหมา
  supervisor: string; // 1.10 ผู้ควบคุมงาน
  baselinePlanProgress: number; // %
}

export type StatusFlag = 'EXCELLENT' | 'ON_TRACK' | 'WARNING' | 'CRITICAL';

export interface CategoryScores {
  front_facade: number; // 0 - 100
  interior: number; // 0 - 100
  rear_building: number; // 0 - 100
  parking_area: number; // 0 - 100
}

export interface EvaluationRecord {
  id: string;
  branch_name: string;
  evaluated_date: string;
  delivery_date: string;
  total_weeks?: number; // Total project duration in weeks (default e.g. 12)
  current_week_index?: number; // Calculated current week index (0 to total_weeks)
  province: string;
  contractor: string;
  supervisor: string;
  confidence_score: number;
  category_scores: CategoryScores;
  calculated_actual_progress: number;
  baseline_plan_progress: number;
  variance_diff: number; // Actual - Plan
  status_flag: StatusFlag;
  summary_reasoning: string;
  photos: PhotoData;
  approval_status: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface SCurveWeekPoint {
  weekLabel: string; // e.g. "Week 0 (เริ่มงาน)", "Week 8 (ปัจจุบัน)", "Week 12 (ส่งมอบ)"
  weekIndex: number; // 0, 1, 2, ... N
  dateLabel: string; // DD/MM
  baselinePlan: number; // % (0% at Week 0 up to 100% at Week N)
  actualProgress: number | null; // % (null for future weeks)
  diff?: number;
  isCurrentWeek?: boolean;
  isDeliveryWeek?: boolean;
}

export interface AppSettings {
  weights: PhotoCategoryWeights;
  sCurveWeeks: number; // 4 - 52 (default 12)
  confidenceThreshold: number; // default 80%
  googleSheetId: string;
  googleWebAppUrl: string;
  autoSyncToSheets: boolean;
}

export interface MascotInfo {
  status: StatusFlag;
  title: string;
  mascotPose: 'GOLD_TROPHY' | 'FOLDED_ARMS' | 'BINOCULARS' | 'RED_FLAG';
  badgeColor: string; // 'emerald' | 'slate' | 'amber' | 'rose'
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  summaryText: string;
  quote: string;
}
