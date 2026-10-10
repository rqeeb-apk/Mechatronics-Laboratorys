import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  phone: string;
  passwordHash: string;
  fullName: string;
  university: string;
  studyLevel: string; // e.g. 'سنة أولى', 'سنة ثانية', 'سنة ثالثة', 'سنة رابعة', 'سنة خامسة / خريج'
  role: 'student' | 'owner';
  status: 'active' | 'expired' | 'suspended' | 'pending_activation';
  subscriptionType: 'مجاني' | 'فصلي' | 'سنوي' | 'VIP';
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  subscriptionType: 'فصلي' | 'سنوي' | 'VIP';
  durationDays: number;
  status: 'active' | 'used' | 'revoked';
  createdAt: string;
  usedAt?: string;
  usedByStudentId?: string;
  usedByStudentPhone?: string;
  notes?: string;
}

export interface AppSetting {
  ownerLocalPhone: string;
  ownerCountryCode: string; // e.g. '+967' or '+966'
  ownerInternationalPhone: string; // computed or explicit e.g. '967785502919'
  allowSelfRegistration: boolean;
  freeTrialDays: number;
  aiPromptLimitDaily: number;
  aiSystemPromptExtra: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorPhone: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface EducationalResource {
  id: string;
  title: string;
  category: 'كتاب' | 'دليل عملي' | 'محاضرة' | 'ورقة بحثية';
  description: string;
  fileUrl: string;
  fileSize: string;
  pages?: number;
  createdAt: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  topic: string;
  url: string;
  duration: string;
  level: string;
  createdAt: string;
}

export interface EducationalLesson {
  id: string;
  title: string;
  subject: string;
  level: string;
  summary: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  author: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  activationCodes: ActivationCode[];
  settings: AppSetting;
  logs: AuditLog[];
  resources: EducationalResource[];
  videos: EducationalVideo[];
  lessons: EducationalLesson[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'lab_database.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_mecha_salt_2026').digest('hex');
}

function getDefaultDatabase(): DatabaseSchema {
  const now = new Date().toISOString();
  const ownerPass = hashPassword('Admin#1234');
  const studentPass = hashPassword('Student#1234');

  // Subscription dates
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);

  const studentEnd = new Date();
  studentEnd.setDate(studentEnd.getDate() + 90);

