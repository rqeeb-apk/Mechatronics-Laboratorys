import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Laptop,
  CheckCircle,
  Copy,
  ExternalLink,
  X,
  Share2,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Layers,
  ArrowRight
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedVercelCmd, setCopiedVercelCmd] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'install' | 'vercel' | 'android'>('install');

  useEffect(() => {
    // Check if app is in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('لتثبيت التطبيق على جهازك: اضغط على زر خيارات المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
    }
  };

  const copyVercelCommands = () => {
    const text = 'npm install -g vercel\nvercel --prod';
    navigator.clipboard.writeText(text);
    setCopiedVercelCmd(true);
    setTimeout(() => setCopiedVercelCmd(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 border border-sky-400/40">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                تحميل وتثبيت التطبيق والنشر على Vercel
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                تثبيت المعمل على الهواتف والكمبيوتر كبرنامج كامل والربط مع منصة Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'install'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>تثبيت PWA (هاتف & ديسكتوب)</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'vercel'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>النشر على Vercel</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>تطبيق Android (Capacitor)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'install' && (
            <div className="space-y-6">
              {/* Direct Install CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-white text-base">
                      {isInstalled ? 'التطبيق مثبت بالفعل على جهازك' : 'تثبيت بنقرة واحدة كبرنامج أصلي'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    يعمل بدون شريط المتصفح، ويدعم العمل السريع والوصول المباشر من الشاشة الرئيسية.
                  </p>
                </div>
                {isInstalled ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>جاهز ومثبت</span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت التطبيق الآن</span>
                  </button>
                )}
              </div>

              {/* Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Android / Chrome */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>هواتف Android (Chrome & Samsung)</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pr-1">
                    <li>اضغط على زر القائمة <span className="font-bold text-white">(⋮)</span> أعلى المتصفح.</li>
                    <li>اختر <span className="text-sky-300 font-semibold">"تثبيت التطبيق"</span> أو <span className="text-sky-300 font-semibold">"إضافة إلى الشاشة الرئيسية"</span>.</li>
                    <li>اضغط <span className="text-white font-bold">"تثبيت"</span> وسيظهر لك كأيقونة تطبيق كاملة مع شعار المختبر.</li>
                  </ol>
                </div>

                {/* iPhone & iPad (iOS Safari) */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <Share2 className="w-4 h-4" />
                    <span>أجهزة iPhone و iPad (متصفح Safari)</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pr-1">
                    <li>اضغط على زر المشاركة <span className="text-white font-bold">(Share ⬆)</span> أسفل الشاشة.</li>
                    <li>مرر للأسفل واختر <span className="text-purple-300 font-semibold">"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</span>.</li>
                    <li>اضغط <span className="text-white font-bold">"إضافة (Add)"</span> في الزاوية العلوية لتثبيت التطبيق.</li>
                  </ol>
                </div>

                {/* Windows & PC */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Laptop className="w-4 h-4" />
                    <span>أجهزة الكمبيوتر (Windows / Mac / Linux)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    في متصفح Google Chrome أو Microsoft Edge، انقر على أيقونة التثبيت 💻 الموجودة في شريط العناوين (URL bar) على اليمين لتشغيله كبرنامج مستقل على سطح المكتب.
                  </p>
                </div>

                {/* Offline & Performance */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span>دعم غير متصل بالإنترنت (Offline Mode)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تم تجهيز ملفات Service Worker و Manifest بنجاح لتخزين موارد المعمل وتشغيل المحاكيات واللوحات حتى في حال انقطاع الشبكة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    المشروع جاهز ومُهيّأ بالكامل للنشر على Vercel بنقرة واحدة
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تم إنشاء ملف <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">vercel.json</code> المخصص تلقائيًا متضمناً مسارات إعادة التوجيه للـ Single Page App وتوزيع واجهات الـ API عبر Vercel Serverless Functions.
                  </p>
                </div>
              </div>

              {/* Deployment Steps */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  طريقة النشر الأولى: عبر Vercel CLI في ثوانٍ
                </h5>

                <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-sky-300 flex items-center justify-between">
                  <pre className="overflow-x-auto">
{`npm install -g vercel
vercel --prod`}
                  </pre>
                  <button
                    onClick={copyVercelCommands}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="نسخ الأوامر"
                  >
                    {copiedVercelCmd ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px]">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">نسخ</span>
                      </>
                    )}
                  </button>
                </div>

                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2 pt-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  طريقة النشر الثانية: عبر ربط مستودع GitHub
                </h5>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2 text-xs text-slate-300">
                  <p>1. قم برفع هذا المشروع إلى مستودعك على <strong className="text-white">GitHub</strong>.</p>
                  <p>2. اذهب إلى <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold inline-flex items-center gap-1">لوحة تحكم Vercel <ExternalLink className="w-3 h-3" /></a> واضغط <strong>Import Project</strong>.</p>
                  <p>3. سيقوم Vercel باكتشاف إعدادات Vite و <code className="text-emerald-300 font-mono">vercel.json</code> وبناء المشروع في <code className="text-emerald-300 font-mono">dist</code> فوراً بدون أي تعديلات يدوية.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    ملف تهيئة Capacitor جاهز لبناء تطبيق أندرويد رسمي (APK)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    ملف <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">capacitor.config.json</code> يحتوي بالفعل على معرف التطبيق <code className="text-amber-300 font-mono">com.mechatronics.virtual.lab</code>.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-300">لبناء حزمة APK لنظام أندرويد بواسطة Android Studio:</p>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-amber-300 overflow-x-auto">
{`npm run build
npx cap add android
npx cap sync
npx cap open android`}
                </div>
                <p className="text-slate-400 text-[11px] pt-1">
                  سيفتح لك بيئة أندرويد ستوديو لبناء ملف APK الموقع وتثبيته على أي جهاز أندرويد أو نشره على متجر Google Play.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>نظام التحميل والتثبيت ونشر Vercel مفعّل</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
