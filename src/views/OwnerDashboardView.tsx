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
  Power
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, ActivationCode, AuditLog, EducationalResource, EducationalVideo, AppSettings } from '../types.ts';

export const OwnerDashboardView: React.FC = () => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'students' | 'codes' | 'resources' | 'settings' | 'logs'>('stats');

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Students state
  const [students, setStudents] = useState<User[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Codes state
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [genCount, setGenCount] = useState<number>(5);
  const [genPrefix, setGenPrefix] = useState<string>('MECHA');
  const [genTier, setGenTier] = useState<'فصلي' | 'سنوي' | 'VIP'>('فصلي');
  const [genDays, setGenDays] = useState<number>(90);
  const [genNotes, setGenNotes] = useState<string>('كود فصلي جديد');

  // Settings state
  const [settingsForm, setSettingsForm] = useState<AppSettings>({
    ownerLocalPhone: '785502919',
    ownerCountryCode: '+967',
    ownerInternationalPhone: '967785502919',
    allowSelfRegistration: true,
    freeTrialDays: 7,
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

  // Fetch data
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

      // 4. Settings
      const setRes = await fetch('/api/owner/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (setRes.ok) {
        const data = await setRes.json();
        setSettingsForm(data.settings);
      }

      // 5. Resources & Videos
      const resRes = await fetch('/api/resources');
      if (resRes.ok) {
        const data = await resRes.json();
        setResources(data.resources || []);
        setVideos(data.videos || []);
      }

      // 6. Logs
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
      }
    } catch (err) {
      showFeedback('error', 'فشل تحديث بيانات الطالب');
    }
  };

  // Delete Student Handler
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب الطالب "${name}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    try {
      const res = await fetch(`/api/owner/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFeedback('success', 'تم حذف حساب الطالب نهائياً من قاعدة البيانات.');
        fetchAll();
      }
    } catch (err) {
      showFeedback('error', 'فشل حذف الحساب');
    }
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-800/60 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">لوحة تحكم مالك المختبر</h1>
            <p className="text-xs text-amber-300 font-mono">
              Owner Management & Control Console — الطلاب، الاشتراكات، الأكواد، وإعدادات الواتساب
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Power className="w-4 h-4" />
          <span>تسجيل الخروج من لوحة الإدارة</span>
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-700' : 'bg-rose-950/90 text-rose-200 border border-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'stats', label: 'الإحصائيات العامة', icon: ShieldAlert },
          { id: 'students', label: 'إدارة الطلاب والاشتراكات', icon: Users },
          { id: 'codes', label: 'توليد ومتابعة أكواد التفعيل', icon: KeyRound },
          { id: 'resources', label: 'المكتبة والكتب والفيديوهات', icon: BookOpen },
          { id: 'settings', label: 'إعدادات التطبيق ورقم الواتساب', icon: Settings },
          { id: 'logs', label: 'سجل العمليات (Audit Log)', icon: ListOrdered },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 block">إجمالي الطلاب المسجلين</span>
              <span className="text-3xl font-black font-mono text-white">{stats.totalStudents}</span>
              <span className="text-[10px] text-slate-500 block">حسابات نشطة ومعلقة</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-emerald-400 block">الاشتراكات النشطة حالياً</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{stats.activeSubscriptions}</span>
              <span className="text-[10px] text-slate-500 block">صالح للاستخدام</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-amber-400 block">اشتراكات بانتظار التفعيل</span>
              <span className="text-3xl font-black font-mono text-amber-400">{stats.pendingActivation}</span>
              <span className="text-[10px] text-slate-500 block">تنتظر كود التفعيل</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-cyan-400 block">أكواد التفعيل المتاحة</span>
              <span className="text-3xl font-black font-mono text-cyan-400">{stats.availableCodes}</span>
              <span className="text-[10px] text-slate-500 block">جاهزة للتوزيع للطالب</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              قائمة الطلاب ({students.length})
            </h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="بحث بالاسم أو رقم الهاتف..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-xs text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-2">الطالب</th>
                  <th className="py-3 px-2">رقم الهاتف</th>
                  <th className="py-3 px-2">الجامعة والمستوى</th>
                  <th className="py-3 px-2">نوع الاشتراك</th>
                  <th className="py-3 px-2">الحالة</th>
                  <th className="py-3 px-2">تاريخ الانتهاء</th>
                  <th className="py-3 px-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students
                  .filter(s => s.fullName.includes(studentSearch) || s.phone.includes(studentSearch))
                  .map((st) => (
                    <tr key={st.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-2 font-bold text-white">{st.fullName}</td>
                      <td className="py-3 px-2 font-mono text-slate-300" dir="ltr">{st.phone}</td>
                      <td className="py-3 px-2 text-slate-400">
                        {st.university} <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded mr-1">{st.studyLevel}</span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-cyan-400">{st.subscriptionType}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : st.status === 'expired'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {st.status === 'active' ? 'نشط' : st.status === 'expired' ? 'منتهي' : st.status === 'suspended' ? 'موقوف' : 'معلق'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">
                        {st.subscriptionEndDate ? st.subscriptionEndDate.split('T')[0] : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg"
                            title="تعديل الطالب"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.fullName)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg"
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

          {/* Edit Student Modal Drawer */}
          {editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                <h4 className="text-sm font-bold text-white">تعديل بيانات الطالب: {editingStudent.fullName}</h4>
                <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">الاسم الكامل:</label>
                    <input
                      type="text"
                      value={editingStudent.fullName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">حالة الحساب:</label>
                    <select
                      value={editingStudent.status}
                      onChange={(e: any) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="مجاني">مجاني</option>
                      <option value="فصلي">فصلي</option>
                      <option value="سنوي">سنوي</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">تاريخ انتهاء الاشتراك (YYYY-MM-DD):</label>
                    <input
                      type="date"
                      value={editingStudent.subscriptionEndDate ? editingStudent.subscriptionEndDate.split('T')[0] : ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, subscriptionEndDate: new Date(e.target.value).toISOString() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl"
                    >
                      حفظ التعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
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

      {/* 3. CODES TAB */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          {/* Generator Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              توليد أكواد تفعيل جديدة أحادية الاستخدام
            </h3>
            <form onSubmit={handleGenerateCodes} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">العدد المطلوب:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value))}
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
                  onChange={(e) => setGenDays(parseInt(e.target.value))}
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
            <h4 className="text-xs font-bold text-slate-300">سجل الأكواد المنشأة ({codes.length}):</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-2">الكود</th>
                    <th className="py-2.5 px-2">النوع والمدة</th>
                    <th className="py-2.5 px-2">الحالة</th>
                    <th className="py-2.5 px-2">المستخدم</th>
                    <th className="py-2.5 px-2">تاريخ الاستخدام</th>
                    <th className="py-2.5 px-2 text-center">إلغاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {codes.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 px-2 font-bold text-sky-400 select-all">{c.code}</td>
                      <td className="py-2 px-2 text-slate-300">{c.subscriptionType} ({c.durationDays} يوم)</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'active' ? 'bg-emerald-950 text-emerald-300' : c.status === 'used' ? 'bg-slate-800 text-slate-400' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {c.status === 'active' ? 'نشط' : c.status === 'used' ? 'مستخدم' : 'ملغي'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-400">{c.usedByStudentPhone || '—'}</td>
                      <td className="py-2 px-2 text-slate-400">{c.usedAt ? c.usedAt.split('T')[0] : '—'}</td>
                      <td className="py-2 px-2 text-center">
                        {c.status === 'active' && (
                          <button
                            onClick={() => handleRevokeCode(c.id)}
                            className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded bg-slate-800"
                          >
                            إلغاء
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESOURCES & VIDEOS TAB */}
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
                  placeholder="مثال: هندسة الروبوتات الصناعية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">رابط الملف (URL):</label>
                <input
                  type="url"
                  required
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  placeholder="https://example.com/handbook.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  dir="ltr"
                />
              </div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl">
                إضافة المرجع
              </button>
            </form>
          </div>

          {/* Add Video */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              إضافة فيديو تعليمي
            </h3>
            <form onSubmit={handleAddVideo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">عنوان المحاضرة:</label>
                <input
                  type="text"
                  required
                  value={newVidTitle}
                  onChange={(e) => setNewVidTitle(e.target.value)}
                  placeholder="مثال: شرح دوائر المضخمات Op-Amp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">رابط الفيديو (YouTube/Drive):</label>
                <input
                  type="url"
                  required
                  value={newVidUrl}
                  onChange={(e) => setNewVidUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  dir="ltr"
                />
              </div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl">
                إضافة الفيديو
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-white border-r-2 border-amber-500 pr-2">
            إعدادات التطبيق ورقم الواتساب الدولي للمالك
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="font-bold text-amber-400 block">إعداد رقم الواتساب المخصص لاستقبال طلبات الطلاب:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">رمز الدولة الدولي:</label>
                  <select
                    value={settingsForm.ownerCountryCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerCountryCode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="+967">+967 (اليمن — Yemen)</option>
                    <option value="+966">+966 (السعودية — Saudi Arabia)</option>
                    <option value="+20">+20 (مصر — Egypt)</option>
                    <option value="+962">+962 (الأردن — Jordan)</option>
                    <option value="+971">+971 (الإمارات — UAE)</option>
                    <option value="+964">+964 (العراق — Iraq)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">الرقم المحلي للمالك:</label>
                  <input
                    type="text"
                    value={settingsForm.ownerLocalPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerLocalPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2 text-slate-400 font-mono text-[11px]">
                الرقم الدولي الناتج للرابط: <strong className="text-emerald-400">{settingsForm.ownerCountryCode.replace('+', '')}{settingsForm.ownerLocalPhone}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">السماح للطلاب بالتسجيل الذاتي:</span>
                <span className="text-[10px] text-slate-400">إذا تم إيقافه، سيتطلب التسجيل موافقة وتوليد حساب من المالك.</span>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.allowSelfRegistration}
                onChange={(e) => setSettingsForm({ ...settingsForm, allowSelfRegistration: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              حفظ التعديلات في قاعدة البيانات
            </button>
          </form>
        </div>
      )}

      {/* 6. AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
            سجل العمليات والأنشطة (Audit Log)
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-400 ml-2">[{log.action}]</span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono shrink-0 mr-2">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
