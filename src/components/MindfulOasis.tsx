import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Heart, Sparkles, BookOpen, Check, Plus, Trash2 } from 'lucide-react';
import { playChime } from '../utils/audio.ts';

interface MindfulOasisProps {
  soundEnabled: boolean;
  onSelectEmotionPrompt?: (text: string) => void;
}

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export const MindfulOasis: React.FC<MindfulOasisProps> = ({ soundEnabled, onSelectEmotionPrompt }) => {
  const [activeTab, setActiveTab] = useState<'breath' | 'gratitude' | 'lexicon'>('breath');

  // Breathing state
  const [breathActive, setBreathActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycle, setCycle] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gratitude state
  const [gratitudes, setGratitudes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('maeum_gratitudes');
      return saved ? JSON.parse(saved) : ['오늘 마신 따뜻한 차 한 잔', '맑은 가을 하늘을 바라본 3분'];
    } catch {
      return [];
    }
  });
  const [newGratitude, setNewGratitude] = useState('');

  // 4-7-8 Breath cycle logic
  useEffect(() => {
    if (!breathActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('idle');
      return;
    }

    // Sequence: Inhale 4s -> Hold 7s -> Exhale 8s
    let currentPhase: BreathPhase = 'inhale';
    let timeLeft = 4;
    setPhase(currentPhase);
    setSecondsLeft(timeLeft);
    if (soundEnabled) playChime('breathe-in');

    timerRef.current = setInterval(() => {
      timeLeft -= 1;

      if (timeLeft <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          timeLeft = 7;
          setPhase('hold');
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timeLeft = 8;
          setPhase('exhale');
          if (soundEnabled) playChime('breathe-out');
        } else if (currentPhase === 'exhale') {
          currentPhase = 'inhale';
          timeLeft = 4;
          setPhase('inhale');
          setCycle((c) => c + 1);
          if (soundEnabled) playChime('breathe-in');
        }
      }
      setSecondsLeft(timeLeft);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [breathActive, soundEnabled]);

  const handleStartBreath = () => {
    setBreathActive(true);
    setCycle(1);
  };

  const handleStopBreath = () => {
    setBreathActive(false);
    setPhase('idle');
    setSecondsLeft(4);
  };

  const handleAddGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGratitude.trim()) return;
    const updated = [newGratitude.trim(), ...gratitudes].slice(0, 10);
    setGratitudes(updated);
    try {
      localStorage.setItem('maeum_gratitudes', JSON.stringify(updated));
    } catch {}
    setNewGratitude('');
    if (soundEnabled) playChime('complete');
  };

  const handleDeleteGratitude = (idx: number) => {
    const updated = gratitudes.filter((_, i) => i !== idx);
    setGratitudes(updated);
    try {
      localStorage.setItem('maeum_gratitudes', JSON.stringify(updated));
    } catch {}
  };

  // Emotion Lexicon Data
  const emotionQuadrants = [
    {
      title: '평온 & 충만 (낮은 에너지 · 긍정)',
      description: '마음이 고요하고 안전하다고 느낄 때',
      color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
      words: ['안도감', '평온함', '감사', '온화함', '안락함', '충만함', '느긋함', '초연함'],
    },
    {
      title: '활력 & 기쁨 (높은 에너지 · 긍정)',
      description: '에너지가 샘솟고 삶의 의욕이 넘칠 때',
      color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
      words: ['설렘', '자신감', '벅참', '열정', '통쾌함', '뿌듯함', '기대감', '유쾌함'],
    },
    {
      title: '불안 & 긴장 (높은 에너지 · 부정)',
      description: '마음이 다급하고 통제하기 어려울 때',
      color: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200',
      words: ['초조함', '막막함', '당혹감', '압박감', '조바심', '경계심', '혼란', '분노'],
    },
    {
      title: '지침 & 쓸쓸함 (낮은 에너지 · 부정)',
      description: '몸과 마음의 배터리가 소진되었을 때',
      color: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200',
      words: ['무기력', '번아웃', '먹먹함', '서운함', '외로움', '공허함', '자책', '소외감'],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Oasis Sub Navigation */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('breath')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'breath'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>4-7-8 이완 호흡</span>
        </button>

        <button
          onClick={() => setActiveTab('gratitude')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'gratitude'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>3가지 감사 노트</span>
        </button>

        <button
          onClick={() => setActiveTab('lexicon')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'lexicon'
              ? 'bg-indigo-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>감정 단어장</span>
        </button>
      </div>

      {/* Tab 1: 4-7-8 Breathing Guide */}
      {activeTab === 'breath' && (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
          <div className="max-w-md space-y-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              4-7-8 이완 호흡법
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              하버드 의대 앤드루 와일 박사의 자율신경 안정 호흡법입니다. 교감신경을 낮추고 마음의 긴장을 풀어줍니다.
            </p>
          </div>

          {/* Animated Visual Orb */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer aura circles */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                phase === 'inhale'
                  ? 'scale-110 bg-rose-200/40 dark:bg-rose-900/30 animate-pulse'
                  : phase === 'hold'
                  ? 'scale-105 bg-amber-200/40 dark:bg-amber-900/30'
                  : phase === 'exhale'
                  ? 'scale-90 bg-emerald-200/40 dark:bg-emerald-900/30'
                  : 'bg-slate-100 dark:bg-slate-800/50'
              }`}
            />

            {/* Core Orb */}
            <div
              className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-transform duration-1000 ${
                phase === 'inhale'
                  ? 'scale-110 bg-gradient-to-tr from-rose-500 to-amber-400 shadow-rose-300/50'
                  : phase === 'hold'
                  ? 'scale-105 bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-300/50'
                  : phase === 'exhale'
                  ? 'scale-90 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-300/50'
                  : 'bg-gradient-to-tr from-slate-400 to-slate-500 shadow-none'
              }`}
            >
              {phase === 'idle' ? (
                <div className="space-y-1">
                  <Wind className="w-8 h-8 mx-auto opacity-90" />
                  <span className="text-sm font-semibold">준비 되셨나요?</span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-xs uppercase tracking-widest opacity-90 font-medium">
                    {phase === 'inhale' ? '코로 들이마시기' : phase === 'hold' ? '숨 멈추기' : '입으로 천천히 내쉬기'}
                  </span>
                  <span className="text-4xl font-extrabold tracking-tight">
                    {secondsLeft}
                  </span>
                  <span className="text-[10px] opacity-80">
                    {cycle}번째 세클
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Phase Guidance text */}
          <div className="min-h-12 flex items-center justify-center">
            {phase === 'inhale' && (
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 animate-fade">
                코로 4초간 맑은 공기를 가슴 가득 채웁니다
              </p>
            )}
            {phase === 'hold' && (
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 animate-fade">
                숨을 7초간 머금으며 산소가 온몸에 퍼지도록 멈춥니다
              </p>
            )}
            {phase === 'exhale' && (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-fade">
                입으로 8초간 모든 긴장과 잡념을 후- 소리와 함께 내보냅니다
              </p>
            )}
            {phase === 'idle' && (
              <p className="text-xs text-slate-500">
                시작 버튼을 누르고 화면의 리듬에 맞춰 편안하게 호흡해보세요.
              </p>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {!breathActive ? (
              <button
                onClick={handleStartBreath}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-rose-200 dark:shadow-none transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>호흡 시작하기</span>
              </button>
            ) : (
              <button
                onClick={handleStopBreath}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-sm transition"
              >
                <Pause className="w-4 h-4" />
                <span>일시 정지</span>
              </button>
            )}

            <button
              onClick={handleStopBreath}
              title="리셋"
              className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: 3 Gratitudes */}
      {activeTab === 'gratitude' && (
        <div className="max-w-xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>오늘의 세 가지 감사한 순간</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              뇌과학 연구에 따르면 작고 사소한 감사를 기록하는 것만으로 스트레스 호르몬이 23% 감소합니다.
            </p>
          </div>

          <form onSubmit={handleAddGratitude} className="flex gap-2">
            <input
              type="text"
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              placeholder="예: 퇴근길에 마주친 길고양이, 맛있는 저녁밥, 따뜻한 안부 문자..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-semibold flex items-center gap-1 transition shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>기록</span>
            </button>
          </form>

          {/* Gratitude List */}
          <div className="space-y-2">
            {gratitudes.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-200 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
                <button
                  onClick={() => handleDeleteGratitude(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {gratitudes.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                아직 기록된 감사가 없어요. 오늘 나를 미소 짓게 했던 작은 순간을 남겨보세요.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Korean Emotion Lexicon */}
      {activeTab === 'lexicon' && (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              감정 어휘 사전 (Name It to Tame It)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              감정을 정확한 단어로 명명하는 순간 뇌의 편도체가 진정됩니다. 마음에 닿는 단어를 눌러 대화해보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emotionQuadrants.map((quad, qIdx) => (
              <div
                key={qIdx}
                className={`p-4 rounded-2xl border ${quad.color} space-y-3 shadow-xs`}
              >
                <div>
                  <h4 className="font-bold text-xs">{quad.title}</h4>
                  <p className="text-[11px] opacity-80">{quad.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quad.words.map((word, wIdx) => (
                    <button
                      key={wIdx}
                      onClick={() => {
                        if (onSelectEmotionPrompt) {
                          onSelectEmotionPrompt(`요즘 제 마음에 '${word}'라는 감정이 크게 맴돌고 있어요. 이 감정에 대해 대화하고 싶어요.`);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-black/5 dark:border-white/10 active:scale-95 transition cursor-pointer"
                    >
                      #{word}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
