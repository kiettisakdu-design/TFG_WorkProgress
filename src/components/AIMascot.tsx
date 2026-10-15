import React from 'react';
import { StatusFlag } from '../types';

interface AIMascotProps {
  diff: number;
  statusFlag?: StatusFlag;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
}

export function getMascotDetails(diff: number) {
  if (diff >= 5) {
    return {
      status: 'EXCELLENT' as StatusFlag,
      title: 'ผลการดำเนินงานยอดเยี่ยม',
      item: 'ถ้วยรางวัลเรขาคณิตสีทอง (Minimalist Geometric Trophy)',
      badgeColor: 'emerald',
      bgGlow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      summary: `เร็วกว่าแผนงาน (+${diff.toFixed(1)}%)`,
      pose: 'GOLD_TROPHY',
      accentColor: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      description: 'คืบหน้าเร็วกว่าเกณฑ์มาตรฐาน รักษาคุณภาพและสปีดการทำงานได้อย่างยอดเยี่ยม',
    };
  } else if (diff >= -5) {
    return {
      status: 'ON_TRACK' as StatusFlag,
      title: 'เป็นไปตามแผนงาน',
      item: 'ท่ายืนกอดอกมาดมั่น เรขาคณิตมาตรฐาน (Geometric Confident Stance)',
      badgeColor: 'sky',
      bgGlow: 'from-sky-500/20 via-blue-500/10 to-transparent',
      borderColor: 'border-sky-500/40',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      summary: `เป็นไปตามแผนงาน (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%)`,
      pose: 'FOLDED_ARMS',
      accentColor: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.4)',
      description: 'งานก่อสร้างดำเนินไปอย่างแม่นยำตาม Milestone สะสม มาตรฐานวิศวกรรมครบถ้วน',
    };
  } else if (diff >= -15) {
    return {
      status: 'WARNING' as StatusFlag,
      title: 'ต้องเฝ้าระวัง',
      item: 'กล้องส่องทางไกลเรขาคณิต (Minimalist Geometric Binoculars)',
      badgeColor: 'amber',
      bgGlow: 'from-amber-500/25 via-yellow-500/10 to-transparent',
      borderColor: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      summary: `ล่าช้ากว่าแผนงาน (${diff.toFixed(1)}%)`,
      pose: 'BINOCULARS',
      accentColor: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.4)',
      description: 'พบจุดสะดุดในบางหมวดงาน แนะนำให้เร่งตรวจสอบสาเหตุและปรับตารางกำลังคน',
    };
  } else {
    return {
      status: 'CRITICAL' as StatusFlag,
      title: 'เตือนภัยระดับวิกฤต',
      item: 'ธงเตือนภัยเรขาคณิตสีแดง (Minimalist Geometric Red Flag)',
      badgeColor: 'rose',
      bgGlow: 'from-rose-500/30 via-red-500/10 to-transparent',
      borderColor: 'border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      summary: `วิกฤต! ล่าช้ามาก (${diff.toFixed(1)}%)`,
      pose: 'RED_FLAG',
      accentColor: '#f43f5e',
      accentGlow: 'rgba(244, 63, 94, 0.4)',
      description: 'ล่าช้าเกินเกณฑ์วิกฤต 15% ต้องเรียกประชุมด่วนกับผู้รับเหมาและวิศวกรผู้คุมงานทันที',
    };
  }
}

