import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  School,
  GraduationCap,
  Calendar,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { WhatsAppButton } from '../components/auth/WhatsAppButton.tsx';

export const ProfileView: React.FC = () => {
  const { user, activateCode, refreshUser } = useAuth();
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!user) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 max-w-lg mx-auto">
        <UserIcon className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">غير مسجل الدخول</h3>
        <p className="text-xs text-slate-400">يرجى تسجيل الدخول أو إنشاء حساب لعرض ملفك الأكاديمي والاشتراك.</p>
      </div>
    );
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCodeInput.trim()) return;
    setLoading(true);
    setFeedback(null);

    const res = await activateCode(activationCodeInput.trim());
    setLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'تم تفعيل كود الاشتراك وتمديد المدة بنجاح!' });
      setActivationCodeInput('');
      refreshUser();
    } else {
      setFeedback({ type: 'error', message: res.error || 'كود غير صالح' });
    }
  };

  const isExpired = user.status === 'expired' || (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-600/30 shrink-0">
          <UserIcon className="w-10 h-10" />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">{user.fullName}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              !isExpired ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {isExpired ? 'اشتراك منتهي' : `اشتراك ${user.subscriptionType} نشط`}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono" dir="ltr">{user.phone}</p>
          <p className="text-xs text-sky-400 font-semibold">{user.university} — {user.studyLevel}</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-700' : 'bg-rose-950/90 text-rose-200 border border-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-r-2 border-sky-500 pr-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>بيانات الاشتراك الأكاديمي</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">نوع الباقة:</span>
              <span className="font-bold text-sky-400 text-sm">{user.subscriptionType}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">حالة الصلاحية:</span>
              <span className={`font-bold ${!isExpired ? 'text-emerald-400' : 'text-rose-400'}`}>
                {!isExpired ? 'ساري المفعول ومتاح' : 'منتهي الصلاحية'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">تاريخ بدء الاشتراك:</span>
              <span className="font-mono text-slate-300">
                {user.subscriptionStartDate ? user.subscriptionStartDate.split('T')[0] : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">تاريخ انتهاء الاشتراك:</span>
              <span className="font-mono text-amber-400 font-bold">
                {user.subscriptionEndDate ? user.subscriptionEndDate.split('T')[0] : 'دائم'}
              </span>
            </div>
          </div>
        </div>

        {/* Redeem Activation Code & WhatsApp Action */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-r-2 border-emerald-500 pr-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>تفعيل أو تمديد كود الاشتراك</span>
          </h3>

          <form onSubmit={handleActivate} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">أدخل كود التفعيل المستلم من المالك:</label>
              <input
                type="text"
                required
                value={activationCodeInput}
                onChange={(e) => setActivationCodeInput(e.target.value.toUpperCase())}
                placeholder="مثال: MECHA-90D-78550"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-sm font-mono font-bold text-sky-400 uppercase tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'جارٍ تفعيل الكود...' : 'تأكيد تفعيل الكود الآن'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-slate-400 text-xs block text-center">لا تملك كود تفعيل؟ اطلبه مباشرة عبر واتساب:</span>
            <WhatsAppButton
              studentName={user.fullName}
              studentPhone={user.phone}
              subscriptionPlan={user.subscriptionType}
              variant="secondary"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
