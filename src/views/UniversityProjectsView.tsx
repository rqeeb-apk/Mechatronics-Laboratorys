import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Cpu,
  Zap,
  Activity,
  Sliders,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  Printer,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
  AlertTriangle,
  Gauge,
  Binary,
  ShieldAlert,
  Wrench,
  Search,
  Award,
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';
import { labAudio } from '../utils/audio.ts';
import { useAuth } from '../context/AuthContext.tsx';

// Structure of a University Project
interface UniversityProject {
  id: string;
  number: number;
  title: string;
  course: string;
  year: string;
  boardType: string;
  objective: string;
  components: string[];
  theory: string;
  formula: string;
  steps: {
    title: string;
    description: string;
    actionLabel: string;
    expectedMeasurement: string;
  }[];
  faults: {
    id: string;
    name: string;
    description: string;
    symptom: string;
    solution: string;
  }[];
  simulationType:
    | 'power_supply'
    | 'triac_phase'
    | 'opamp_ina'
    | 'timer_pwm'
    | 'sensor_relay'
    | 'h_bridge'
    | 'robotics_arm'
    | 'pid_control'
    | 'bcd_counter'
    | 'arduino_radar'
    | 'stepper_motor'
    | 'ball_and_beam';
}

export const UniversityProjectsView: React.FC<{
  onOpenTrainingBoard?: () => void;
  onOpenElectronicsBox?: () => void;
}> = ({ onOpenTrainingBoard, onOpenElectronicsBox }) => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_1');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [loggedReadings, setLoggedReadings] = useState<
    Array<{ step: string; reading: string; theoretical: string; error: string; time: string }>
  >([]);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 12 Comprehensive University Mechatronics Engineering Projects
  const projects: UniversityProject[] = [
    {
      id: 'proj_1',
      number: 1,
      title: 'وحدة التغذية الخطية المنظمة الشاملة (Multi-Rail Regulated Power Supply)',
      course: 'إلكترونيات القوى والدوائر المتكاملة (Power Electronics)',
      year: 'السنة الثانية / الثالثة',
      boardType: 'لوحة مزود الطاقة المخبري (Training Board)',
      objective: 'تصميم وتنفيذ وفحص وحدة تغذية مختبرية متكاملة توفر خطوط تغذية متعددة (+5V ثابتة، ±15V متوازنة، و3-20V متغيرة) مع الحماية من القصر وتنعيم التموج.',
      components: [
        'محول خافض 240V إلى 15V/10V/2V متعدد المخارج Multi-Tap (20VA)',
        'قنطرة دايودات تقويم كامل Full-Wave Bridge Rectifier (1N4007 × 4)',
        'مكثفات ترشيح إلكتروليتية (1000µF 35V × 2, 470µF 35V × 2)',
        'منظمات الجهد الخطية (LM7805, LM7815, LM7915, LM317)',
        'فيوزات حماية سريعة (1A, 0.3A)',
        'مقياس جهد رقمي LED Display 7-Segment ومقاومة متغيرة للضبط'
      ],
      theory: 'تعتمد وحدة التغذية على تحويل جهد الشبكة المتناوب إلى جهد منخفض بواسطة المحول، ثم تقويمه بموجة كاملة للحصول على نبضات مستمرة، ثم تنعيم الجهد عبر مكثف ذي سعة كبيرة لتقليل تموج الجهد V_ripple = I_dc / (2·f·C). وأخيراً تثبيت الجهد خطياً عند مستويات ثابتة ومحمية ضد التيارات الزائدة.',
      formula: 'V_{ripple} = \\frac{I_{load}}{2 \\cdot f \\cdot C} \\quad , \\quad V_{out(LM317)} = 1.25 \\times \\left(1 + \\frac{R_2}{R_1}\\right) + I_{adj} R_2',
      simulationType: 'power_supply',
      steps: [
        {
          title: 'الخطوة 1: تشغيل الدخل المتناوب 240VAC وفحص المحول',
          description: 'توصيل التغذية الرئيسية للملف الابتدائي وفحص الجهود المتناوبة الناتجة من المخارج المعزولة (2V, 10V, 15V AC).',
          actionLabel: 'فحص مخرج المحول 15VAC',
          expectedMeasurement: '15.24 V RMS (AC)'
        },
        {
          title: 'الخطوة 2: فحص خرج قنطرة التقويم Full-Bridge',
          description: 'ربط مخرج المحول 15V بقنطرة دايودات التقويم 1N4007 ومراقبة النبضات المستمرة عند نقطة TP2.',
          actionLabel: 'قياس جهد النبضات المقومة',
          expectedMeasurement: '19.85 V Peak (Pulsed DC)'
        },
        {
          title: 'الخطوة 3: تفعيل مكثف الترشيح 1000µF وقياس التموج',
          description: 'توصيل مكثف الترشيح بالتوازي وملاحظة اختفاء القمم النبضية وانخفاض تموج الجهد Ripple Voltage إلى أقل من 0.4V.',
          actionLabel: 'فحص جهد المكثف ونسبة التموج',
          expectedMeasurement: '19.10 V DC (Ripple: 0.32V)'
        },
        {
          title: 'الخطوة 4: فحص خطوط التغذية الثابتة (+5V و ±15V)',
          description: 'ربط منظمات LM7805 و LM7815 و LM7915 وقياس استقرار الجهد تحت مختلف الأحمال.',
          actionLabel: 'قياس خطوط المنظمات الثابتة',
          expectedMeasurement: '+5.02V, +14.98V, -15.01V'
        },
        {
          title: 'الخطوة 5: معايرة المنظم المتغير LM317 بالتحكم',
          description: 'تدوير المقاومة المتغيرة لضبط مخرج الجهد المتغير بين 3.0V و 20.0V.',
          actionLabel: 'معايرة الجهد المتغير 12.0V',
          expectedMeasurement: '12.05 V DC'
        },
        {
          title: 'الخطوة 6: اختبار فصل فيوز الحماية عند القصر (Short-Circuit)',
          description: 'محاكاة حدوث قصر كهربائي على المخرج وفحص فصل الفيوز السريع فوراً لحماية المحول.',
          actionLabel: 'اختبار الحماية ضد القصر',
          expectedMeasurement: 'فصل الفيوز F3 (0.00 V - Safe Trip)'
        }
      ],
      faults: [
        {
          id: 'fuse_blow',
          name: 'احتراق فيوز الحماية F3 (Blown Fuse)',
          description: 'حمل زائد أو قصر في دارة الخرج المتغير يؤدي لانقطاع سلك الفيوز.',
          symptom: 'الجهد يقرأ 0.00V مع وجود التغذية على الدخل، وإضاءة مؤشر التحذير الأحمر.',
          solution: 'إزالة القصر الكهربائي واستبدال الفيوز الزجاجي بفيوز سليم 0.3A.'
        },
        {
          id: 'open_diode',
          name: 'تلف دايود في قنطرة التقويم (Open Bridge Diode)',
          description: 'انقطاع أحد دايودات التقويم الأربعة في قنطرة 1N4007.',
          symptom: 'يتحول التقويم من موجة كاملة 100Hz إلى نصف موجة 50Hz مع تضاعف التموج Ripple.',
          solution: 'فحص الدايودات بواسطة وضع فحص الدايود في الملتيميتر واستبدال الدايود المعطوب.'
        },
        {
          id: 'dry_cap',
          name: 'جفاف أو انقطاع مكثف الترشيح 1000µF',
          description: 'تلف المكثف الكيميائي أو انفصال طرفه السالب.',
          symptom: 'تموج عالي جداً في الجهد وهبوط شديد في الجهد المستمر تحت أدنى حمل.',
          solution: 'قياس سعة المكثف بواسطة جهاز قياس السعة C-Meter واستبداله بآخر جديد 35V.'
        }
      ]
    },
    {
      id: 'proj_2',
      number: 2,
      title: 'التحكم في طور وقدرة أحمال AC عبر الترياك والثايريستور (SCR & TRIAC Phase Angle Control)',
      course: 'إلكترونيات القوى والمشغلات (Power Electronics & Actuators)',
      year: 'السنة الثالثة',
      boardType: 'صندوق لوحة الإلكترونيات (Electronics Box)',
      objective: 'دراسة زاوية القدح (Firing Angle α) في نبضات الترياك والثايريستور للتحكم في سرعة محركات AC وشدة إضاءة المصابيح.',
      components: [
        'ثايريستور SCR نوع BT151 أو ترياك TRIAC نوع BT136',
        'داياك DIAC لإطلاق نبضة القدح المتناظرة (DB3)',
        'مقاومة متغيرة 100kΩ ومكثف 100nF لضبط زاوية الطور',
        'حمل متناوب (مصباح 220V أو محرك تحريضي)',
        'راسم إشارة لفحص زاوية القطع الموجي'
      ],
      theory: 'عبر تأخير نبضة البوابة بواسطة دائرة RC، يتم إشعال الترياك عند زاوية محددة α من كل نصف دورة، مما يغير القيمة الفعالة للجهد المطبق على الحمل V_rms = V_m · √[(1/π)·(π - α + sin(2α)/2)].',
      formula: 'V_{rms} = V_{peak} \\sqrt{\\frac{1}{\\pi} \\left( \\pi - \\alpha + \\frac{\\sin(2\\alpha)}{2} \\right)}',
      simulationType: 'triac_phase',
      steps: [
        {
          title: 'الخطوة 1: توصيل دارة تأخير الطور RC بالداياك DB3',
          description: 'ربط المقاومة المتغيرة والمكثف لتشكيل مرحلة تأخير نبضة الإشعال.',
          actionLabel: 'فحص جهد المكثف قبل انهيار الداياك',
          expectedMeasurement: '±32V Peak Trigger Pulse'
        },
        {
          title: 'الخطوة 2: ربط أطراف الترياك MT1 و MT2 مع الحمل المتناوب',
          description: 'توصيل الترياك على التوالي مع المصباح ومصدر الجهد 220VAC.',
          actionLabel: 'تشغيل الدائرة بـ α = 45°',
          expectedMeasurement: '198.4 V RMS (إضاءة قوية 85%)'
        },
        {
          title: 'الخطوة 3: زيادة زاوية القدح إلى α = 90°',
          description: 'تدوير المقاومة لزيادة زمن التأخير ومراقبة نصف الموجة المقطوعة.',
          actionLabel: 'قياس الجهد الفعال عند زاوية 90°',
          expectedMeasurement: '155.6 V RMS (إضاءة متوسطة 50%)'
        },
        {
          title: 'الخطوة 4: ضبط زاوية القدح إلى α = 135°',
          description: 'ملاحظة خفوت شديد في إضاءة المصباح وانخفاض سرعة المحرك.',
          actionLabel: 'قياس الجهد الفعال عند زاوية 135°',
          expectedMeasurement: '78.2 V RMS (إضاءة خافتة 15%)'
        }
      ],
      faults: [
        {
          id: 'triac_short',
          name: 'قصر دائم في الترياك (Triac Punctured)',
          description: 'انهيار بلورة الترياك يؤدي إلى توصيل دائم بدون تحكم.',
          symptom: 'المصباح يضيء بأقصى قوة طوال الوقت ولا يستجيب لتدوير المقاومة.',
          solution: 'استبدال الترياك والتأكد من إضافة دارة إخماد Snubber (RC) لحمايته من dv/dt.'
        }
      ]
    },
    {
      id: 'proj_3',
      number: 3,
      title: 'مضخم القياسات الحيوية والصناعية ومضخمات العمليات (Instrumentation Amplifier INA)',
      course: 'معالجة الإشارات والقياسات الكهربائية (Signal Conditioning)',
      year: 'السنة الثانية / الثالثة',
      boardType: 'مختبر الإلكترونيات ومضخمات Op-Amp',
      objective: 'بناء مضخم قياسات دقيق بثلاث مضخمات عمليات (3-Op-Amp INA) لتضخيم إشارات الحساسات الضعيفة جداً ورفض الضوضاء المشتركة (High CMRR).',
      components: [
        'ثلاث مضخمات عمليات LM741 أو مضخم رباعي LM324',
        'مقاومات دقيقة متطابقة (10kΩ × 6)',
        'مقاومة كسب قابلة للتعديل Rgain (100Ω إلى 10kΩ)',
        'فلتر فعال ممرر للترددات المنخفضة Active LPF (Sallen-Key)',
        'مصدر تغذية متوازن ±15V من لوحة مزود الطاقة'
      ],
      theory: 'يمتاز مضخم القياسات بممانعة دخل عالية جداً للطرفين، ومعادلة كسبه هي: V_out = (1 + 2·R1/R_gain) · (R3/R2) · (V2 - V1)، مما يتيح استخلاص إشارات الحساسات في البيئات الصناعية المشوشة.',
      formula: 'A_v = \\left(1 + \\frac{2 R_1}{R_G}\\right) \\cdot \\frac{R_3}{R_2} \\quad , \\quad CMRR = 20 \\log_{10} \\left( \\frac{A_d}{A_{cm}} \\right) > 100\\,\\text{dB}',
      simulationType: 'opamp_ina',
      steps: [
        {
          title: 'الخطوة 1: تغذية مكبرات العمليات بالجهد المتوازن ±15V',
          description: 'فحص خطوط التغذية المزدوجة والأرضي المشترك.',
          actionLabel: 'فحص التغذية المتوازنة',
          expectedMeasurement: '+15.00V / -15.00V DC'
        },
        {
          title: 'الخطوة 2: اختبار مرحلة العزل Buffer والمداخل التفاضلية',
          description: 'تطبيق إشارة جهد تفاضلية صغيرة (50mV) من قنطرة السترين غيج.',
          actionLabel: 'قياس إشارة الدخل التفاضلية',
          expectedMeasurement: 'ΔV_in = 50.0 mV'
        },
        {
          title: 'الخطوة 3: ضبط مقاومة الكسب Rgain = 1kΩ وحساب الكسب',
          description: 'كسب المرحلة الأولى = (1 + 2*10k/1k) = 21. الكسب الإجمالي = 21.',
          actionLabel: 'قياس إشارة الخرج المضخمة',
          expectedMeasurement: 'V_out = 1.05 V (Gain = 21.0)'
        },
        {
          title: 'الخطوة 4: حقن إشارة ضوضاء مشتركة Common-Mode Noise',
          description: 'حقن ضوضاء 5V مشتركة على المدخلين معاً وإثبات إلغائها التام بالخرج.',
          actionLabel: 'فحص نسبة رفض النمط المشترك CMRR',
          expectedMeasurement: 'CMRR = 104 dB (Noise Nullified)'
        }
      ],
      faults: [
        {
          id: 'resistor_mismatch',
          name: 'عدم تطابق المقاومات في دارة الطرح (Resistor Mismatch)',
          description: 'استخدام مقاومات تفاوتها 10% بدل مقاومات دقيقة 0.1%.',
          symptom: 'انخفاض شديد في CMRR وظهور ضوضاء الشبكة 50Hz على مخرج الإشارة.',
          solution: 'استخدام مقاومات دقيقة Metal Film بنسبة تفاوت 0.1% أو تشذيب بالمقاومة المتغيرة.'
        }
      ]
    },
    {
      id: 'proj_4',
      number: 4,
      title: 'المؤقت الصناعي ومولد نبضات التضمين PWM بواسطة 555 (Industrial 555 PWM Timer)',
      course: 'الدوائر الإلكترونية والنبضية (Pulse & Switching Circuits)',
      year: 'السنة الثانية',
      boardType: 'لوحة الإلكترونيات وصندوق التوصيل',
      objective: 'توليد نبضات مربعة بنسبة تشغيل Duty Cycle متغيرة من 1% إلى 99% للتحكم في سرعة المحركات والمشغلات.',
      components: [
        'مؤقت NE555 Timer',
        'دايودات توجيه سريعة 1N4148 لفرز مساري الشحن والتفريغ',
        'مقاومة متغيرة 10kΩ ومكثف 10nF',
        'ترانزستور قيادة NPN وحمل محرك DC',
        'راسم إشارة لفحص شكل النبضة وزمن الصعود'
      ],
      theory: 'باستخدام دايودي توجيه على طرفي المقاومة المتغيرة، يشحن المكثف عبر الجزء العلوي ويفرغ عبر الجزء السفلي، مما يعزل زمن التشغيل t_high عن زمن الإطفاء t_low ويتيح تعديل نسبة التشغيل دون تغيير التردد الإجمالي.',
      formula: 't_{high} = 0.693 \\cdot R_A \\cdot C \\quad , \\quad t_{low} = 0.693 \\cdot R_B \\cdot C \\quad , \\quad Duty\\,Cycle = \\frac{t_{high}}{t_{high} + t_{low}}',
      simulationType: 'timer_pwm',
      steps: [
        {
          title: 'الخطوة 1: توصيل المؤقت 555 في وضع الاهتزاز الحر Astable',
          description: 'ربط أطراف التغذية (Pin 8 Vcc, Pin 1 GND) وتثبيت طرف الإعادة Pin 4.',
          actionLabel: 'فحص استقرار التغذية 12V',
          expectedMeasurement: '12.00 V DC'
        },
        {
          title: 'الخطوة 2: ربط دايودي التوجيه 1N4148 بالمقاومة المتغيرة',
          description: 'فصل مسار الشحن (شحن المكثف) عن مسار التفريغ (تفريغ عبر Pin 7).',
          actionLabel: 'فحص شكل موجة المكثف C (1/3 إلى 2/3 Vcc)',
          expectedMeasurement: 'Oscillating between 4.0V and 8.0V'
        },
        {
          title: 'الخطوة 3: قياس نسبة التشغيل عند ضبط المقاومة بـ 25%',
          description: 'قياس زمن التشغيل t_high وزمن الإطفاء t_low بالمايكروثانية.',
          actionLabel: 'قياس نبضة 25% PWM',
          expectedMeasurement: 'Duty Cycle = 25.4%, Freq = 1.44 kHz'
        },
        {
          title: 'الخطوة 4: زيادة نسبة التشغيل إلى 75% وقياس سرعة المحرك',
          description: 'تدوير المقاومة وملاحظة تسارع دوران المحرك وزيادة زمن النبضة الموجبة.',
          actionLabel: 'قياس نبضة 75% PWM وسرعة المحرك',
          expectedMeasurement: 'Duty Cycle = 74.8%, Motor Speed = 2250 RPM'
        }
      ],
      faults: [
        {
          id: 'floating_pin4',
          name: 'ترك طرف الإعادة Pin 4 عائماً بدون توصيل',
          description: 'عدم ربط الطرف 4 بالـ Vcc يؤدي لتصفير المؤقت بفعل الضوضاء الكهروستاتيكية.',
          symptom: 'المؤقت يتوقف فجأة وبشكل عشوائي بدون إخراج نبضات.',
          solution: 'ربط Pin 4 مباشرة بخط التغذية الموجب Vcc.'
        }
      ]
    },
    {
      id: 'proj_5',
      number: 5,
      title: 'نظام الإنذار والتحكم التلقائي بحساسات الضوء والحرارة (LDR/NTC Sensor & Relay)',
      course: 'الحساسات والمحولات (Sensors & Transducers)',
      year: 'السنة الثالثة',
      boardType: 'لوحة الإلكترونيات ومكبرات LM358',
      objective: 'بناء نظام أتمتة كامل يقيس التغيرات البيئية (ضوء/حرارة) ويفصل أو يشغل الأحمال الصناعية عبر مرحل كهرومغناطيسي Relay محمي بدارات الحماية.',
      components: [
        'مقاومة ضوئية LDR ومقاومة حرارية NTC',
        'مكبر عمليات LM358 كمقارن ذي تخلفية Schmitt Trigger',
        'ترانزستور قيادة BC547',
        'مرحل 12V Relay مع دايود تفريغ عكسي Flyback Diode (1N4007)',
        'صفارة إنذار ومصباح تحذيري'
      ],
      theory: 'تولد دائرة المقسم التناسبي جهداً يتغير مع شدة الضوء أو الحرارة، يقارنه مكبر العمليات بجهد مرجعي، ويقود الترانزستور لتفعيل ملف المرحل. ويمنع دايود التفريغ العكسي القوة الدافعة الكهربائية الحثية العالية المتولدة عند فصل الملف من إتلاف الترانزستور.',
      formula: 'V_{sensor} = V_{cc} \\cdot \\frac{R_{LDR}}{R_1 + R_{LDR}} \\quad , \\quad V_{spike} = -L \\frac{di}{dt} > 150\\,\\text{V} \\;\\text{(بدون دايود)}',
      simulationType: 'sensor_relay',
      steps: [
        {
          title: 'الخطوة 1: معايرة مقسم الجهد لحساس الضوء LDR',
          description: 'قياس جهد الخرج في الإضاءة الطبيعية وعند حجب الضوء.',
          actionLabel: 'قياس جهد الحساس تحت الضوء الطبيعي',
          expectedMeasurement: 'V_light = 2.40V, V_dark = 9.80V'
        },
        {
          title: 'الخطوة 2: ضبط عتبة المقارن Comparator Threshold',
          description: 'ضبط الجهد المرجعي Vref عند 6.0V عبر المقاومة المتغيرة.',
          actionLabel: 'فحص الجهد المرجعي Vref',
          expectedMeasurement: 'V_ref = 6.00 V DC'
        },
        {
          title: 'الخطوة 3: حجب الضوء واختبار تفعيل المرحل Relay',
          description: 'عند تجاوز عتبة الظلام يرتفع خرج المقارن مشغلاً ترانزستور BC547 وطقطقة المرحل.',
          actionLabel: 'تفعيل الظلام وفحص ملف المرحل',
          expectedMeasurement: 'Relay Active (NO Contact Closed, Siren ON)'
        },
        {
          title: 'الخطوة 4: فحص نبضة التفريغ الحثي ودايود الحماية Flyback',
          description: 'مراقبة الجهد العكسي على مجمع الترانزستور عند فصل المرحل مع وجود الدايود وبدونه.',
          actionLabel: 'قياس ذروة الجهد العكسي',
          expectedMeasurement: 'Clamped safely to 12.7V (Flyback Diode Protected)'
        }
      ],
      faults: [
        {
          id: 'missing_flyback',
          name: 'نزع دايود التفريغ العكسي 1N4007 من ملف المرحل',
          description: 'فصل الدايود الموازي للملف الحثي.',
          symptom: 'تولد نبضة جهد عكسي تزيد عن 180V تتسبب في احتراق ترانزستور القيادة BC547 فوراً.',
          solution: 'تركيب دايود سريع أو 1N4007 بالتوازي المعاكس الدائم عبر طرفي ملف المرحل.'
        }
      ]
    },
    {
      id: 'proj_6',
      number: 6,
      title: 'قيادة محرك تيار مستمر بقنطرة H-Bridge مع التغذية العكسية للمشفر البصري',
      course: 'أنظمة قيادة المحركات الكهربائية (Motor Drives & Actuators)',
      year: 'السنة الثالثة / الرابعة',
      boardType: 'مختبر المحركات والروبوتات',
      objective: 'التحكم في اتجاه وسرعة محرك DC ذي عزم كبير في الاتجاهين (Forward & Reverse) مع فرملة إلكترونية وقياس السرعة الحقيقية بواسطة مشفر بصري Encoder.',
      components: [
        'قنطرة ترانزستورات أو دارة L298N Dual H-Bridge',
        'محرك DC بجهد 12V مع تروس تخفيض ومشفر بصري',
        'متحكم PWM للسرعة',
        'دايودات حماية حثية Fast Recovery Diodes'
      ],
      theory: 'تتكون قنطرة H-Bridge من 4 مفاتيح إلكترونية، يتيح إغلاق الزوج المائل (Q1 و Q4) تدوير المحرك للأمام، وإغلاق الزوج المقابل (Q2 و Q3) تدويره للخلف، بينما يتم تفعيل نبضات PWM على خط التمكين (Enable) للتحكم الدقيق في السرعة.',
      formula: 'V_{motor} = D \\cdot V_s \\quad , \\quad RPM = \\frac{Pulses \\times 60}{PPR \\times \\Delta t} \\quad , \\quad T = K_t \\cdot I',
      simulationType: 'h_bridge',
      steps: [
        {
          title: 'الخطوة 1: توصيل خط التغذية 12V DC لقنطرة القدرة L298N',
          description: 'فحص التغذية والأرضي المشترك مع إشارات التحكم.',
          actionLabel: 'فحص تغذية المحرك',
          expectedMeasurement: '12.00 V DC'
        },
        {
          title: 'الخطوة 2: تطبيق الدوران الأمامي Forward (IN1=1, IN2=0)',
          description: 'تطبيق إشارة اتجاه الدوران وتشغيل نبضات PWM بنسبة 60%.',
          actionLabel: 'تشغيل الدوران للأمام',
          expectedMeasurement: 'Direction: CW, Speed = 1800 RPM'
        },
        {
          title: 'الخطوة 3: الفرملة النشطة Active Dynamic Brake (IN1=1, IN2=1)',
          description: 'قصر طرفي المحرك على الأرضي لفرملة سريعة في أقل من 50ms.',
          actionLabel: 'تطبيق الفرملة اللحظية',
          expectedMeasurement: 'Braking time: 42 ms, Speed = 0 RPM'
        },
        {
          title: 'الخطوة 4: الدوران العكسي Reverse (IN1=0, IN2=1)',
          description: 'عكس قطبية الجهد المطبق على المحرك للدوران بالاتجاه المعاكس.',
          actionLabel: 'تشغيل الدوران للخلف',
          expectedMeasurement: 'Direction: CCW, Speed = -1800 RPM'
        }
      ],
      faults: [
        {
          id: 'shoot_through',
          name: 'التوصيل المتزامن Shoot-Through (قصر رأسي)',
          description: 'توصيل Q1 و Q2 معاً في نفس الساق نتيجة خطأ برمجي أو غياب زمن الموت Dead-time.',
          symptom: 'قصر مباشر على مزود الطاقة واحتراق الترانزستورات فوراً بفعل تيار هائل.',
          solution: 'برمجة زمن أمان Dead-Time بين فصل المفتاح العلوي وتشغيل المفتاح السفلي.'
        }
      ]
    },
    {
      id: 'proj_7',
      number: 7,
      title: 'الذراع الروبوتية المفصلية ثلاثية المحاور وحسابات الكينماتيكا (3-DOF Robot Arm)',
      course: 'مقدمة في الروبوتات والحركيات (Robotics & Kinematics)',
      year: 'السنة الرابعة / تخرج',
      boardType: 'مختبر الروبوتات والأنظمة الميكاترونية',
      objective: 'حساب مصفوفات التحويل الهندسي DH Parameters، وتحريك ذراع روبوتية ثلاثية المفاصل للوصول لإحداثيات نقطة النهاية (X, Y, Z) في حيز العمل بدقة ميكانيكية.',
      components: [
        'هيكل ذراع روبوتية ثلاثية المحاور (Base, Shoulder, Elbow, Gripper)',
        'محركات سيرفو معدنية العزم MG995 / SG90',
        'متحكم زوايا PWM دقيق',
        'حاسبة كينماتيكا مباشرة Forward Kinematics Solver'
      ],
      theory: 'يتم تمثيل كل وصلة روبوتية بمتغيراتها الهندسية، وتحسب إحداثيات القابض بنهاية الذراع بمصفوفات الدوران والإزاحة: X = (L1·cosθ2 + L2·cos(θ2+θ3))·cosθ1 و Z = L0 + L1·sinθ2 + L2·sin(θ2+θ3).',
      formula: 'X = \\left(L_1 \\cos\\theta_2 + L_2 \\cos(\\theta_2+\\theta_3)\\right) \\cos\\theta_1 \\quad , \\quad Z = L_0 + L_1 \\sin\\theta_2 + L_2 \\sin(\\theta_2+\\theta_3)',
      simulationType: 'robotics_arm',
      steps: [
        {
          title: 'الخطوة 1: معايرة الزوايا الصفرية للمفاصل الثلاثة',
          description: 'ضبط محركات السيرفو عند الزوايا الافتراضية θ1=0°, θ2=90°, θ3=0°.',
          actionLabel: 'معايرة الوضع المرجعي Home Position',
          expectedMeasurement: 'X = 140 mm, Y = 0 mm, Z = 220 mm'
        },
        {
          title: 'الخطوة 2: تطبيق حركة الكتف والكوع للوصول لنقطة العمل',
          description: 'تطبيق الزوايا θ1=45°, θ2=30°, θ3=-40° ومراقبة حركة المفصلين.',
          actionLabel: 'حساب الإحداثيات المباشرة',
          expectedMeasurement: 'X = 138.2 mm, Y = 138.2 mm, Z = 142.5 mm'
        },
        {
          title: 'الخطوة 3: تنفيذ دورة مناولة آلية (Pick and Place Routine)',
          description: 'النزول لموقع القطعة، إغلاق القابض Gripper، الارتفاع والنقل لموقع التفريغ.',
          actionLabel: 'تشغيل دورة المناولة الآلية',
          expectedMeasurement: 'Cycle Completed (Gripper Force: 3.2 N)'
        }
      ],
      faults: [
        {
          id: 'singularity',
          name: 'نقطة الانفرد الهندسي Kinematic Singularity',
          description: 'امتداد مفاصل الذراع بالكامل على خط مستقيم (θ3 = 0° و θ2 = 0°).',
          symptom: 'فقدان درجة من درجات الحرية وعجز خوارزمية الكينماتيكا العكسية عن حساب المشتقات.',
          solution: 'تحديد حدود حيز العمل البرمجي وتجنب محاذاة الوصلات التامة.'
        }
      ]
    },
    {
      id: 'proj_8',
      number: 8,
      title: 'محطة التحكم الصناعي بمعاملات PID ومعايرة استجابة النظام المغلق',
      course: 'نظرية التحكم الآلي (Automatic Control Theory)',
      year: 'السنة الثالثة / الرابعة',
      boardType: 'مختبر أنظمة التحكم',
      objective: 'معايرة معاملات متحكم PID الثلاثة (Kp, Ki, Kd) لنظام تحكم مغلق لتقليل نسبة التجاوز وتصفير خطأ الحالة المستقرة بأسرع زمن استقرار ممكن.',
      components: [
        'نظام محاكاة ديناميكي من الدرجة الثانية (Plant G(s))',
        'متحكم PID قابل للتوليف الرقمي',
        'مولد إشارة خطوة مرجعية Step Input',
        'راسم استجابة زمنية لحساب tr, tp, Mp%, ts, ess'
      ],
      theory: 'يحسب المتحكم الخطأ لحظياً e(t) = r(t) - y(t)، حيث يسرع الحد التناسبي Kp الاستجابة، ويلغي الحد التكاملي Ki خطأ الحالة المستقرة، بينما يخمد الحد التفاضلي Kd التذبذبات ويضمن استقرار النظام.',
      formula: 'u(t) = K_p e(t) + K_i \\int_0^t e(\\tau) d\\tau + K_d \\frac{de(t)}{dt} \\quad , \\quad G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta \\omega_n s + \\omega_n^2}',
      simulationType: 'pid_control',
      steps: [
        {
          title: 'الخطوة 1: تفعيل التحكم التناسبي فقط (P-Only: Kp=2.0, Ki=0, Kd=0)',
          description: 'ملاحظة سرعة الاستجابة مع بقاء خطأ دائم في الحالة المستقرة (Steady-State Offset).',
          actionLabel: 'اختبار P-Only ورصد الخطأ',
          expectedMeasurement: 'Output = 0.67 (Offset Error = 33%)'
        },
        {
          title: 'الخطوة 2: إضافة الحد التكاملي (PI: Kp=2.0, Ki=1.5, Kd=0)',
          description: 'إلغاء خطأ الحالة المستقرة تماماً مع ظهور قمة تجاوز overshoot ملحوظة.',
          actionLabel: 'اختبار PI وتصفير الخطأ',
          expectedMeasurement: 'Output = 1.00 (ess = 0%, Overshoot Mp = 28%)'
        },
        {
          title: 'الخطوة 3: إضافة الحد التفاضلي للضبط المثالي (PID: Kp=3.5, Ki=2.0, Kd=1.2)',
          description: 'إخماد قمة التجاوز وتقليل زمن الاستقرار إلى أقل من 0.8 ثانية.',
          actionLabel: 'اختبار الاستجابة المثالية PID',
          expectedMeasurement: 'Overshoot < 4%, Settling Time = 0.65 s'
        },
        {
          title: 'الخطوة 4: حقن تشويش مفاجئ Disturbance Rejection',
          description: 'تطبيق حمل ميكانيكي مباغت ومراقبة تعافي المتحكم وعودته للهدف بدقة.',
          actionLabel: 'اختبار رفض التشويش الخارجي',
          expectedMeasurement: 'System Recovered in 0.42 seconds'
        }
      ],
      faults: [
        {
          id: 'integral_windup',
          name: 'تشبع الحد التكاملي (Integral Windup)',
          description: 'تراكم قيمة التكامل عند وصول مشغل القدرة للتشبع الأقصى Saturation.',
          symptom: 'تأخر طويل جداً في العودة وتجاوز هائل للهدف عند تغيير القيمة المرجعية.',
          solution: 'تطبيق خوارزمية منع تشبع التكامل Anti-Windup Clamping.'
        }
      ]
    },
    {
      id: 'proj_9',
      number: 9,
      title: 'دائرة العداد الثنائي مع مفكك الترميز وشاشة الـ 7-Segment (BCD to 7-Segment)',
      course: 'الأنظمة الرقمية والمعمارية (Digital Systems & Logic Design)',
      year: 'السنة الأولى / الثانية',
      boardType: 'المختبر الرقمي والمنطق',
      objective: 'تصميم وبناء نظام عداد عشري رقمي (0 إلى 9) باستخدام القلابات التتابعية ودارة فك الترميز 7447 BCD وشاشة الإظهار سباعية القطع.',
      components: [
        'عداد ثنائي تصاعدي 4-Bit Binary Counter (74LS90 / 74LS193)',
        'مفكك ترميز 74LS47 BCD to 7-Segment Decoder',
        'شاشة عرض سباعية القطع Common Anode 7-Segment',
        'مقاومات حماية للقطع 330Ω × 7',
        'مولد نبضات ساعة Clock Generator'
      ],
      theory: 'يولد العداد شفرة BCD ثنائية من 0000 إلى 1001، تقوم دارة فك الترميز بتحويلها إلى تشكيلة إضاءة مناسبة للقطع السبع (a, b, c, d, e, f, g) لترسم الأرقام العشرية بوضوح.',
      formula: 'BCD = [Q_3, Q_2, Q_1, Q_0] \\quad , \\quad Segments = f(A,B,C,D)',
      simulationType: 'bcd_counter',
      steps: [
        {
          title: 'الخطوة 1: فحص نبضات الساعة Clock Pulse من المولد',
          description: 'ضبط تردد النبضات عند 1Hz لمراقبة التحول الزمني بوضوح.',
          actionLabel: 'فحص إشارة الساعة',
          expectedMeasurement: 'Clock Freq = 1.0 Hz (Square Wave)'
        },
        {
          title: 'الخطوة 2: ربط مخارج العداد Q0-Q3 بمداخل دارة فك الترميز 74LS47',
          description: 'توصيل الخطوط الثنائية الأربعة ومراقبة القيمة الثنائية الحالية.',
          actionLabel: 'فحص العد الثنائي BCD',
          expectedMeasurement: 'State = 0000 -> 0001 -> 0010...'
        },
        {
          title: 'الخطوة 3: فحص إضاءة قطع الشاشة (a إلى g) للأرقام من 0 إلى 9',
          description: 'تأكيد إضاءة القطع المناسبة لكل رقم وتصفير العداد تلقائياً عند الرقم 9.',
          actionLabel: 'اختبار دورة العد الكاملة (0-9)',
          expectedMeasurement: 'Display shows digits 0 to 9 in sync'
        }
      ],
      faults: [
        {
          id: 'floating_inputs',
          name: 'مداخل TTL متروكة عائمة (Floating TTL Inputs)',
          description: 'ترك أحد مداخل العداد غير متصل.',
          symptom: 'تعتبر مداخل TTL العائمة منطقياً كـ HIGH، مما يسبب قفز الأرقام وتخبط التسلسل.',
          solution: 'ربط جميع المداخل غير المستخدمة بالأرضي أو Vcc عبر مقاومات Pull-up/down.'
        }
      ]
    },
    {
      id: 'proj_10',
      number: 10,
      title: 'محطة الميكاترونكس الذكية الشاملة بالأردوينو (Smart Arduino Mechatronics Station)',
      course: 'المتحكمات الدقيقة وتطبيقاتها (Microcontrollers & Interfacing)',
      year: 'السنة الثالثة / الرابعة',
      boardType: 'مختبر الأردوينو ومحاكي C++',
      objective: 'دمج حساس المسافة فوق الصوتي ومقاومة التعيير التماثلية ومحرك السيرفو مع شاشة المنفذ التسلسلي لبناء رادار مسح أوتوماتيكي ذكي.',
      components: [
        'لوحة Arduino Uno R3',
        'مستشعر المسافة بالموجات فوق الصوتية HC-SR04',
        'محرك سيرفو SG90 مركب عليه المستشعر للمسح الزاوي',
        'مقاومة متغيرة لضبط حساسية العتبة التناظرية',
        'محرر كود C++ البرمجي ومراقب المنفذ التسلسلي Serial Monitor'
      ],
      theory: 'يقوم الأردوينو بمسح أفق الرؤية بزوايا من 0° إلى 180° خطوة بخطوة، ويقيس المسافة عند كل زاوية عبر حساب زمن ارتداد الموجة t: Distance = (t * 0.0343) / 2، ويرسم خريطة العوائق المحيطة.',
      formula: 'Distance (\\text{cm}) = \\frac{Echo\\,Time (\\mu\\text{s}) \\times 0.0343}{2} \\quad , \\quad PWM_{servo} = 1000 + \\frac{\\theta}{180} \\times 1000\\,\\mu\\text{s}',
      simulationType: 'arduino_radar',
      steps: [
        {
          title: 'الخطوة 1: فحص نبضة إطلاق الموجات Trig Pulse (10µs)',
          description: 'تطبيق نبضة تشغيل 10 مايكروثانية وإرسال حزمة 8 نبضات فوق صوتية بتردد 40kHz.',
          actionLabel: 'فحص نبضة الإطلاق Trig',
          expectedMeasurement: 'Trig Pulse = 10.0 µs High'
        },
        {
          title: 'الخطوة 2: قياس زمن ارتداد صدى الموجة Echo وحساب المسافة',
          description: 'حساب زمن النبضة الراجعة وتحويلها لمسافة بالسنتيمتر بدقة عالية.',
          actionLabel: 'قياس مسافة العائق',
          expectedMeasurement: 'Echo: 1458 µs -> Distance = 25.0 cm'
        },
        {
          title: 'الخطوة 3: تفعيل محرك السيرفو للمسح الزاوي الترددي (0° إلى 180°)',
          description: 'مسح محيط الرادار خطوة بخطوة بزوايا متزايدة وتحديث شاشة الرادار الخضراء.',
          actionLabel: 'بدء مسح الرادار الأوتوماتيكي',
          expectedMeasurement: 'Radar Scanning [0° -> 180°] Active'
        }
      ],
      faults: [
        {
          id: 'blind_zone',
          name: 'المنطقة العمياء لحساس المسافة (Blind Zone)',
          description: 'وضع العائق على مسافة أقل من 2 سم من الحساس.',
          symptom: 'تداخل نبضة الإرسال مع الارتداد وقراءة قيم عشوائية تزيد عن 300 سم.',
          solution: 'إبقاء مسافة أمان ميكانيكية لا تقل عن 3 سم في تصميم الحامل.'
        }
      ]
    },
    {
      id: 'proj_11',
      number: 11,
      title: 'قيادة محرك الخطوة بالخطوات الميكروية (Stepper Motor Microstepping Driver)',
      course: 'المشغلات الكهروميكانيكية والمتحكمات (Actuators & Motion Control)',
      year: 'السنة الثالثة / الرابعة',
      boardType: 'مختبر المحركات والروبوتات',
      objective: 'التحكم في زاوية وموقع وسرعة محرك خطوة ثنائي القطبية (Bipolar Stepper) باستخدام نمط الخطوات الكاملة والخطوات الميكروية (1/16 Microstepping) للتخلص من الاهتزازات الميكانيكية.',
      components: [
        'محرك خطوة ثنائي القطب Bipolar Stepper Motor (NEMA 17, 1.8°/step)',
        'درايفر محرك خطوة A4988 أو DRV8825 مع متحكم تيار مدمج',
        'متحكم نبضات Step/Dir',
        'مقياس زاوية ومؤشر موقع رقمي'
      ],
      theory: 'تقوم تقنية المايكروستيبينغ بتطبيق تيارات جيبية متغيرة في الملفين A و B بدلاً من التيارات النبضية المربعة، مما يجزئ الخطوة الواحدة (1.8°) إلى 16 خطوة ميكروية ناعمة جداً بزاوية 0.1125° للخطوة.',
      formula: 'Step\\,Angle = \\frac{360^\\circ}{\\text{Steps per Rev}} = 1.8^\\circ \\quad , \\quad I_A = I_{max} \\cos(\\theta_e) \\;,\\; I_B = I_{max} \\sin(\\theta_e)',
      simulationType: 'stepper_motor',
      steps: [
        {
          title: 'الخطوة 1: معايرة تيار درايفر المحرك Vref لنظام الحماية',
          description: 'ضبط مقاومة المعايرة لحماية المحرك من السخونة الزائدة.',
          actionLabel: 'فحص جهد المعايرة Vref',
          expectedMeasurement: 'Vref = 0.60V (I_max = 1.2A)'
        },
        {
          title: 'الخطوة 2: اختبار نمط الخطوة الكاملة Full-Step وملاحظة الاهتزاز',
          description: 'تطبيق نبضات خطوة كاملة (200 خطوة للدورة الواحدة).',
          actionLabel: 'تشغيل نمط الخطوة الكاملة',
          expectedMeasurement: 'Step Angle = 1.80° (Resonance Noticeable)'
        },
        {
          title: 'الخطوة 3: تفعيل نمط الخطوات الميكروية 1/16 Microstepping',
          description: 'تنعيم الحركة الميكانيكية وزيادة الدقة إلى 3200 خطوة لكل دورة.',
          actionLabel: 'تفعيل المايكروستيب 1/16',
          expectedMeasurement: 'Microstep Angle = 0.1125° (Ultra Smooth Motion)'
        }
      ],
      faults: [
        {
          id: 'missed_steps',
          name: 'فقدان الخطوات الميكانيكية (Missed Steps / Stall)',
          description: 'تطبيق تسارع يفوق عزم المحرك القابل للتحمل أو حمل زائد.',
          symptom: 'توقف المحرك عن الدوران مع إصدار صوت طنين حاد وفقدان دقة الإحداثيات.',
          solution: 'برمجة منحنى تسارع ناعم Trapezoidal Acceleration أو تخفيف الحمل.'
        }
      ]
    },
    {
      id: 'proj_12',
      number: 12,
      title: 'نظام توازن الكرة والعارضة الميكاتروني (Ball and Beam Balance Mechatronics System)',
      course: 'هندسة الميكاترونكس المتقدمة (Advanced Mechatronics Systems)',
      year: 'السنة الرابعة / تخرج',
      boardType: 'مختبر أنظمة التحكم والميكاترونكس',
      objective: 'تطبيق خوارزميات التحكم الحديث لتثبيت كرة حديدية متدحرجة على عارضة مائلة بدقة في موقع محدد عبر محرك سيرفو وحساس مسافة تماثلي.',
      components: [
        'عارضة خفيفة الوزن طولها 40 سم مع مفصل محوري',
        'كرة معدنية متدحرجة بدون انزلاق',
        'محرك سيرفو عالي العزم للتحكم في زاوية ميل العارضة α',
        'حساس موضع تماثلي لقياس مكان الكرة لحظياً x(t)',
        'خوارزمية تحكم PD في الزمن الحقيقي'
      ],
      theory: 'يمثل نظام الكرة والعارضة نموذجاً غير خطي وغير مستقر بطبيعته (Open-loop Unstable). تخضع حركة الكرة لمعادلة نيوتن للحركة: d²x/dt² = -(5/7) * g * sin(α)، حيث يتم حساب زاوية الميل اللازمة عبر تغذية عكسية للموضع والسرعة لإبقاء الكرة في الموضع المستهدف.',
      formula: '\\ddot{x}(t) = -\\frac{5}{7} g \\sin(\\alpha) \\approx -\\frac{5}{7} g \\alpha \\quad , \\quad \\alpha(t) = -K_p (x - x_{target}) - K_d \\dot{x}',
      simulationType: 'ball_and_beam',
      steps: [
        {
          title: 'الخطوة 1: معايرة حساس موضع الكرة التماثلي (Zero Calibration)',
          description: 'معايرة منتصف العارضة كنقطة مرجعية الصفر (0 cm).',
          actionLabel: 'معايرة نقطة الصفر',
          expectedMeasurement: 'Center Position = 0.00 cm (V = 2.50V)'
        },
        {
          title: 'الخطوة 2: اختبار استجابة السيرفو للميل المفتوح Open-Loop',
          description: 'إمالة العارضة بزاوية 5 درجات وملاحظة تدحرج الكرة المتسارع بتأثير الجاذبية.',
          actionLabel: 'اختبار التدحرج المفتوح',
          expectedMeasurement: 'Ball Accelerates at 0.61 m/s²'
        },
        {
          title: 'الخطوة 3: تفعيل متحكم التوازن المغلق PD Controller',
          description: 'تطبيق زوايا ميل عكسية لحظية لتخميد سرعة الكرة وتثبيتها عند الهدف المطلوب.',
          actionLabel: 'تشغيل التوازن التلقائي',
          expectedMeasurement: 'Ball Stabilized at Target ±0.2 mm'
        }
      ],
      faults: [
        {
          id: 'sensor_noise',
          name: 'ضوضاء حساس الموضع تؤدي لارتعاش السيرفو (Sensor Jitter)',
          description: 'عدم فلترة إشارة موضع الكرة التماثلية.',
          symptom: 'اهتزاز ميكانيكي سريع في محرك السيرفو وسخونة مفرطة.',
          solution: 'تطبيق مرشح رقمي ممرر للترددات المنخفضة (Digital Low-Pass Filter) على إشارة الحساس.'
        }
      ]
    }
  ];

  // Filter projects by search
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // State for interactive simulation controls across various project types
  // 1. Power Supply Simulation State
  const [psVoltageKnob, setPsVoltageKnob] = useState<number>(12.0);
  const [psTransformerTap, setPsTransformerTap] = useState<'2V' | '10V' | '15V'>('15V');
  const [psFilterCapOn, setPsFilterCapOn] = useState<boolean>(true);
  const [psShortCircuit, setPsShortCircuit] = useState<boolean>(false);
  const [psFuseBlown, setPsFuseBlown] = useState<boolean>(false);

  // 2. TRIAC Phase Simulation State
  const [triacFiringAngle, setTriacFiringAngle] = useState<number>(60); // 0 to 180 degrees

  // 3. Op-Amp INA Simulation State
  const [inaDiffInputMv, setInaDiffInputMv] = useState<number>(50); // mV
  const [inaRgainKohm, setInaRgainKohm] = useState<number>(1.0); // kOhm
  const [inaCommonModeNoise, setInaCommonModeNoise] = useState<boolean>(false);

  // 4. 555 Timer PWM Simulation State
  const [timerDutyCycle, setTimerDutyCycle] = useState<number>(50); // 1% to 99%
  const [timerCapacitor, setTimerCapacitor] = useState<'10nF' | '100nF'>('10nF');

  // 5. Sensor Relay Simulation State
  const [sensorLightLux, setSensorLightLux] = useState<number>(150); // Lux
  const [sensorTempC, setSensorTempC] = useState<number>(28); // Celsius
  const [relayFlybackPresent, setRelayFlybackPresent] = useState<boolean>(true);

  // 6. H-Bridge DC Motor State
  const [hBridgeDirection, setHBridgeDirection] = useState<'CW' | 'CCW' | 'BRAKE' | 'COAST'>('CW');
  const [hBridgePwmDuty, setHBridgePwmDuty] = useState<number>(70); // %

  // 7. 3-DOF Robot Arm State
  const [armTheta1, setArmTheta1] = useState<number>(45); // Base deg
  const [armTheta2, setArmTheta2] = useState<number>(35); // Shoulder deg
  const [armTheta3, setArmTheta3] = useState<number>(-40); // Elbow deg
  const [armGripperClosed, setArmGripperClosed] = useState<boolean>(false);

  // 8. PID Control State
  const [pidKp, setPidKp] = useState<number>(3.5);
  const [pidKi, setPidKi] = useState<number>(1.8);
  const [pidKd, setPidKd] = useState<number>(1.2);
  const [pidSetpoint, setPidSetpoint] = useState<number>(1.0);
  const [pidDisturbance, setPidDisturbance] = useState<boolean>(false);

  // 9. BCD Counter State
  const [bcdCount, setBcdCount] = useState<number>(4);
  const [bcdAutoClock, setBcdAutoClock] = useState<boolean>(false);

  // 10. Arduino Radar State
  const [radarAngle, setRadarAngle] = useState<number>(65); // deg
  const [radarObstacleDist, setRadarObstacleDist] = useState<number>(24); // cm
  const [radarScanning, setRadarScanning] = useState<boolean>(true);

  // 11. Stepper Motor State
  const [stepperMode, setStepperMode] = useState<'full' | 'half' | 'micro16'>('micro16');
  const [stepperAngle, setStepperAngle] = useState<number>(128.5); // deg
  const [stepperDirection, setStepperDirection] = useState<'CW' | 'CCW'>('CW');

  // 12. Ball and Beam State
  const [ballPos, setBallPos] = useState<number>(0.0); // -15cm to +15cm
  const [beamTiltAngle, setBeamTiltAngle] = useState<number>(1.2); // deg
  const [ballBalancingActive, setBallBalancingActive] = useState<boolean>(true);

  // Canvas Refs for Real-Time Waveforms & Physical Visualizers
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Automated clock ticking for BCD Counter
  useEffect(() => {
    if (!bcdAutoClock || currentProject.simulationType !== 'bcd_counter') return;
    const timer = setInterval(() => {
      setBcdCount((prev) => (prev + 1) % 10);
    }, 800);
    return () => clearInterval(timer);
  }, [bcdAutoClock, currentProject.simulationType]);

  // Automated sweeping for Arduino Radar
  useEffect(() => {
    if (!radarScanning || currentProject.simulationType !== 'arduino_radar') return;
    let dir = 1;
    const timer = setInterval(() => {
      setRadarAngle((prev) => {
        if (prev >= 175) dir = -1;
        if (prev <= 5) dir = 1;
        return prev + dir * 3;
      });
    }, 70);
    return () => clearInterval(timer);
  }, [radarScanning, currentProject.simulationType]);

  // Automated ball balancing physics for Ball and Beam
  useEffect(() => {
    if (!ballBalancingActive || currentProject.simulationType !== 'ball_and_beam') return;
    let pos = ballPos;
    let vel = 0;
    const interval = setInterval(() => {
      // PD controller tilt: alpha = -Kp*x - Kd*vel
      const targetPos = 0; // Center 0cm
      const error = pos - targetPos;
      const tilt = Math.max(-12, Math.min(12, -0.9 * error - 1.2 * vel));
      setBeamTiltAngle(tilt);

      // Physics: acceleration a = -(5/7) * g * sin(tilt in rad)
      const g = 980; // cm/s^2
      const accel = -(5 / 7) * g * Math.sin((tilt * Math.PI) / 180);
      vel = (vel + accel * 0.05) * 0.96; // air friction damping
      pos = Math.max(-18, Math.min(18, pos + vel * 0.05));
      setBallPos(parseFloat(pos.toFixed(2)));
    }, 50);

    return () => clearInterval(interval);
  }, [ballBalancingActive, currentProject.simulationType]);

  // Draw Real Oscilloscope Waveforms based on Active Project Simulation
  useEffect(() => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderScope = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      // Dark CRT background with green grid
      ctx.fillStyle = '#050c14';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#0e3328';
      ctx.lineWidth = 1;
      const divX = w / 10;
      const divY = h / 8;
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * divX, 0);
        ctx.lineTo(i * divX, h);
        ctx.stroke();
      }
      for (let j = 0; j <= 8; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * divY);
        ctx.lineTo(w, j * divY);
        ctx.stroke();
      }

      // Draw Center Crosshair
      ctx.strokeStyle = '#185942';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();

      const midY = h / 2;

      // Render Project Specific Waveforms
      if (currentProject.simulationType === 'power_supply') {
        // Channel 1 (Yellow): Transformer AC Sine Wave
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const vAcPeak = psTransformerTap === '15V' ? 15 * 1.414 : psTransformerTap === '10V' ? 10 * 1.414 : 2 * 1.414;
        const scaleAc = (h / 4) / 25;
        for (let x = 0; x < w; x++) {
          const val = Math.sin((x / 25) + t) * vAcPeak;
          const y = midY - val * scaleAc;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Channel 2 (Cyan): Filtered / Regulated DC output
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (psFuseBlown || psShortCircuit) {
          // 0V Flatline
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
        } else if (psFilterCapOn) {
          // DC with slight ripple
          const dcVal = psVoltageKnob;
          for (let x = 0; x < w; x++) {
            const rip = Math.sin((x / 12) + t * 2) * 0.3;
            const y = midY - (dcVal + rip) * scaleAc;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else {
          // Full-wave rectified pulsing DC without filter
          for (let x = 0; x < w; x++) {
            const raw = Math.abs(Math.sin((x / 25) + t)) * vAcPeak;
            const y = midY - raw * scaleAc;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else if (currentProject.simulationType === 'triac_phase') {
        // TRIAC Phase chopped waveform
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const alphaRad = (triacFiringAngle * Math.PI) / 180;
        for (let x = 0; x < w; x++) {
          const phase = ((x / 30) + t) % (Math.PI);
          const rawSin = Math.sin((x / 30) + t);
          let val = 0;
          if (phase >= alphaRad) {
            val = rawSin;
          }
          const y = midY - val * 70;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (currentProject.simulationType === 'timer_pwm') {
        // 555 PWM Waveform (Green)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const period = 80;
        const highWidth = period * (timerDutyCycle / 100);
        for (let x = 0; x < w; x++) {
          const pos = (x + t * 40) % period;
          const y = pos < highWidth ? midY - 60 : midY + 40;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (currentProject.simulationType === 'pid_control') {
        // Rolling Step Response
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Target Setpoint dashed line
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#f59e0b';
        ctx.moveTo(0, midY - pidSetpoint * 60);
        ctx.lineTo(w, midY - pidSetpoint * 60);
        ctx.stroke();
        ctx.setLineDash([]);

        // System output curve
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const simT = x / 30;
          // Step response of 2nd order underdamped system
          const wn = 2.5 * Math.sqrt(pidKp);
          const zeta = 0.5 * (pidKd + 0.4);
          const wd = wn * Math.sqrt(Math.max(0.01, 1 - zeta * zeta));
          const yVal = pidSetpoint * (1 - Math.exp(-zeta * wn * simT) * Math.cos(wd * simT));
          const disturb = pidDisturbance && x > w / 2 ? Math.sin((x - w / 2) / 10) * 0.2 : 0;
          const y = midY - (yVal + disturb) * 60;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Default General Sine / Pulse Reference Waveform
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = midY - Math.sin((x / 20) + t) * 50;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderScope);
    };

    renderScope();
    return () => cancelAnimationFrame(animId);
  }, [
    currentProject.simulationType,
    psTransformerTap,
    psFilterCapOn,
    psVoltageKnob,
    psFuseBlown,
    psShortCircuit,
    triacFiringAngle,
    timerDutyCycle,
    pidSetpoint,
    pidKp,
    pidKd,
    pidDisturbance
  ]);

  // Step Execution & Practical Data Logging
  const handleExecuteStep = () => {
    labAudio.playRelayClick();
    const currentStep = currentProject.steps[activeStepIdx];

    // Compute measured reading based on simulation physics
    let meas = currentStep.expectedMeasurement;
    let theo = currentStep.expectedMeasurement;
    let errorPct = '0.4%';

    if (currentProject.simulationType === 'power_supply') {
      if (activeStepIdx === 0) {
        meas = psTransformerTap === '15V' ? '15.22 V RMS' : psTransformerTap === '10V' ? '10.14 V RMS' : '2.03 V RMS';
        theo = psTransformerTap === '15V' ? '15.00 V RMS' : psTransformerTap === '10V' ? '10.00 V RMS' : '2.00 V RMS';
        errorPct = '1.4%';
      } else if (activeStepIdx === 4) {
        meas = `${psVoltageKnob.toFixed(2)} V DC`;
        theo = `${psVoltageKnob.toFixed(2)} V DC`;
        errorPct = '0.3%';
      }
    } else if (currentProject.simulationType === 'triac_phase') {
      const alphaRad = (triacFiringAngle * Math.PI) / 180;
      const vRms = 220 * Math.sqrt((1 / Math.PI) * (Math.PI - alphaRad + Math.sin(2 * alphaRad) / 2));
      meas = `${vRms.toFixed(1)} V RMS (α = ${triacFiringAngle}°)`;
      theo = `${(vRms * 1.01).toFixed(1)} V RMS`;
      errorPct = '1.0%';
    } else if (currentProject.simulationType === 'timer_pwm') {
      meas = `Duty: ${timerDutyCycle}%, Freq: 1.44 kHz`;
      theo = `Duty: ${timerDutyCycle}%, Freq: 1.44 kHz`;
      errorPct = '0.2%';
    }

    // Add to logged table
    setLoggedReadings((prev) => [
      {
        step: `الخطوة ${activeStepIdx + 1}: ${currentStep.title}`,
        reading: meas,
        theoretical: theo,
        error: errorPct,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev
    ]);

    // Move to next step if available
    if (activeStepIdx < currentProject.steps.length - 1) {
      setActiveStepIdx((prev) => prev + 1);
    }
  };

  const handleResetLab = () => {
    labAudio.playClick();
    setActiveStepIdx(0);
    setActiveFault(null);
    setPsFuseBlown(false);
    setPsShortCircuit(false);
    setLoggedReadings([]);
  };

  const handleApplyFault = (faultId: string) => {
    labAudio.playFuseBlow();
    setActiveFault(faultId);
    if (faultId === 'fuse_blow') {
      setPsFuseBlown(true);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Academic Mechatronics Lab Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-sky-500/25">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                المشاريع الهندسية الجامعية التطبيقية (University Engineering Projects)
              </h1>
              <p className="text-xs text-sky-400 font-mono">
                12 Accredited Mechatronics Lab Projects: Real Physics Solvers, Schematics, Instruments & Official Lab Reports
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Links */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenTrainingBoard && (
            <button
              onClick={onOpenTrainingBoard}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>لوحة مزود الطاقة المخبري</span>
            </button>
          )}

          {onOpenElectronicsBox && (
            <button
              onClick={onOpenElectronicsBox}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>صندوق توصيل الإلكترونيات</span>
            </button>
          )}

          <button
            onClick={() => setReportModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>استخراج تقرير التجربة الرسمي</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Projects Sidebar (Left 4 cols) & Live Interactive Workbench (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Projects Browser with Search */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في مشاريع الميكاترونكس..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  labAudio.playClick();
                  setSelectedProjectId(p.id);
                  setActiveStepIdx(0);
                  setActiveFault(null);
                  setLoggedReadings([]);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-2 ${
                  selectedProjectId === p.id
                    ? 'bg-sky-950/70 border-sky-400 shadow-xl shadow-sky-500/15 scale-[1.01]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-sky-300 border border-slate-800">
                    {p.course}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.year}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  مشروع {p.number}: {p.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {p.objective}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area: Interactive Real-Time Project Workbench */}
        <div className="lg:col-span-8 space-y-6">
          {/* Project Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                  #{currentProject.number}
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">{currentProject.title}</h2>
                  <span className="text-xs text-slate-400 font-mono">{currentProject.course}</span>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-full">
                اللوحة: {currentProject.boardType}
              </span>
            </div>

            {/* Scientific Formula & Theory Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الأساس العلمي والنظري:</span>
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">{currentProject.theory}</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>المعادلات الحاكمة والحسابات:</span>
                </span>
                <div className="p-2 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[11px] text-center border border-slate-800">
                  {currentProject.formula}
                </div>
              </div>
            </div>

            {/* LIVE INTERACTIVE APPARATUS & EXPERIMENT WORKBENCH */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">طاولة العمل والتشغيل المخبري المباشر (Interactive Bench)</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetLab}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                    title="إعادة تعيين المحاكاة"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">إعادة ضبط</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Live Interactive Module for Selected Project */}
              {/* 1. Power Supply Studio */}
              {currentProject.simulationType === 'power_supply' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                      <label className="text-xs text-slate-400 block font-bold">مخرج المحول المتناوب AC Tap:</label>
                      <div className="flex gap-1.5">
                        {(['2V', '10V', '15V'] as const).map((tap) => (
                          <button
                            key={tap}
                            onClick={() => { labAudio.playClick(); setPsTransformerTap(tap); }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              psTransformerTap === tap ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {tap}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">مقاومة LM317:</span>
                        <span className="text-sky-400 font-mono">{psVoltageKnob.toFixed(2)} V</span>
                      </div>
                      <input
                        type="range"
                        min="3.0"
                        max="20.0"
                        step="0.1"
                        value={psVoltageKnob}
                        onChange={(e) => setPsVoltageKnob(parseFloat(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <span className="text-xs text-slate-400 font-bold">مكثف الترشيح 1000µF:</span>
                      <button
                        onClick={() => { labAudio.playSwitch(); setPsFilterCapOn(!psFilterCapOn); }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          psFilterCapOn ? 'bg-emerald-600 text-white' : 'bg-rose-900/60 text-rose-300'
                        }`}
                      >
                        {psFilterCapOn ? 'مكثف التنعيم متصل (Ripple < 0.4V)' : 'مكثف التنعيم مفصول (Pulsed)'}
                      </button>
                    </div>
                  </div>

                  {/* Fuses and Short-Circuit Test */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">حالة الفيوز F3 (0.3A Fast):</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${psFuseBlown ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                        {psFuseBlown ? 'احترق الفيوز (BLOWN)' : 'سليم وموصل (OK)'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          labAudio.playFuseBlow();
                          setPsShortCircuit(true);
                          setPsFuseBlown(true);
                        }}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        إحداث قصر كهربائي (Short Circuit Test)
                      </button>
                      {psFuseBlown && (
                        <button
                          onClick={() => {
                            labAudio.playRelayClick();
                            setPsFuseBlown(false);
                            setPsShortCircuit(false);
                          }}
                          className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
                        >
                          استبدال الفيوز بجديد
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TRIAC Phase Studio */}
              {currentProject.simulationType === 'triac_phase' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">زاوية القدح Firing Angle (α):</span>
                      <span className="text-amber-400 font-mono text-sm">{triacFiringAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="170"
                      value={triacFiringAngle}
                      onChange={(e) => setTriacFiringAngle(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0° (أقصى قدرة 100%)</span>
                      <span>90° (نصف قدرة 50%)</span>
                      <span>180° (إطفاء 0%)</span>
                    </div>
                  </div>

                  {/* Visual Load: Glowing 220V Bulb and AC Motor */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-around">
                    <div className="text-center space-y-1">
                      <div
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border transition-all duration-300"
                        style={{
                          backgroundColor: `rgba(245, 158, 11, ${(180 - triacFiringAngle) / 180})`,
                          boxShadow: `0 0 ${Math.max(5, (180 - triacFiringAngle) * 0.4)}px rgba(245, 158, 11, 0.8)`,
                          borderColor: '#f59e0b'
                        }}
                      >
                        <Zap className="w-8 h-8 text-white drop-shadow" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-bold block">مصباح 220V AC</span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {Math.round(((180 - triacFiringAngle) / 180) * 100)}% إضاءة
                      </span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-sky-400 animate-spin" style={{ animationDuration: `${Math.max(0.2, (triacFiringAngle / 40))}s` }} />
                      </div>
                      <span className="text-[11px] text-slate-300 font-bold block">محرك تحريضي</span>
                      <span className="text-[10px] text-sky-300 font-mono">
                        {Math.round(1450 * ((180 - triacFiringAngle) / 180))} RPM
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 555 Timer PWM Studio */}
              {currentProject.simulationType === 'timer_pwm' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">نسبة التشغيل Duty Cycle:</span>
                      <span className="text-emerald-400 font-mono text-sm">{timerDutyCycle}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={timerDutyCycle}
                      onChange={(e) => setTimerDutyCycle(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center font-mono text-slate-300">
                        t_high: {(0.693 * (timerDutyCycle / 100) * 10).toFixed(2)} µs
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center font-mono text-slate-300">
                        t_low: {(0.693 * ((100 - timerDutyCycle) / 100) * 10).toFixed(2)} µs
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-around">
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-emerald-400 animate-pulse" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-bold block">متحكم MOSFET</span>
                      <span className="text-[10px] text-emerald-400 font-mono">1.44 kHz Switching</span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                        <Gauge className="w-8 h-8 text-sky-400" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-bold block">سرعة محرك DC</span>
                      <span className="text-[10px] text-sky-400 font-mono">{Math.round((timerDutyCycle / 100) * 3000)} RPM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Closed-Loop PID Control Studio */}
              {currentProject.simulationType === 'pid_control' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-sky-300">Kp (تناسبي):</span>
                        <span className="font-mono text-white">{pidKp.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={pidKp}
                        onChange={(e) => setPidKp(parseFloat(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-emerald-300">Ki (تكاملي):</span>
                        <span className="font-mono text-white">{pidKi.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={pidKi}
                        onChange={(e) => setPidKi(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-amber-300">Kd (تفاضلي):</span>
                        <span className="font-mono text-white">{pidKd.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={pidKd}
                        onChange={(e) => setPidKd(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-center">
                      <button
                        onClick={() => {
                          labAudio.playClick();
                          setPidDisturbance(!pidDisturbance);
                        }}
                        className={`w-full py-2 rounded-lg font-bold transition-all cursor-pointer ${
                          pidDisturbance ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {pidDisturbance ? 'إيقاف التشويش' : 'حقن تشويش مفاجئ (Disturbance)'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">زمن الصعود (tr)</span>
                      <span className="font-mono text-sky-400 font-bold">{(1.8 / Math.sqrt(pidKp || 1)).toFixed(2)} s</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">نسبة التجاوز (Mp%)</span>
                      <span className="font-mono text-amber-400 font-bold">{Math.max(0, Math.round((pidKp * 8) - (pidKd * 12)))}%</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">زمن الاستقرار (ts)</span>
                      <span className="font-mono text-emerald-400 font-bold">{(4.0 / (pidKd + 0.5)).toFixed(2)} s</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">خطأ الاستقرار (ess)</span>
                      <span className="font-mono text-purple-400 font-bold">{pidKi > 0.2 ? '0.00% (صفري)' : '24.5% (عائم)'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. 3-DOF Robot Arm Studio */}
              {currentProject.simulationType === 'robotics_arm' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-300">القاعدة Base (θ1):</span>
                      <span className="font-mono text-sky-400">{armTheta1}°</span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={armTheta1}
                      onChange={(e) => setArmTheta1(parseInt(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-300">الكتف Shoulder (θ2):</span>
                      <span className="font-mono text-emerald-400">{armTheta2}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      value={armTheta2}
                      onChange={(e) => setArmTheta2(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-300">الكوع Elbow (θ3):</span>
                      <span className="font-mono text-purple-400">{armTheta3}°</span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="45"
                      value={armTheta3}
                      onChange={(e) => setArmTheta3(parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* 6. Arduino Radar Scanner Studio */}
              {currentProject.simulationType === 'arduino_radar' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">زاوية مسح السيرفو الحالية:</span>
                      <span className="text-emerald-400 font-mono text-sm">{radarAngle}°</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">مسافة العائق المرصود:</span>
                      <span className="text-sky-400 font-mono text-sm">{radarObstacleDist} cm</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="80"
                      value={radarObstacleDist}
                      onChange={(e) => setRadarObstacleDist(parseInt(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => { labAudio.playClick(); setRadarScanning(!radarScanning); }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          radarScanning ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {radarScanning ? 'المسح التلقائي قيد العمل' : 'استئناف مسح الرادار'}
                      </button>
                    </div>
                  </div>

                  {/* Polar Radar Visualizer Display */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-950 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="w-36 h-36 rounded-full border-2 border-emerald-500/40 relative flex items-center justify-center">
                      {/* Grid concentric rings */}
                      <div className="w-24 h-24 rounded-full border border-emerald-500/30 absolute" />
                      <div className="w-12 h-12 rounded-full border border-emerald-500/20 absolute" />
                      {/* Crosshairs */}
                      <div className="w-full h-px bg-emerald-500/30 absolute" />
                      <div className="h-full w-px bg-emerald-500/30 absolute" />
                      {/* Sweeping Beam */}
                      <div
                        className="w-18 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent absolute origin-left"
                        style={{
                          left: '50%',
                          transform: `rotate(${-radarAngle}deg)`
                        }}
                      />
                      {/* Target Blip */}
                      <div
                        className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/80 absolute animate-ping"
                        style={{
                          left: `${50 + (radarObstacleDist / 80) * 40 * Math.cos((-radarAngle * Math.PI) / 180)}%`,
                          top: `${50 + (radarObstacleDist / 80) * 40 * Math.sin((-radarAngle * Math.PI) / 180)}%`
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
                      Target Polar: (r = {radarObstacleDist}cm, θ = {radarAngle}°)
                    </span>
                  </div>
                </div>
              )}

              {/* 7. Ball and Beam Balance Studio */}
              {currentProject.simulationType === 'ball_and_beam' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">موضع الكرة لحظياً على العارضة:</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">{ballPos.toFixed(1)} cm</span>
                    </div>

                    {/* Visual Beam with Ball */}
                    <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                      {/* Tilting Beam */}
                      <div
                        className="w-72 h-3 bg-gradient-to-r from-slate-400 to-slate-200 rounded-full relative transition-transform duration-75 flex items-center shadow-lg"
                        style={{
                          transform: `rotate(${beamTiltAngle}deg)`
                        }}
                      >
                        {/* Rolling Steel Ball */}
                        <div
                          className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 via-slate-100 to-white border border-slate-300 absolute -top-4 shadow-xl transition-all duration-75"
                          style={{
                            left: `${50 + (ballPos / 18) * 45}%`,
                            transform: 'translateX(-50%)'
                          }}
                        />
                        {/* Center Target Mark */}
                        <div className="w-1 h-5 bg-emerald-500 absolute left-1/2 -top-1 -translate-x-1/2" />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>زاوية ميل السيرفو: {beamTiltAngle.toFixed(2)}°</span>
                      <button
                        onClick={() => {
                          labAudio.playClick();
                          setBallPos((prev) => (prev > 0 ? -12 : 12));
                        }}
                        className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
                      >
                        دفع الكرة يدوياً لاختبار التوازن
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Oscilloscope Screen */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>راسم الإشارة المخبري الرقمي (Digital Storage Oscilloscope):</span>
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-yellow-400">CH1: 5V/Div</span>
                    <span className="text-sky-400">CH2: 2V/Div</span>
                    <span className="text-emerald-400">Time: 1ms/Div</span>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                  <canvas
                    ref={scopeCanvasRef}
                    width={720}
                    height={200}
                    className="w-full h-48 block bg-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* STEP-BY-STEP GUIDED LAB PROCEDURE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>خطوات التوصيل والتنفيذ المخبري المعتمدة (Step-by-Step Procedure):</span>
                </h3>
                <span className="text-xs text-sky-400 font-mono">
                  خطوة {activeStepIdx + 1} من {currentProject.steps.length}
                </span>
              </div>

              <div className="space-y-2">
                {currentProject.steps.map((st, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      labAudio.playClick();
                      setActiveStepIdx(idx);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                      activeStepIdx === idx
                        ? 'bg-sky-950/80 border-sky-400 text-white shadow-lg shadow-sky-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded-full font-bold font-mono text-[11px] flex items-center justify-center shrink-0 ${
                          activeStepIdx === idx ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-xs">{st.title}</h5>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{st.description}</p>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full block">
                          القراءة المتوقعة: {st.expectedMeasurement}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button: Execute & Log Reading */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleExecuteStep}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>تنفيذ الخطوة الحالية وتدوين القراءة في جدول النتائج</span>
                </button>

                <span className="text-xs text-slate-400">
                  انقر لتطبيق التوصيل وتسجيل قياس جهاز الملتيميتر وراسم الإشارة تلقائياً
                </span>
              </div>
            </div>

            {/* EXPERIMENTAL DATA LOG TABLE */}
            {loggedReadings.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>جدول القراءات والنتائج المخبرية المقاسة (Laboratory Data Log):</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{loggedReadings.length} قراءات مسجلة</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-bold">الخطوة والتوصيلة</th>
                        <th className="pb-2 font-bold font-mono">القراءة المقاسة</th>
                        <th className="pb-2 font-bold font-mono">القيمة النظرية</th>
                        <th className="pb-2 font-bold font-mono">نسبة الخطأ %</th>
                        <th className="pb-2 font-bold">وقت القياس</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {loggedReadings.map((r, i) => (
                        <tr key={i} className="text-slate-300 hover:bg-slate-900/50">
                          <td className="py-2 pr-1 font-sans text-white">{r.step}</td>
                          <td className="py-2 text-emerald-400">{r.reading}</td>
                          <td className="py-2 text-slate-400">{r.theoretical}</td>
                          <td className="py-2 text-sky-400">{r.error}</td>
                          <td className="py-2 text-slate-500 text-[10px]">{r.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FAULT INJECTION & TROUBLESHOOTING SECTION */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" />
                  <span>محاكاة وتشخيص الأعطال الهندسية (Troubleshooting & Fault Injection):</span>
                </h4>
                <span className="text-[11px] text-slate-400">اختر عطلاً لمشاهدة تأثيره على الدائرة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentProject.faults.map((flt) => (
                  <div
                    key={flt.id}
                    onClick={() => handleApplyFault(flt.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      activeFault === flt.id
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{flt.name}</span>
                      <AlertTriangle className={`w-3.5 h-3.5 ${activeFault === flt.id ? 'text-rose-400' : 'text-slate-500'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-1">{flt.description}</p>
                    {activeFault === flt.id && (
                      <div className="mt-2 pt-2 border-t border-rose-800/60 text-[10px] space-y-1">
                        <span className="block text-rose-300 font-bold">العَرَض في أجهزة القياس: {flt.symptom}</span>
                        <span className="block text-emerald-400 font-bold">طريقة الإصلاح الهندسية: {flt.solution}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL UNIVERSITY LAB REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            {/* Header / Report Print Styling */}
            <div className="border-b-2 border-slate-700 pb-4 text-center space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>كلية الهندسة — قسم هندسة الميكاترونكس</span>
                <span>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</span>
              </div>
              <h2 className="text-xl font-black text-white">تقرير التجربة المخبرية الأكاديمي (Official Lab Report)</h2>
              <h3 className="text-sm font-bold text-sky-400">{currentProject.title}</h3>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">اسم الطالب:</span>
                <span className="font-bold text-white">{user?.fullName || 'طالب ميكاترونكس'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الجامعة:</span>
                <span className="font-bold text-white">{user?.university || 'كلية الهندسة'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المستوى الأكاديمي:</span>
                <span className="font-bold text-white">{user?.studyLevel || 'السنة الثالثة'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المساق الدراسي:</span>
                <span className="font-bold text-white">{currentProject.course}</span>
              </div>
            </div>

            {/* Objective & Theory */}
            <div className="space-y-2 text-xs text-slate-300">
              <h4 className="font-bold text-white">1. الهدف التعليمي من التجربة:</h4>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">{currentProject.objective}</p>

              <h4 className="font-bold text-white pt-2">2. القوانين والمعادلات الحاكمة:</h4>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-emerald-300 text-center">
                {currentProject.formula}
              </div>
            </div>

            {/* Table of Readings */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white">3. جدول النتائج والقياسات المخبرية المقارنة:</h4>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-1">البيان</th>
                      <th className="pb-1 font-mono">القيمة المقاسة عملياً</th>
                      <th className="pb-1 font-mono">القيمة المحسوبة نظرياً</th>
                      <th className="pb-1 font-mono">نسبة الخطأ %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {loggedReadings.length > 0 ? (
                      loggedReadings.map((r, i) => (
                        <tr key={i}>
                          <td className="py-1.5 font-sans">{r.step}</td>
                          <td className="py-1.5 text-emerald-400">{r.reading}</td>
                          <td className="py-1.5 text-slate-400">{r.theoretical}</td>
                          <td className="py-1.5 text-sky-400">{r.error}</td>
                        </tr>
                      ))
                    ) : (
                      currentProject.steps.map((st, i) => (
                        <tr key={i}>
                          <td className="py-1.5 font-sans">{st.title}</td>
                          <td className="py-1.5 text-emerald-400">{st.expectedMeasurement}</td>
                          <td className="py-1.5 text-slate-400">{st.expectedMeasurement}</td>
                          <td className="py-1.5 text-sky-400">0.5%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Conclusions */}
            <div className="space-y-1 text-xs text-slate-300">
              <h4 className="font-bold text-white">4. الاستنتاج والمناقشة الهندسية:</h4>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                تطابقت النتائج العملية المقاسة بواسطة أجهزة القياس الرقمية وراسم الإشارة مع المعادلات الفيزيائية النظرية بنسبة خطأ ضئيلة تعود إلى هبوط الجهد على أشباه الموصلات (0.7V للدايود) ومقاومة التوصيل الداخلية للمكونات. تم التحقق من استقرار النظام وتطبيق إجراءات الحماية ضد الأعطال بنجاح.
              </p>
            </div>

            {/* Signature Box */}
            <div className="flex justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
              <div>توقيع الطالب: _______________</div>
              <div>اعتماد مدرس المختبر: _______________</div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-600/25 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة أو حفظ كـ PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
