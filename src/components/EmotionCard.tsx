import React, { useState } from 'react';
import { EmotionAnalysis } from '../types.ts';
import { getEmotionTheme } from '../utils/theme.ts';
import { Activity, Flame, ChevronDown, ChevronUp, Tag, Compass } from 'lucide-react';

interface EmotionCardProps {
  analysis: EmotionAnalysis;
  compact?: boolean;
}

export const EmotionCard: React.FC<EmotionCardProps> = ({ analysis, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const theme = getEmotionTheme(analysis.primaryEmotion);

  // Valence: -1.0 to 1.0 -> map to 0% to 100%
  const valencePercent = Math.min(100, Math.max(0, ((analysis.valence + 1) / 2) * 100));

  // Stress level color
  const getStressColor = (level: number) => {
    if (level <= 3) return 'bg-emerald-500 text-emerald-700';
    if (level <= 6) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        theme.border
      } bg-white/90 dark:bg-slate-900/90 shadow-sm ${theme.glow}`}
    >
      {/* Top Header / Bar */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xl" role="img" aria-label="emotion-emoji">
            {analysis.emotionEmoji || '🌱'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              분석된 감정:
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-xs ${theme.badgeBg} ${theme.badgeText}`}
            >
              {analysis.primaryEmotion}
            </span>
          </div>

          {/* Stress tag badge */}
          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>스트레스 {analysis.stressLevel}/10</span>
          </div>
        </div>

        <button
          type="button"
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
        >
          <span>{isExpanded ? '접기' : '상세 분석'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Analysis Content */}
      {isExpanded && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Summary insight */}
          {analysis.summaryReason && (
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>감정의 핵심 맥락</span>
              </div>
              <p>{analysis.summaryReason}</p>
            </div>
          )}

          {/* Meters: Valence & Stress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Valence (정서 가치) */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>정서 지수 (Valence)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {analysis.valence > 0 ? `+${analysis.valence.toFixed(1)} (긍정)` : `${analysis.valence.toFixed(1)} (부정/중립)`}
                </span>
              </div>
              <div className="relative h-2 w-full bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-400 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-slate-900 dark:bg-white rounded-full shadow-sm -ml-1 transition-all duration-500"
                  style={{ left: `${valencePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>지침/답답</span>
                <span>평온</span>
                <span>활력/기쁨</span>
              </div>
            </div>

            {/* Stress Level Meter */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-rose-500" />
                  심리적 긴장도 / 스트레스
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {analysis.stressLevel}단계 ({analysis.energyLevel || '보통'} 에너지)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getStressColor(
                    analysis.stressLevel
                  )}`}
                  style={{ width: `${analysis.stressLevel * 10}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>편안함 (1~3)</span>
                <span>보통 (4~6)</span>
                <span>과부하 (7~10)</span>
              </div>
            </div>
          </div>

          {/* Secondary Emotions & Keywords */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            {analysis.secondaryEmotions && analysis.secondaryEmotions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  동반된 감정:
                </span>
                {analysis.secondaryEmotions.map((sec, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    #{sec}
                  </span>
                ))}
              </div>
            )}

            {analysis.detectedKeywords && analysis.detectedKeywords.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 ml-auto">
                <Tag className="w-3 h-3" />
                <span className="text-[10px]">
                  {analysis.detectedKeywords.slice(0, 3).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
