import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EmotionAnalysis } from '../types.ts';
import { EmotionCard } from './EmotionCard.tsx';
import { PrescriptionCard } from './PrescriptionCard.tsx';
import { Send, Sparkles, Heart, Bot, User, ArrowDown, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { playChime, speakText, stopSpeaking } from '../utils/audio.ts';

interface EmotionChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onStartBreathing: () => void;
  soundEnabled: boolean;
  onEmotionDetected: (emotion: string) => void;
}

export const EmotionChat: React.FC<EmotionChatProps> = ({
  messages,
  setMessages,
  onStartBreathing,
  soundEnabled,
  onEmotionDetected,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick Starter Prompts
  const quickStarters = [
    {
      emoji: '😮‍💨',
      label: '오늘 너무 지치고 무기력해요',
      text: '오늘 회사와 일상에 너무 지쳐서 몸과 마음에 아무런 힘이 안 나요. 어떻게 쉬어야 할지조차 막막해요.',
    },
    {
      emoji: '🫧',
      label: '마음이 불안하고 초조해요',
      text: '앞으로 닥칠 일들에 대한 생각 때문에 가슴이 답답하고 자꾸만 안 좋은 상황이 상상되어 불안해요.',
    },
    {
      emoji: '💔',
      label: '말 못 할 서운함이 있어요',
      text: '가까운 사람과의 일로 마음이 많이 상했는데, 겉으로는 괜찮은 척 참았더니 마음이 너무 무거워요.',
    },
    {
      emoji: '✨',
      label: '작은 성취가 있어 뿌듯해요',
      text: '오늘 오랫동안 미뤄두었던 일을 해냈어요! 사소하지만 스스로에게 칭찬해주고 싶고 홀가분해요.',
    },
  ];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setError(null);
    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || '감정 분석 답변을 받아오지 못했습니다.');
      }

      const { empathyResponse, emotionAnalysis, advice, recommendedActivity, suggestedReplies } =
        json.data;

      const assistantMsgId = (Date.now() + 1).toString();
      const newAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: empathyResponse,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        emotionAnalysis,
        advice,
        recommendedActivity,
        suggestedReplies,
      };

      setMessages([...updatedMessages, newAssistantMessage]);

      if (emotionAnalysis?.primaryEmotion) {
        onEmotionDetected(emotionAnalysis.primaryEmotion);
      }

      if (soundEnabled) {
        playChime('calm');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleSpeak = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      const speech = `${msg.content}. ${msg.advice?.title ? `${msg.advice.title}. ${msg.advice.actionableSteps.join('. ')}` : ''}`;
      setSpeakingMessageId(msg.id);
      speakText(speech, () => setSpeakingMessageId(null));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-4xl mx-auto">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Welcome Banner if chat is empty */}
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto text-center space-y-6 pt-6">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-400 via-amber-300 to-indigo-400 text-white shadow-lg shadow-rose-200/50 dark:shadow-none">
              <Heart className="w-8 h-8 fill-white/90 animate-pulse text-white" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-100" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                안녕하세요! 당신의 마음 쉼표, <span className="text-rose-600 dark:text-rose-400">마음모디</span>예요.
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                지금 마음에 어떤 파도가 치고 있나요? 기쁨, 분노, 번아웃, 불안, 외로움 무엇이든 편안하게 들려주세요. 감정을 세심하게 분석하고 따뜻한 위로와 처방전을 선물해드릴게요.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                이런 이야기부터 시작해보세요
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(starter.text)}
                    className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-rose-50/50 dark:hover:bg-slate-700/60 hover:border-rose-300 dark:hover:border-rose-800/50 transition flex items-start gap-2.5 shadow-xs group"
                  >
                    <span className="text-lg">{starter.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition">
                        {starter.label}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {starter.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            } space-y-2`}
          >
            {/* Sender identity */}
            <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span>나의 이야기</span>
                  <User className="w-3 h-3 text-slate-500" />
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-white">
                    <Heart className="w-2 h-2 fill-white" />
                  </div>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">마음모디</span>
                  <span>• {msg.timestamp}</span>
                </>
              )}
            </div>

            {/* Main bubble */}
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed space-y-3.5 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-rose-600 text-white rounded-tr-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
              }`}
            >
              {/* Text content */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

              {/* TTS Voice Readout for Assistant */}
              {msg.role === 'assistant' && (
                <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <button
                    onClick={() => handleToggleSpeak(msg)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 transition"
                  >
                    {speakingMessageId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span>낭독 멈춤</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>음성으로 듣기</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Emotion Analysis Card */}
              {msg.emotionAnalysis && (
                <div className="pt-1">
                  <EmotionCard analysis={msg.emotionAnalysis} />
                </div>
              )}

              {/* Advice Prescription Card */}
              {msg.advice && (
                <div className="pt-1">
                  <PrescriptionCard
                    advice={msg.advice}
                    recommendedActivity={msg.recommendedActivity}
                    onStartBreathing={onStartBreathing}
                    soundEnabled={soundEnabled}
                  />
                </div>
              )}
            </div>

            {/* Suggested Replies */}
            {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 pl-2">
                {msg.suggestedReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    💬 {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-white">
                <Heart className="w-2 h-2 fill-white" />
              </div>
              <span className="font-semibold text-rose-600 dark:text-rose-400">마음모디</span>
              <span>가 감정을 분석하고 있어요...</span>
            </div>
            <div className="p-4 rounded-3xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 shadow-xs">
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                감정의 파동을 읽고 따뜻한 처방전을 조제하고 있습니다...
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-rose-400 focus-within:border-transparent transition"
        >
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="지금 마음에 떠오르는 기분이나 일어난 일을 편안하게 이야기해주세요..."
            rows={2}
            className="w-full p-3 pr-14 rounded-2xl bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between px-3 pb-2 text-[11px] text-slate-400">
            <span>Shift + Enter로 줄바꿈</span>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-500 text-white shadow-xs transition active:scale-95 cursor-pointer"
              title="메시지 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
