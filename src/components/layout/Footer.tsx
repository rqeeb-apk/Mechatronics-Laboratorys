import React from 'react';
import { Cpu, Phone, BookOpen, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { WhatsAppButton } from '../auth/WhatsAppButton.tsx';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'activate') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onOpenAuth }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Lab Branding */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">مختبر الميكاترونكس الافتراضي</h4>
              <p className="text-xs text-sky-400 font-mono">Virtual Mechatronics Lab</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed text-right">
            منصة هندسية تطبيقية متقدمة لطلاب وهواة هندسة الميكاترونكس والأنظمة الذكية، تعتمد على الحسابات العلمية الموثوقة والمحاكاة التفاعلية بدقة وفيزيائية واقعية.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام اشتراكات وأكواد تفعيل مشفرة ومؤمنة</span>
          </div>
        </div>

        {/* Labs Quick Links */}
        <div>
          <h5 className="text-white font-bold text-sm mb-3 border-r-2 border-sky-500 pr-2">محطات المختبر</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setCurrentTab('circuits')} className="hover:text-sky-400 transition-colors">
                مختبر الدوائر والقياسات الكهربائية
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('powersupply')} className="hover:text-sky-400 transition-colors">
                مزود الطاقة المخبري AC/DC
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('electronics')} className="hover:text-sky-400 transition-colors">
                مختبر الإلكترونيات والمضخمات
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('digital')} className="hover:text-sky-400 transition-colors">
                المختبر الرقمي والبوابات وK-Map
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('arduino')} className="hover:text-sky-400 transition-colors">
                محاكي الأردوينو ومستشعرات المسافة
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('robotics')} className="hover:text-sky-400 transition-colors">
                المحركات والروبوتات والذراع المفصلي
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('control')} className="hover:text-sky-400 transition-colors">
                أنظمة التحكم والمتحكم التناسبي PID
              </button>
            </li>
          </ul>
        </div>

        {/* Academic Tools */}
        <div>
          <h5 className="text-white font-bold text-sm mb-3 border-r-2 border-sky-500 pr-2">أدوات ومراجع هندسية</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setCurrentTab('experiments')} className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>مكتبة التجارب الجاهزة والتمارين</span>
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('calculators')} className="hover:text-sky-400 transition-colors">
                الحاسبات الهندسية وقوانين أوم والمحركات
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('ai')} className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>مساعد الذكاء الاصطناعي (Gemini)</span>
              </button>
            </li>
            <li>
              <button onClick={() => onOpenAuth('activate')} className="hover:text-sky-400 transition-colors text-emerald-400 font-semibold">
                تفعيل كود اشتراك جديد
              </button>
            </li>
          </ul>
        </div>

        {/* Owner WhatsApp Activation Callout */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>طلب تفعيل أو استفسار المالك</span>
          </div>
          <p className="text-xs text-slate-400">
            للحصول على كود تفعيل فصلي أو سنوي، يمكنك التواصل المباشر مع إدارة المختبر عبر واتساب:
          </p>
          <WhatsAppButton
            variant="primary"
            className="w-full text-xs py-2.5"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} — مختبر الميكاترونكس الافتراضي.</p>
        <p className="flex items-center gap-1">
          <span>صُمم خصيصاً لدعم مهندسي المستقبل في الوطن العربي</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </p>
      </div>
    </footer>
  );
};
