import React from 'react';
import { Heart, Sparkles, BookOpen, Wind, BarChart3, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'journal' | 'oasis' | 'analytics';
  setActiveTab: (tab: 'chat' | 'journal' | 'oasis' | 'analytics') => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onResetChat: () => void;
  currentEmotion?: string;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  onResetChat,
  currentEmotion,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-amber-300 to-indigo-400 shadow-sm shadow-rose-200/50 dark:shadow-none text-white">
            <Heart className="w-5 h-5 fill-white/90 animate-pulse text-white" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                마음모디
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  AI 감정 코칭
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentEmotion ? (
                <span>
                  현재 감정 흐름:{' '}
                  <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                    {currentEmotion}
                  </strong>
                </span>
              ) : (
                '이야기를 들려주시면 감정을 읽고 따뜻한 처방전을 드려요'
              )}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>대화</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'journal'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>감정 일기</span>
          </button>

          <button
            onClick={() => setActiveTab('oasis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'oasis'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>마음 쉼터</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>감정 리포트</span>
          </button>
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Chat */}
          {activeTab === 'chat' && (
            <button
              onClick={onResetChat}
              title="새로운 대화 시작하기"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">대화 비우기</span>
            </button>
          )}

          {/* Gemini Indicator */}
          <div
            title={hasApiKey ? 'Gemini 3.8 Flash 연동됨' : 'Gemini API 설정 필요'}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${
              hasApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden md:inline">Gemini AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};