  return {
    users: [
      {
        id: 'user_owner_01',
        phone: '785502919',
        passwordHash: ownerPass,
        fullName: 'المهندس المشرف (مالك المختبر)',
        university: 'جامعة العلوم والتكنولوجيا والهندسة',
        studyLevel: 'أستاذ مهندس',
        role: 'owner',
        status: 'active',
        subscriptionType: 'VIP',
        subscriptionStartDate: now,
        subscriptionEndDate: futureDate.toISOString(),
        createdAt: now,
      },
      {
        id: 'user_student_sample',
        phone: '777000111',
        passwordHash: studentPass,
        fullName: 'عمر الميقاتي',
        university: 'جامعة الملك فهد / جامعة صنعاء',
        studyLevel: 'سنة ثالثة',
        role: 'student',
        status: 'active',
        subscriptionType: 'فصلي',
        subscriptionStartDate: now,
        subscriptionEndDate: studentEnd.toISOString(),
        createdAt: now,
      }
    ],
    activationCodes: [
      {
        id: 'code_01',
        code: 'MECHA-90D-78550',
        subscriptionType: 'فصلي',
        durationDays: 90,
        status: 'active',
        createdAt: now,
        notes: 'كود فصلي تجريبي صالح لمدة 3 أشهر',
      },
      {
        id: 'code_02',
        code: 'MECHA-365-VIP01',
        subscriptionType: 'VIP',
        durationDays: 365,
        status: 'active',
        createdAt: now,
        notes: 'كود اشتراك سنوي شامل VIP',
      },
      {
        id: 'code_03',
        code: 'MECHA-SEM-2026',
        subscriptionType: 'فصلي',
        durationDays: 120,
        status: 'active',
        createdAt: now,
        notes: 'كود فصل دراسي كامل',
      }
    ],
    settings: {
      ownerLocalPhone: '785502919',
      ownerCountryCode: '+967', // Yemen default for 78xxxxxxx, easily changeable to +966, +20, etc.
      ownerInternationalPhone: '967785502919',
      allowSelfRegistration: true,
      freeTrialDays: 0,
      aiPromptLimitDaily: 50,
      aiSystemPromptExtra: 'أنت مهندس ميكاترونكس خبير ومرشد أكاديمي متميز في مختبر الميكاترونكس الافتراضي.',
    },
    logs: [
      {
        id: 'log_init',
        timestamp: now,
        actorPhone: 'SYSTEM',
        actorRole: 'system',
        action: 'تهيئة النظام',
        details: 'تم إنشاء قاعدة بيانات مختبر الميكاترونكس الافتراضي وتجهيز الحسابات الافتراضية بنجاح.',
      }
    ],
    resources: [
      {
        id: 'res_01',
        title: 'المرجع الشامل في الدوائر الكهربائية والإلكترونية (Hayt & Boylestad)',
        category: 'كتاب',
        description: 'تحليل دوائر التيار المستمر والمتردد وقوانين كيرشوف ومضخمات العمليات.',
        fileUrl: 'https://example.com/books/electric-circuits-mechatronics.pdf',
        fileSize: '14.2 MB',
        pages: 620,
        createdAt: now,
      },
      {
        id: 'res_02',
        title: 'دليل برمجة وتطبيقات الأردوينو في الروبوتات الصناعية',
        category: 'دليل عملي',
        description: 'شرح الحساسات والمحركات وواجهات الاتصال التسلسلي مع أمثلة كود جاهزة.',
        fileUrl: 'https://example.com/guides/arduino-robotics-handbook.pdf',
        fileSize: '8.5 MB',
        pages: 240,
        createdAt: now,
      },
      {
        id: 'res_03',
        title: 'مقدمة في نظرية التحكم الآلي وتصميم متحكمات PID',
        category: 'محاضرة',
        description: 'دراسة استجابة الأنظمة من الدرجة الأولى والثانية وطرق ضبط معاملات Ziegler-Nichols.',
        fileUrl: 'https://example.com/lectures/control-systems-pid.pdf',
        fileSize: '5.1 MB',
        pages: 115,
        createdAt: now,
      }
    ],
    videos: [
      {
        id: 'vid_01',
        title: 'شرح قوانين كيرشوف وتحليل العقد والحلقات عمليًا',
        topic: 'دوائر كهربائية',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '28:15',
        level: 'مستوى أساسي',
        createdAt: now,
      },
      {
        id: 'vid_02',
        title: 'بناء وبرمجة ذراع روبوتية ثلاثية المحاور بواسطة Arduino',
        topic: 'روبوتات ومحركات',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '42:00',
        level: 'مستوى متوسط',
        createdAt: now,
      },
      {
        id: 'vid_03',
        title: 'طريقة ضبط معاملات متحكم PID للمحركات خطوة بخطوة',
        topic: 'أنظمة التحكم',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '35:40',
        level: 'مستوى متقدم',
        createdAt: now,
      }
    ],
    lessons: [
      {
        id: 'les_01',
        title: 'الدرس 1: تحليل الدوائر الكهربائية وقانون أوم وتوصيل المقاومات',
        subject: 'دوائر كهربائية',
        level: 'مبتدئ',
        summary: 'شرح مفهوم فرق الجهد والتيار والمقاومة وتطبيقات قانون أوم وكيرشوف في الدوائر المتسلسلة والمتوازية.',
        content: 'في هذا الدرس، يتعلم الطالب أساسيات الهندسة الكهربائية، حيث ينص قانون أوم على أن V = I × R. يتم تحليل دارات التوالي لحساب المقاومة المكافئة Req = R1 + R2، ودارات التوازي لحساب 1/Req = 1/R1 + 1/R2 مع قياس الجهد والتيار باستخدام الفولتميتر والأميتر المخبري.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: 'https://example.com/lessons/ohm-law-circuits.pdf',
        author: 'المهندس المشرف (مالك المختبر)',
        createdAt: now,
      },
      {
        id: 'les_02',
        title: 'الدرس 2: الترانزستور BJT واستخدامه كمفتاح إلكتروني وقيادة الأحمال',
        subject: 'إلكترونيات',
        level: 'متوسط',
        summary: 'دراسة مناطق عمل الترانزستور (القطع، التشبع، التكبير) وكيفية قيادة الريليهات ومحركات التيار المستمر.',
        content: 'الترانزستور NPN BC547 يعتبر حجر الأساس في التحكم في الأحمال الحثية. عند تطبيق تيار كافٍ على القاعدة Ib > Ic/hFE، يدخل الترانزستور في طور التشبع (Vce ≈ 0.2V) ليعمل كمفتاح مغلق، مع ضرورة وضع دايود حماية Flyback Diode بالتوازي مع الملف.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: 'https://example.com/lessons/transistor-switch-circuit.pdf',
        author: 'المهندس المشرف (مالك المختبر)',
        createdAt: now,
      },
      {
        id: 'les_03',
        title: 'الدرس 3: برمجة Arduino Uno وقراءة الحساسات والتحكم النبضي PWM',
        subject: 'أردوينو',
        level: 'متوسط',
        summary: 'التعامل مع المداخل والمخارج الرقمية والتناظرية، توليد إشارات PWM للتحكم في سرعة المحركات وإضاءة LED.',
        content: 'متحكم ATmega328P على لوحة Arduino Uno يوفر منافذ تناظرية (A0-A5) بدقة 10-bit لتحويل الجهد 0-5V إلى قيم رقمية 0-1023، ومنافذ PWM بتردد 490Hz للتحكم في عرض النبضة عبر دالة analogWrite(pin, val).',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: 'https://example.com/lessons/arduino-pwm-sensors.pdf',
        author: 'المهندس المشرف (مالك المختبر)',
        createdAt: now,
      },
      {
        id: 'les_04',
        title: 'الدرس 4: الكينماتيكا المباشرة للأذرع الروبوتية وحسابات العزم',
        subject: 'روبوتات',
        level: 'متقدم',
        summary: 'حساب موقع نهاية الذراع الروبوتية في الفضاء ثلاثي الأبعاد بالاعتماد على زوايا المفاصل وأطوال الوصلات.',
        content: 'معادلات Forward Kinematics تمكننا من تحديد موضع المستجيب النهائي (X, Y, Z) بدلالة زوايا المفاصل ثيتا 1 و 2 و 3 ومصفوفات التحويل المتجانسة Denavit-Hartenberg (D-H parameters). كما يتم حساب عزم المحركات اللازم لرفع الأحمال مع الأخذ بعين الاعتبار الجاذبية وعزم القصور الذاتي.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: 'https://example.com/lessons/robotics-kinematics.pdf',
        author: 'المهندس المشرف (مالك المختبر)',
        createdAt: now,
      },
      {
        id: 'les_05',
        title: 'الدرس 5: تصميم وضبط معاملات متحكم PID لأنظمة التحكم المغلقة',
        subject: 'أنظمة تحكم',
        level: 'متقدم',
        summary: 'تأثير كل من الحد التناسبي Kp والتكاملي Ki والاشتقاقي Kd على استجابة النظام وزمن الاستقرار والتجاوز.',
        content: 'يعد متحكم PID المعيار الصناعي الأول لأنظمة التغذية الراجعة. الحد التناسبي Kp يقلل زمن الصعود، والتكاملي Ki يلغي الخطأ في الحالة المستقرة (Steady-state error)، والاشتقاقي Kd يحسن التخميد ويقلل التجاوز الزائد (Overshoot). يتم الضبط العملي بطريقة Ziegler-Nichols.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: 'https://example.com/lessons/pid-controller-tuning.pdf',
        author: 'المهندس المشرف (مالك المختبر)',
        createdAt: now,
      }
    ]
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        // Ensure all required fields exist
        const defaultDb = getDefaultDatabase();
        return {
          ...defaultDb,
          ...parsed,
          settings: { ...defaultDb.settings, ...(parsed.settings || {}) },
          users: Array.isArray(parsed.users) ? parsed.users : defaultDb.users,
          activationCodes: Array.isArray(parsed.activationCodes) ? parsed.activationCodes : defaultDb.activationCodes,
          logs: Array.isArray(parsed.logs) ? parsed.logs : defaultDb.logs,
          resources: Array.isArray(parsed.resources) ? parsed.resources : defaultDb.resources,
          videos: Array.isArray(parsed.videos) ? parsed.videos : defaultDb.videos,
          lessons: Array.isArray(parsed.lessons) ? parsed.lessons : defaultDb.lessons,
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }
    const defaultData = getDefaultDatabase();
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByPhone(phone: string): User | undefined {
    const clean = phone.trim().replace(/\s+/g, '');
    return this.data.users.find(u => u.phone === clean);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Activation Codes
  getActivationCodes(): ActivationCode[] {
    return this.data.activationCodes;
  }

  getCodeByCodeString(codeStr: string): ActivationCode | undefined {
    const clean = codeStr.trim().toUpperCase();
    return this.data.activationCodes.find(c => c.code.toUpperCase() === clean);
  }

  createActivationCode(code: ActivationCode): ActivationCode {
    this.data.activationCodes.unshift(code);
    this.saveData();
    return code;
  }

  updateActivationCode(id: string, updates: Partial<ActivationCode>): ActivationCode | null {
    const idx = this.data.activationCodes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.activationCodes[idx] = { ...this.data.activationCodes[idx], ...updates };
    this.saveData();
    return this.data.activationCodes[idx];
  }

  // Settings
  getSettings(): AppSetting {
    return this.data.settings;
  }

  updateSettings(updates: Partial<AppSetting>): AppSetting {
    this.data.settings = { ...this.data.settings, ...updates };
    // Recompute international phone if country code or local phone changed
    if (updates.ownerCountryCode || updates.ownerLocalPhone) {
      const code = this.data.settings.ownerCountryCode.replace('+', '').trim();
      const local = this.data.settings.ownerLocalPhone.replace(/^0+/, '').replace(/\s+/g, '').trim();
      this.data.settings.ownerInternationalPhone = `${code}${local}`;
    }
    this.saveData();
    return this.data.settings;
  }

  // Logs
  getLogs(): AuditLog[] {
    return this.data.logs;
  }

  addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log
    };
    this.data.logs.unshift(newLog);
    // Keep last 300 logs
    if (this.data.logs.length > 300) {
      this.data.logs = this.data.logs.slice(0, 300);
    }
    this.saveData();
    return newLog;
  }

