import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  Cpu,
  Code2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: 'مرحبًا بك يا مهندس! أنا المساعد الذكي لمختبر الميكاترونكس الافتراضي المدعوم بنموذج Gemini 3.8 Flash.\n\nيمكنني مساعدتك في:\n1. شرح الدوائر الكهربائية والإلكترونية خطوة بخطوة.\n2. تشخيص وتصحيح أخطاء كود وبرمجة الأردوينو Arduino.\n3. حل المسائل الرياضية الهندسية مع القوانين والوحدات.\n4. معايرة معاملات متحكم PID وحسابات الكينماتيكا للروبوتات.\n\nكيف يمكنني مساعدتك في تجربتك اليوم؟',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quickPrompts = [
    'كيف أضبط معاملات متحكم PID لمحرك تيار مستمر عملياً؟',
    'احسب مقاومة التوالي المطلوبة لتشغيل دايود LED أزرق (Vf=3.2V, 20mA) بمصدر 12V',
    'اشرح لي كيف يعمل المقوم القنطري Full-Bridge مع مكثف التنعيم ومعادلة التموج',
    'ما هي أسباب القراءات العشوائية في مستشعر المسافة HC-SR04 مع الأردوينو؟',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text.trim() }),
      });
      const data = await res.json();

      const aiReply: Message = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || 'عذرًا، لم يتم استلام رد.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'ai',
          text: 'حدث خطأ في الاتصال بالخادم. يرجى التأكد من استقرار الشبكة وتوفر مفتاح GEMINI_API_KEY في الخادم.',
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">مساعد الذكاء الاصطناعي للميكاترونكس</h1>
          </div>
          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-3 py-1 rounded-full">
            Gemini 3.8 Flash Model
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          AI Engineering Tutor: Circuit Debugging, Math Problem Solver, Arduino Code Explanation & Robotics
        </p>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-w-4xl mx-auto flex flex-col h-[650px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                msg.sender === 'user' ? 'bg-sky-600 shadow-md shadow-sky-600/30' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap font-sans'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
                <span className="text-[10px] opacity-60 block mt-2 font-mono text-left" dir="ltr">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-indigo-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>المساعد يحلل المسألة الهندسية ويجهز الإجابة...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="border-t border-slate-800/80 pt-3">
          <span className="text-[11px] text-slate-400 block mb-2 font-semibold">أسئلة مقترحة سريعة:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qp)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-right transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="pt-2">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="اكتب سؤالك الهندسي، مسألة، أو كود أردوينو لتحليله..."
              className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none px-3"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
