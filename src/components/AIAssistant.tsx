'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

type Message = { role: 'user' | 'assistant'; content: string };

const quickQuestions: { [key: string]: string[] } = {
  student: [
    'Analyze my academic performance',
    'Create a study plan for my next exam',
    'Generate a quiz for me',
    'Help me write an essay',
    'What study techniques do you recommend?',
  ],
  teacher: [
    'Generate exam questions',
    'Create a grading rubric',
    'Which students need extra help?',
    'Suggest lesson activities',
    'Generate practice exercises',
  ],
  admin: [
    'School performance overview',
    'Attendance insights',
    'Draft an announcement',
    'Suggest academic goals',
  ],
  parent: [
    'How is my child performing?',
    'How can I help my child study?',
    'What subjects need attention?',
    'How to motivate my child?',
  ],
};

const roleLabels: { [key: string]: string } = {
  student: 'Academic Advisor',
  teacher: 'Teaching Assistant',
  admin: 'School Insights',
  parent: 'Parent Guide',
};

const roleColors: { [key: string]: string } = {
  student: 'from-blue-500 to-blue-600',
  teacher: 'from-emerald-500 to-emerald-600',
  admin: 'from-purple-500 to-purple-600',
  parent: 'from-amber-500 to-amber-600',
};

const AIAssistant = ({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getWelcomeMessage(role, userName),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: messageText },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const gradient = roleColors[role] || roleColors.student;
  const label = roleLabels[role] || 'Academic Advisor';
  const questions = quickQuestions[role] || quickQuestions.student;

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-6 w-80 md:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '560px', zIndex: 9999 }}
        >
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${gradient} p-4 flex items-center gap-3 flex-shrink-0`}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Image src="/logo.png" alt="AI" width={24} height={24} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{label}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                <p className="text-white/80 text-xs">AI-powered · Academos</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    role: 'assistant',
                    content: getWelcomeMessage(role, userName),
                  },
                ]);
              }}
              className="text-white/60 hover:text-white transition-colors text-xs mr-2"
              title="New conversation"
            >
              ↺
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 mr-2 mt-0.5`}
                  >
                    <Image src="/logo.png" alt="" width={14} height={14} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 mr-2 mt-0.5`}
                >
                  <Image src="/logo.png" alt="" width={14} height={14} />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-xs text-gray-400 text-center">
                  Suggested questions:
                </p>
                {questions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors text-gray-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your advisor..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{ zIndex: 9999 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 bg-gradient-to-r ${open ? 'from-gray-500 to-gray-600' : gradient}`}
        title={label}
      >
        {open ? (
          <span className="text-white text-2xl leading-none">×</span>
        ) : (
          <Image src="/logo.png" alt="AI Advisor" width={28} height={28} />
        )}
      </button>
    </>
  );
};

function getWelcomeMessage(role: string, userName: string): string {
  const name = userName ? `, ${userName}` : '';
  switch (role) {
    case 'student':
      return `Hi${name}! 🎓 I'm your Academic Advisor. I can analyze your grades, create personalized study plans, generate practice quizzes, help with essays, and suggest study techniques. What would you like to work on today?`;
    case 'teacher':
      return `Hello${name}! 📚 I'm your Teaching Assistant. I can generate exam questions, create rubrics, analyze student progress, suggest lesson activities, and help with assessment design. How can I help you today?`;
    case 'admin':
      return `Hello${name}! 🏫 I'm your School Insights AI. I can provide performance reports, attendance analysis, help draft announcements, and suggest academic strategies. What would you like to explore?`;
    case 'parent':
      return `Hello${name}! 👨‍👩‍👧 I'm your Parent Guide. I can explain your child's academic performance, suggest ways to support them at home, and provide strategies to help them succeed. How can I help?`;
    default:
      return `Hello${name}! 👋 I'm your Academic Advisor. How can I help you today?`;
  }
}

export default AIAssistant;