  // Resources
  getResources(): EducationalResource[] {
    return this.data.resources;
  }

  createResource(resource: EducationalResource): EducationalResource {
    this.data.resources.unshift(resource);
    this.saveData();
    return resource;
  }

  deleteResource(id: string): boolean {
    const initialLen = this.data.resources.length;
    this.data.resources = this.data.resources.filter(r => r.id !== id);
    if (this.data.resources.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Videos
  getVideos(): EducationalVideo[] {
    return this.data.videos;
  }

  createVideo(video: EducationalVideo): EducationalVideo {
    this.data.videos.unshift(video);
    this.saveData();
    return video;
  }

  deleteVideo(id: string): boolean {
    const initialLen = this.data.videos.length;
    this.data.videos = this.data.videos.filter(v => v.id !== id);
    if (this.data.videos.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Lessons
  getLessons(): EducationalLesson[] {
    return this.data.lessons || [];
  }

  getLessonById(id: string): EducationalLesson | undefined {
    return (this.data.lessons || []).find(l => l.id === id);
  }

  createLesson(lesson: EducationalLesson): EducationalLesson {
    if (!this.data.lessons) this.data.lessons = [];
    this.data.lessons.unshift(lesson);
    this.saveData();
    return lesson;
  }

  updateLesson(id: string, updates: Partial<EducationalLesson>): EducationalLesson | null {
    if (!this.data.lessons) this.data.lessons = [];
    const index = this.data.lessons.findIndex(l => l.id === id);
    if (index === -1) return null;
    this.data.lessons[index] = { ...this.data.lessons[index], ...updates };
    this.saveData();
    return this.data.lessons[index];
  }

  deleteLesson(id: string): boolean {
    if (!this.data.lessons) return false;
    const initialLen = this.data.lessons.length;
    this.data.lessons = this.data.lessons.filter(l => l.id !== id);
    if (this.data.lessons.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const db = new Database();
