import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db, hashPassword, User, ActivationCode } from './server/db.js';
import { askMechatronicsAi, explainArduinoCode } from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper: Owner auth check middleware
function requireOwner(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'غير مصرح: يلزم تسجيل الدخول كمالك للمختبر' });
    return;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const user = db.getUserById(token);
  if (!user || user.role !== 'owner') {
    res.status(403).json({ error: 'صلاحية مرفوضة: هذه العملية خاصة بمالك المختبر فقط' });
    return;
  }
  (req as any).user = user;
  next();
}

// Helper: Active subscription check middleware for students & services
function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'عذرًا، لا يمكن استخدام أي خدمة أو دخول أي مختبر إلا بعد تسجيل الحساب وإدخال كود التفعيل.' });
    return;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const user = db.getUserById(token);
  if (!user) {
    res.status(401).json({ error: 'جلسة المستخدم غير صالحة. يرجى تسجيل الدخول مجددًا.' });
    return;
  }
  if (user.role === 'owner') {
    (req as any).user = user;
    return next();
  }
  const now = new Date();
  const isExpired = user.subscriptionEndDate && new Date(user.subscriptionEndDate) <= now;
  if (user.status !== 'active' || isExpired) {
    res.status(403).json({ error: 'عذرًا، لا يمكن استخدام هذه الخدمة أو دخول المختبر إلا بعد تفعيل الحساب بكود اشتراك معتمد.' });
    return;
  }
  (req as any).user = user;
  next();
}

// ---------------- PUBLIC SETTINGS & STATS ----------------
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({
    ownerLocalPhone: settings.ownerLocalPhone,
    ownerCountryCode: settings.ownerCountryCode,
    ownerInternationalPhone: settings.ownerInternationalPhone,
    allowSelfRegistration: settings.allowSelfRegistration,
    freeTrialDays: settings.freeTrialDays,
  });
});

