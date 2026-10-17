import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal, Copy, Check, RefreshCw } from 'lucide-react';
import { CopilotMessage } from '../types/cisco';

interface CopilotChatProps {
  configContext?: string;
  findingsSummary?: string;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ configContext, findingsSummary }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Merhaba! Ben Cisco Güvenlik ve Packet Tracer Yapay Zeka Asistanınızım. Taranan konfigürasyonunuz, tespit edilen güvenlik açıkları, Cisco IOS hardening komutları veya Packet Tracer simülasyonları hakkında dilediğinizi sorabilirsiniz.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || input).trim();
    if (!q || isLoading) return;

    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          configContext: configContext || '',
          findingsSummary: findingsSummary || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`Sunucu hatası: ${res.status}`);
      }

      const data = await res.json();
      const botMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.answer || 'Yanıt alınamadı.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Üzgünüm, yanıt oluşturulurken bir hata oluştu: ' + (err?.message || String(err)),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = [
    'Packet Tracer\'da crypto key generate rsa komutu hata verirse ne yapmalıyım?',
    'VTY hatlarında Telnet yerine SSH zorlamasını adım adım açıkla',
    'Type 7 şifreleme neden güvensizdir ve nasıl kırılır?',
    'Bu konfigürasyondaki eksik ACL kurallarını nasıl tamamlarım?',
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cisco Güvenlik &amp; Packet Tracer Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Hardening, ACL yazımı ve Packet Tracer laboratuvar danışmanı</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className={`text-[10px] text-right ${isUser ? 'text-cyan-200' : 'text-slate-500'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 text-slate-400 text-xs px-4 py-2.5 rounded-2xl rounded-tl-none">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Cisco IOS kuralları ve Packet Tracer kılavuzu taranıyor...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0">Önerilenler:</span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="text-[11px] text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cisco güvenliği veya Packet Tracer hakkında bir soru sorun..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              !input.trim() || isLoading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gönder</span>
          </button>
        </form>
      </div>
    </div>
  );
};
