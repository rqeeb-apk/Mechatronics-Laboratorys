import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Experiment } from '../types.ts';

export const ExperimentsView: React.FC<{ onLaunchLab?: (labId: string) => void }> = ({ onLaunchLab }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const experimentsList: Experiment[] = [
    {
      id: 'exp_01',
      title: 'التحقق العملي من قانون أوم وحساب المقاومة النوعية',
      subject: 'كهرباء',
      academicLevel: 'سنة أولى',
      objective: 'دراسة العلاقة الخطية بين فرق الجهد المطبق وشِدّة التيار الكهربائي المار في موصل أومي، وحساب قيمة المقاومة تجريبياً.',
      theory: 'ينص قانون أوم على أن شدة التيار المار في موصل تتناسب طردياً مع فرق الجهد بين طرفيه عند ثبوت درجة الحرارة: V = I × R.',
      equations: ['V = I × R', 'R = V / I', 'P = V × I = I² × R'],
      components: ['مزود جهد مستمر DC (0-20V)', 'مقاومة كربونية معلومة 100Ω', 'جهاز فولتميتر رقمي', 'جهاز أمبيرميتر رقمي', 'أسلاك توصيل'],
      steps: [
        'قم بتوصيل مصدر الجهد مع المقاومة والأمبيرميتر على التوالي.',
        'صل الفولتميتر بالتوازي عبر طرفي المقاومة.',
        'غيّر جهد المصدر من 2V إلى 12V بزيادة 2V في كل خطوة.',
        'سجل قراءة التيار المقابلة لكل قيمة جهد.',
        'احسب ميل الخط البياني V مقابل I للتحقق من قيمة المقاومة R.'
      ],
      quiz: [
        {
          question: 'إذا طُبّق جهد قدره 12V على مقاومة قيمتها 240Ω، فما هي شدة التيار المار؟',
          options: ['0.05 A (50 mA)', '0.5 A (500 mA)', '2 A', '2880 mA'],
          correctIndex: 0,
          explanation: 'وفق قانون أوم: I = V / R = 12 / 240 = 0.05 أمبير = 50 ملي أمبير.'
        },
        {
          question: 'ما الذي يحدث للقدرة المبددة في المقاومة إذا تضاعف فرق الجهد إلى المثلين؟',
          options: ['تتضاعف مرتين', 'تتضاعف 4 مرات', 'تنخفض للنصف', 'تبقى ثابتة'],
          correctIndex: 1,
          explanation: 'القدرة تتناسب مع مربع الجهد P = V² / R، لذا فإن مضاعفة الجهد تضاعف القدرة 4 مرات (2² = 4).'
        }
      ],
      summary: 'قانون أوم هو حجر الأساس في التحليل الكهربائي؛ ويمثل السلوك الخطي للعناصر السلبية تحت تأثير التيار المستمر والمتردد.'
    },
    {
      id: 'exp_02',
      title: 'شحن وتفريغ المكثف الكهربائي وثابت الزمن (RC Time Constant)',
      subject: 'إلكترونيات',
      academicLevel: 'سنة ثانية',
      objective: 'قياس ثابت الزمن τ لدائرة RC عملياً وملاحظة منحنى الجهد الأسي أثناء عمليتي الشحن والتفريغ.',
      theory: 'يشحن المكثف وفق دالة أسية Vc(t) = Vs(1 - e^(-t/RC))، ويصل الجهد إلى 63.2% من قيمته العظمى بعد مرور زمن مقداره ثابت زمن واحد τ = R × C.',
      equations: ['τ = R × C', 'Vc(t) = Vs × (1 - e^(-t/τ)) [شحن]', 'Vc(t) = Vs × e^(-t/τ) [تفريغ]'],
      components: ['مصدر جهد 10V DC', 'مقاومة 10 kΩ', 'مكثف إلكتروليتي 100 µF', 'مفتاح تبديل SPDT', 'راسم إشارة أو فولتميتر مع مؤقت'],
      steps: [
        'صل المقاومة مع المكثف على التوالي.',
        'صل المفتاح بحيث يبدل بين مصدر الجهد (وضع الشحن) والأرضي (وضع التفريغ).',
        'شغّل المؤقت عند إغلاق مفتاح الشحن ولاحظ زمن وصول الجهد إلى 6.32V.',
        'قارن الزمن المقاس بالقيمة النظرية τ = R × C.'
      ],
      quiz: [
        {
          question: 'لدائرة تحوي مقاومة 10kΩ ومكثف 100µF، ما هو ثابت الزمن τ؟',
          options: ['1.0 ثانية', '10 ثوانٍ', '0.1 ثانية', '1000 ثانية'],
          correctIndex: 0,
          explanation: 'τ = R × C = (10,000 Ω) × (100 × 10^-6 F) = 1.0 ثانية.'
        }
      ],
      summary: 'يحدد ثابت الزمن RC سرعة استجابة الدوائر التناظرية وفلاتر التردد ومولدات النبضات في أنظمة التحكم.'
    },
    {
      id: 'exp_03',
      title: 'بناء وبرمجة مستشعر المسافة بالأردوينو (HC-SR04 Radar)',
      subject: 'أردوينو',
      academicLevel: 'سنة ثالثة',
      objective: 'ربط حساس الموجات فوق الصوتية بلوحة Arduino Uno وحساب المسافة بدقة بالسنتيمتر وعرض النتائج على الشاشة التسلسلية.',
      theory: 'يرسل المستشعر نبضة صوتية بتردد 40kHz ويقيس زمن الارتداد t، فتكون المسافة d = (t × v) / 2 حيث v سرعة الصوت في الهواء (343 m/s).',
      equations: ['Distance = (Duration × 0.0343) / 2', 'Time_us = Distance_cm × 58.3'],
      components: ['لوحة Arduino Uno', 'مستشعر HC-SR04', 'أسلاك توصيل ذكر-أنثى', 'لوحة تجارب Breadboard'],
      steps: [
        'صل طرف VCC بـ 5V وطرف GND بأرضي اللوحة.',
        'صل طرف Trig بالمنفذ الرقمي 7 وطرف Echo بالمنفذ 8.',
        'ارفع كود الأردوينو الذي يطلق نبضة 10µs ويقيس زمن Echo بدالة pulseIn().',
        'افتح الـ Serial Monitor وحرّك عائقاً أمام الحساس ولاحظ تغير القراءات.'
      ],
      quiz: [
        {
          question: 'لماذا نقسم زمن ارتداد نبضة الصوت على 2 عند حساب المسافة؟',
          options: ['لأن الصوت يقطع المسافة مرتين (ذهاباً وإياباً)', 'لأن الحساس يحوي ميكروفونين', 'لتعويض الخطأ الحراري', 'بسبب مقاومة الهواء'],
          correctIndex: 0,
          explanation: 'الموجة فوق الصوتية تقطع المسافة من الحساس إلى العائق ذهاباً ثم ترتد إياباً إلى المستقبل، لذا نقسم الزمن على 2 لحساب بعد العائق الفعلي.'
        }
      ],
      summary: 'تعد مستشعرات المسافة ركيزة أساسية في روبوتات تجنب العوائق وأنظمة قياس مستوى السوائل والرادارات الصناعية.'
    },
    {
      id: 'exp_04',
      title: 'معايرة وضبط متحكم السرعة PID لمحرك تيار مستمر',
      subject: 'تحكم',
      academicLevel: 'سنة رابعة',
      objective: 'تصميم ومعايرة متحكم PID للحفاظ على سرعة محرك DC ثابتة تحت تغيرات الحمل الخارجي.',
      theory: 'يحسب متحكم PID إشارة التحكم بناءً على الخطأ اللحظي (P) وتراكم الخطأ في الماضي (I) ومعدل تغير الخطأ المتوقع (D).',
      equations: ['u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·(de/dt)', 'Error e(t) = Setpoint - Actual'],
      components: ['محرك DC مزود بمشفر سرعة Encoder', 'متحكم دقيق أو بطاقة محاكاة', 'دائرة قيادة H-Bridge L298N', 'برنامج محاكاة استجابة الخطوة'],
      steps: [
        'ابدأ بضبط المعاملين Ki و Kd على الصفر.',
        'ارفع المعامل التناسبي Kp تدريجياً حتى يبدأ النظام في الاستجابة السريعة.',
        'أضف المعامل التكاملي Ki لإلغاء خطأ الحالة المستقرة (Steady-state error).',
        'أضف المعامل التفاضلي Kd لتخميد التذبذبات وتقليل نسبة التجاوز (Overshoot).'
      ],
      quiz: [
        {
          question: 'ما هو الدور الرئيسي للمعامل التكاملي (Integral Gain Ki)؟',
          options: ['إلغاء خطأ الحالة المستقرة تماماً', 'زيادة سرعة النظام فقط', 'تقليل التذبذب', 'حماية المحرك من التيار الزائد'],
          correctIndex: 0,
          explanation: 'يقوم الحد التكاملي بجمع وتراكم أي خطأ متبقٍ بمرور الوقت وزيادة إشارة التحكم حتى يصبح الخطأ مساوياً للصفر تماماً.'
        }
      ],
      summary: 'طريقة الضبط المتدرجة لمعاملات PID تعد المعيار الذهبي في الأتمتة الصناعية والروبوتات المتقدمة.'
    }
  ];

  // Active selected experiment details
  const [activeExpId, setActiveExpId] = useState<string>(experimentsList[0].id);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);

  const activeExp = experimentsList.find(e => e.id === activeExpId) || experimentsList[0];

  // Filter experiments
  const filteredExperiments = experimentsList.filter(e => {
    const matchSubject = selectedSubject === 'all' || e.subject === selectedSubject;
    const matchLevel = selectedLevel === 'all' || e.academicLevel === selectedLevel;
    const matchSearch = e.title.includes(searchQuery) || e.objective.includes(searchQuery);
    return matchSubject && matchLevel && matchSearch;
  });

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setUserQuizAnswers(prev => ({ ...prev, [`${activeExp.id}_q${qIdx}`]: optIdx }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">مكتبة التجارب التعليمية الجاهزة</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Structured Mechatronics Laboratory Curriculum, Objectives, Procedures & Interactive Self-Assessment
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن تجربة أو قانون..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-xs text-white placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2"
          >
            <option value="all">كل المواد والتخصصات</option>
            <option value="كهرباء">كهرباء ودوائر</option>
            <option value="إلكترونيات">إلكترونيات</option>
            <option value="أردوينو">أردوينو ومستشعرات</option>
            <option value="تحكم">أنظمة التحكم</option>
          </select>

          {/* Academic Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2"
          >
            <option value="all">جميع السنوات الدراسية</option>
            <option value="سنة أولى">سنة أولى</option>
            <option value="سنة ثانية">سنة ثانية</option>
            <option value="سنة ثالثة">سنة ثالثة</option>
            <option value="سنة رابعة">سنة رابعة</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Experiments List (Left) and Active Experiment View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Experiments Navigation List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>قائمة التجارب المتاحة ({filteredExperiments.length}):</span>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredExperiments.map((exp) => (
              <div
                key={exp.id}
                onClick={() => { setActiveExpId(exp.id); setShowQuizResults(false); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-right space-y-2 ${
                  activeExpId === exp.id
                    ? 'bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-slate-800">
                    {exp.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {exp.academicLevel}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{exp.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {exp.objective}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Full Guided Experiment Details & Interactive Quiz (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Header of Active Experiment */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {activeExp.subject} — {activeExp.academicLevel}
              </span>
              <span className="text-xs text-slate-400 font-mono">Experiment ID: {activeExp.id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">{activeExp.title}</h2>
          </div>

          {/* 1. Objective */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>هدف التجربة (Objective):</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{activeExp.objective}</p>
          </div>

          {/* 2. Scientific Theory & Equations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sky-400">النظرية العلمية والقوانين الفيزيائية (Theory & Laws):</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {activeExp.theory}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeExp.equations.map((eq, i) => (
                <div key={i} className="bg-slate-950 border border-sky-800/60 px-3 py-1.5 rounded-xl font-mono text-xs text-sky-300 font-bold">
                  {eq}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Required Components */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400">المكونات والأجهزة المطلوبة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeExp.components.map((c, i) => (
                <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Execution Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white">خطوات التنفيذ المخبري خطوة بخطوة:</h4>
            <div className="space-y-2">
              {activeExp.steps.map((s, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Interactive Assessment Quiz */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>الأسئلة التدريبية والتقييم الذاتي</span>
              </span>
              <button
                onClick={() => setShowQuizResults(!showQuizResults)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-600/30"
              >
                {showQuizResults ? 'إخفاء التفسير' : 'تحقق من إجاباتي'}
              </button>
            </div>

            <div className="space-y-5">
              {activeExp.quiz.map((q, qIdx) => {
                const answerKey = `${activeExp.id}_q${qIdx}`;
                const selectedOpt = userQuizAnswers[answerKey];

                return (
                  <div key={qIdx} className="space-y-2 text-xs">
                    <p className="font-bold text-slate-200">
                      السؤال {qIdx + 1}: {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = selectedOpt === oIdx;
                        const isCorrect = q.correctIndex === oIdx;

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                            className={`p-2.5 rounded-xl border text-right transition-all font-medium ${
                              showQuizResults
                                ? isCorrect
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                                  : isChosen
                                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                                : isChosen
                                ? 'bg-sky-600 text-white border-sky-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 mt-2">
                        <span className="font-bold text-emerald-400 block mb-0.5">الشرح العلمي للإجابة:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Summary */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-2xl text-xs text-emerald-200 space-y-1">
            <span className="font-bold text-emerald-300 block">الملخص التعليمي المستفاد:</span>
            <p className="leading-relaxed">{activeExp.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