// ---------------- AUTHENTICATION ROUTES ----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { phone, password, activationCode } = req.body;
  if (!phone || !password) {
    res.status(400).json({ error: 'يرجى إدخال رقم الهاتف وكلمة المرور' });
    return;
  }

  const user = db.getUserByPhone(phone);
  if (!user) {
    res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    return;
  }

  const inputHash = hashPassword(password);
  if (user.passwordHash !== inputHash) {
    res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'تم إيقاف هذا الحساب. يرجى التواصل مع إدارة المختبر عبر واتساب.' });
    return;
  }

  // If user provided an activation code during login, attempt activation
  if (activationCode && activationCode.trim()) {
    const codeObj = db.getCodeByCodeString(activationCode.trim());
    if (codeObj && codeObj.status === 'active') {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + codeObj.durationDays);

      db.updateUser(user.id, {
        status: 'active',
        subscriptionType: codeObj.subscriptionType,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: end.toISOString(),
      });

      db.updateActivationCode(codeObj.id, {
        status: 'used',
        usedAt: now.toISOString(),
        usedByStudentId: user.id,
        usedByStudentPhone: user.phone,
      });

      db.addLog({
        actorPhone: user.phone,
        actorRole: user.role,
        action: 'تفعيل اشتراك أثناء الدخول',
        details: `قام الطالب بتفعيل كود ${codeObj.code} بنجاح نوع ${codeObj.subscriptionType}`,
      });
    }
  }

  // Check subscription expiration for students
  if (user.role === 'student' && user.subscriptionEndDate) {
    const now = new Date();
    const expiry = new Date(user.subscriptionEndDate);
    if (now > expiry && user.status === 'active') {
      db.updateUser(user.id, { status: 'expired' });
      user.status = 'expired';
    }
  }

  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  db.addLog({
    actorPhone: user.phone,
    actorRole: user.role,
    action: 'تسجيل دخول',
    details: `تسجيل دخول ناجح للمستخدم ${user.fullName}`,
  });

  const refreshedUser = db.getUserById(user.id);
  const { passwordHash: _, ...safeUser } = refreshedUser!;
  res.json({
    token: user.id, // For simplicity and security within preview environment
    user: safeUser,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const settings = db.getSettings();
  if (!settings.allowSelfRegistration) {
    res.status(403).json({ error: 'التسجيل الذاتي مغلق حاليًا من قِبل إدارة المختبر. تواصل عبر واتساب لطلب حساب.' });
    return;
  }

  const { phone, password, fullName, university, studyLevel, activationCode } = req.body;
  if (!phone || !password || !fullName || !university || !studyLevel) {
    res.status(400).json({ error: 'يرجى استكمال جميع بيانات التسجيل المطلوبة' });
    return;
  }

  const existing = db.getUserByPhone(phone);
  if (existing) {
    res.status(400).json({ error: 'رقم الهاتف مسجل بالفعل مسبقًا. يمكنك تسجيل الدخول مباشرة.' });
    return;
  }

  const now = new Date();
  let status: 'active' | 'pending_activation' = 'pending_activation';
  let subscriptionType: 'مجاني' | 'فصلي' | 'سنوي' | 'VIP' = 'مجاني';
  let subStart = now.toISOString();
  let subEnd = now.toISOString(); // Expired until code is provided!

  let usedCode: ActivationCode | null = null;
  if (activationCode && activationCode.trim()) {
    const codeObj = db.getCodeByCodeString(activationCode.trim());
    if (!codeObj || codeObj.status !== 'active') {
      res.status(400).json({ error: 'كود التفعيل المدخل غير صالح أو تم استخدامه مسبقًا.' });
      return;
    }
    usedCode = codeObj;
    status = 'active';
    subscriptionType = codeObj.subscriptionType;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + codeObj.durationDays);
    subEnd = endDate.toISOString();
  }
  // Note: Registration without activation code requires entering a code before accessing labs!

  const newUser: User = {
    id: 'student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    phone: phone.trim().replace(/\s+/g, ''),
    passwordHash: hashPassword(password),
    fullName: fullName.trim(),
    university: university.trim(),
    studyLevel: studyLevel.trim(),
    role: 'student',
    status,
    subscriptionType,
    subscriptionStartDate: subStart,
    subscriptionEndDate: subEnd,
    createdAt: now.toISOString(),
    lastLoginAt: now.toISOString(),
  };

  db.createUser(newUser);

  if (usedCode) {
    db.updateActivationCode(usedCode.id, {
      status: 'used',
      usedAt: now.toISOString(),
      usedByStudentId: newUser.id,
      usedByStudentPhone: newUser.phone,
    });
  }

  db.addLog({
    actorPhone: newUser.phone,
    actorRole: 'student',
    action: 'إنشاء حساب جديد',
    details: `قام الطالب ${newUser.fullName} بإنشاء حساب جديد (اشتراك: ${newUser.subscriptionType})`,
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.json({
    token: newUser.id,
    user: safeUser,
  });
});

app.post('/api/auth/activate', (req: Request, res: Response) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    res.status(400).json({ error: 'يرجى تحديد المستخدم وكود التفعيل' });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'المستخدم غير موجود' });
    return;
  }

  const codeObj = db.getCodeByCodeString(code.trim());
  if (!codeObj || codeObj.status !== 'active') {
    res.status(400).json({ error: 'كود التفعيل غير صالح، منتهي، أو تم استخدامه بالفعل.' });
    return;
  }

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + codeObj.durationDays);

  const updatedUser = db.updateUser(user.id, {
    status: 'active',
    subscriptionType: codeObj.subscriptionType,
    subscriptionStartDate: now.toISOString(),
    subscriptionEndDate: end.toISOString(),
  });

  db.updateActivationCode(codeObj.id, {
    status: 'used',
    usedAt: now.toISOString(),
    usedByStudentId: user.id,
    usedByStudentPhone: user.phone,
  });

  db.addLog({
    actorPhone: user.phone,
    actorRole: user.role,
    action: 'تفعيل كود اشتراك',
    details: `تم تفعيل الكود ${codeObj.code} بنجاح وتمديد الاشتراك حتى ${end.toISOString().split('T')[0]}`,
  });

  const { passwordHash: _, ...safeUser } = updatedUser!;
  res.json({
    success: true,
    message: 'تم تفعيل الاشتراك بنجاح!',
    user: safeUser,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'غير مسجل الدخول' });
    return;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const user = db.getUserById(token);
  if (!user) {
    res.status(401).json({ error: 'جلسة المستخدم منتهية' });
    return;
  }

  // Auto-check expiry
  if (user.role === 'student' && user.subscriptionEndDate) {
    const now = new Date();
    const expiry = new Date(user.subscriptionEndDate);
    if (now > expiry && user.status === 'active') {
      db.updateUser(user.id, { status: 'expired' });
      user.status = 'expired';
    }
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ---------------- OWNER DASHBOARD ROUTES ----------------
app.get('/api/owner/stats', requireOwner, (req: Request, res: Response) => {
  const users = db.getUsers().filter(u => u.role === 'student');
  const codes = db.getActivationCodes();
  const activeSubs = users.filter(u => u.status === 'active').length;
  const expiredSubs = users.filter(u => u.status === 'expired').length;
  const pendingSubs = users.filter(u => u.status === 'pending_activation').length;

  res.json({
    totalStudents: users.length,
    activeSubscriptions: activeSubs,
    expiredSubscriptions: expiredSubs,
    pendingActivation: pendingSubs,
    totalCodes: codes.length,
    availableCodes: codes.filter(c => c.status === 'active').length,
    usedCodes: codes.filter(c => c.status === 'used').length,
    revokedCodes: codes.filter(c => c.status === 'revoked').length,
  });
});

app.get('/api/owner/students', requireOwner, (req: Request, res: Response) => {
  const students = db.getUsers()
    .filter(u => u.role === 'student')
    .map(({ passwordHash: _, ...safe }) => safe);
  res.json({ students });
});

app.put('/api/owner/students/:id', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  // Prevent tampering with id or passwordHash directly via this route
  delete updates.id;
  delete updates.passwordHash;

  const updated = db.updateUser(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'الطالب غير موجود' });
    return;
  }

  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'تعديل بيانات طالب',
    details: `تم تحديث بيانات الطالب ${updated.fullName} (${updated.phone})`,
  });

  const { passwordHash: _, ...safe } = updated;
  res.json({ student: safe });
});

