import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  AlertCircle,
  Lightbulb,
  FileText,
  HelpCircle,
  Share2,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Business } from '../../types';
import { askBusinessCopilot } from '../../services/copilotService';
import { useAuth } from '../../services/authContext';

interface BusinessCopilotModalProps {
  business: Business;
  onClose: () => void;
  initialMode?: 'customer_qa' | 'owner_tools';
}

export const BusinessCopilotModal: React.FC<BusinessCopilotModalProps> = ({
  business,
  onClose,
  initialMode = 'customer_qa',
}) => {
  const { role } = useAuth();
  const [mode, setMode] = useState<'customer_qa' | 'owner_tools'>(initialMode);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; isFallback?: boolean }>>([
    {
      sender: 'assistant',
      text:
        mode === 'customer_qa'
          ? `Sat Sri Akal! I am the AOCSF Copilot for ${business.name} in ${business.locality}, Bathinda. Ask me about opening hours, services, location, or catalog items!`
          : `Welcome to the AOCSF Business Copilot for ${business.name}. I can draft editorial business descriptions, suggest FAQs from your catalog, or create Punjabi festival social posts!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const customerSamplePrompts = [
    'What are your exact opening hours today?',
    'Where are you located in Bathinda and is parking available?',
    'What is your most popular service or product?',
  ];

  const ownerTools = [
    { id: 'desc', label: 'Draft Editorial Description', prompt: 'Draft a distinctive newspaper-style business description for Bathinda local shoppers.', toolType: 'desc' as const },
    { id: 'faqs', label: 'Suggest 3 FAQs', prompt: 'Generate 3 essential frequently asked questions and answers for our store.', toolType: 'faqs' as const },
    { id: 'social', label: 'Social & Festival Post Ideas', prompt: 'Generate 2 social media captions with hashtags suitable for Bathinda community.', toolType: 'social' as const },
    { id: 'audit', label: 'Profile Improvement Audit', prompt: 'Audit this profile completeness and recommend 3 high-impact discovery improvements.', toolType: 'audit' as const },
  ];

  const handleSend = async (customPrompt?: string, toolType?: 'desc' | 'faqs' | 'audit' | 'social') => {
    const queryText = customPrompt || input;
    if (!queryText.trim()) return;

    const userMsg = { sender: 'user' as const, text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askBusinessCopilot({
        mode,
        prompt: queryText,
        businessInfo: business,
        toolType,
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: response.text,
          isFallback: response.isFallback,
        },
      ]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to connect to Copilot at this moment. Please check store details directly.',
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Newspaper Masthead Copilot Header */}
        <div className="bg-[#161412] text-[#FAF8F5] p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#E23E3E] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-wide">
                AOCSF Business Copilot
              </div>
              <div className="text-[10px] font-mono text-[#E2DFD7] tracking-wider">
                FOR: {business.name.toUpperCase()} • BATHINDA
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle (Customer Q&A vs Owner Copilot Tools) */}
        <div className="bg-[#EFECE4] border-b border-[#161412]/20 px-3 py-1.5 flex items-center justify-between text-xs font-mono">
          <div className="flex space-x-1">
            <button
              onClick={() => setMode('customer_qa')}
              className={`px-2.5 py-1 uppercase rounded-xs transition ${
                mode === 'customer_qa'
                  ? 'bg-[#161412] text-white font-bold'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              Customer Assistant
            </button>
            <button
              onClick={() => setMode('owner_tools')}
              className={`px-2.5 py-1 uppercase rounded-xs transition ${
                mode === 'owner_tools'
                  ? 'bg-[#161412] text-white font-bold'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              Owner Growth Tools
            </button>
          </div>
          <span className="text-[10px] text-stone-500 hidden sm:inline">
            Grounded strictly in verified business facts
          </span>
        </div>

        {/* Chat Stream Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#FAF8F5]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-none border border-[#161412] bg-[#FAF3E0] text-[#161412] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#C82A2A]" />
                </div>
              )}
              <div
                className={`p-3 rounded-xs text-xs max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#161412] text-white'
                    : 'bg-white border border-[#161412]/20 text-[#161412] shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.sender === 'assistant' && (
                  <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between text-[9px] font-mono text-stone-400">
                    <span>AI-generated response — verify before publishing</span>
                    {m.isFallback && <span className="text-amber-600">Local facts model</span>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-stone-500 font-mono text-xs p-2">
              <Sparkles className="w-4 h-4 animate-spin text-[#C82A2A]" />
              <span>Copilot is formulating grounded response...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts / Owner Quick Buttons */}
        <div className="p-2.5 bg-[#F5F2EB] border-t border-[#161412]/15">
          {mode === 'customer_qa' ? (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {customerSamplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="shrink-0 text-[10px] font-mono bg-white border border-stone-300 hover:border-black px-2 py-1 text-stone-700 hover:text-black transition"
                >
                  ⚡ {p}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 pb-1">
              {ownerTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSend(tool.prompt, tool.toolType)}
                  className="text-left text-[11px] font-mono bg-white border border-[#161412]/25 hover:border-black p-1.5 text-stone-800 transition flex items-center space-x-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#C82A2A] shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompt Input Field */}
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                mode === 'customer_qa'
                  ? 'Ask Copilot about this business...'
                  : 'Ask Copilot to help with marketing, catalog, or growth...'
              }
              className="flex-1 text-xs p-2 bg-white border border-[#161412]/30 rounded-xs focus:outline-none focus:border-[#C82A2A] font-sans"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-[#C82A2A] hover:bg-[#A81F1F] disabled:opacity-50 text-white rounded-xs transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
