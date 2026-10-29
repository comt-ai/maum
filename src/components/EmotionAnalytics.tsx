import React from 'react';
import { ChatMessage } from '../types.ts';
import { BarChart3, TrendingUp, Heart, Sparkles, Smile, Frown, ShieldCheck } from 'lucide-react';
import { getEmotionTheme } from '../utils/theme.ts';

interface EmotionAnalyticsProps {
  messages: ChatMessage[];
  onStartChat: () => void;
}

export const EmotionAnalytics: React.FC<EmotionAnalyticsProps> = ({ messages, onStartChat }) => {
  // Extract all assistant messages with emotion analysis
  const analyzedResponses = messages.filter((m) => m.role === 'assistant' && m.emotionAnalysis);

  if (analyzedResponses.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            아직 분석된 감정 데이터가 없어요
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            마음모디와 대화를 나누시거나 오늘의 기분을 이야기해주시면 실시간 감정 흐름과 스트레스 통계가 기록됩니다.
          </p>
        </div>
        <button
          onClick={onStartChat}
          className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-xs"
        >
          대화 시작하기
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalAnalyzed = analyzedResponses.length;
  const avgStress = (
    analyzedResponses.reduce((acc, m) => acc + (m.emotionAnalysis?.stressLevel || 5), 0) /
    totalAnalyzed
  ).toFixed(1);

  const avgValence = (
    analyzedResponses.reduce((acc, m) => acc + (m.emotionAnalysis?.valence || 0), 0) /
    totalAnalyzed
  ).toFixed(2);

  // Emotion frequency
  const emotionCounts: Record<string, { count: number; emoji: string }> = {};
  analyzedResponses.forEach((m) => {
    const em = m.emotionAnalysis?.primaryEmotion || '기타';
    const emoji = m.emotionAnalysis?.emotionEmoji || '🌱';
    if (!emotionCounts[em]) {
      emotionCounts[em] = { count: 0, emoji };
    }
    emotionCounts[em].count += 1;
  });

  const emotionList = Object.entries(emotionCounts).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
          <TrendingUp className="w-5 h-5 text-teal-500" />
          <span>감정 흐름 & 마음 케어 리포트</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          최근 {totalAnalyzed}번의 감정 분석 대화를 바탕으로 생성된 종합 정서 요약입니다.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total interactions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>감정 분석 횟수</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {totalAnalyzed} <span className="text-xs font-normal text-slate-400">회</span>
          </div>
          <p className="text-[11px] text-slate-400">솔직한 감정 탐색 기록</p>
        </div>

        {/* Card 2: Average Stress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>평균 스트레스 지수</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {avgStress} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {Number(avgStress) <= 4 ? '안정적인 상태' : Number(avgStress) <= 6 ? '완만한 긴장 상태' : '돌봄이 필요한 과부하'}
          </p>
        </div>

        {/* Card 3: Valence */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>정서적 긍정도 (Valence)</span>
            {Number(avgValence) >= 0 ? (
              <Smile className="w-4 h-4 text-emerald-500" />
            ) : (
              <Frown className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {Number(avgValence) > 0 ? `+${avgValence}` : avgValence}
          </div>
          <p className="text-[11px] text-slate-400">
            {Number(avgValence) > 0.2 ? '긍정적 정서 우세' : Number(avgValence) >= -0.2 ? '중립 및 차분' : '부정 정서 완화 필요'}
          </p>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>주요 감정 분포도</span>
        </h4>

        <div className="space-y-2.5">
          {emotionList.map(([emotion, { count, emoji }]) => {
            const percent = Math.round((count / totalAnalyzed) * 100);
            const theme = getEmotionTheme(emotion);
            return (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>{emoji}</span>
                    <span>{emotion}</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {count}회 ({percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${theme.badgeBg}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn-by-Turn Timeline */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
          대화별 감정 변화 타임라인
        </h4>

        <div className="relative border-l-2 border-rose-200 dark:border-rose-900/50 ml-3 pl-4 space-y-4">
          {analyzedResponses.map((msg, idx) => {
            const analysis = msg.emotionAnalysis!;
            return (
              <div key={idx} className="relative space-y-1 text-xs">
                {/* Timeline node */}
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-800" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {idx + 1}회차
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
                    {analysis.emotionEmoji} {analysis.primaryEmotion}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    스트레스: {analysis.stressLevel}/10
                  </span>
                </div>
                {analysis.summaryReason && (
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {analysis.summaryReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