app.delete('/api/owner/students/:id', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const target = db.getUserById(id);
  if (!target) {
    res.status(404).json({ error: 'الطالب غير موجود' });
    return;
  }
  if (target.role === 'owner') {
    res.status(400).json({ error: 'لا يمكن حذف حساب المالك' });
    return;
  }

  const success = db.deleteUser(id);
  if (success) {
    db.addLog({
      actorPhone: (req as any).user.phone,
      actorRole: 'owner',
      action: 'حذف طالب نهائيًا',
      details: `تم حذف الطالب ${target.fullName} (${target.phone}) من قاعدة البيانات`,
    });
    res.json({ success: true, message: 'تم حذف حساب الطالب نهائيًا بنجاح.' });
  } else {
    res.status(500).json({ error: 'فشل حذف الحساب' });
  }
});

// Subscription Management: Cancel or Activate/Extend Duration
app.post('/api/owner/students/:id/subscription', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, durationDays, customEndDate, subscriptionType } = req.body;
  const target = db.getUserById(id);
  if (!target) {
    res.status(404).json({ error: 'الطالب غير موجود' });
    return;
  }

  const now = new Date();
  if (action === 'cancel') {
    const updated = db.updateUser(id, {
      status: 'expired',
      subscriptionEndDate: now.toISOString(),
    });
    db.addLog({
      actorPhone: (req as any).user.phone,
      actorRole: 'owner',
      action: 'إلغاء اشتراك طالب',
      details: `قام المالك بإلغاء اشتراك الطالب ${target.fullName} (${target.phone}) فورياً`,
    });
    const { passwordHash: _, ...safe } = updated!;
    res.json({ success: true, message: 'تم إلغاء الاشتراك بنجاح', student: safe });
    return;
  }

  // Activate or extend duration
  const days = parseInt(durationDays, 10) || 90;
  let end = new Date(now);
  if (customEndDate) {
    end = new Date(customEndDate);
  } else {
    const currentEnd = target.subscriptionEndDate ? new Date(target.subscriptionEndDate) : now;
    const baseDate = currentEnd > now ? currentEnd : now;
    end = new Date(baseDate);
    end.setDate(end.getDate() + days);
  }

  const updated = db.updateUser(id, {
    status: 'active',
    subscriptionType: subscriptionType || target.subscriptionType || 'فصلي',
    subscriptionStartDate: now.toISOString(),
    subscriptionEndDate: end.toISOString(),
  });

  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'تفعيل/تمديد اشتراك طالب',
    details: `قام المالك بتفعيل اشتراك الطالب ${target.fullName} (${target.phone}) حتى ${end.toISOString().split('T')[0]}`,
  });

  const { passwordHash: _, ...safe } = updated!;
  res.json({ success: true, message: 'تم تفعيل وتمديد الاشتراك بنجاح', student: safe });
});

