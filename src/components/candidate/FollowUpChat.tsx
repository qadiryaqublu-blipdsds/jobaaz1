import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageSquareText } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, CVAnalysisResult } from '../../types';
import { safeFetchJson } from '../../utils/apiHelper';

interface FollowUpChatProps {
  analysisResult: CVAnalysisResult;
  selectedLanguage: 'az' | 'en' | 'tr' | 'ru';
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({
  analysisResult,
  selectedLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Salam! Mən sizin CV üzrə süni intellekt köməkçinizəm. Bu CV barədə hər hansı bir sualınızı verə bilərsiniz — məsələn, müsahibəyə hazırlıq, cover letter yazılması, layihələrin təqdimatı və ya LinkedIn profilinizin optimallaşdırılması barədə.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Bu CV üçün güclü LinkedIn başlığı təklif et',
    'Bu profil üçün qısa Müşayiət Məktubu (Cover Letter) yaz',
    'Müsahibədə hansı zəif tərəfimi necə təqdim edim?',
    'Hansı layihələri portfelimə əlavə etsəm şansım artar?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await safeFetchJson<{ answer: string }>('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          cvSummaryContext: {
            candidateName: analysisResult.candidateName,
            detectedRole: analysisResult.detectedRole,
            seniorityLevel: analysisResult.seniorityLevel,
            overallScore: analysisResult.overallScore,
            executiveSummary:
              typeof analysisResult.executiveSummary === 'object' && analysisResult.executiveSummary !== null
                ? (analysisResult.executiveSummary as any).verdict
                : analysisResult.executiveSummary || analysisResult.candidateSummary,
            strengths: analysisResult.strengths,
            weaknesses: analysisResult.weaknesses,
            missingRecommendedSkills: analysisResult.missingRecommendedSkills,
          },
          language: selectedLanguage,
        }),
        timeoutMs: 45000,
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Cavab alınarkən xəta baş verdi.');
      }

      const data = response.data;

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.answer || 'Cavab hazırlana bilmədi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Xəta: ${err.message || 'Serverlə əlaqə qurula bilmədi.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            İnteraktiv Köməkçi
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            Gemini Karyera Məsləhətçisi (Sual-Cavab)
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <MessageSquareText className="w-5 h-5" />
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all font-medium cursor-pointer"
          >
            <Sparkles className="w-3 h-3 inline-block mr-1 text-indigo-600" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages container */}
      <div className="h-80 overflow-y-auto p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
              }`}
            >
              {msg.sender === 'assistant' ? (
                <div className="markdown-body max-w-none text-slate-800 text-xs leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
              <span
                className={`text-[10px] block text-right pt-0.5 ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 text-xs mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Gemini cavab hazırlayır...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Məsələn: 'Bu CV üçün maaş gözləntisi necə təyin olunmalıdır?'"
          disabled={isLoading}
          className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default FollowUpChat;
