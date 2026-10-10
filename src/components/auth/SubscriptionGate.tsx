import React, { useState } from 'react';
import {
  Lock,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Phone,
  UserCheck,
  Zap,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { WhatsAppButton } from './WhatsAppButton.tsx';
import { labAudio } from '../../utils/audio.ts';

interface SubscriptionGateProps {
  targetTab: string;
  onOpenAuth: (mode?: 'login' | 'register' | 'activate') => void;
  onGoHome: () => void;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  targetTab,
  onOpenAuth,
  onGoHome,
}) => {
  const { user, activateCode } = useAuth();
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Human-readable lab name mapping
  const labNames: Record<string, string> = {
    uniprojects: 'المشاريع الهندسية الجامعية التطبيقية',
    trainingboard: 'لوحة مزود الطاقة المخبري AC/DC POWER SUPPLY',
    electronicsbox: 'صندوق لوحة الإلكترونيات والتوصيل',
    circuits: 'مختبر الدوائر والقياسات الكهربائية',
    powersupply: 'مزود الطاقة المخبري',
    electronics: 'مختبر الإلكترونيات والمضخمات',
    digital: 'المختبر الرقمي والمنطق',
    arduino: 'مختبر ومحاكي Arduino',
    robotics: 'المحركات والروبوتات والذراع المفصلي',
    control: 'مختبر أنظمة التحكم ومتحكم PID',
    experiments: 'مكتبة التجارب الجاهزة والتمارين',
    calculators: 'الحاسبات الهندسية والمحولات',
    ai: 'مساعد الذكاء الاصطناعي الذكي',
  };

  const currentLabTitle = labNames[targetTab] || 'المختبر الهندسي';

  const handleInlineActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!inputCode.trim()) {
      setErrorMsg('يرجى إدخال كود التفعيل.');
      return;
    }

    setLoading(true);
    const res = await activateCode(inputCode.trim());
    setLoading(false);

    if (res.success) {
      labAudio.playRelayClick();
      setSuccessMsg(res.message || 'تم تفعيل كود الاشتراك بنجاح! جاري فتح المختبر...');
    } else {
      labAudio.playFuseBlow();
      setErrorMsg(res.error || 'كود التفعيل غير صحيح أو تم استخدامه مسبقًا.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Shield Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 border-2 border-amber-400/40">
          <Lock className="w-10 h-10 animate-bounce" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>بوابة التحقق والتفعيل الإلزامي (Access Control Gate)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            المختبر محمي: يتطلب التسجيل وإدخال كود التفعيل
          </h2>

          <p className="text-sm font-bold text-sky-400 font-mono">
            المختبر المطلوب: {currentLabTitle}
          </p>
        </div>

        {/* Clear Policy Notice */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed text-right space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span>قاعدة الدخول المعتمدة لمختبر الميكاترونكس:</span>
          </div>
          <p className="text-slate-300">
            وفقاً لضوابط المنصة التعليمية، <strong>لا يستطيع الطالب استخدام أي خدمة أو دخول أي مختبر افتراضي أو إجراء التجارب إلا بعد تسجيل الحساب وإدخال كود التفعيل المعتمد</strong>.
          </p>
        </div>

        {/* Dynamic State: User Logged in vs Not Logged In */}
        {user ? (
          // Case 1: Student is Logged in but Pending Activation or Expired
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">حساب الطالب:</span>
                <span className="font-bold text-white">{user.fullName}</span>
                <span className="text-slate-500 font-mono">({user.phone})</span>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                حالة الحساب: {user.status === 'pending_activation' ? 'بانتظار كود التفعيل' : user.status === 'expired' ? 'الاشتراك منتهي' : 'موقوف'}
              </span>
            </div>

            {/* Direct In-Line Activation Code Form */}
            <form onSubmit={handleInlineActivate} className="space-y-3">
              <label className="text-xs font-bold text-white block">
                أدخل كود التفعيل الخاص بك للدخول الفوري:
              </label>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="مثال: TEST-365D-XXXXXX أو MECHA-XXXX-XXXX"
                  className="w-full bg-slate-900 border-2 border-amber-500/50 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق من الكود...' : 'تفعيل الكود ودخول المختبر فوراً'}</span>
              </button>
            </form>

            {/* WhatsApp Request Callout */}
            <div className="pt-2 border-t border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400 block">
                ليس لديك كود تفعيل حتى الآن؟ تواصل مباشرة مع المالك:
              </span>
              <WhatsAppButton
                studentName={user.fullName}
                studentPhone={user.phone}
                className="w-full justify-center"
              />
            </div>
          </div>
        ) : (
          // Case 2: Student is Not Logged In
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>تسجيل الدخول إلى حسابك</span>
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>إنشاء حساب طالب جديد</span>
              </button>
            </div>

            {/* WhatsApp Activation Request Button */}
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400 block">
                طلب كود التفعيل وطريقة الاشتراك المعتمدة عبر واتساب:
              </span>
              <WhatsAppButton className="w-full justify-center" />
            </div>
          </div>
        )}

        {/* Back to Home Button */}
        <div className="pt-2">
          <button
            onClick={onGoHome}
            className="text-xs text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى الصفحة الرئيسية للمختبر</span>
          </button>
        </div>
      </div>
    </div>
  );
};