app.get('/api/owner/codes', requireOwner, (req: Request, res: Response) => {
  res.json({ codes: db.getActivationCodes() });
});

app.post('/api/owner/codes/generate', requireOwner, (req: Request, res: Response) => {
  const { count = 1, prefix = 'MECHA', subscriptionType = 'فصلي', durationDays = 90, notes = '' } = req.body;
  const numToGen = Math.min(Math.max(parseInt(count, 10) || 1, 1), 50);

  const generated: ActivationCode[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < numToGen; i++) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const codeString = `${prefix}-${subscriptionType === 'VIP' ? 'VIP' : durationDays + 'D'}-${randomHex}`;
    const codeItem: ActivationCode = {
      id: 'code_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 5),
      code: codeString,
      subscriptionType,
      durationDays: parseInt(durationDays, 10) || 90,
      status: 'active',
      createdAt: now,
      notes: notes || `كود توليد آلي نوع ${subscriptionType}`,
    };
    db.createActivationCode(codeItem);
    generated.push(codeItem);
  }

  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'توليد أكواد تفعيل جديدة',
    details: `تم توليد عدد ${generated.length} كود تفعيل نوع ${subscriptionType}`,
  });

  res.json({ success: true, generated });
});

app.put('/api/owner/codes/:id/revoke', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateActivationCode(id, { status: 'revoked' });
  if (!updated) {
    res.status(404).json({ error: 'الكود غير موجود' });
    return;
  }
  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'إلغاء كود تفعيل',
    details: `تم إلغاء كود التفعيل ${updated.code}`,
  });
  res.json({ success: true, code: updated });
});

app.put('/api/owner/codes/:id/reactivate', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateActivationCode(id, { status: 'active' });
  if (!updated) {
    res.status(404).json({ error: 'الكود غير موجود' });
    return;
  }
  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'إعادة تفعيل كود',
    details: `تمت إعادة تفعيل الكود ${updated.code} ليصبح متاحاً للطلاب`,
  });
  res.json({ success: true, code: updated });
});

app.get('/api/owner/settings', requireOwner, (req: Request, res: Response) => {
  res.json({ settings: db.getSettings() });
});

app.put('/api/owner/settings', requireOwner, (req: Request, res: Response) => {
  const updates = req.body;
  const updated = db.updateSettings(updates);
  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'تحديث إعدادات التطبيق',
    details: `تم تعديل إعدادات المختبر ورقم الواتساب الدولي (${updated.ownerInternationalPhone})`,
  });
  res.json({ success: true, settings: updated });
});

app.get('/api/owner/logs', requireOwner, (req: Request, res: Response) => {
  res.json({ logs: db.getLogs() });
});

