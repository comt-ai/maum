import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { EmotionChat } from './components/EmotionChat.tsx';
import { MoodJournal } from './components/MoodJournal.tsx';
import { MindfulOasis } from './components/MindfulOasis.tsx';
import { EmotionAnalytics } from './components/EmotionAnalytics.tsx';
import { ChatMessage } from './types.ts';
import { getEmotionTheme } from './utils/theme.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'journal' | 'oasis' | 'analytics'>('chat');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<string>('');

  // Persisted Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('maeum_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('maeum_chat_messages', JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save messages:', err);
    }

    // Update current emotion from latest assistant message
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant' && m.emotionAnalysis);
    if (lastAssistant?.emotionAnalysis?.primaryEmotion) {
      setCurrentEmotion(lastAssistant.emotionAnalysis.primaryEmotion);
    }
  }, [messages]);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasKey);
      })
      .catch((err) => {
        console.debug('Health check warning:', err);
      });
  }, []);

  const handleResetChat = () => {
    if (window.confirm('대화 기록을 비우고 새로운 마음으로 시작할까요?')) {
      setMessages([]);
      setCurrentEmotion('');
      try {
        localStorage.removeItem('maeum_chat_messages');
      } catch {}
    }
  };

  const handleStartBreathing = () => {
    setActiveTab('oasis');
  };

  const handleSelectEmotionPrompt = (text: string) => {
    setActiveTab('chat');
    // Prepend user message or trigger chat
    setTimeout(() => {
      const chatInput = document.querySelector('textarea') as HTMLTextAreaElement | null;
      if (chatInput) {
        chatInput.value = text;
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        chatInput.focus();
      }
    }, 100);
  };

  const theme = getEmotionTheme(currentEmotion);

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-700 flex flex-col relative overflow-x-hidden`}
    >
      {/* Ambient Morphing Background Light */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${theme.gradient} opacity-80 blur-3xl transition-all duration-1000 -z-10`}
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onResetChat={handleResetChat}
        currentEmotion={currentEmotion}
        hasApiKey={hasApiKey}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <EmotionChat
            messages={messages}
            setMessages={setMessages}
            onStartBreathing={handleStartBreathing}
            soundEnabled={soundEnabled}
            onEmotionDetected={(em) => setCurrentEmotion(em)}
          />
        )}

        {activeTab === 'journal' && (
          <div className="py-6">
            <MoodJournal
              soundEnabled={soundEnabled}
              onStartBreathing={handleStartBreathing}
            />
          </div>
        )}

        {activeTab === 'oasis' && (
          <div className="py-6">
            <MindfulOasis
              soundEnabled={soundEnabled}
              onSelectEmotionPrompt={handleSelectEmotionPrompt}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="py-6">
            <EmotionAnalytics
              messages={messages}
              onStartChat={() => setActiveTab('chat')}
            />
          </div>
        )}
      </main>
    </div>
  );
}
