import React, { useState } from 'react';
import { PhotoData, CategoryScores, PhotoCategoryWeights } from '../types';
import { Maximize2, X, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface PhotoGalleryProps {
  photos: PhotoData;
  scores: CategoryScores;
  weights: PhotoCategoryWeights;
}

const CATEGORY_DEFINITIONS = [
  {
    key: 'facade' as const,
    scoreKey: 'front_facade' as const,
    weightKey: 'front' as const,
    num: '1.1',
    name: 'รูปด้านหน้าอาคาร (Facade)',
    inspectionPoints: 'ป้ายร้าน, กระจกหน้าหน้าร้าน, โครงสร้างเสา/คานด้านหน้า, ประตูทางเข้าหลัก, สีและวัสดุปิดผิว',
    fallbackGrad: 'from-blue-600 to-indigo-900',
    iconText: 'FACADE',
  },
  {
    key: 'interior' as const,
    scoreKey: 'interior' as const,
    weightKey: 'interior' as const,
    num: '1.2',
    name: 'รูปภายในอาคาร (Interior)',
    inspectionPoints: 'งานฝ้าเพดาน, ระบบไฟฟ้า/เครื่องปรับอากาศ, งานปูพื้น, การกั้นผนังห้อง, เฟอร์นิเจอร์ Built-in',
    fallbackGrad: 'from-amber-600 to-stone-900',
    iconText: 'INTERIOR',
  },
  {
    key: 'rear' as const,
    scoreKey: 'rear_building' as const,
    weightKey: 'rear' as const,
    num: '1.3',
    name: 'รูปด้านหลังอาคาร (Rear)',
    inspectionPoints: 'ประตูทางออกหลังร้าน, พื้นที่เก็บของ, ระบบบำบัด/งานสุขาภิบาล, โครงสร้างผนังด้านหลัง',
    fallbackGrad: 'from-emerald-700 to-slate-900',
    iconText: 'REAR',
  },
  {
    key: 'parking' as const,
    scoreKey: 'parking_area' as const,
    weightKey: 'parking' as const,
    num: '1.4',
    name: 'รูปพื้นลานจอดรถ (Parking Area)',
    inspectionPoints: 'งานเทคอนกรีต/แอสฟัลต์, เส้นจราจร/ช่องจอด, ไฟส่องสว่าง, ระบบระบายน้ำลานจอด',
    fallbackGrad: 'from-violet-700 to-slate-950',
    iconText: 'PARKING',
  },
];

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, scores, weights }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    title: string;
    score: number;
    weight: number;
    points: string;
  } | null>(null);

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400 text-emerald-400';
    if (score >= 50) return 'from-cyan-500 to-blue-500 text-cyan-400';
    if (score >= 30) return 'from-amber-500 to-orange-500 text-amber-400';
    return 'from-rose-500 to-red-600 text-rose-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>📷</span> แกลเลอรีภาพถ่าย 4 หมวดหลักและการประเมิน AI
          </h3>
          <p className="text-xs text-slate-400">
            ระบบวิเคราะห์ภาพถ่ายแยกหมวด พร้อมคำนวณถ่วงน้ำหนักรวม 100%
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
          เกณฑ์ตรวจสอบมาตรฐาน Shop TFM
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORY_DEFINITIONS.map((cat) => {
          const photoUrl = photos[cat.key];
          const score = scores[cat.scoreKey] ?? 0;
          const weight = weights[cat.weightKey] ?? 25;
          const weightedContribution = ((score * weight) / 100).toFixed(1);
          const colorClass = getProgressColor(score);

          return (
            <div
              key={cat.key}
              className="group relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between"
            >
              {/* Photo Display / Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${cat.fallbackGrad} flex flex-col items-center justify-center p-4 text-center`}>
                    <span className="text-2xl mb-1 opacity-70">🏗️</span>
                    <span className="text-xs font-mono font-bold tracking-wider text-white/90">
                      {cat.iconText}
                    </span>
                    <span className="text-[10px] text-white/70 mt-1">
                      {cat.name.split(' ')[0]}
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-medium text-slate-200">
                  <span className="text-cyan-400 font-mono">{cat.num}</span>
                  <span>{cat.name.split(' ')[0]}</span>
                </div>

                {/* Weight Tag */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-md border border-cyan-800/60 text-[10px] font-mono font-semibold text-cyan-300">
                  น้ำหนัก {weight}%
                </div>

                {/* Zoom overlay */}
                {photoUrl && (
                  <button
                    onClick={() =>
                      setSelectedPhoto({
                        url: photoUrl,
                        title: cat.name,
                        score,
                        weight,
                        points: cat.inspectionPoints,
                      })
                    }
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 text-white gap-1.5 text-xs font-medium backdrop-blur-[2px]"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>ดูภาพขยาย</span>
                  </button>
                )}
              </div>

              {/* Card Body & Progress Bar */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                    <span className="text-sm font-bold font-mono text-slate-100">
                      {score}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    />
                  </div>

                  {/* Contribution breakdown */}
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                    <span>ส่วนร่วมความคืบหน้ารวม:</span>
                    <span className="text-cyan-400 font-semibold">+{weightedContribution}%</span>
                  </div>
                </div>

                {/* Inspection Points Tooltip Box */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 line-clamp-2 hover:line-clamp-none transition-all">
                  <span className="text-slate-500 font-semibold">จุดตรวจ: </span>
                  {cat.inspectionPoints}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-semibold text-slate-100">{selectedPhoto.title}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono">
                  คะแนนประเมิน {selectedPhoto.score}% (น้ำหนัก {selectedPhoto.weight}%)
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="max-h-[65vh] overflow-hidden bg-black flex items-center justify-center p-2">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-cyan-400">จุดตรวจวิเคราะห์ AI ที่ตรวจสอบ: </span>
              {selectedPhoto.points}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