// ---------------- EDUCATIONAL RESOURCES & VIDEOS ----------------
app.get('/api/resources', (req: Request, res: Response) => {
  res.json({ resources: db.getResources(), videos: db.getVideos() });
});

app.post('/api/owner/resources', requireOwner, (req: Request, res: Response) => {
  const { title, category, description, fileUrl, fileSize, pages } = req.body;
  if (!title || !fileUrl) {
    res.status(400).json({ error: 'يرجى إدخال عنوان الملف ورابط التحميل' });
    return;
  }
  const resource = db.createResource({
    id: 'res_' + Date.now(),
    title,
    category: category || 'دليل عملي',
    description: description || '',
    fileUrl,
    fileSize: fileSize || 'غير محدد',
    pages: pages ? parseInt(pages, 10) : undefined,
    createdAt: new Date().toISOString(),
  });
  res.json({ success: true, resource });
});

app.delete('/api/owner/resources/:id', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteResource(id);
  res.json({ success });
});

app.post('/api/owner/videos', requireOwner, (req: Request, res: Response) => {
  const { title, topic, url, duration, level } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: 'يرجى إدخال عنوان الفيديو والرابط' });
    return;
  }
  const video = db.createVideo({
    id: 'vid_' + Date.now(),
    title,
    topic: topic || 'عام',
    url,
    duration: duration || 'غير محدد',
    level: level || 'مبتدئ',
    createdAt: new Date().toISOString(),
  });
  res.json({ success: true, video });
});

app.delete('/api/owner/videos/:id', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteVideo(id);
  res.json({ success });
});

// ---------------- EDUCATIONAL LESSONS ----------------
app.get('/api/lessons', (req: Request, res: Response) => {
  res.json({ lessons: db.getLessons() });
});

app.post('/api/owner/lessons', requireOwner, (req: Request, res: Response) => {
  const { title, subject, level, summary, content, videoUrl, pdfUrl } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'يرجى إدخال عنوان ومحتوى الدرس' });
    return;
  }
  const lesson = db.createLesson({
    id: 'les_' + Date.now(),
    title,
    subject: subject || 'عام',
    level: level || 'مبتدئ',
    summary: summary || '',
    content,
    videoUrl: videoUrl || undefined,
    pdfUrl: pdfUrl || undefined,
    author: (req as any).user.fullName || 'المهندس المشرف (مالك المختبر)',
    createdAt: new Date().toISOString(),
  });

  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'إضافة درس تعليمي جديد',
    details: `قام المالك بإضافة درس جديد: ${lesson.title} (${lesson.subject})`,
  });

  res.json({ success: true, lesson });
});

app.put('/api/owner/lessons/:id', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.updateLesson(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'الدرس غير موجود' });
    return;
  }
  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'تعديل درس تعليمي',
    details: `تم تحديث بيانات الدرس: ${updated.title}`,
  });
  res.json({ success: true, lesson: updated });
});

app.delete('/api/owner/lessons/:id', requireOwner, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteLesson(id);
  db.addLog({
    actorPhone: (req as any).user.phone,
    actorRole: 'owner',
    action: 'حذف درس تعليمي',
    details: `تم حذف الدرس رقم ${id}`,
  });
  res.json({ success });
});

// ---------------- AI MECHATRONICS ASSISTANT ----------------
app.post('/api/ai/chat', requireActiveSubscription, async (req: Request, res: Response) => {
  const { prompt, context } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'يرجى كتابة السؤال أو الطلب' });
    return;
  }

  const reply = await askMechatronicsAi(prompt, context);
  res.json({ reply });
});

app.post('/api/ai/explain-code', requireActiveSubscription, async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'يرجى إرسال كود الأردوينو المراد تحليله' });
    return;
  }

  const reply = await explainArduinoCode(code);
  res.json({ reply });
});

// ---------------- VITE MIDDLEWARE / STATIC FILES ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Virtual Mechatronics Lab Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
