import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  KeyRound,
  Settings,
  BookOpen,
  Video,
  ListOrdered,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Save,
  RotateCcw,
  Phone,
  Power,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  UserX,
  Sparkles,
  School,
  GraduationCap,
  MessageSquare,
  FileText,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, ActivationCode, AuditLog, EducationalResource, EducationalVideo, EducationalLesson, AppSettings } from '../types.ts';
import { YEMENI_UNIVERSITIES } from '../components/auth/AuthModal.tsx';

export const OwnerDashboardView: React.FC = () => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'students' | 'codes' | 'lessons' | 'resources' | 'settings' | 'logs'>('stats');

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Students state
  const [students, setStudents] = useState<User[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'active' | 'expired' | 'pending_activation' | 'suspended'>('all');
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Quick Subscription Modal state
  const [subModalStudent, setSubModalStudent] = useState<User | null>(null);
  const [subModalDays, setSubModalDays] = useState<number>(90);
  const [subModalType, setSubModalType] = useState<'فصلي' | 'سنوي' | 'VIP'>('فصلي');
  const [subModalCustomDate, setSubModalCustomDate] = useState<string>('');

  // Codes state
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [codeFilter, setCodeFilter] = useState<'all' | 'active' | 'used' | 'revoked'>('all');
  const [codeSearch, setCodeSearch] = useState('');
  const [genCount, setGenCount] = useState<number>(5);
  const [genPrefix, setGenPrefix] = useState<string>('MECHA');
  const [genTier, setGenTier] = useState<'فصلي' | 'سنوي' | 'VIP'>('فصلي');
  const [genDays, setGenDays] = useState<number>(90);
  const [genNotes, setGenNotes] = useState<string>('كود معتمد للطلاب');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Quick Direct Student Activation by Phone
  const [quickPhone, setQuickPhone] = useState('');
  const [quickDays, setQuickDays] = useState(90);
  const [quickTier, setQuickTier] = useState<'فصلي' | 'سنوي' | 'VIP'>('فصلي');

  // Lessons state
  const [lessons, setLessons] = useState<EducationalLesson[]>([]);
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<EducationalLesson | null>(null);
  const [viewingLesson, setViewingLesson] = useState<EducationalLesson | null>(null);

  // Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSubject, setLessonSubject] = useState('دوائر كهربائية');
  const [lessonLevel, setLessonLevel] = useState('مبتدئ');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonPdfUrl, setLessonPdfUrl] = useState('');

  // Settings state
  const [settingsForm, setSettingsForm] = useState<AppSettings>({
    ownerLocalPhone: '785502919',
    ownerCountryCode: '+967',
    ownerInternationalPhone: '967785502919',
    allowSelfRegistration: true,
    freeTrialDays: 0,
  });

  // Resources & Videos
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResCat, setNewResCat] = useState<'كتاب' | 'دليل عملي' | 'محاضرة'>('كتاب');
  const [newResSize, setNewResSize] = useState('12.4 MB');

  const [newVidTitle, setNewVidTitle] = useState('');
  const [newVidUrl, setNewVidUrl] = useState('');
  const [newVidTopic, setNewVidTopic] = useState('دوائر كهربائية');
  const [newVidDuration, setNewVidDuration] = useState('25:00');

  // Logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Fetch all dashboard data
  const fetchAll = async () => {
    if (!token) return;
    try {
      // 1. Stats
      const statsRes = await fetch('/api/owner/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (statsRes.ok) setStats(await statsRes.json());

      // 2. Students
      const stdRes = await fetch('/api/owner/students', { headers: { Authorization: `Bearer ${token}` } });
      if (stdRes.ok) {
        const data = await stdRes.json();
        setStudents(data.students);
      }

      // 3. Codes
      const codeRes = await fetch('/api/owner/codes', { headers: { Authorization: `Bearer ${token}` } });
      if (codeRes.ok) {
        const data = await codeRes.json();
        setCodes(data.codes);
      }

      // 4. Lessons
      const lesRes = await fetch('/api/lessons');
      if (lesRes.ok) {
        const data = await lesRes.json();
        setLessons(data.lessons || []);
      }

      // 5. Settings
      const setRes = await fetch('/api/owner/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (setRes.ok) {
        const data = await setRes.json();
        setSettingsForm(data.settings);
      }

      // 6. Resources & Videos
      const resRes = await fetch('/api/resources');
      if (resRes.ok) {
        const data = await resRes.json();
        setResources(data.resources || []);
        setVideos(data.videos || []);
      }

      // 7. Logs
      const logRes = await fetch('/api/owner/logs', { headers: { Authorization: `Bearer ${token}` } });
      if (logRes.ok) {
        const data = await logRes.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  // Handle Cancel Student Subscription
  const handleCancelSubscription = async (studentId: string, studentName: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء اشتراك الطالب "${studentName}" فورياً؟ سيتوقف وصوله للمختبرات.`)) return;
    try {
      const res = await fetch(`/api/owner/students/${studentId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        showFeedback('success', `تم إلغاء اشتراك الطالب ${studentName} فورياً.`);
        fetchAll();
      } else {
        showFeedback('error', 'فشل إلغاء الاشتراك');
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ في الاتصال');
    }
  };

  // Handle Activate/Extend Student Subscription
  const handleActivateSubscription = async () => {
    if (!subModalStudent) return;
    try {
      const res = await fetch(`/api/owner/students/${subModalStudent.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'activate',
          durationDays: subModalDays,
          customEndDate: subModalCustomDate || undefined,
          subscriptionType: subModalType,
        }),
      });
      if (res.ok) {
        showFeedback('success', `تم تفعيل وتمديد اشتراك الطالب ${subModalStudent.fullName} بنجاح.`);
        setSubModalStudent(null);
        setSubModalCustomDate('');
        fetchAll();
      } else {
        showFeedback('error', 'فشل تفعيل الاشتراك');
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ في الاتصال');
    }
  };

  // Handle Quick Activate by Phone
  const handleQuickActivateByPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;
    const cleanPhone = quickPhone.trim().replace(/\s+/g, '');
    const found = students.find((s) => s.phone === cleanPhone);
    if (!found) {
      showFeedback('error', `لم يتم العثور على طالب مسجل برقم الهاتف ${cleanPhone}.`);
      return;
    }

    try {
      const res = await fetch(`/api/owner/students/${found.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'activate',
          durationDays: quickDays,
          subscriptionType: quickTier,
        }),
      });
      if (res.ok) {
        showFeedback('success', `تم التفعيل المباشر للطالب ${found.fullName} (${cleanPhone}) لمدة ${quickDays} يوم بنجاح.`);
        setQuickPhone('');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل التفعيل المباشر');
    }
  };

  // Quick Cancel Student Subscription by Phone
  const handleQuickCancelByPhone = async () => {
    if (!quickPhone.trim()) {
      showFeedback('error', 'يرجى إدخال رقم هاتف الطالب لإلغاء اشتراكه.');
      return;
    }
    const cleanPhone = quickPhone.trim().replace(/\s+/g, '');
    const found = students.find((s) => s.phone === cleanPhone);
    if (!found) {
      showFeedback('error', `لم يتم العثور على طالب مسجل برقم الهاتف ${cleanPhone}.`);
      return;
    }
    if (!confirm(`هل أنت متأكد من إلغاء اشتراك الطالب "${found.fullName}" (${cleanPhone}) فورياً؟ سيتوقف وصوله لكافة المختبرات.`)) return;

    try {
      const res = await fetch(`/api/owner/students/${found.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        showFeedback('success', `تم إلغاء اشتراك الطالب ${found.fullName} (${cleanPhone}) فورياً.`);
        setQuickPhone('');
        fetchAll();
      } else {
        showFeedback('error', 'فشل إلغاء الاشتراك');
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ في الاتصال بالخادم');
    }
  };

  // Generate Codes Handler
  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/owner/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          count: genCount,
          prefix: genPrefix,
          subscriptionType: genTier,
          durationDays: genDays,
          notes: genNotes,
        }),
      });
      if (res.ok) {
        showFeedback('success', `تم توليد عدد ${genCount} كود تفعيل بنجاح.`);
        fetchAll();
      } else {
        showFeedback('error', 'فشل توليد الأكواد');
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ في الاتصال بالخادم');
    }
  };

  // Revoke Code Handler
  const handleRevokeCode = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/codes/${id}/revoke`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFeedback('success', 'تم إلغاء كود التفعيل.');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل إلغاء الكود');
    }
  };

  // Reactivate Code Handler
  const handleReactivateCode = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/codes/${id}/reactivate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFeedback('success', 'تمت إعادة تفعيل الكود ليصبح متاحاً للطلاب.');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل إعادة التفعيل');
    }
  };

  // Copy code with ready WhatsApp text
  const handleCopyCodeMessage = (codeObj: ActivationCode) => {
    const text = `مرحباً بك في مختبر الميكاترونكس الافتراضي 🔬⚡\nكود التفعيل المخصص لحسابك هو:\n${codeObj.code}\nباقة: ${codeObj.subscriptionType} (صالحة لمدة ${codeObj.durationDays} يوماً)\nرابط الدخول: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedCodeId(codeObj.id);
    setTimeout(() => setCopiedCodeId(null), 2500);
    showFeedback('success', `تم نسخ كود التفعيل مع رسالة الواتساب: ${codeObj.code}`);
  };

  // Update Student Handler
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/owner/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingStudent),
      });
      if (res.ok) {
        showFeedback('success', `تم تحديث بيانات الطالب ${editingStudent.fullName} بنجاح.`);
        setEditingStudent(null);
        fetchAll();
      } else {
        showFeedback('error', 'فشل تحديث بيانات الطالب');
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ في الاتصال');
    }
  };

  // Delete Student Handler
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب الطالب "${name}" نهائياً من قاعدة البيانات؟`)) return;
    try {
      const res = await fetch(`/api/owner/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFeedback('success', 'تم حذف حساب الطالب نهائياً من قاعدة البيانات.');
        fetchAll();
      } else {
        showFeedback('error', 'فشل حذف الحساب');
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ في الاتصال');
    }
  };

  // Save Lesson Handler (Add or Update)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonContent.trim()) {
      showFeedback('error', 'يرجى كتابة عنوان ومحتوى الدرس.');
      return;
    }

    try {
      if (editingLesson) {
        // Update lesson
        const res = await fetch(`/api/owner/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: lessonTitle,
            subject: lessonSubject,
            level: lessonLevel,
            summary: lessonSummary,
            content: lessonContent,
            videoUrl: lessonVideoUrl,
            pdfUrl: lessonPdfUrl,
          }),
        });
        if (res.ok) {
          showFeedback('success', `تم تحديث الدرس: ${lessonTitle}`);
          setEditingLesson(null);
          setIsAddingLesson(false);
          fetchAll();
        }
      } else {
        // Create lesson
        const res = await fetch('/api/owner/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: lessonTitle,
            subject: lessonSubject,
            level: lessonLevel,
            summary: lessonSummary,
            content: lessonContent,
            videoUrl: lessonVideoUrl,
            pdfUrl: lessonPdfUrl,
          }),
        });
        if (res.ok) {
          showFeedback('success', `تمت إضافة الدرس الجديد: ${lessonTitle}`);
          setIsAddingLesson(false);
          // Reset form
          setLessonTitle('');
          setLessonSummary('');
          setLessonContent('');
          setLessonVideoUrl('');
          setLessonPdfUrl('');
          fetchAll();
        }
      }
    } catch (err) {
      showFeedback('error', 'حدث خطأ أثناء حفظ الدرس');
    }
  };

  // Delete Lesson Handler
  const handleDeleteLesson = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف الدرس "${title}"؟`)) return;
    try {
      const res = await fetch(`/api/owner/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFeedback('success', 'تم حذف الدرس بنجاح.');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل حذف الدرس');
    }
  };

  // Open Edit Lesson Modal
  const handleOpenEditLesson = (les: EducationalLesson) => {
    setEditingLesson(les);
    setLessonTitle(les.title);
    setLessonSubject(les.subject);
    setLessonLevel(les.level);
    setLessonSummary(les.summary);
    setLessonContent(les.content);
    setLessonVideoUrl(les.videoUrl || '');
    setLessonPdfUrl(les.pdfUrl || '');
    setIsAddingLesson(true);
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        showFeedback('success', 'تم حفظ وتطبيق إعدادات المختبر ورقم الواتساب بنجاح.');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل حفظ الإعدادات');
    }
  };

  // Add Resource Handler
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle || !newResUrl) return;
    try {
      const res = await fetch('/api/owner/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newResTitle,
          fileUrl: newResUrl,
          category: newResCat,
          fileSize: newResSize,
        }),
      });
      if (res.ok) {
        showFeedback('success', 'تمت إضافة المرجع التعليمي.');
        setNewResTitle('');
        setNewResUrl('');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل إضافة المرجع');
    }
  };

  // Add Video Handler
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVidTitle || !newVidUrl) return;
    try {
      const res = await fetch('/api/owner/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newVidTitle,
          url: newVidUrl,
          topic: newVidTopic,
          duration: newVidDuration,
        }),
      });
      if (res.ok) {
        showFeedback('success', 'تمت إضافة الفيديو التعليمي.');
        setNewVidTitle('');
        setNewVidUrl('');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل إضافة الفيديو');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-amber-600/20 border border-amber-400/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">لوحة تحكم وإدارة مالك المختبر</h1>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
                Owner Full Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              التحكم الشامل بجميع الصلاحيات: تفعيل الأكواد، إضافة الدروس، إدارة اشتراكات الطلاب، وإعدادات الواتساب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-lg ${
          feedback.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
            : 'bg-rose-950/90 text-rose-300 border-rose-700/80'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'stats', label: 'الإحصائيات العامة', icon: ShieldAlert },
          { id: 'students', label: 'إدارة الطلاب والاشتراكات', icon: Users, badge: students.length },
          { id: 'codes', label: 'توليد وتفعيل الأكواد', icon: KeyRound, badge: codes.filter(c => c.status === 'active').length },
          { id: 'lessons', label: 'خدمة إضافة الدروس', icon: BookOpen, badge: lessons.length },
          { id: 'resources', label: 'المكتبة والمراجع', icon: Video },
          { id: 'settings', label: 'إعدادات المعمل والواتساب', icon: Settings },
          { id: 'logs', label: 'سجل العمليات (Audit)', icon: ListOrdered },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= 1. STATS TAB ================= */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 block">إجمالي الطلاب</span>
              <span className="text-3xl font-black font-mono text-white">{stats.totalStudents}</span>
              <span className="text-[10px] text-slate-500 block">في قاعدة البيانات</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-emerald-400 block">الاشتراكات النشطة</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{stats.activeSubscriptions}</span>
              <span className="text-[10px] text-slate-500 block">يمكنهم دخول المعامل</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-amber-400 block">بانتظار التفعيل</span>
              <span className="text-3xl font-black font-mono text-amber-400">{stats.pendingActivation}</span>
              <span className="text-[10px] text-slate-500 block">سجلوا ولم يدخلوا كوداً</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-cyan-400 block">أكواد تفعيل متاحة</span>
              <span className="text-3xl font-black font-mono text-cyan-400">{stats.availableCodes}</span>
              <span className="text-[10px] text-slate-500 block">جاهزة للتسليم للطلاب</span>
            </div>
          </div>

          {/* Quick Direct Student Activation Banner */}
          <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-amber-950/70 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">تفعيل اشتراك فوري وسريع لأي طالب برقم هاتفه</h3>
            </div>
            <p className="text-xs text-slate-300">
              يمكنك كمالك للمختبر تفعيل اشتراك أي طالب مباشرة من هنا دون الحاجة لإرسال كود يدوي للطالب.
            </p>
            <form onSubmit={handleQuickActivateByPhone} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                required
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                placeholder="رقم هاتف الطالب (مثال: 777000111)"
                className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />
              <select
                value={quickDays}
                onChange={(e) => setQuickDays(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
              >
                <option value={30}>مدة شهر (30 يوماً)</option>
                <option value={90}>فصل دراسي (90 يوماً)</option>
                <option value={180}>نصف سنة (180 يوماً)</option>
                <option value={365}>سنة كاملة (365 يوماً)</option>
              </select>
              <select
                value={quickTier}
                onChange={(e: any) => setQuickTier(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
              >
                <option value="فصلي">باقة فصلية</option>
                <option value="سنوي">باقة سنوية</option>
                <option value="VIP">باقة VIP شاملة</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                تفعيل حساب الطالب الآن
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 2. STUDENTS TAB ================= */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white border-r-3 border-amber-500 pr-2">
                إدارة الطلاب والاشتراكات ({students.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تفعيل مدد الاشتراكات، تمديد الصلاحية، إلغاء الاشتراك فوريًا، وتعديل بيانات الجامعات
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filter */}
              <select
                value={studentFilter}
                onChange={(e: any) => setStudentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">الاشتراكات النشطة فقط</option>
                <option value="expired">الاشتراكات المنتهية</option>
                <option value="pending_activation">في انتظار التفعيل</option>
                <option value="suspended">الموقوفة</option>
              </select>

              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الهاتف أو الجامعة..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-xs text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-2">الطالب</th>
                  <th className="py-3 px-2">رقم الهاتف</th>
                  <th className="py-3 px-2">الجامعة اليمنية والمستوى</th>
                  <th className="py-3 px-2">نوع الاشتراك</th>
                  <th className="py-3 px-2">الحالة</th>
                  <th className="py-3 px-2">تاريخ الانتهاء</th>
                  <th className="py-3 px-2 text-center">إجراءات الاشتراك السريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students
                  .filter((s) => {
                    const matchesSearch =
                      s.fullName.includes(studentSearch) ||
                      s.phone.includes(studentSearch) ||
                      s.university.includes(studentSearch);
                    const matchesFilter =
                      studentFilter === 'all' || s.status === studentFilter;
                    return matchesSearch && matchesFilter;
                  })
                  .map((st) => (
                    <tr key={st.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-bold text-white block">{st.fullName}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-300" dir="ltr">
                        {st.phone}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="font-medium">{st.university}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 mr-5">
                          {st.studyLevel}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-cyan-400">{st.subscriptionType}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : st.status === 'expired'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : st.status === 'suspended'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {st.status === 'active'
                            ? 'نشط'
                            : st.status === 'expired'
                            ? 'منتهي'
                            : st.status === 'suspended'
                            ? 'موقوف'
                            : 'بانتظار التفعيل'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-300">
                        {st.subscriptionEndDate ? st.subscriptionEndDate.split('T')[0] : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Activate / Extend Button */}
                          <button
                            onClick={() => {
                              setSubModalStudent(st);
                              setSubModalType(st.subscriptionType === 'مجاني' ? 'فصلي' : (st.subscriptionType as any));
                            }}
                            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="تفعيل أو تمديد الاشتراك"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>تفعيل/تمديد</span>
                          </button>

                          {/* Quick Cancel Subscription Button */}
                          {st.status === 'active' && (
                            <button
                              onClick={() => handleCancelSubscription(st.id, st.fullName)}
                              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="إلغاء الاشتراك فوراً"
                            >
                              <UserX className="w-3.5 h-3.5 text-rose-400" />
                              <span>إلغاء</span>
                            </button>
                          )}

                          {/* Edit Full Student Data */}
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg cursor-pointer"
                            title="تعديل بيانات الطالب"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Chat with Student */}
                          <a
                            href={`https://wa.me/${st.phone.startsWith('0') ? '967' + st.phone.substring(1) : st.phone.length <= 9 ? '967' + st.phone : st.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 rounded-lg cursor-pointer"
                            title="مراسلة الطالب عبر واتساب"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Student Account */}
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.fullName)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg cursor-pointer"
                            title="حذف الطالب نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Quick Activate / Extend Subscription Modal */}
          {subModalStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">تفعيل وتمديد مدة اشتراك الطالب</h4>
                  </div>
                  <button
                    onClick={() => setSubModalStudent(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1">
                  <p className="text-white font-bold">{subModalStudent.fullName}</p>
                  <p className="text-slate-400">الهاتف: <span className="text-sky-300 font-mono" dir="ltr">{subModalStudent.phone}</span> | الجامعة: {subModalStudent.university}</p>
                  <p className="text-slate-400">الحالة الحالية: <span className="text-amber-300 font-semibold">{subModalStudent.status}</span></p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1.5 font-semibold">باقة الاشتراك:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['فصلي', 'سنوي', 'VIP'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSubModalType(t)}
                          className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                            subModalType === t
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1.5 font-semibold">تحديد مدة التفعيل:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setSubModalDays(30); setSubModalCustomDate(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                          subModalDays === 30 && !subModalCustomDate
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        + شهر (30 يوماً)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSubModalDays(90); setSubModalCustomDate(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                          subModalDays === 90 && !subModalCustomDate
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        + فصل دراسي (90 يوماً)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSubModalDays(180); setSubModalCustomDate(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                          subModalDays === 180 && !subModalCustomDate
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        + نصف سنة (180 يوماً)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSubModalDays(365); setSubModalCustomDate(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                          subModalDays === 365 && !subModalCustomDate
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        + سنة كاملة (365 يوماً)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">أو حدد تاريخ انتهاء مخصص بالتقويم:</label>
                    <input
                      type="date"
                      value={subModalCustomDate}
                      onChange={(e) => setSubModalCustomDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleActivateSubscription}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      تفعيل الاشتراك وتحديث الحساب
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubModalStudent(null)}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Student Full Modal Drawer */}
          {editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-white">تعديل بيانات الطالب: {editingStudent.fullName}</h4>
                  <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">الاسم الكامل:</label>
                    <input
                      type="text"
                      value={editingStudent.fullName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">الجامعة اليمنية:</label>
                    <select
                      value={editingStudent.university}
                      onChange={(e) => setEditingStudent({ ...editingStudent, university: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      {YEMENI_UNIVERSITIES.map((univ) => (
                        <option key={univ} value={univ}>
                          {univ}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">المستوى الدراسي:</label>
                    <select
                      value={editingStudent.studyLevel}
                      onChange={(e) => setEditingStudent({ ...editingStudent, studyLevel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="سنة أولى">سنة أولى (إعدادي هندسة)</option>
                      <option value="سنة ثانية">سنة ثانية (ميكاترونكس)</option>
                      <option value="سنة ثالثة">سنة ثالثة (ميكاترونكس)</option>
                      <option value="سنة رابعة">سنة رابعة (تخرج)</option>
                      <option value="دراسات عليا / باحث">دراسات عليا / باحث</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">حالة الحساب:</label>
                    <select
                      value={editingStudent.status}
                      onChange={(e: any) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="active">نشط (Active)</option>
                      <option value="expired">منتهي (Expired)</option>
                      <option value="suspended">موقوف (Suspended)</option>
                      <option value="pending_activation">في انتظار التفعيل</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">نوع الاشتراك:</label>
                    <select
                      value={editingStudent.subscriptionType}
                      onChange={(e: any) => setEditingStudent({ ...editingStudent, subscriptionType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="مجاني">مجاني</option>
                      <option value="فصلي">فصلي</option>
                      <option value="سنوي">سنوي</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">تاريخ انتهاء الاشتراك:</label>
                    <input
                      type="date"
                      value={editingStudent.subscriptionEndDate ? editingStudent.subscriptionEndDate.split('T')[0] : ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, subscriptionEndDate: new Date(e.target.value).toISOString() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                    >
                      حفظ التعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. CODES TAB ================= */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          {/* Generator Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              توليد أكواد تفعيل جديدة
            </h3>
            <form onSubmit={handleGenerateCodes} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">عدد الأكواد:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">بادئة الكود (Prefix):</label>
                <input
                  type="text"
                  value={genPrefix}
                  onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">باقة الاشتراك:</label>
                <select
                  value={genTier}
                  onChange={(e: any) => setGenTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="فصلي">فصلي (Semester)</option>
                  <option value="سنوي">سنوي (Annual)</option>
                  <option value="VIP">شامل VIP</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">مدة الصلاحية (أيام):</label>
                <input
                  type="number"
                  value={genDays}
                  onChange={(e) => setGenDays(parseInt(e.target.value) || 90)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  توليد الآن
                </button>
              </div>
            </form>
          </div>

          {/* Codes List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-300">سجل الأكواد ({codes.length}):</h4>
              <div className="flex items-center gap-2">
                <select
                  value={codeFilter}
                  onChange={(e: any) => setCodeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">جميع الأكواد</option>
                  <option value="active">النشطة فقط</option>
                  <option value="used">المستخدمة</option>
                  <option value="revoked">الملغاة</option>
                </select>
                <input
                  type="text"
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value.toUpperCase())}
                  placeholder="بحث في الأكواد..."
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-2">الكود</th>
                    <th className="py-2.5 px-2">النوع والمدة</th>
                    <th className="py-2.5 px-2">الحالة</th>
                    <th className="py-2.5 px-2">المستخدم</th>
                    <th className="py-2.5 px-2">تاريخ الاستخدام</th>
                    <th className="py-2.5 px-2 text-center">التحكم والنسخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {codes
                    .filter((c) => {
                      const matchesF = codeFilter === 'all' || c.status === codeFilter;
                      const matchesS = !codeSearch || c.code.includes(codeSearch) || (c.usedByStudentPhone || '').includes(codeSearch);
                      return matchesF && matchesS;
                    })
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 px-2 font-bold text-sky-400 select-all">{c.code}</td>
                        <td className="py-2.5 px-2 text-slate-300 font-sans">{c.subscriptionType} ({c.durationDays} يوم)</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                            c.status === 'active' ? 'bg-emerald-950 text-emerald-300' : c.status === 'used' ? 'bg-slate-800 text-slate-400' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {c.status === 'active' ? 'نشط' : c.status === 'used' ? 'مستخدم' : 'ملغي'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-400 font-sans">{c.usedByStudentPhone || '—'}</td>
                        <td className="py-2.5 px-2 text-slate-400">{c.usedAt ? c.usedAt.split('T')[0] : '—'}</td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Copy Code with WhatsApp Text */}
                            <button
                              onClick={() => handleCopyCodeMessage(c)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-sans flex items-center gap-1 cursor-pointer"
                              title="نسخ الكود مع رسالة واتساب جاهزة"
                            >
                              {copiedCodeId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCodeId === c.id ? 'تم النسخ!' : 'نسخ'}</span>
                            </button>

                            {/* Revoke or Reactivate Button */}
                            {c.status === 'active' && (
                              <button
                                onClick={() => handleRevokeCode(c.id)}
                                className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 font-sans cursor-pointer"
                              >
                                إلغاء
                              </button>
                            )}

                            {c.status === 'revoked' && (
                              <button
                                onClick={() => handleReactivateCode(c.id)}
                                className="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 font-sans cursor-pointer"
                              >
                                إعادة تفعيل
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. LESSONS TAB (خدمة إضافة الدروس) ================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">خدمة إضافة الدروس والشروحات الأكاديمية</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                يمكن للمالك إضافة دروس ومحاضرات تفصيلية مرفقة بالفيديوهات وملفات الـ PDF لتظهر للطلاب في المختبر
              </p>
            </div>

            <button
              onClick={() => {
                setEditingLesson(null);
                setLessonTitle('');
                setLessonSummary('');
                setLessonContent('');
                setLessonVideoUrl('');
                setLessonPdfUrl('');
                setIsAddingLesson(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة درس جديد</span>
            </button>
          </div>

          {/* Add / Edit Lesson Form Modal */}
          {isAddingLesson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{editingLesson ? 'تعديل الدرس التعليمي' : 'إضافة درس تعليمي جديد للمختبر'}</span>
                  </h4>
                  <button onClick={() => setIsAddingLesson(false)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">عنوان الدرس:</label>
                    <input
                      type="text"
                      required
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="مثال: الدرس 6: برمجة المؤقت 555 وتوليد نبضات التوقيت"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">المادة / التخصص الهندسي:</label>
                      <select
                        value={lessonSubject}
                        onChange={(e) => setLessonSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="دوائر كهربائية">دوائر كهربائية وقياسات</option>
                        <option value="إلكترونيات">إلكترونيات ومضخمات</option>
                        <option value="منطق رقمي">منطق رقمي وأنظمة مدمجة</option>
                        <option value="أردوينو">أردوينو ومتحكمات دقيقة</option>
                        <option value="روبوتات">روبوتات ومحركات صناعية</option>
                        <option value="أنظمة تحكم">أنظمة تحكم ومتحكم PID</option>
                        <option value="مشاريع تخرج">مشاريع تخرج جامعية</option>
                        <option value="عام">هندسة ميكاترونكس عامة</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">المستوى العلمي:</label>
                      <select
                        value={lessonLevel}
                        onChange={(e) => setLessonLevel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      >
                        <option value="مبتدئ">مستوى أساسي (مبتدئ)</option>
                        <option value="متوسط">مستوى متوسط</option>
                        <option value="متقدم">مستوى متقدم (تخصصي)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">ملخص فكرة الدرس:</label>
                    <input
                      type="text"
                      value={lessonSummary}
                      onChange={(e) => setLessonSummary(e.target.value)}
                      placeholder="ملخص قصير يظهر في بطاقة الدرس للطلاب..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">محتوى وشرح الدرس بالتفصيل:</label>
                    <textarea
                      required
                      rows={6}
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      placeholder="اكتب الشرح العلمي المفصل، القوانين الرياضية، والتطبيقات العملية هنا..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white leading-relaxed font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">رابط فيديو الشرح (YouTube):</label>
                      <input
                        type="url"
                        value={lessonVideoUrl}
                        onChange={(e) => setLessonVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">رابط تحميل ملف PDF / مرجع:</label>
                      <input
                        type="url"
                        value={lessonPdfUrl}
                        onChange={(e) => setLessonPdfUrl(e.target.value)}
                        placeholder="https://example.com/lesson-guide.pdf"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      {editingLesson ? 'تحديث الدرس' : 'نشر الدرس للطلاب'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingLesson(false)}
                      className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lessons List View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((les) => (
              <div
                key={les.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {les.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {les.level}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{les.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {les.summary || les.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    {les.videoUrl && (
                      <span className="text-rose-400 flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        <span>فيديو مرفق</span>
                      </span>
                    )}
                    {les.pdfUrl && (
                      <span className="text-sky-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>PDF مرفق</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => setViewingLesson(les)}
                    className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>قراءة الدرس</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditLesson(les)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg cursor-pointer"
                      title="تعديل الدرس"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(les.id, les.title)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg cursor-pointer"
                      title="حذف الدرس"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Lesson Reader Modal */}
          {viewingLesson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                      {viewingLesson.subject} • {viewingLesson.level}
                    </span>
                    <h3 className="text-base font-black text-white mt-1.5">{viewingLesson.title}</h3>
                  </div>
                  <button onClick={() => setViewingLesson(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
                  {viewingLesson.summary && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
                      💡 <strong>ملخص الفكرة:</strong> {viewingLesson.summary}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {viewingLesson.content}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {viewingLesson.videoUrl && (
                      <a
                        href={viewingLesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>مشاهدة فيديو الدرس على YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {viewingLesson.pdfUrl && (
                      <a
                        href={viewingLesson.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        <span>تحميل ملخص PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setViewingLesson(null)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 5. RESOURCES & VIDEOS TAB ================= */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add PDF */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              إضافة كتاب أو مرجع PDF
            </h3>
            <form onSubmit={handleAddResource} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">عنوان المرجع:</label>
                <input
                  type="text"
                  required
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="مثال: كتاب مبادئ الإلكترونيات التطبيقية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">التصنيف:</label>
                <select
                  value={newResCat}
                  onChange={(e: any) => setNewResCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="كتاب">كتاب مرجعي</option>
                  <option value="دليل عملي">دليل تجارب عملية</option>
                  <option value="محاضرة">ملخص محاضرة</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">رابط التحميل المباشر (URL):</label>
                <input
                  type="url"
                  required
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-left"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl cursor-pointer"
              >
                إضافة المرجع الآن
              </button>
            </form>
          </div>

          {/* Add Video */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              إضافة فيديو تعليمي (YouTube)
            </h3>
            <form onSubmit={handleAddVideo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">عنوان الفيديو:</label>
                <input
                  type="text"
                  required
                  value={newVidTitle}
                  onChange={(e) => setNewVidTitle(e.target.value)}
                  placeholder="مثال: تجربة فحص دايود السيليكون عملياً"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الموضوع:</label>
                <input
                  type="text"
                  value={newVidTopic}
                  onChange={(e) => setNewVidTopic(e.target.value)}
                  placeholder="دوائر كهربائية / أردوينو"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">رابط YouTube:</label>
                <input
                  type="url"
                  required
                  value={newVidUrl}
                  onChange={(e) => setNewVidUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-left"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl cursor-pointer"
              >
                إضافة الفيديو الآن
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 6. SETTINGS TAB ================= */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white border-r-3 border-amber-500 pr-2">
              إعدادات تطبيق المختبر ورقم الواتساب
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              الرقم الدولي المعتمد لاستقبال رسائل طلبات أكواد التفعيل وتجديد الاشتراكات من الطلاب
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold">رمز الدولة (كود الدولة الدولي):</label>
                <input
                  type="text"
                  value={settingsForm.ownerCountryCode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ownerCountryCode: e.target.value })}
                  placeholder="+967"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold">رقم الهاتف المحلي:</label>
                <input
                  type="text"
                  value={settingsForm.ownerLocalPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ownerLocalPhone: e.target.value })}
                  placeholder="785502919"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-semibold">رقم الواتساب الدولي الكامل بدون (+):</label>
              <input
                type="text"
                value={settingsForm.ownerInternationalPhone}
                onChange={(e) => setSettingsForm({ ...settingsForm, ownerInternationalPhone: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="967785502919"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono text-left text-sm"
                dir="ltr"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                تأكد من كتابة الرقم بالصيغة الدولية: مثال اليمن (967785502919).
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">السماح للطلاب بإنشاء حسابات ذاتية</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  عند إيقاف هذا الخيار، لا يمكن لأي طالب التسجيل إلا عبر تواصله المباشر معك.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.allowSelfRegistration}
                onChange={(e) => setSettingsForm({ ...settingsForm, allowSelfRegistration: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتطبيق الإعدادات</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= 7. AUDIT LOGS TAB ================= */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
            سجل العمليات والرقابة (Audit Log) ({logs.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-2">الوقت</th>
                  <th className="py-2.5 px-2">المنفّذ</th>
                  <th className="py-2.5 px-2">الدور</th>
                  <th className="py-2.5 px-2">العملية</th>
                  <th className="py-2.5 px-2">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40">
                    <td className="py-2.5 px-2 text-slate-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td className="py-2.5 px-2 font-bold text-sky-400" dir="ltr">{log.actorPhone}</td>
                    <td className="py-2.5 px-2 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        log.actorRole === 'owner' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {log.actorRole === 'owner' ? 'المالك' : 'طالب'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-sans font-bold text-white">{log.action}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
