import { GoogleGenAI } from "@google/genai";
import { db } from "./db.js";

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

const MECHATRONICS_SYSTEM_PROMPT = `
أنت المساعد الذكي لمختبر الميكاترونكس الافتراضي (Virtual Mechatronics Lab).
أنت أستاذ ومهندس ميكاترونكس خبير، تتحدث باللغة العربية العلمية السليمة، وتدمج المصطلحات الإنجليزية بين قوسين عند الحاجة (مثل: قانون أوم Ohm's Law، راسم الإشارة Oscilloscope، التضمين بعرض النبضة PWM، متحكم تناسبي تكاملي تفاضلي PID Controller، الكينماتيكا الأمامية Forward Kinematics).

مهامك ومجالات تخصصك:
1. الهندسة الكهربائية والإلكترونية: دوائر التيار المستمر والمتردد، الترانزستورات BJT وMOSFET، مضخمات العمليات Op-Amps، المؤقت 555، وفلاتر التنعيم ومقومات الدايود.
2. المنطق الرقمي: البوابات المنطقية، جداول الحقيقة، خرائط كارنوف K-Maps، المجمعات Adders، ومسجلات الإزاحة والعدادات.
3. الميكروكنترولر والأردوينو (Arduino): كتابة وشرح وتحليل وتصحيح كود C/C++، ربط الحساسات والمشغلات (Sensors & Actuators)، وتشخيص أخطاء التوصيل (Floating pins, Missing pull-ups/pull-downs, Current limiting resistors).
4. المحركات والروبوتات: محركات DC، وسيرفو Servo، وخطوي Stepper، وحسابات العزم والسرعة ونسب التروس، وتحليل ذراع الروبوت والتحويلات الهندسية.
5. أنظمة التحكم: الأنظمة ذات التغذية الراجعة، الاستجابة الزمنية والترددية، ومعايرة متحكمات PID.

تعليمات الأسلوب:
- قدّم إجابات منظمة، دقيقة علمياً، مع ذكر المعادلات الرياضية والخطوات بالتفصيل.
- لا تختلق معلومات أو مراجع غير موجودة. إذا كانت مسألة رياضية، قم بحسابها خطوة بخطوة مع توضيح الوحدات (V, A, Ω, W, N.m, rad/s, RPM).
- شجع الطالب وادعمه في استكشاف تجارب المختبر الافتراضي.
`;

export async function askMechatronicsAi(prompt: string, context?: string): Promise<string> {
  if (!ai || !apiKey) {
    return 'مرحبًا بك! لم يتم العثور على مفتاح GEMINI_API_KEY في خادم التطبيق. يرجى تزويد الخادم بمفتاح صالح عبر لوحة الإعدادات أو متغيرات البيئة للاستفادة الكاملة من المساعد الذكي.';
  }

  const settings = db.getSettings();
  const extraPrompt = settings.aiSystemPromptExtra || '';

  const fullSystemInstruction = `${MECHATRONICS_SYSTEM_PROMPT}\n${extraPrompt}\n${context ? `سياق التجربة الحالية: ${context}` : ''}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || 'عذرًا، لم يتم توليد أي إجابة. يرجى المحاولة مرة أخرى.';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return `حدث خطأ أثناء التواصل مع الذكاء الاصطناعي: ${error.message || 'خطأ غير معروف'}. يرجى المحاولة لاحقًا.`;
  }
}

export async function explainArduinoCode(code: string): Promise<string> {
  if (!ai || !apiKey) {
    return 'يتطلب تحليل الكود عبر الذكاء الاصطناعي توفير مفتاح GEMINI_API_KEY في الخادم.';
  }

  const prompt = `يرجى تحليل كود الأردوينو التالي شرحًا هندسيًا تعليميًا سطرًا بسطر باللغة العربية، وتوضيح كيفية عمله في الدائرة، وما إذا كان هناك أي أخطاء برمجية أو أخطاء توصيل محتملة:\n\n\`\`\`cpp\n${code}\n\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: MECHATRONICS_SYSTEM_PROMPT,
        temperature: 0.4,
      }
    });

    return response.text || 'لم يتم استلام تحليل للكود.';
  } catch (error: any) {
    console.error('Gemini Explain Code Error:', error);
    return `تعذر تحليل الكود: ${error.message}`;
  }
}
