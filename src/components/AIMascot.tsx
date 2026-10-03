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
      item: 'ถือถ้วยรางวัลสีทอง (3D Voxel Gold Trophy)',
      badgeColor: 'emerald',
      bgGlow: 'from-emerald-500/25 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      summary: `เร็วกว่าแผนงาน (+${diff.toFixed(1)}%)`,
      pose: 'GOLD_TROPHY',
      accentColor: '#10b981',
      description: 'งานก่อสร้างคืบหน้าเร็วกว่ากำหนดการมาตรฐาน รักษาความต่อเนื่องของคุณภาพงาน',
    };
  } else if (diff >= -5) {
    return {
      status: 'ON_TRACK' as StatusFlag,
      title: 'เป็นไปตามแผนงาน',
      item: 'ยืนกอดอก มาดมั่น (3D Voxel Folded Arms)',
      badgeColor: 'slate',
      bgGlow: 'from-sky-500/25 via-slate-500/5 to-transparent',
      borderColor: 'border-sky-500/40',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
      summary: `เป็นไปตามแผนงาน (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%)`,
      pose: 'FOLDED_ARMS',
      accentColor: '#38bdf8',
      description: 'การควบคุมหน้างานเป็นไปตาม Milestone สะสม สภาพแวดล้อมและงานตกแต่งตรงสเปก',
    };
  } else if (diff >= -15) {
    return {
      status: 'WARNING' as StatusFlag,
      title: 'ต้องเฝ้าระวัง',
      item: 'ถือกล้องส่องทางไกล (3D Voxel Binoculars)',
      badgeColor: 'amber',
      bgGlow: 'from-amber-500/25 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      summary: `ล่าช้ากว่าแผนงาน (${diff.toFixed(1)}%)`,
      pose: 'BINOCULARS',
      accentColor: '#f59e0b',
      description: 'พบจุดสะดุดในบางหมวดงาน แนะนำให้เร่งตรวจสอบสาเหตุและปรับตารางกำลังคน',
    };
  } else {
    return {
      status: 'CRITICAL' as StatusFlag,
      title: 'เตือนภัยระดับวิกฤต',
      item: 'ถือธงสีแดง (3D Voxel Red Flag)',
      badgeColor: 'rose',
      bgGlow: 'from-rose-500/30 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/60',
      summary: `วิกฤต! ล่าช้ามาก (${diff.toFixed(1)}%)`,
      pose: 'RED_FLAG',
      accentColor: '#f43f5e',
      description: 'ล่าช้าเกินเกณฑ์วิกฤต 15% ต้องเรียกประชุมด่วนกับผู้รับเหมาและวิศวกรผู้คุมงานทันที',
    };
  }
}

/**
 * Helper to render an isometric 3D Voxel Cube.
 * x, y: center top coordinate
 * w: half-width
 * d: isometric depth
 * h: block height
 */