export const AIMascot: React.FC<AIMascotProps> = ({
  diff,
  size = 'md',
  showDetails = true,
}) => {
  const details = getMascotDetails(diff);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-60 h-60',
  }[size];

  return (
    <div className="flex flex-col items-center text-center">
      {/* Minimalist Geometric Engineer Mascot Illustration */}
      <div className={`relative ${sizeClasses} transition-all duration-300 hover:scale-105 select-none`}>
        {/* Ambient Geometric Backlight Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl bg-gradient-to-tr ${details.bgGlow} opacity-90 transition-all duration-700`}
        />

        {/* Minimalist Geometric Vector Art SVG */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full relative z-10 drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Minimalist Linear & Radial Gradients */}
            <linearGradient id="geomHelmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>

            <linearGradient id="geomVestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id="geomSuitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="geomGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id="geomFlagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="60%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>

            <filter id="geomSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. ARCHITECTURAL GEOMETRIC GRID & PEDESTAL */}
          <g id="geom-pedestal" opacity="0.85">
            {/* Concentric Blueprint Circles */}
            <circle cx="120" cy="195" r="46" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <ellipse cx="120" cy="202" rx="54" ry="14" fill="#0F172A" opacity="0.7" />
            <ellipse cx="120" cy="200" rx="42" ry="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            {/* Minimalist Axis Tick Marks */}
            <line x1="120" y1="184" x2="120" y2="188" stroke={details.accentColor} strokeWidth="1.5" />
            <line x1="74" y1="200" x2="78" y2="200" stroke="#64748B" strokeWidth="1" />
            <line x1="162" y1="200" x2="166" y2="200" stroke="#64748B" strokeWidth="1" />
          </g>

          {/* 2. LOWER BODY & LEGS (Clean Geometric Pillars) */}
          <g id="geom-lower-body">
            {/* Left Leg */}
            <rect x="100" y="162" width="16" height="28" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
            {/* Right Leg */}
            <rect x="124" y="162" width="16" height="28" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
            {/* Work Boot Soles (Minimalist Sleek Wedges) */}
            <path d="M96 188 H118 L116 195 H96 Z" fill="#334155" />
            <path d="M124 188 H146 L144 195 H124 Z" fill="#334155" />
            {/* High-vis ankle stripe */}
            <rect x="100" y="180" width="16" height="3" fill="#E2E8F0" opacity="0.9" />
            <rect x="124" y="180" width="16" height="3" fill="#E2E8F0" opacity="0.9" />
          </g>

          {/* 3. TORSO & GEOMETRIC HIGH-VIS SAFETY VEST */}
          <g id="geom-torso">
            {/* Dark inner technical turtleneck */}
            <path d="M98 116 L142 116 L146 164 L94 164 Z" fill="url(#geomSuitGrad)" />

            {/* High-Vis Vest Body (Crisp Angular Facets) */}
            <polygon
              points="96,120 144,120 148,162 92,162"
              fill="url(#geomVestGrad)"
              stroke="#EA580C"
              strokeWidth="0.8"
            />

            {/* Minimalist Geometric Reflective Chevrons (Silver White Band) */}
            <polygon
              points="95,134 107,134 120,146 133,134 145,134 146,140 120,154 94,140"
              fill="#F8FAFC"
              opacity="0.95"
            />
            {/* Horizontal Waist Reflective Strip */}
            <rect x="93" y="152" width="54" height="4" fill="#F8FAFC" opacity="0.95" />

            {/* Center Zipper / Alignment Line */}
            <line x1="120" y1="120" x2="120" y2="162" stroke="#7C2D12" strokeWidth="1.5" />

            {/* Shop TFM Geometric Smart Badge on Chest */}
            <polygon points="102,125 110,125 110,133 106,136 102,133" fill="#0284C7" />
            <circle cx="106" cy="129" r="1.5" fill="#FFFFFF" />
          </g>

          {/* 4. GEOMETRIC HEAD & MINIMALIST VISOR */}
          <g id="geom-head">
            {/* Neck Pillar */}
            <rect x="113" y="106" width="14" height="12" rx="2" fill="#FDBA74" />

            {/* Head Silhouette (Clean Faceted Octagon / Rounded Hexagon) */}
            <polygon
              points="102,82 138,82 142,95 138,108 102,108 98,95"
              fill="#FED7AA"
            />

            {/* Minimalist Cyber Visor / Smart Safety Goggles */}
            <polygon
              points="99,87 141,87 140,99 100,99"
              fill="#0F172A"
              stroke="#1E293B"
              strokeWidth="1"
            />

            {/* Glowing Digital HUD Scan Line */}
            <line
              x1="102"
              y1="93"
              x2="138"
              y2="93"
              stroke={details.accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#geomSoftGlow)"
            />
            {/* HUD Status Dot */}
            <circle cx="134" cy="93" r="1.5" fill="#FFFFFF" />
            <circle cx="106" cy="93" r="1" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* 5. MINIMALIST GEOMETRIC SAFETY HELMET */}
          <g id="geom-helmet">
            {/* Hard-Hat Dome (Pure Hexagonal Geometric Arch) */}
            <polygon
              points="120,44 144,55 146,74 94,74 96,55"
              fill="url(#geomHelmetGrad)"
              stroke="#CA8A04"
              strokeWidth="1"
            />

            {/* Helmet Center Crest Ridge (Minimalist Vertical Keystone) */}
            <polygon
              points="117,44 123,44 124,74 116,74"
              fill="#FEF08A"
              opacity="0.9"
            />

            {/* Helmet Geometric Visor Brim */}
            <polygon
              points="90,74 150,74 146,79 94,79"
              fill="#EAB308"
              stroke="#A16207"
              strokeWidth="0.8"
            />

            {/* TFM Geometric Logo Emblem on Helmet Front */}
            <polygon points="120,53 125,62 115,62" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
            <polygon points="120,58 122,62 118,62" fill="#FFFFFF" />

            {/* Minimalist Geometric Smart Headset / Ear Protectors */}
            <circle cx="94" cy="85" r="4.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
            <circle cx="94" cy="85" r="2" fill={details.accentColor} />
            <circle cx="146" cy="85" r="4.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
            <circle cx="146" cy="85" r="2" fill={details.accentColor} />
          </g>

          {/* 6. DYNAMIC MINIMALIST GEOMETRIC POSES & ACCESSORIES */}

          {/* POSE 1: GOLD_TROPHY (diff >= 5) */}
          {details.pose === 'GOLD_TROPHY' && (
            <g id="geom-pose-trophy">
              {/* Left Arm: Angled upward greeting */}
              <polyline
                points="95,124 76,136 70,126"
                stroke="#F97316"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="70" cy="125" r="4.5" fill="#334155" />

              {/* Right Arm: Holding Trophy High */}
              <polyline
                points="145,124 165,116 172,92"
                stroke="#F97316"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="172" cy="91" r="5" fill="#334155" />

              {/* Minimalist Geometric Gold Trophy Cup */}
              <g id="geom-trophy" transform="translate(150, 42)">
                {/* Trophy Pedestal Base */}
                <polygon points="14,46 30,46 28,52 16,52" fill="#78350F" />
                <rect x="20" y="38" width="4" height="8" fill="#F59E0B" />
                {/* Main Geometric Faceted Cup */}
                <polygon
                  points="10,12 34,12 30,38 14,38"
                  fill="url(#geomGoldGrad)"
                  stroke="#F59E0B"
                  strokeWidth="1"
                />
                {/* Facet Highlights */}
                <polygon points="10,12 22,12 20,38 14,38" fill="#FEF08A" opacity="0.6" />
                {/* Minimalist Handles (Geometric Hex-Rings) */}
                <path d="M10 16 L4 22 L7 28 L11 26" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M34 16 L40 22 L37 28 L33 26" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                {/* Center Star on Trophy */}
                <polygon points="22,18 24,24 30,24 25,28 27,34 22,30 17,34 19,28 14,24 20,24" fill="#FFFFFF" />
              </g>

              {/* Floating Geometric Sparkle Stars */}
              <g id="geom-sparkles" className="animate-pulse">
                {/* 4-point Diamond Star 1 */}
                <polygon points="194,36 197,42 204,44 197,46 194,52 191,46 184,44 191,42" fill="#FEF08A" />
                {/* 4-point Diamond Star 2 */}
                <polygon points="76,64 78,68 83,69 78,71 76,75 74,71 69,69 74,68" fill="#34D399" />
                {/* Small Diamond Sparkle */}
                <polygon points="160,26 162,29 166,30 162,31 160,34 158,31 154,30 158,29" fill="#FBBF24" />
              </g>
            </g>
          )}

          {/* POSE 2: FOLDED_ARMS (diff between -5 and +5) */}
          {details.pose === 'FOLDED_ARMS' && (
            <g id="geom-pose-folded">
              {/* Left & Right Folded Arms (Geometric Crossing Hexagonal Bars) */}
              {/* Left Bicep */}
              <polyline
                points="95,124 82,138 98,148"
                stroke="#EA580C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Bicep */}
              <polyline
                points="145,124 158,138 142,148"
                stroke="#EA580C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Horizontal Forearm Crossing Bar */}
              <rect x="94" y="142" width="52" height="11" rx="4" fill="#FB923C" stroke="#C2410C" strokeWidth="1" />
              {/* High-vis stripe on folded arms */}
              <rect x="108" y="145" width="24" height="4" fill="#F8FAFC" opacity="0.95" />
              {/* Work Gloves tucked */}
              <circle cx="97" cy="147" r="4.5" fill="#334155" />
              <circle cx="143" cy="147" r="4.5" fill="#334155" />

              {/* Minimalist Geometric Blueprint Stylus / Tablet at Hip */}
              <g id="geom-tablet" transform="translate(152, 134)">
                <rect x="0" y="0" width="16" height="24" rx="2" fill="#0F172A" stroke="#0284C7" strokeWidth="1" />
                <rect x="2" y="3" width="12" height="15" rx="1" fill="#0369A1" opacity="0.8" />
                {/* Geometric Checkmark */}
                <polyline points="4,11 7,14 12,8" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Clean Geometric Halo Rings (Calm & Balanced) */}
              <circle cx="120" cy="96" r="54" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.4" />
            </g>
          )}

          {/* POSE 3: BINOCULARS (diff between -15 and -5) */}
          {details.pose === 'BINOCULARS' && (
            <g id="geom-pose-binoculars">
              {/* Left Arm Raised to Face */}
              <polyline
                points="95,124 82,112 104,96"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Arm Raised to Face */}
              <polyline
                points="145,124 158,112 136,96"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Minimalist Geometric Cyber Binoculars */}
              <g id="geom-binoculars">
                {/* Center Bridge Axle */}
                <rect x="114" y="90" width="12" height="6" rx="1" fill="#475569" />
                {/* Left Geometric Lens Cylinder */}
                <rect x="98" y="85" width="16" height="17" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                <circle cx="106" cy="93" r="5.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
                <circle cx="106" cy="93" r="3" fill="#F59E0B" filter="url(#geomSoftGlow)" />

                {/* Right Geometric Lens Cylinder */}
                <rect x="126" y="85" width="16" height="17" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                <circle cx="134" cy="93" r="5.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
                <circle cx="134" cy="93" r="3" fill="#F59E0B" filter="url(#geomSoftGlow)" />

                {/* Focus Dial */}
                <rect x="117" y="83" width="6" height="4" rx="1" fill="#F59E0B" />
              </g>

              {/* Geometric Warning Triangle Motif Floating */}
              <g id="geom-caution-mark" className="animate-bounce" style={{ animationDuration: '2s' }}>
                <polygon points="184,60 198,84 170,84" fill="#78350F" opacity="0.8" />
                <polygon points="184,63 195,82 173,82" fill="#F59E0B" />
                <line x1="184" y1="69" x2="184" y2="76" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                <circle cx="184" cy="79" r="1" fill="#000000" />
              </g>

              {/* Radar Scan Rays */}
              <path d="M106 85 L90 56" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
              <path d="M134 85 L150 56" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
            </g>
          )}

          {/* POSE 4: RED_FLAG (diff < -15) */}
          {details.pose === 'RED_FLAG' && (
            <g id="geom-pose-flag">
              {/* Left Arm: Down / Anchored */}
              <polyline
                points="95,124 82,142 80,158"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="80" cy="159" r="4.5" fill="#334155" />

              {/* Right Arm: Gripping high flagpole */}
              <polyline
                points="145,124 165,116 172,96"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="172" cy="95" r="5" fill="#334155" />

              {/* Minimalist Geometric Flagpole */}
              <line x1="172" y1="20" x2="172" y2="190" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
              <polygon points="172,14 176,20 168,20" fill="#FACC15" />

              {/* Sharp Minimalist Geometric Red Hazard Pennant */}
              <g id="geom-flag">
                {/* Triangular Pennant with Faceted Shadow */}
                <polygon
                  points="173,22 226,38 173,56"
                  fill="url(#geomFlagGrad)"
                  filter="url(#geomSoftGlow)"
                />
                <polygon points="173,22 204,33 173,42" fill="#FDA4AF" opacity="0.7" />

                {/* Geometric White Exclamation Point */}
                <line x1="184" y1="31" x2="184" y2="40" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="184" cy="45" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Geometric Angular Alert Shockwaves */}
              <g id="geom-shockwaves" className="animate-ping" style={{ animationDuration: '2s' }}>
                <polyline points="218,22 228,26 222,34" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                <polyline points="214,48 226,52 220,60" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Mascot Status Badge & Details */}
      {showDetails && (
        <div className="mt-3 flex flex-col items-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${details.badgeBg} shadow-sm backdrop-blur-md`}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: details.accentColor }}
            />
            <span>{details.summary}</span>
          </div>

          <div className="mt-1 text-sm font-bold text-slate-100">{details.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{details.item}</div>
        </div>
      )}
    </div>
  );
};
