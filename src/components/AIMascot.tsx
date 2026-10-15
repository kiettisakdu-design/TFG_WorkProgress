import React from 'react';
import { StatusFlag } from '../types';

interface AIMascotProps {
  diff: number;
  statusFlag?: StatusFlag;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
}

export function getMascotDetails(diff: number) {
  // 2.1 เร็วกว่าแผนงาน (+5% ขึ้นไป): ถ้วยรางวัลเรขาคณิตสีทอง พร้อมประกายดาว Geometric Sparkle และแสงออร่า Emerald
  if (diff >= 5) {
    return {
      status: 'EXCELLENT' as StatusFlag,
      condition: '+5% ขึ้นไป',
      title: 'เร็วกว่าแผนงาน (+5% ขึ้นไป)',
      item: 'ถ้วยรางวัลเรขาคณิตสีทอง (Minimalist Geometric Trophy)',
      badgeColor: 'emerald',
      bgGlow: 'from-emerald-500/35 via-teal-500/20 to-transparent',
      borderColor: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      summary: `เร็วกว่าแผนงาน (+${diff.toFixed(1)}%)`,
      pose: 'GOLD_TROPHY',
      accentColor: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.45)',
      description: 'ถ้วยรางวัลเรขาคณิตสีทอง พร้อมประกายดาว Geometric Sparkle และแสงออร่า Emerald',
    };
  }
  // 2.2 เป็นไปตามแผนงาน (-5% ถึง +5%): ท่ายืนกอดอกมาดมั่น สมมาตรเรขาคณิต และแท็บเล็ต Blueprint พร้อมเครื่องหมายตรวจสอบ
  else if (diff >= -5) {
    return {
      status: 'ON_TRACK' as StatusFlag,
      condition: '-5% ถึง +5%',
      title: 'เป็นไปตามแผนงาน (-5% ถึง +5%)',
      item: 'ท่ายืนกอดอกมาดมั่น สมมาตรเรขาคณิต (Geometric Confident Stance)',
      subItem: 'แท็บเล็ต Blueprint พร้อมเครื่องหมายตรวจสอบ (✓)',
      badgeColor: 'sky',
      bgGlow: 'from-sky-500/25 via-blue-500/15 to-transparent',
      borderColor: 'border-sky-500/40',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      summary: `เป็นไปตามแผนงาน (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%)`,
      pose: 'FOLDED_ARMS',
      accentColor: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.4)',
      description: 'ท่ายืนกอดอกมาดมั่น สมมาตรเรขาคณิต และแท็บเล็ต Blueprint พร้อมเครื่องหมายตรวจสอบ',
    };
  }
  // 2.3 เฝ้าระวัง (-15% ถึง -5%): กล้องส่องทางไกลเรขาคณิต (Cyber Binoculars) พร้อมเลนส์เรขาคณิตสีอำพันและเครื่องหมายระวังทรงสามเหลี่ยม
  else if (diff >= -15) {
    return {
      status: 'WARNING' as StatusFlag,
      condition: '-15% ถึง -5%',
      title: 'เฝ้าระวัง (-15% ถึง -5%)',
      item: 'กล้องส่องทางไกลเรขาคณิต (Cyber Binoculars)',
      subItem: 'เลนส์สีอำพัน & เครื่องหมายระวังทรงสามเหลี่ยม (⚠)',
      badgeColor: 'amber',
      bgGlow: 'from-amber-500/30 via-yellow-500/15 to-transparent',
      borderColor: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      summary: `เฝ้าระวัง (${diff.toFixed(1)}%)`,
      pose: 'BINOCULARS',
      accentColor: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.45)',
      description: 'กล้องส่องทางไกลเรขาคณิต พร้อมเลนส์เรขาคณิตสีอำพันและเครื่องหมายระวังทรงสามเหลี่ยม',
    };
  }
  // 2.4 วิกฤต (ต่ำกว่า -15%): ธงเตือนภัยเรขาคณิตสีแดง (Minimalist Geometric Red Flag) ปลายแหลมคมชัดพร้อมคลื่นสัญญาณเตือน
  else {
    return {
      status: 'CRITICAL' as StatusFlag,
      condition: 'ต่ำกว่า -15%',
      title: 'วิกฤต (ต่ำกว่า -15%)',
      item: 'ธงเตือนภัยเรขาคณิตสีแดง (Minimalist Geometric Red Flag)',
      subItem: 'ปลายแหลมคมชัดพร้อมคลื่นสัญญาณเตือน (🚨)',
      badgeColor: 'rose',
      bgGlow: 'from-rose-500/35 via-red-500/20 to-transparent',
      borderColor: 'border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      summary: `วิกฤต! ต่ำกว่า -15% (${diff.toFixed(1)}%)`,
      pose: 'RED_FLAG',
      accentColor: '#f43f5e',
      accentGlow: 'rgba(244, 63, 94, 0.5)',
      description: 'ธงเตือนภัยเรขาคณิตสีแดง ปลายแหลมคมชัดพร้อมคลื่นสัญญาณเตือน',
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
            {/* Minimalist Gradients */}
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

            {/* Gold Trophy Gradient */}
            <linearGradient id="geomGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Red Flag Gradient */}
            <linearGradient id="geomFlagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="60%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>

            {/* Amber Lens Gradient */}
            <radialGradient id="geomAmberLens" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>

            {/* Emerald Aura Radial Gradient */}
            <radialGradient id="geomEmeraldAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>

            <filter id="geomSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="geomStrongGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. ARCHITECTURAL GEOMETRIC GRID & PEDESTAL */}
          <g id="geom-pedestal" opacity="0.85">
            <circle cx="120" cy="195" r="46" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <ellipse cx="120" cy="202" rx="54" ry="14" fill="#0F172A" opacity="0.7" />
            <ellipse cx="120" cy="200" rx="42" ry="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            {/* Minimalist Axis Tick Marks */}
            <line x1="120" y1="184" x2="120" y2="188" stroke={details.accentColor} strokeWidth="1.5" />
            <line x1="74" y1="200" x2="78" y2="200" stroke="#64748B" strokeWidth="1" />
            <line x1="162" y1="200" x2="166" y2="200" stroke="#64748B" strokeWidth="1" />
          </g>

          {/* EMERALD AURA LIGHT (Only for 2.1: diff >= 5) */}
          {details.pose === 'GOLD_TROPHY' && (
            <g id="geom-emerald-aura">
              {/* Concentric Emerald Aura Halo Rings */}
              <circle
                cx="120"
                cy="110"
                r="74"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.55"
                filter="url(#geomSoftGlow)"
              />
              <circle
                cx="120"
                cy="110"
                r="88"
                stroke="#34D399"
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.35"
              />
              {/* Soft radial emerald light pool behind mascot */}
              <ellipse cx="120" cy="115" rx="60" ry="55" fill="url(#geomEmeraldAura)" opacity="0.5" />
              {/* Geometric Aura Ray Accents */}
              <line x1="120" y1="25" x2="120" y2="35" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="45" y1="110" x2="55" y2="110" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="185" y1="110" x2="195" y2="110" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            </g>
          )}

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

          {/* =========================================================================
              6. DYNAMIC MINIMALIST GEOMETRIC POSES & ACCESSORIES (User Spec 2.1 - 2.4)
             ========================================================================= */}

          {/* POSE 2.1: GOLD_TROPHY (+5% ขึ้นไป)
              ถ้วยรางวัลเรขาคณิตสีทอง (Minimalist Geometric Trophy)
              พร้อมประกายดาว Geometric Sparkle และแสงออร่า Emerald */}
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
              <g id="geom-trophy" transform="translate(150, 40)">
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
                <polygon points="10,12 22,12 20,38 14,38" fill="#FEF08A" opacity="0.7" />
                {/* Minimalist Handles (Geometric Hex-Rings) */}
                <path d="M10 16 L4 22 L7 28 L11 26" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M34 16 L40 22 L37 28 L33 26" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                {/* Center Star on Trophy */}
                <polygon points="22,18 24,24 30,24 25,28 27,34 22,30 17,34 19,28 14,24 20,24" fill="#FFFFFF" />
              </g>

              {/* Floating Geometric Sparkle Stars (Geometric Sparkle) */}
              <g id="geom-sparkles" className="animate-pulse">
                {/* Sparkle 1: Emerald Star */}
                <polygon points="196,32 199,39 207,41 199,43 196,50 193,43 185,41 193,39" fill="#34D399" filter="url(#geomSoftGlow)" />
                {/* Sparkle 2: Golden Star */}
                <polygon points="74,58 76,63 82,64 76,66 74,71 72,66 66,64 72,63" fill="#FDE047" />
                {/* Sparkle 3: White Diamond Sparkle near Trophy */}
                <polygon points="156,24 158,28 163,29 158,30 156,34 154,30 149,29 154,28" fill="#FFFFFF" />
                {/* Sparkle 4: Emerald Diamond Sparkle */}
                <polygon points="214,68 216,71 220,72 216,73 214,76 212,73 208,72 212,71" fill="#10B981" />
              </g>
            </g>
          )}

          {/* POSE 2.2: FOLDED_ARMS (-5% ถึง +5%)
              ท่ายืนกอดอกมาดมั่น สมมาตรเรขาคณิต (Geometric Confident Stance)
              และแท็บเล็ต Blueprint พร้อมเครื่องหมายตรวจสอบ */}
          {details.pose === 'FOLDED_ARMS' && (
            <g id="geom-pose-confident-blueprint">
              {/* Left & Right Folded Arms (Geometric Confident Stance: Symmetrical Hexagonal Crossing Bars) */}
              {/* Left Bicep */}
              <polyline
                points="95,124 80,138 98,148"
                stroke="#EA580C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Bicep */}
              <polyline
                points="145,124 160,138 142,148"
                stroke="#EA580C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Symmetrical Forearm Crossing Bar */}
              <rect x="92" y="141" width="56" height="12" rx="4" fill="#FB923C" stroke="#C2410C" strokeWidth="1" />
              {/* Symmetrical High-Vis Chevron Center Accent */}
              <polygon points="106,143 120,151 134,143 134,147 120,155 106,147" fill="#F8FAFC" />
              {/* Symmetrical Tucked Work Gloves */}
              <circle cx="95" cy="147" r="4.5" fill="#334155" />
              <circle cx="145" cy="147" r="4.5" fill="#334155" />

              {/* แท็บเล็ต Blueprint พร้อมเครื่องหมายตรวจสอบ (Minimalist Geometric Blueprint Tablet) */}
              <g id="geom-blueprint-tablet" transform="translate(152, 126)">
                {/* Tablet Frame / Hardware */}
                <rect x="0" y="0" width="22" height="32" rx="3" fill="#0F172A" stroke="#0284C7" strokeWidth="1.2" />
                {/* Blueprint Screen (Deep Blueprint Blue) */}
                <rect x="2" y="2" width="18" height="28" rx="2" fill="#0369A1" opacity="0.9" />

                {/* Blueprint Grid Lines */}
                <line x1="3" y1="8" x2="19" y2="8" stroke="#38BDF8" strokeWidth="0.5" opacity="0.5" />
                <line x1="3" y1="14" x2="19" y2="14" stroke="#38BDF8" strokeWidth="0.5" opacity="0.5" />
                <line x1="3" y1="20" x2="19" y2="20" stroke="#38BDF8" strokeWidth="0.5" opacity="0.5" />
                <line x1="8" y1="3" x2="8" y2="28" stroke="#38BDF8" strokeWidth="0.5" opacity="0.5" />
                <line x1="14" y1="3" x2="14" y2="28" stroke="#38BDF8" strokeWidth="0.5" opacity="0.5" />

                {/* Sharp Geometric Blueprint Checkmark (เครื่องหมายตรวจสอบ) */}
                <g filter="url(#geomSoftGlow)">
                  <circle cx="11" cy="16" r="6" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                  <polyline
                    points="7,16 10,19 15,13"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Status Indicator LED */}
                <circle cx="18" cy="4" r="1" fill="#34D399" />
              </g>

              {/* Clean Geometric Symmetry Alignment Ring */}
              <circle cx="120" cy="100" r="56" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.45" />
              <line x1="60" y1="100" x2="68" y2="100" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />
              <line x1="172" y1="100" x2="180" y2="100" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />
            </g>
          )}

          {/* POSE 2.3: BINOCULARS (-15% ถึง -5%)
              กล้องส่องทางไกลเรขาคณิต (Cyber Binoculars)
              พร้อมเลนส์เรขาคณิตสีอำพันและเครื่องหมายระวังทรงสามเหลี่ยม */}
          {details.pose === 'BINOCULARS' && (
            <g id="geom-pose-binoculars">
              {/* Left Arm Raised to Face */}
              <polyline
                points="95,124 80,112 102,96"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Arm Raised to Face */}
              <polyline
                points="145,124 160,112 138,96"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* กล้องส่องทางไกลเรขาคณิต (Cyber Binoculars) */}
              <g id="geom-cyber-binoculars">
                {/* Center Bridge Axle & Focus Knob */}
                <rect x="113" y="90" width="14" height="6" rx="1.5" fill="#475569" stroke="#1E293B" strokeWidth="0.8" />
                <rect x="117" y="84" width="6" height="5" rx="1" fill="#F59E0B" />

                {/* Left Geometric Lens Cylinder */}
                <rect x="96" y="85" width="18" height="18" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                {/* เลนส์เรขาคณิตสีอำพัน 1 */}
                <circle cx="105" cy="94" r="6.5" fill="url(#geomAmberLens)" stroke="#D97706" strokeWidth="1" />
                <circle cx="105" cy="94" r="3.5" fill="#FEF08A" filter="url(#geomSoftGlow)" opacity="0.9" />
                {/* Amber Reticle Crosshair */}
                <line x1="101" y1="94" x2="109" y2="94" stroke="#78350F" strokeWidth="0.8" />
                <line x1="105" y1="90" x2="105" y2="98" stroke="#78350F" strokeWidth="0.8" />

                {/* Right Geometric Lens Cylinder */}
                <rect x="126" y="85" width="18" height="18" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                {/* เลนส์เรขาคณิตสีอำพัน 2 */}
                <circle cx="135" cy="94" r="6.5" fill="url(#geomAmberLens)" stroke="#D97706" strokeWidth="1" />
                <circle cx="135" cy="94" r="3.5" fill="#FEF08A" filter="url(#geomSoftGlow)" opacity="0.9" />
                {/* Amber Reticle Crosshair */}
                <line x1="131" y1="94" x2="139" y2="94" stroke="#78350F" strokeWidth="0.8" />
                <line x1="135" y1="90" x2="135" y2="98" stroke="#78350F" strokeWidth="0.8" />
              </g>

              {/* เครื่องหมายระวังทรงสามเหลี่ยม (Geometric Caution Triangle) */}
              <g id="geom-caution-mark" className="animate-bounce" style={{ animationDuration: '2.5s' }}>
                <polygon points="186,58 202,86 170,86" fill="#78350F" opacity="0.85" />
                <polygon points="186,61 199,84 173,84" fill="#F59E0B" stroke="#FEF08A" strokeWidth="0.8" />
                {/* Exclamation Mark inside triangle */}
                <line x1="186" y1="68" x2="186" y2="76" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="186" cy="80" r="1.2" fill="#000000" />
              </g>

              {/* Amber Cyber Scan Cones / Radar Ray Accents */}
              <path d="M105 85 L85 52" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
              <path d="M135 85 L155 52" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
              <path d="M96 94 L68 94" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            </g>
          )}

          {/* POSE 2.4: RED_FLAG (ต่ำกว่า -15%)
              ธงเตือนภัยเรขาคณิตสีแดง (Minimalist Geometric Red Flag) ปลายแหลมคมชัด
              พร้อมคลื่นสัญญาณเตือน */}
          {details.pose === 'RED_FLAG' && (
            <g id="geom-pose-flag">
              {/* Left Arm: Anchored down */}
              <polyline
                points="95,124 82,142 80,158"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="80" cy="159" r="4.5" fill="#334155" />

              {/* Right Arm: Raised gripping high flagpole */}
              <polyline
                points="145,124 165,116 172,96"
                stroke="#F97316"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="172" cy="95" r="5" fill="#334155" />

              {/* Minimalist Geometric Flagpole */}
              <line x1="172" y1="16" x2="172" y2="190" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
              <polygon points="172,10 177,16 167,16" fill="#FACC15" />

              {/* Sharp Minimalist Geometric Red Hazard Flag (ธงเตือนภัยปลายแหลมคมชัด) */}
              <g id="geom-red-flag">
                {/* Sharp-pointed triangular pennant with faceted angle */}
                <polygon
                  points="173,18 232,36 173,56"
                  fill="url(#geomFlagGrad)"
                  filter="url(#geomSoftGlow)"
                  stroke="#E11D48"
                  strokeWidth="1"
                />
                {/* Geometric Facet Highlight */}
                <polygon points="173,18 206,31 173,42" fill="#FDA4AF" opacity="0.75" />

                {/* Geometric White Exclamation Point */}
                <line x1="185" y1="28" x2="185" y2="38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="185" cy="44" r="1.5" fill="#FFFFFF" />
              </g>

              {/* คลื่นสัญญาณเตือน (Alert Warning Shockwaves radiating from flag) */}
              <g id="geom-alert-waves">
                {/* Arc Shockwave 1 */}
                <path
                  d="M214 18 A 20 20 0 0 1 228 50"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                {/* Arc Shockwave 2 */}
                <path
                  d="M222 10 A 32 32 0 0 1 238 60"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3 3"
                  className="animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                {/* Chevron shockwave pulses */}
                <polyline points="228,26 236,32 230,38" fill="none" stroke="#FB7185" strokeWidth="1.8" />
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
          <div className="text-xs text-slate-300 font-medium mt-0.5">{details.item}</div>
          {details.subItem && (
            <div className="text-[11px] text-slate-400 mt-0.5">{details.subItem}</div>
          )}
        </div>
      )}
    </div>
  );
};