const VoxelCube: React.FC<{
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  topColor: string;
  leftColor: string;
  rightColor: string;
  className?: string;
  filter?: string;
}> = ({ x, y, w, d, h, topColor, leftColor, rightColor, className, filter }) => {
  return (
    <g className={className} filter={filter}>
      {/* Left Face */}
      <polygon
        points={`${x - w},${y + d} ${x},${y + 2 * d} ${x},${y + 2 * d + h} ${x - w},${y + d + h}`}
        fill={leftColor}
      />
      {/* Right Face */}
      <polygon
        points={`${x},${y + 2 * d} ${x + w},${y + d} ${x + w},${y + d + h} ${x},${y + 2 * d + h}`}
        fill={rightColor}
      />
      {/* Top Face */}
      <polygon
        points={`${x},${y} ${x + w},${y + d} ${x},${y + 2 * d} ${x - w},${y + d}`}
        fill={topColor}
      />
    </g>
  );
};

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
      {/* 3D Voxel Art Mascot Illustration */}
      <div className={`relative ${sizeClasses} transition-transform duration-300 hover:scale-105 select-none`}>
        {/* Ambient Backlight Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-tr ${details.bgGlow} opacity-80 animate-pulse`}
          style={{ animationDuration: '3s' }}
        />

        {/* 3D Voxel Art SVG */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full relative z-10 drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="voxelGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Isometric Voxel Ground Shadow Platform */}
          <g id="voxel-shadow">
            <ellipse cx="120" cy="216" rx="60" ry="12" fill="#090d16" opacity="0.6" />
            {/* Voxel pedestal tiles */}
            <VoxelCube x={120} y={202} w={55} d={12} h={6} topColor="#1e293b" leftColor="#0f172a" rightColor="#090d16" />
            <VoxelCube x={120} y={198} w={48} d={10} h={4} topColor="#334155" leftColor="#1e293b" rightColor="#0f172a" />
          </g>

          {/* Voxel Legs & Work Boots */}
          <g id="voxel-legs">
            {/* Left Boot */}
            <VoxelCube x={102} y={180} w={12} d={5} h={14} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />
            {/* Right Boot */}
            <VoxelCube x={138} y={180} w={12} d={5} h={14} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />
            {/* Left Pant Leg */}
            <VoxelCube x={102} y={162} w={12} d={5} h={18} topColor="#0284c7" leftColor="#0369a1" rightColor="#075985" />
            {/* Right Pant Leg */}
            <VoxelCube x={138} y={162} w={12} d={5} h={18} topColor="#0284c7" leftColor="#0369a1" rightColor="#075985" />
          </g>

          {/* Voxel Torso & High-Vis Safety Vest */}
          <g id="voxel-torso">
            {/* Base Body block */}
            <VoxelCube x={120} y={118} w={32} d={10} h={44} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
            {/* Reflective Voxel Stripe (Silver White) */}
            <VoxelCube x={120} y={134} w={33} d={10} h={7} topColor="#f8fafc" leftColor="#e2e8f0" rightColor="#cbd5e1" />
            <VoxelCube x={120} y={148} w={33} d={10} h={7} topColor="#f8fafc" leftColor="#e2e8f0" rightColor="#cbd5e1" />
            {/* TFM Logo Voxel Patch */}
            <VoxelCube x={104} y={124} w={7} d={3} h={6} topColor="#38bdf8" leftColor="#0284c7" rightColor="#0369a1" />
          </g>

          {/* Voxel Head & Visor */}
          <g id="voxel-head">
            {/* Neck */}
            <VoxelCube x={120} y={108} w={10} d={4} h={10} topColor="#fed7aa" leftColor="#fba76a" rightColor="#ea580c" />
            {/* Head Core Block */}
            <VoxelCube x={120} y={70} w={24} d={8} h={38} topColor="#fed7aa" leftColor="#fba76a" rightColor="#f97316" />

            {/* 3D Voxel Smart Visor / Cyber Goggles */}
            <VoxelCube
              x={120}
              y={80}
              w={26}
              d={8}
              h={12}
              topColor="#0f172a"
              leftColor={details.accentColor}
              rightColor={details.accentColor}
            />
            {/* Visor Glint / Voxel Pixels */}
            <polygon points="106,85 114,88 114,93 106,90" fill="#ffffff" opacity="0.9" />
            <polygon points="126,85 134,88 134,93 126,90" fill="#ffffff" opacity="0.9" />
          </g>

          {/* 3D Voxel Safety Helmet (Tiered Blocky Stepped Geometry) */}
          <g id="voxel-helmet">
            {/* Helmet Brim (Wide step) */}
            <VoxelCube x={120} y={64} w={30} d={10} h={8} topColor="#facc15" leftColor="#eab308" rightColor="#ca8a04" />
            {/* Helmet Middle Tier */}
            <VoxelCube x={120} y={50} w={24} d={8} h={14} topColor="#fde047" leftColor="#facc15" rightColor="#ca8a04" />
            {/* Helmet Center Top Ridge */}
            <VoxelCube x={120} y={40} w={10} d={7} h={10} topColor="#fef08a" leftColor="#fde047" rightColor="#eab308" />
            {/* Helmet TFM Voxel Emblem (Front) */}
            <VoxelCube x={120} y={58} w={6} d={2} h={6} topColor="#38bdf8" leftColor="#0284c7" rightColor="#0369a1" />
          </g>

          {/* DYNAMIC 3D VOXEL POSES & ACCESSORIES (Section 4 & Request 6) */}

          {/* POSE 1: GOLD_TROPHY (3D Voxel Gold Trophy Cup) */}
          {details.pose === 'GOLD_TROPHY' && (
            <g id="voxel-pose-trophy" className="animate-bounce" style={{ animationDuration: '2.5s' }}>
              {/* Left Arm Voxel (Relaxed or celebrating) */}
              <VoxelCube x={80} y={124} w={8} d={6} h={30} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              <VoxelCube x={80} y={154} w={7} d={5} h={10} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />

              {/* Right Arm Voxel (Raised high holding trophy) */}
              <VoxelCube x={160} y={116} w={8} d={6} h={24} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              <VoxelCube x={170} y={92} w={8} d={6} h={24} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              {/* Gloved Hand */}
              <VoxelCube x={172} y={80} w={7} d={5} h={12} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />

              {/* 3D Voxel Gold Trophy */}
              <g id="voxel-trophy">
                {/* Trophy Pedestal Base */}
                <VoxelCube x={174} y={70} w={14} d={6} h={8} topColor="#78350f" leftColor="#451a03" rightColor="#290e02" />
                {/* Trophy Stem */}
                <VoxelCube x={174} y={60} w={6} d={4} h={10} topColor="#facc15" leftColor="#eab308" rightColor="#ca8a04" />
                {/* Trophy Main Cup Tier 1 */}
                <VoxelCube x={174} y={44} w={16} d={7} h={16} topColor="#fef08a" leftColor="#facc15" rightColor="#d97706" />
                {/* Trophy Top Rim */}
                <VoxelCube x={174} y={36} w={20} d={8} h={8} topColor="#fef9c3" leftColor="#fde047" rightColor="#ca8a04" />
                {/* Trophy Left Handle (Voxel blocks) */}
                <VoxelCube x={152} y={42} w={4} d={2} h={12} topColor="#facc15" leftColor="#eab308" rightColor="#ca8a04" />
                {/* Trophy Right Handle (Voxel blocks) */}
                <VoxelCube x={196} y={42} w={4} d={2} h={12} topColor="#facc15" leftColor="#eab308" rightColor="#ca8a04" />
                {/* Floating Voxel Stars / Sparkles */}
                <VoxelCube x={198} y={24} w={4} d={2} h={4} topColor="#ffffff" leftColor="#fef08a" rightColor="#facc15" className="animate-ping" />
                <VoxelCube x={150} y={26} w={3} d={2} h={3} topColor="#ffffff" leftColor="#fef08a" rightColor="#facc15" />
              </g>
            </g>
          )}

          {/* POSE 2: FOLDED_ARMS (3D Voxel Folded Arms Stance) */}
          {details.pose === 'FOLDED_ARMS' && (
            <g id="voxel-pose-folded">
              {/* Left Upper Arm */}
              <VoxelCube x={84} y={120} w={8} d={6} h={26} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              {/* Right Upper Arm */}
              <VoxelCube x={156} y={120} w={8} d={6} h={26} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              {/* Horizontal Cross Arm Block 1 */}
              <VoxelCube x={120} y={138} w={28} d={7} h={12} topColor="#fb923c" leftColor="#ea580c" rightColor="#c2410c" />
              {/* Horizontal Cross Arm Block 2 (Overlapping voxel depth) */}
              <VoxelCube x={120} y={146} w={24} d={7} h={10} topColor="#f97316" leftColor="#c2410c" rightColor="#9a3412" />
              {/* Gloved Hands tucked in */}
              <VoxelCube x={98} y={142} w={6} d={4} h={8} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />
              <VoxelCube x={142} y={142} w={6} d={4} h={8} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />
            </g>
          )}

          {/* POSE 3: BINOCULARS (3D Voxel Binoculars to Visor) */}
          {details.pose === 'BINOCULARS' && (
            <g id="voxel-pose-binoculars">
              {/* Left Arm Raised to Face */}
              <VoxelCube x={86} y={120} w={8} d={6} h={20} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              <VoxelCube x={100} y={98} w={8} d={6} h={22} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />

              {/* Right Arm Raised to Face */}
              <VoxelCube x={154} y={120} w={8} d={6} h={20} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              <VoxelCube x={140} y={98} w={8} d={6} h={22} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />

              {/* 3D Voxel Binoculars */}
              <g id="voxel-binoculars">
                {/* Center Bridge */}
                <VoxelCube x={120} y={82} w={10} d={4} h={8} topColor="#64748b" leftColor="#475569" rightColor="#334155" />
                {/* Left Lens Barrel */}
                <VoxelCube x={104} y={76} w={12} d={7} h={16} topColor="#1e293b" leftColor="#0f172a" rightColor="#0284c7" />
                {/* Right Lens Barrel */}
                <VoxelCube x={136} y={76} w={12} d={7} h={16} topColor="#1e293b" leftColor="#0f172a" rightColor="#0284c7" />
                {/* Glowing Voxel Lenses */}
                <VoxelCube x={104} y={80} w={8} d={4} h={8} topColor="#38bdf8" leftColor="#0284c7" rightColor="#0369a1" filter="url(#voxelGlow)" />
                <VoxelCube x={136} y={80} w={8} d={4} h={8} topColor="#38bdf8" leftColor="#0284c7" rightColor="#0369a1" filter="url(#voxelGlow)" />
                {/* Focus Dial */}
                <VoxelCube x={120} y={74} w={5} d={3} h={6} topColor="#f59e0b" leftColor="#d97706" rightColor="#b45309" />
              </g>
            </g>
          )}

          {/* POSE 4: RED_FLAG (3D Voxel Red Hazard Flag) */}
          {details.pose === 'RED_FLAG' && (
            <g id="voxel-pose-flag">
              {/* Left Arm (Down) */}
              <VoxelCube x={82} y={124} w={8} d={6} h={30} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              <VoxelCube x={82} y={154} w={7} d={5} h={10} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />

              {/* Right Arm Gripping Flagpole High */}
              <VoxelCube x={158} y={116} w={8} d={6} h={24} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              <VoxelCube x={170} y={92} w={8} d={6} h={24} topColor="#f97316" leftColor="#ea580c" rightColor="#c2410c" />
              {/* Gloved Hand */}
              <VoxelCube x={172} y={84} w={8} d={6} h={12} topColor="#475569" leftColor="#334155" rightColor="#1e293b" />

              {/* 3D Voxel Flagpole */}
              <VoxelCube x={174} y={16} w={4} d={2} h={150} topColor="#f1f5f9" leftColor="#cbd5e1" rightColor="#94a3b8" />
              <VoxelCube x={174} y={10} w={6} d={3} h={6} topColor="#fde047" leftColor="#facc15" rightColor="#ca8a04" />

              {/* 3D Voxel Red Pennant/Hazard Flag */}
              <g id="voxel-flag-banner">
                {/* Stepped Voxel flag planes */}
                <VoxelCube x={198} y={22} w={20} d={4} h={16} topColor="#fb7185" leftColor="#f43f5e" rightColor="#e11d48" filter="url(#voxelGlow)" />
                <VoxelCube x={212} y={32} w={12} d={4} h={14} topColor="#fb7185" leftColor="#f43f5e" rightColor="#e11d48" />
                <VoxelCube x={220} y={42} w={8} d={3} h={10} topColor="#f43f5e" leftColor="#e11d48" rightColor="#be123c" />
                {/* White Voxel Exclamation Symbol on Red Flag */}
                <VoxelCube x={198} y={26} w={3} d={1} h={8} topColor="#ffffff" leftColor="#f1f5f9" rightColor="#e2e8f0" />
                <VoxelCube x={198} y={36} w={3} d={1} h={3} topColor="#ffffff" leftColor="#f1f5f9" rightColor="#e2e8f0" />
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
            <span className="w-2 h-2 rounded-full animate-ping bg-current opacity-75" />
            <span>{details.summary}</span>
          </div>

          <div className="mt-1 text-sm font-bold text-slate-100">{details.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{details.item}</div>
        </div>
      )}
    </div>
  );
};
