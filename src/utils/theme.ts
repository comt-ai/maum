export interface EmotionTheme {
  name: string;
  gradient: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  glow: string;
}

export function getEmotionTheme(emotion?: string): EmotionTheme {
  if (!emotion) {
    return {
      name: '기본',
      gradient: 'from-amber-500/10 via-rose-500/5 to-purple-500/10',
      accent: 'text-amber-700 dark:text-amber-300',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
      badgeText: 'text-amber-800 dark:text-amber-200',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      glow: 'shadow-amber-100 dark:shadow-amber-950/20',
    };
  }

  const em = emotion.toLowerCase();

  if (em.includes('기쁨') || em.includes('행복') || em.includes('설렘') || em.includes('감사') || em.includes('신남')) {
    return {
      name: '기쁨/설렘',
      gradient: 'from-amber-400/15 via-orange-300/10 to-yellow-400/15',
      accent: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
      badgeText: 'text-amber-800 dark:text-amber-200',
      border: 'border-amber-200 dark:border-amber-700/50',
      glow: 'shadow-amber-200/50',
    };
  }

  if (em.includes('평온') || em.includes('안도') || em.includes('편안') || em.includes('차분')) {
    return {
      name: '평온/안도',
      gradient: 'from-emerald-400/15 via-teal-300/10 to-cyan-400/15',
      accent: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      badgeText: 'text-emerald-800 dark:text-emerald-200',
      border: 'border-emerald-200 dark:border-emerald-700/50',
      glow: 'shadow-emerald-200/50',
    };
  }

  if (em.includes('불안') || em.includes('초조') || em.includes('걱정') || em.includes('두려움') || em.includes('혼란')) {
    return {
      name: '불안/초조',
      gradient: 'from-teal-500/15 via-sky-400/10 to-blue-500/15',
      accent: 'text-teal-600 dark:text-teal-400',
      badgeBg: 'bg-teal-100 dark:bg-teal-900/40',
      badgeText: 'text-teal-800 dark:text-teal-200',
      border: 'border-teal-200 dark:border-teal-700/50',
      glow: 'shadow-teal-200/50',
    };
  }

  if (em.includes('슬픔') || em.includes('우울') || em.includes('외로움') || em.includes('자책') || em.includes('먹먹')) {
    return {
      name: '슬픔/외로움',
      gradient: 'from-indigo-400/15 via-purple-300/10 to-blue-400/15',
      accent: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      badgeText: 'text-indigo-800 dark:text-indigo-200',
      border: 'border-indigo-200 dark:border-indigo-700/50',
      glow: 'shadow-indigo-200/50',
    };
  }

  if (em.includes('분노') || em.includes('짜증') || em.includes('답답') || em.includes('화') || em.includes('억울')) {
    return {
      name: '분노/답답',
      gradient: 'from-rose-500/15 via-orange-400/10 to-red-400/15',
      accent: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
      badgeText: 'text-rose-800 dark:text-rose-200',
      border: 'border-rose-200 dark:border-rose-700/50',
      glow: 'shadow-rose-200/50',
    };
  }

  if (em.includes('번아웃') || em.includes('지침') || em.includes('무기력') || em.includes('피로')) {
    return {
      name: '번아웃/무기력',
      gradient: 'from-slate-400/15 via-stone-300/10 to-zinc-400/15',
      accent: 'text-stone-600 dark:text-stone-300',
      badgeBg: 'bg-stone-100 dark:bg-stone-800/60',
      badgeText: 'text-stone-800 dark:text-stone-200',
      border: 'border-stone-200 dark:border-stone-700/50',
      glow: 'shadow-stone-200/50',
    };
  }

  return {
    name: '복합 감정',
    gradient: 'from-purple-400/15 via-pink-300/10 to-indigo-400/15',
    accent: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
    badgeText: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-700/50',
    glow: 'shadow-purple-200/50',
  };
}
