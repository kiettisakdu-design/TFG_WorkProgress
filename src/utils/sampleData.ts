import { EvaluationRecord, SCurveWeekPoint } from '../types';

// High-quality SVG-based sample construction site images for instant demo testing
export function generateSampleConstructionImage(type: 'facade' | 'interior' | 'rear' | 'parking', title: string, progress: number): string {
  const colors = {
    facade: { bg: '#0369a1', accent: '#38bdf8', icon: '🏢' },
    interior: { bg: '#b45309', accent: '#fde047', icon: '🛠️' },
    rear: { bg: '#047857', accent: '#34d399', icon: '🚪' },
    parking: { bg: '#4338ca', accent: '#a78bfa', icon: '🚗' },
  }[type];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors.bg}"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <rect width="600" height="400" fill="url(#grid)"/>

    <!-- Building Silhouette -->
    <rect x="70" y="120" width="460" height="230" rx="10" fill="#1e293b" opacity="0.9" stroke="${colors.accent}" stroke-width="2"/>
    
    <!-- Scaffolding or Frame Elements -->
    <line x1="70" y1="180" x2="530" y2="180" stroke="${colors.accent}" stroke-width="1.5" stroke-dasharray="6,4"/>
    <line x1="70" y1="240" x2="530" y2="240" stroke="${colors.accent}" stroke-width="1.5" stroke-dasharray="6,4"/>
    <line x1="200" y1="120" x2="200" y2="350" stroke="${colors.accent}" stroke-width="1.5"/>
    <line x1="400" y1="120" x2="400" y2="350" stroke="${colors.accent}" stroke-width="1.5"/>

    <!-- Center Icon & Progress Stamp -->
    <circle cx="300" cy="200" r="48" fill="#0f172a" stroke="${colors.accent}" stroke-width="3"/>
    <text x="300" y="212" font-size="34" text-anchor="middle">${colors.icon}</text>

    <!-- Header bar -->
    <rect x="0" y="0" width="600" height="50" fill="rgba(15,23,42,0.85)"/>
    <text x="25" y="32" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="16">SHOP TFM SITE INSPECTION</text>
    <text x="575" y="32" fill="${colors.accent}" font-family="monospace" font-weight="bold" font-size="15" text-anchor="end">${type.toUpperCase()} • ${progress}%</text>

    <!-- Title Label -->
    <text x="300" y="285" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">${title}</text>
    <text x="300" y="310" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">ประเมินโดย AI Vision Engine v2.0 • Shop TFM</text>

    <!-- Progress indicator at bottom -->
    <rect x="100" y="365" width="400" height="12" rx="6" fill="#334155"/>
    <rect x="100" y="365" width="${4 * progress}" height="12" rx="6" fill="${colors.accent}"/>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Standard 10-week cumulative baseline plan for Shop TFM projects
// Week 0 (0%) -> Week 10 (100%)
export const DEFAULT_SCURVE_10_WEEKS: number[] = [0, 5, 12, 22, 35, 50, 65, 78, 88, 95, 100];

// Stage descriptions for each of the 10 weeks
export const SCURVE_WEEK_DESCRIPTIONS: { week: number; title: string; desc: string }[] = [
  { week: 0, title: 'เริ่มโครงการ (Kick-off)', desc: 'ส่งมอบพื้นที่, วางผังเสาเข็มและจัดตั้งแคมป์คนงาน' },
  { week: 1, title: 'งานฐานรากและโครงสร้างใต้ดิน', desc: 'ขุดดิน, เทลีน, หล่อตอม่อและคานคอดิน' },
  { week: 2, title: 'โครงสร้างหลักเสาและคาน', desc: 'ตั้งตุ๊กตา, เทคอนกรีตเสา, คาน และพื้นชั้นล่าง' },
  { week: 3, title: 'โครงสร้างหลังคาและมุงหลังคา', desc: 'ติดตั้งโครงถักเหล็กกัลวาไนซ์, มุงเมทัลชีท, รางน้ำฝน' },
  { week: 4, title: 'งานก่อผนังและเดินท่อระบบ', desc: 'ก่ออิฐมวลเบา, ร้อยท่อสายไฟ EMT, ท่อน้ำดีและสุขาภิบาล' },
  { week: 5, title: 'งานฉาบปูนและติดตั้งแอร์', desc: 'ฉาบผิวเรียบผนัง, แขวนยูนิตแฟนคอยล์แอร์, กรอบกระจก' },
  { week: 6, title: 'งานฝ้าเพดานและเทลานจอดรถ', desc: 'โครงฝ้าฉาบเรียบ/ทีบาร์, บดอัดหินคลุกและเทคอนกรีตลานจอด' },
  { week: 7, title: 'งานปูพื้นกระเบื้องและป้ายร้าน', desc: 'ปูแกรนิตโต้ 60x60, ติดตั้งบานกระจกนิรภัย Facade และป้าย TFM' },
  { week: 8, title: 'งาน Built-in ตกแต่งและตีเส้นลานจอด', desc: 'ติดตั้งเคาน์เตอร์, ชั้นวางสินค้า, ระบบไฟ LED, ตีเส้นจราจร' },
  { week: 9, title: 'ทดสอบระบบไฟฟ้า/ประปาและติดตั้งตู้เย็น', desc: 'Commissioning ระบบไฟฉุกเฉิน, ระบบ POS, ทดสอบแอร์ 24 ชม.' },
  { week: 10, title: 'ส่งมอบงานและตรวจรับ Defect Checklist', desc: 'ทำความสะอาด Big Cleaning, Final Inspection, ส่งมอบกุญแจ' },
];

// Generate realistic S-Curve points from Week 0 (left) to Week N (right, matching Delivery Date)
export function generateSCurveData(
  totalWeeks: number = 10,
  currentActual: number = 78,
  currentPlan?: number,
  evaluatedDate: string = '2026-10-02',
  deliveryDate: string = '2026-11-15',
  customBaselinePlan?: number[]
): SCurveWeekPoint[] {
  const points: SCurveWeekPoint[] = [];

  const delivery = new Date(deliveryDate);
  const evalDate = new Date(evaluatedDate);

  // Standard duration: default 10 weeks
  const effectiveWeeks = totalWeeks > 0 ? totalWeeks : 10;
  const totalDays = effectiveWeeks * 7;
  const startDate = new Date(delivery.getTime() - totalDays * 24 * 60 * 60 * 1000);

  // Calculate current week index based on evaluatedDate relative to startDate & deliveryDate
  const daysFromStart = Math.max(0, (evalDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const currentWeekIndex = Math.min(effectiveWeeks, Math.max(0, Math.round(daysFromStart / 7)));

  for (let w = 0; w <= effectiveWeeks; w++) {
    const pointDate = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
    const dateLabel = `${pointDate.getDate()}/${pointDate.getMonth() + 1}`;

    let baselinePlan = 0;
    if (w === 0) {
      baselinePlan = 0;
    } else if (customBaselinePlan && customBaselinePlan[w] !== undefined) {
      baselinePlan = customBaselinePlan[w];
    } else if (w === effectiveWeeks) {
      baselinePlan = 100;
    } else {
      const t = w / effectiveWeeks;
      const rawSigmoid = 1 / (1 + Math.exp(-6 * (t - 0.5)));
      const s0 = 1 / (1 + Math.exp(-6 * (0 - 0.5)));
      const s1 = 1 / (1 + Math.exp(-6 * (1 - 0.5)));
      const normalized = (rawSigmoid - s0) / (s1 - s0);
      baselinePlan = Math.round(normalized * 100);
    }

    let actualProgress: number | null = null;
    const isCurrentWeek = w === currentWeekIndex;
    const isDeliveryWeek = w === effectiveWeeks;

    if (w === 0) {
      actualProgress = 0;
    } else if (w < currentWeekIndex) {
      // Past weeks progress tracking towards currentActual
      const progressRatio = w / (currentWeekIndex || 1);
      const pastVal = Math.round(currentActual * Math.pow(progressRatio, 1.1) + Math.sin(w) * 1.5);
      actualProgress = Math.max(0, Math.min(currentActual, pastVal));
    } else if (w === currentWeekIndex) {
      actualProgress = currentActual;
    } else {
      // Future weeks beyond current evaluation date have not happened yet
      actualProgress = null;
    }

    let weekLabel = `Week ${w}`;
    if (w === 0) weekLabel = 'Week 0 (เริ่มงาน)';
    else if (isCurrentWeek) weekLabel = `Week ${w} (ปัจจุบัน)`;
    else if (isDeliveryWeek) weekLabel = `Week ${w} (ส่งมอบงาน)`;

    points.push({
      weekLabel,
      weekIndex: w,
      dateLabel,
      baselinePlan,
      actualProgress,
      isCurrentWeek,
      isDeliveryWeek,
      diff: actualProgress !== null ? parseFloat((actualProgress - baselinePlan).toFixed(1)) : undefined,
    });
  }

  return points;
}

// Initial Sample Evaluations for the system
export const INITIAL_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'TFM-2026-001',
    branch_name: 'สาขา สยามสแควร์',
    evaluated_date: '2026-10-02',
    delivery_date: '2026-11-15',
    province: 'กรุงเทพฯ',
    contractor: 'บจก. สยาม คอนสตรัคชั่น บิลเดอร์',
    supervisor: 'วิศวกร ธนกร ชัยมงคล (วศ.บ. โยธา)',
    confidence_score: 94,
    category_scores: {
      front_facade: 88,
      interior: 85,
      rear_building: 80,
      parking_area: 82,
    },
    calculated_actual_progress: 84.7, // (88*0.3)+(85*0.4)+(80*0.15)+(82*0.15) = 26.4+34+12+12.3 = 84.7
    baseline_plan_progress: 78.0,
    variance_diff: 6.7, // >= +5% -> EXCELLENT (Gold Trophy)
    status_flag: 'EXCELLENT',
    summary_reasoning: 'งานตกแต่งหน้าร้านและงานระบบไฟส่องสว่างเสร็จสมบูรณ์ เฟอร์นิเจอร์ Built-in ติดตั้งเรียบร้อย งานลานจอดรถเทพื้นคอนกรีตเสร็จสิ้น เร็วกว่าแผนงาน 6.7%',
    photos: {
      facade: generateSampleConstructionImage('facade', 'หน้าร้านสยามสแควร์ กระจกและป้ายไฟ TFM ติดตั้งครบ', 88),
      interior: generateSampleConstructionImage('interior', 'ภายในห้องโถง งานฝ้าเพดานและกระเบื้องปูเสร็จ', 85),
      rear: generateSampleConstructionImage('rear', 'ประตูทางออกหลังร้านและระบบบำบัดน้ำเสียพร้อม', 80),
      parking: generateSampleConstructionImage('parking', 'ลานจอดหน้าร้าน ตีเส้นจราจรและติดโคมไฟ', 82),
    },
    approval_status: 'APPROVED',
    approved_by: 'ระบบ AI อัตโนมัติ (Confidence 94% >= 80%)',
    approved_at: '2026-10-02T07:15:00Z',
    created_at: '2026-10-02T07:14:30Z',
  },
  {
    id: 'TFM-2026-002',
    branch_name: 'สาขา เชียงใหม่ นิมมาน',
    evaluated_date: '2026-10-01',
    delivery_date: '2026-12-10',
    province: 'เชียงใหม่',
    contractor: 'หจก. นครพิงค์ เอ็นจิเนียริ่ง',
    supervisor: 'วิศวกร กิตติพงษ์ สุริยะวงศ์',
    confidence_score: 91,
    category_scores: {
      front_facade: 68,
      interior: 65,
      rear_building: 70,
      parking_area: 60,
    },
    calculated_actual_progress: 65.9, // (68*0.3)+(65*0.4)+(70*0.15)+(60*0.15) = 20.4+26+10.5+9 = 65.9
    baseline_plan_progress: 65.0,
    variance_diff: 0.9, // -5% to +5% -> ON_TRACK (Folded Arms)
    status_flag: 'ON_TRACK',
    summary_reasoning: 'งานก่อสร้างโครงสร้างหลักและกั้นผนังห้องภายในเป็นไปตามเป้าหมาย งานด้านหน้าเริ่มติดตั้งโครงสร้างอลูมิเนียมคอมโพสิต ความคืบหน้าตรงตามแผนงาน',
    photos: {
      facade: generateSampleConstructionImage('facade', 'โครงสร้างหน้าร้าน สาขานิมมาน อยู่ระหว่างลงสีรองพื้น', 68),
      interior: generateSampleConstructionImage('interior', 'งานกั้นห้องและระบบท่อแอร์ภายในอาคาร', 65),
      rear: generateSampleConstructionImage('rear', 'โครงสร้างผนังด้านหลังและบ่อดักไขมัน', 70),
      parking: generateSampleConstructionImage('parking', 'เตรียมเททรายบดอัดพื้นลานจอดรถ', 60),
    },
    approval_status: 'APPROVED',
    approved_by: 'ระบบ AI อัตโนมัติ (Confidence 91% >= 80%)',
    approved_at: '2026-10-01T14:20:00Z',
    created_at: '2026-10-01T14:18:00Z',
  },
  {
    id: 'TFM-2026-003',
    branch_name: 'สาขา ภูเก็ต ป่าตอง',
    evaluated_date: '2026-09-30',
    delivery_date: '2026-11-30',
    province: 'ภูเก็ต',
    contractor: 'บจก. อันดามัน ซีวิล โปรเจกต์',
    supervisor: 'วิศวกร ภัทรพล เจริญวิทย์',
    confidence_score: 86,
    category_scores: {
      front_facade: 45,
      interior: 40,
      rear_building: 50,
      parking_area: 35,
    },
    calculated_actual_progress: 42.25, // (45*0.3)+(40*0.4)+(50*0.15)+(35*0.15) = 13.5+16+7.5+5.25 = 42.25
    baseline_plan_progress: 52.0,
    variance_diff: -9.75, // -15% to -5% -> WARNING (Binoculars)
    status_flag: 'WARNING',
    summary_reasoning: 'งานปูพื้นและงานระบบปรับอากาศล่าช้าเนื่องจากฝนตกหนักและส่งมอบสุขภัณฑ์ช้ากว่ากำหนด ล่าช้ากว่าแผนงาน 9.8% ต้องเฝ้าระวังและปรับกะงาน',
    photos: {
      facade: generateSampleConstructionImage('facade', 'หน้าร้านป่าตอง ติดตั้งกระจกได้เพียง 40%', 45),
      interior: generateSampleConstructionImage('interior', 'งานฝ้าเพดานภายในรอดำเนินการติดตั้งแอร์', 40),
      rear: generateSampleConstructionImage('rear', 'งานก่ออิฐผนังด้านหลังและระบบท่อระบายน้ำ', 50),
      parking: generateSampleConstructionImage('parking', 'ลานจอดรถดินชื้น รอเทคอนกรีตลานจอด', 35),
    },
    approval_status: 'APPROVED',
    approved_by: 'ระบบ AI อัตโนมัติ (Confidence 86% >= 80%)',
    approved_at: '2026-09-30T10:00:00Z',
    created_at: '2026-09-30T09:55:00Z',
  },
  {
    id: 'TFM-2026-004',
    branch_name: 'สาขา ขอนแก่น มิตรอารีย์',
    evaluated_date: '2026-09-29',
    delivery_date: '2026-11-20',
    province: 'ขอนแก่น',
    contractor: 'บจก. อีสาน บิลดิ้ง ดีเวลลอปเมนต์',
    supervisor: 'วิศวกร สมศักดิ์ อานันท์',
    confidence_score: 74, // < 80% -> Routed to Approval Queue
    category_scores: {
      front_facade: 30,
      interior: 25,
      rear_building: 35,
      parking_area: 20,
    },
    calculated_actual_progress: 27.25, // (30*0.3)+(25*0.4)+(35*0.15)+(20*0.15) = 9+10+5.25+3 = 27.25
    baseline_plan_progress: 48.0,
    variance_diff: -20.75, // < -15% -> CRITICAL (Red Flag)
    status_flag: 'CRITICAL',
    summary_reasoning: 'ความคืบหน้าต่ำกว่าเกณฑ์วิกฤต ล่าช้ากว่าแผนงาน 20.8% และภาพถ่ายภายในมีความมัว AI มีความมั่นใจ 74% จึงถูกส่งเข้าคิวอนุมัติเพื่อตรวจสอบซ้ำ',
    photos: {
      facade: generateSampleConstructionImage('facade', 'หน้าร้านมิตรอารีย์ โครงสร้างเหล็กยังไม่เสร็จ', 30),
      interior: generateSampleConstructionImage('interior', 'ภายในอาคาร ยังเป็นโครงเปล่า ไม่มีการเก็บสายไฟ', 25),
      rear: generateSampleConstructionImage('rear', 'ด้านหลังยังเป็นผนังดินและโครงสร้างชั่วคราว', 35),
      parking: generateSampleConstructionImage('parking', 'ลานจอดรถมีกองดินและเศษวัสดุก่อสร้าง', 20),
    },
    approval_status: 'PENDING_APPROVAL',
    created_at: '2026-09-29T16:30:00Z',
  },
];

export const PROVINCES_LIST = [
  'กรุงเทพฯ',
  'นนทบุรี',
  'ปทุมธานี',
  'สมุทรปราการ',
  'เชียงใหม่',
  'เชียงราย',
  'ขอนแก่น',
  'นครราชสีมา',
  'อุดรธานี',
  'ชลบุรี',
  'ระยอง',
  'ภูเก็ต',
  'สุราษฎร์ธานี',
  'สงขลา',
  'นครศรีธรรมราช',
  'พิษณุโลก',
  'นครสวรรค์',
  'พระนครศรีอยุธยา',
  'ประจวบคีรีขันธ์',
];

export const CONTRACTORS_LIST = [
  'บจก. สยาม คอนสตรัคชั่น บิลเดอร์',
  'หจก. นครพิงค์ เอ็นจิเนียริ่ง',
  'บจก. อันดามัน ซีวิล โปรเจกต์',
  'บจก. อีสาน บิลดิ้ง ดีเวลลอปเมนต์',
  'บจก. ไทย เจริญกิจ งานช่าง',
  'บจก. พรีเมียร์ สตรัคเจอร์ คอร์ปอเรชั่น',
];
