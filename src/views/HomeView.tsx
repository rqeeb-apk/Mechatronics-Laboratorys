import React from 'react';
import {
  Zap,
  Activity,
  Binary,
  Layers,
  Bot,
  Sliders,
  BookOpen,
  Calculator,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Calendar,
  Phone,
  ShieldCheck,
  ChevronLeft,
  Gauge,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { WhatsAppButton } from '../components/auth/WhatsAppButton.tsx';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'activate') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setCurrentTab, onOpenAuth }) => {
  const { user, hasActiveSubscription, isOwner } = useAuth();

  const labCards = [
    {
      id: 'uniprojects',
      title: 'المشاريع الجامعية التطبيقية المعتمدة',
      subtitle: 'Accredited University Mechatronics Projects',
      description: '12 مشروعاً أكاديمياً متكاملاً يشمل وحدة التغذية المتعددة، تحكم الترياك، مضخم القياسات، مؤقت 555، قيادة المحركات، الذراع الروبوتية، ونظام PID مع تقارير رسمية.',
      icon: GraduationCap,
      gradient: 'from-sky-500 via-indigo-600 to-purple-600',
      badge: '12 مشروعاً معتمداً وتقارير',
    },
    {
      id: 'trainingboard',
      title: 'لوحة مزود الطاقة المخبري الواقعية',
      subtitle: 'AC/DC Training Board Simulator',
      description: 'محاكاة طبق الأصل للوحة المخبرية التعليمية مع محول متعدد المخارج، قنطرة تقويم، منظمات 5V و ±15V و 3-20V، وفيوزات حماية قابلة للاحتراق والاستبدال.',
      icon: Gauge,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'لوحة تعليمية حقيقية',
    },
    {
      id: 'electronicsbox',
      title: 'لوحة التيارات والمكونات وأجهزة القياس',
      subtitle: 'Physical Benchtop Meters & Banana Port Trainer',
      description: 'لوحة تيارات مخبرية متطورة بمنافذ بنانا تتيح تركيب وتوصيل أي مكون بحرية، مع جهازي فولتميتر وأميتر رقميين مخبريين واقعيين بمجسات فحص حرة ومتحركة.',
      icon: Layers,
      gradient: 'from-indigo-500 to-blue-600',
      badge: 'فولتميتر وأميتر ومنافذ حقيقية',
    },
    {
      id: 'circuits',
      title: 'مختبر الدوائر والقياسات الكهربائية',
      subtitle: 'Electric Circuits & Instrumentation',
      description: 'بناء وتوصيل دوائر التيار المستمر والمتردد، قياس الجهد والتيار بدقة، راسم إشارة ثنائي القناة ومولد إشارات تفاعلي.',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      badge: 'قوانين كيرشوف وأوم',
    },
    {
      id: 'powersupply',
      title: 'مزود الطاقة المخبري AC/DC',
      subtitle: 'Precision Benchtop Power Supply',
      description: 'مزود طاقة متطور يدعم التيار المستمر والمتردد مع ضبط دقيق للجهد وحد التيار وحماية من القصر ورسم بياني حي.',
      icon: Gauge,
      gradient: 'from-sky-500 to-blue-600',
      badge: 'حماية القصر والجهد',
    },
    {
      id: 'electronics',
      title: 'مختبر الإلكترونيات والمضخمات',
      subtitle: 'Analog & Power Electronics',
      description: 'دوائر تقويم التيار، فلاتر التنعيم، منظمات زينر، مفاتيح الترانزستور BJT، مضخمات العمليات Op-Amp، والمؤقت 555.',
      icon: Activity,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'أشباه الموصلات والمؤقتات',
    },
    {
      id: 'digital',
      title: 'المختبر الرقمي والمنطق',
      subtitle: 'Digital Logic & Sequential Circuits',
      description: 'محاكاة البوابات المنطقية، خرائط كارنوف (K-Maps)، الدوائر التوافقية (Adders/MUX) والمتتابعة (Flip-Flops/Counters).',
      icon: Binary,
      gradient: 'from-cyan-500 to-sky-600',
      badge: 'خرائط كارنوف والقلابات',
    },
    {
      id: 'arduino',
      title: 'مختبر ومحاكي Arduino',
      subtitle: 'Arduino Uno Interactive Sandbox',
      description: 'توصيل الحساسات والمحركات، محرر كود تفاعلي، فحص الأخطاء البرمجية والتوصيلية، ومراقبة المنفذ التسلسلي Serial Monitor.',
      icon: Layers,
      gradient: 'from-blue-600 to-indigo-700',
      badge: 'محاكاة كود C++ وتوصيل',
    },
    {
      id: 'robotics',
      title: 'المحركات والروبوتات والذراع المفصلي',
      subtitle: 'Motors & Robotic Arm Kinematics',
      description: 'حسابات عزم وسرعة ونسب تروس محركات DC/Servo/Stepper، مع محاكاة ذراع روبوتية ثلاثية المفاصل بحسابات الكينماتيكا المباشرة.',
      icon: Bot,
      gradient: 'from-purple-600 to-pink-600',
      badge: 'الكينماتيكا الأمامية والعزم',
    },
    {
      id: 'control',
      title: 'مختبر أنظمة التحكم ومتحكم PID',
      subtitle: 'Control Systems & PID Tuning',
      description: 'استجابة الأنظمة من الدرجة الأولى والثانية، معايرة معاملات P وI وD، ومراقبة زمن الصعود والاستقرار ونسبة التجاوز في الزمن الحقيقي.',
      icon: Sliders,
      gradient: 'from-rose-500 to-red-600',
      badge: 'محاكاة حل المعادلات التفاضلية',
    },
    {
      id: 'lessons',
      title: 'الدروس والشروحات الأكاديمية',
      subtitle: 'Academic Tutorials & Lecture Notes',
      description: 'شروحات هندسية تفصيلية معدة من قِبل إدارة المعمل تشمل قوانين الدوائر، الترانزستور، الأردوينو، الكينماتيكا، ومتحكمات PID مع فيديوهات وملازم PDF.',
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-600',
      badge: 'شروحات ومحاضرات معتمدة',
    },
    {
      id: 'experiments',
      title: 'مكتبة التجارب الجاهزة والتمارين',
      subtitle: 'Guided Engineering Experiments',
      description: 'تجارب مخبرية منهجية مقسمة حسب السنوات الدراسية تشمل النظرية، خطوات العمل، بيئة المحاكاة، وأسئلة تقييم تفاعلية.',
      icon: BookOpen,
      gradient: 'from-emerald-600 to-green-700',
      badge: 'مناهج معتمدة وتمارين',
    },
    {
      id: 'calculators',
      title: 'الحاسبات الهندسية والمحولات',
      subtitle: 'Engineering Formula Solvers',
      description: 'حاسبات دقيقة لقوانين أوم، مقسمات الجهد، مكافئات التوالي والتوازي، ثوابت RC/RL، التردد الرنيني، ونسب التروس الميكانيكية.',
      icon: Calculator,
      gradient: 'from-amber-600 to-yellow-600',
      badge: 'حل خطوة بخطوة بالوحدات',
    },
    {
      id: 'ai',
      title: 'مساعد الذكاء الاصطناعي الذكي',
      subtitle: 'AI Mechatronics Tutor (Gemini)',
      description: 'مرشد أكاديمي وهندسي يشرح القوانين، يحل المسائل الرياضية خطوة بخطوة، ويحلل أخطاء كود الأردوينو والتوصيل الكهربائي.',
      icon: Sparkles,
      gradient: 'from-indigo-600 to-violet-700',
      badge: 'مدعوم بنموذج Gemini 3.8 Flash',
    },
  ];

  const handleCardClick = (cardId: string) => {
    if (!hasActiveSubscription) {
      if (!user) {
        onOpenAuth('login');
      } else {
        onOpenAuth('activate');
      }
      return;
    }
    setCurrentTab(cardId);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 lg:p-14 shadow-2xl lab-grid-bg">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/80 text-sky-300 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>منصة المحاكاة الهندسية الأكاديمية الشاملة للميكاترونكس</span>
          </div>

          <h1 className="text-3xl sm:5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            مختبر الميكاترونكس الافتراضي
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 text-2xl sm:text-3xl lg:text-4xl mt-2 font-mono font-bold">
              Virtual Mechatronics Lab
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
            بيئة محاكاة تطبيقية رائدة تدمج الكهرباء والإلكترونيات والمنطق الرقمي وبرمجة الأردوينو والروبوتات ونظرية التحكم، معتمدة على معادلات فيزيائية حقيقية وحسابات علمية دقيقة لدعم الطلاب والمهندسين.
          </p>

          {/* Access Policy Banner */}
          {!hasActiveSubscription && (
            <div className="bg-amber-950/70 border border-amber-600/70 p-3 rounded-2xl max-w-xl mx-auto text-amber-200 text-xs flex items-center justify-center gap-2 font-bold shadow-lg">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>تنبيه إلزامي: لا يمكن استخدام أي خدمة أو دخول أي مختبر إلا بعد تسجيل الحساب وإدخال كود التفعيل.</span>
            </div>
          )}

          {/* Subscription / Auth Status Banner */}
          {user ? (
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-right shadow-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  hasActiveSubscription ? 'bg-emerald-600' : 'bg-amber-600'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{user.fullName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      hasActiveSubscription
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {hasActiveSubscription
                        ? `اشتراك ${user.subscriptionType} نشط`
                        : user.status === 'pending_activation'
                        ? 'بانتظار إدخال كود التفعيل'
                        : 'الاشتراك منتهي'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {hasActiveSubscription
                        ? `صالح حتى: ${user.subscriptionEndDate ? user.subscriptionEndDate.split('T')[0] : 'دائم'}`
                        : 'يلزم إدخال كود التفعيل لتشغيل المختبرات'}
                    </span>
                  </p>
                </div>
              </div>

              {!hasActiveSubscription && (
                <button
                  onClick={() => onOpenAuth('activate')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30 shrink-0 cursor-pointer animate-pulse"
                >
                  إدخال كود التفعيل الآن
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-sky-600/30 transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>إنشاء حساب طالب وإدخال الكود</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-slate-800/80 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl border border-slate-700 transition-all text-sm cursor-pointer"
              >
                تسجيل الدخول
              </button>
              <WhatsAppButton
                subscriptionPlan="فصلي"
                variant="secondary"
                className="text-xs py-3"
              />
            </div>
          )}
        </div>
      </section>

      {/* Lab Stations Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-r-4 border-sky-500 pr-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">محطات المختبر التفاعلية</h2>
            <p className="text-xs sm:text-sm text-slate-400">اختر المحطة الهندسية للانتقال المباشر وتجربة المحاكاة التفاعلية</p>
          </div>
          <span className="text-xs text-sky-400 font-mono bg-sky-950/70 border border-sky-800 px-3 py-1 rounded-full">
            12 محطة هندسية متخصصة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {labCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!hasActiveSubscription && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>كود التفعيل</span>
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                        {card.badge}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-sky-400/90 font-mono mt-0.5">{card.subtitle}</p>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-bold group-hover:text-sky-300">
                  <span>{hasActiveSubscription ? 'فتح محطة المحاكاة' : 'تفعيل الكود لدخول المختبر'}</span>
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp Activation Request Section */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-800/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-right max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <Phone className="w-4 h-4" />
            <span>طلب فوري من مالك المختبر</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            تحتاج كود تفعيل فصلي أو ترقية إلى باقة VIP؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تواصل مباشرة مع إدارة المختبر عبر واتساب لاستلام كود التفعيل المخصص لك برسالة جاهزة تحتوي على بياناتك، واستمتع بالوصول لجميع التجارب والمساعد الذكي.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <WhatsAppButton
            variant="primary"
            className="w-full sm:w-auto px-6 py-3.5 text-sm"
          />
        </div>
      </section>
    </div>
  );
};
