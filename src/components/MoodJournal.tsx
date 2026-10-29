import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types.ts';
import { EmotionCard } from './EmotionCard.tsx';
import { PrescriptionCard } from './PrescriptionCard.tsx';
import { BookOpen, Sparkles, Send, Calendar, Trash2, Heart, CheckCircle2 } from 'lucide-react';
import { playChime } from '../utils/audio.ts';

interface MoodJournalProps {
  soundEnabled: boolean;
  onStartBreathing?: () => void;
}

export const MoodJournal: React.FC<MoodJournalProps> = ({ soundEnabled, onStartBreathing }) => {
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Journal entries history from local storage
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('maeum_journal_entries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const availableTags = [
    '지친 하루',
    '성취감',
    '관계의 어려움',
    '막연한 불안',
    '소소한 행복',
    '외로움',
    '일/학업 부담',
    '자기비하',
    '새로운 다짐',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAnalyzeJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalText: journalText.trim(),
          selectedEmotions: selectedTags,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || '일기 분석 중 오류가 발생했습니다.');
      }

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        }),
        text: journalText.trim(),
        selectedEmotions: selectedTags,
        analysis: json.data,
      };

      const updated = [newEntry, ...entries];
      setEntries(updated);
      try {
        localStorage.setItem('maeum_journal_entries', JSON.stringify(updated));
      } catch {}

      setJournalText('');
      setSelectedTags([]);
      if (soundEnabled) playChime('calm');
    } catch (err: any) {
      setError(err.message || '분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try {
      localStorage.setItem('maeum_journal_entries', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>감정 일기 & 심층 마음 분석</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          오늘 있었던 일과 떠오른 감정들을 자유롭게 적어보세요. Gemini가 감정의 뿌리를 짚고 맞춤 처방을 선물합니다.
        </p>
      </div>

      {/* Editor Box */}
      <form
        onSubmit={handleAnalyzeJournal}
        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm"
      >
        {/* Emotion Tag Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            오늘을 설명하는 키워드 선택 (선택 사항)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-1">
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            rows={5}
            placeholder="오늘 어떤 일이 있었나요? 그때 어떤 마음이 들었는지, 어떤 생각이 머릿속을 맴돌았는지 편안하게 털어놓아 보세요..."
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
            <span>솔직하게 적을수록 더 정밀한 감정 분석이 가능합니다</span>
            <span>{journalText.length}자</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !journalText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition active:scale-95"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>감정 정밀 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>심층 분석 & 처방받기</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Journal History & Analyzed Entries */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>기록된 감정 일기 ({entries.length})</span>
        </h4>

        {entries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            아직 기록된 일기가 없습니다. 오늘의 솔직한 생각을 남겨보세요.
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {entry.date}
                    </span>
                    {entry.selectedEmotions?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="일기 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Entry Original Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  {entry.text}
                </p>

                {/* AI Analysis & Prescription */}
                {entry.analysis && (
                  <div className="space-y-3.5 pt-1">
                    {/* Empathy Response bubble */}
                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                      <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 fill-rose-500" />
                      <div>
                        <div className="font-bold text-indigo-900 dark:text-indigo-300 mb-0.5">
                          마음모디의 공감 코멘트
                        </div>
                        <p>{entry.analysis.empathyResponse}</p>
                      </div>
                    </div>

                    {/* Emotion Card */}
                    <EmotionCard analysis={entry.analysis.emotionAnalysis} />

                    {/* Prescription Card */}
                    <PrescriptionCard
                      advice={entry.analysis.advice}
                      recommendedActivity={entry.analysis.recommendedActivity}
                      onStartBreathing={onStartBreathing}
                      soundEnabled={soundEnabled}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
