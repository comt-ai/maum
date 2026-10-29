import React, { useState } from 'react';
import { AdvicePrescription, RecommendedActivity } from '../types.ts';
import { CheckCircle2, Circle, Sparkles, Quote, Lightbulb, PlayCircle, Volume2, VolumeX, Check } from 'lucide-react';
import { speakText, stopSpeaking, playChime } from '../utils/audio.ts';

interface PrescriptionCardProps {
  advice: AdvicePrescription;
  recommendedActivity?: RecommendedActivity;
  onStartBreathing?: () => void;
  soundEnabled?: boolean;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  advice,
  recommendedActivity,
  onStartBreathing,
  soundEnabled = true,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleStep = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter((i) => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
      if (soundEnabled) playChime('complete');
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const fullSpeech = `${advice.title}. 조언을 들려드릴게요. ${advice.actionableSteps.join('. ')}. 마음에 담아둘 문장입니다. ${advice.quote}`;
      setIsSpeaking(true);
      speakText(fullSpeech, () => setIsSpeaking(false));
    }
  };

  const handleCopy = () => {
    const textToCopy = `[마음 처방전: ${advice.title}]\n\n* 행동 가이드:\n${advice.actionableSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n* 생각의 전환: ${advice.perspectiveShift}\n\n* 오늘의 한 줄: "${advice.quote}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/60 via-amber-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 p-4 shadow-sm space-y-3.5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-500 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
              마음모디 처방전
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {advice.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TTS Listen Button */}
          <button
            onClick={handleSpeak}
            title={isSpeaking ? '음성 멈추기' : '음성으로 처방전 듣기'}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">
              {isSpeaking ? '듣는 중' : '음성 안내'}
            </span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="처방전 복사하기"
            className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[11px]">복사</span>}
          </button>
        </div>
      </div>

      {/* Actionable Steps */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>오늘 나를 위한 실천 가이드:</span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          {advice.actionableSteps.map((step, idx) => {
            const isDone = completedSteps.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`flex items-start gap-2.5 p-2 rounded-xl text-xs cursor-pointer select-none transition border ${
                  isDone
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 line-through opacity-80'
                    : 'bg-white/90 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 hover:text-rose-500 transition" />
                  )}
                </div>
                <span className="leading-relaxed">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perspective Shift (생각의 전환) */}
      {advice.perspectiveShift && (
        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>생각의 관점 바꾸기 (Cognitive Reframe)</span>
          </div>
          <p className="leading-relaxed pl-5 text-[11.5px] text-slate-700 dark:text-slate-300">
            {advice.perspectiveShift}
          </p>
        </div>
      )}

      {/* Comforting Quote / Affirmation */}
      {advice.quote && (
        <div className="relative p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed text-center">
          <Quote className="w-3.5 h-3.5 text-rose-400 mx-auto mb-1 opacity-70" />
          <p className="font-medium text-slate-800 dark:text-slate-200">
            &ldquo;{advice.quote}&rdquo;
          </p>
        </div>
      )}

      {/* Micro Activity Quick Action */}
      {recommendedActivity && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800/90 text-xs gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-rose-300">
              <PlayCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{recommendedActivity.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 dark:bg-slate-700 text-slate-300">
                {recommendedActivity.duration}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              {recommendedActivity.description}
            </p>
          </div>

          {onStartBreathing && (
            <button
              onClick={onStartBreathing}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-medium text-xs transition"
            >
              호흡 시작
            </button>
          )}
        </div>
      )}
    </div>
  );
};
