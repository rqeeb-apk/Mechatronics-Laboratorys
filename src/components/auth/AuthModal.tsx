import React, { useState } from 'react';
import { X, Lock, Phone, User as UserIcon, School, GraduationCap, KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { WhatsAppButton } from './WhatsAppButton.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'activate';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, activateCode, settings, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'activate'>(initialMode);

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('جامعة الملك فهد للبترول والمعادن');
  const [studyLevel, setStudyLevel] = useState('سنة ثالثة');
  const [activationCode, setActivationCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(phone, password, activationCode);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'فشل تسجيل الدخول');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await register({
      phone,
      password,
      fullName,
      university,
      studyLevel,
      activationCode: activationCode.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'فشل إنشاء الحساب');
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!activationCode.trim()) {
      setErrorMsg('يرجى إدخال كود التفعيل');
      return;
    }

    setLoading(true);
    const res = await activateCode(activationCode.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'تم تفعيل الاشتراك بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'كود غير صالح');
    }
  };

  const handleFillDemoOwner = () => {
    setPhone('785502919');
    setPassword('Admin#1234');
    setErrorMsg('');
  };

  const handleFillDemoStudent = () => {
    setPhone('777000111');
    setPassword('Student#1234');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'login' && 'تسجيل الدخول إلى المختبر'}
                {mode === 'register' && 'إنشاء حساب طالب جديد'}
                {mode === 'activate' && 'تفعيل كود الاشتراك'}
              </h3>
              <p className="text-xs text-slate-400">مختبر الميكاترونكس الافتراضي الهندسي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-700 text-rose-200 text-sm p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm p-3.5 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Credentials Bar for Testing */}
          {mode === 'login' && (
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
              <span>بيانات تجريبية سريعة:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFillDemoOwner}
                  className="bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 px-2.5 py-1 rounded-lg text-xs transition-colors"
                >
                  حساب المالك (785502919)
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoStudent}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs transition-colors"
                >
                  حساب طالب (777000111)
                </button>
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              حساب جديد
            </button>
            {user && (
              <button
                type="button"
                onClick={() => { setMode('activate'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'activate' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                تفعيل كود
              </button>
            )}
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 785502919"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-left"
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-left"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex justify-between">
                  <span>كود التفعيل (اختياري، لتمديد أو تفعيل الاشتراك)</span>
                  <span className="text-slate-500">إذا كان متوفرًا</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                    placeholder="مثال: MECHA-90D-78550"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-sky-400 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-sky-500 transition-colors uppercase"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400 text-center mb-2">ليس لديك كود تفعيل؟ يمكنك طلبه فورًا من المالك:</p>
                <WhatsAppButton
                  studentPhone={phone}
                  subscriptionPlan="فصلي"
                />
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الاسم الرباعي أو الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: م. أحمد صالح الكندي"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهاتف</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مثال: 771234567"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 pl-9 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-left"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 pl-9 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-left"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الجامعة / الكلية</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="اسم الجامعة"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 pl-9 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    />
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">المستوى الدراسي</label>
                  <div className="relative">
                    <select
                      value={studyLevel}
                      onChange={(e) => setStudyLevel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 pl-9 text-white focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    >
                      <option value="سنة أولى">سنة أولى (إعدادي هندسة)</option>
                      <option value="سنة ثانية">سنة ثانية (ميكاترونكس)</option>
                      <option value="سنة ثالثة">سنة ثالثة (ميكاترونكس)</option>
                      <option value="سنة رابعة">سنة رابعة (تخرج)</option>
                      <option value="دراسات عليا / باحث">دراسات عليا / باحث</option>
                    </select>
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex justify-between">
                  <span>كود التفعيل (اختياري)</span>
                  <span className="text-slate-500">احصل عليه من المالك عبر واتساب</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                    placeholder="مثال: MECHA-90D-78550"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-sky-400 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-sky-500 transition-colors uppercase"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'جارٍ تسجيل الحساب...' : 'إنشاء الحساب وبدء التجربة'}
              </button>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400 text-center mb-2">هل تريد تفعيل حسابك فورًا برمز رسمي؟</p>
                <WhatsAppButton
                  studentName={fullName}
                  studentPhone={phone}
                  subscriptionPlan="فصلي"
                />
              </div>
            </form>
          )}

          {/* ACTIVATE CODE FORM */}
          {mode === 'activate' && (
            <form onSubmit={handleActivateSubmit} className="space-y-4">
              <div className="bg-sky-950/40 border border-sky-800/60 p-4 rounded-xl text-xs text-sky-200">
                <p className="font-semibold mb-1 text-sky-300">طريقة تفعيل الاشتراك:</p>
                <p>أدخل كود التفعيل المكوّن من أرقام وحروف لتمديد اشتراكك أو ترقيته، يتم ربط الكود بحسابك فورًا واستخدامه لمرة واحدة فقط.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">كود التفعيل أحادي الاستخدام</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                    placeholder="مثال: MECHA-365-VIP01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-sky-400 placeholder-slate-600 font-mono text-base font-bold focus:outline-none focus:border-sky-500 transition-colors uppercase text-center tracking-wider"
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'جارٍ التحقق وتفعيل الكود...' : 'تأكيد تفعيل الكود الآن'}
              </button>

              <div className="pt-2 border-t border-slate-800">
                <WhatsAppButton
                  subscriptionPlan="فصلي"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
