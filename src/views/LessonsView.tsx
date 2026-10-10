import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Video,
  FileText,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  GraduationCap,
  Layers,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { EducationalLesson } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface LessonsViewProps {
  onOpenOwnerDashboard?: () => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onOpenOwnerDashboard }) => {
  const { isOwner } = useAuth();
  const [lessons, setLessons] = useState<EducationalLesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeLesson, setActiveLesson] = useState<EducationalLesson | null>(null);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lessons');
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const subjects = [
    { id: 'all', label: 'جميع المواد' },
    { id: 'دوائر كهربائية', label: 'دوائر كهربائية' },
    { id: 'إلكترونيات', label: 'إلكترونيات ومضخمات' },
    { id: 'منطق رقمي', label: 'منطق رقمي' },
    { id: 'أردوينو', label: 'أردوينو ومتحكمات' },
    { id: 'روبوتات', label: 'روبوتات ومحركات' },
    { id: 'أنظمة تحكم', label: 'أنظمة تحكم و PID' },
    { id: 'مشاريع تخرج', label: 'مشاريع تخرج' },
  ];

  const filteredLessons = lessons.filter((l) => {
    const matchSearch =
      l.title.includes(search) ||
      (l.summary || '').includes(search) ||
      l.content.includes(search);
    const matchSubject = selectedSubject === 'all' || l.subject === selectedSubject;
    const matchLevel = selectedLevel === 'all' || l.level === selectedLevel;
    return matchSearch && matchSubject && matchLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/30 p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 border border-sky-400/40">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">الدروس والمحاضرات الأكاديمية</h1>
              <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full border border-sky-500/40 font-bold font-mono">
                {lessons.length} دروس معتمدة
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              شروحات نظرية وعملية تفصيلية معدة من قِبل إدارة ومهندسي المختبر لطلاب الهندسة في الجامعات اليمنية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && onOpenOwnerDashboard && (
            <button
              onClick={onOpenOwnerDashboard}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>إضافة درس في لوحة المالك</span>
            </button>
          )}

          <button
            onClick={fetchLessons}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="تحديث قائمة الدروس"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
        {/* Subject pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedSubject === sub.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 border border-sky-400/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Search bar & level filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-slate-800/80">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في عناوين وشروحات الدروس..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
            >
              <option value="all">جميع المستويات</option>
              <option value="مبتدئ">مستوى أساسي (مبتدئ)</option>
              <option value="متوسط">مستوى متوسط</option>
              <option value="متقدم">مستوى متقدم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          جارٍ تحميل الدروس التعليمية...
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-white font-bold text-sm">لا توجد دروس مطابقة لبحثك</h4>
          <p className="text-xs text-slate-400">جرب تغيير كلمات البحث أو اختيار مادة أخرى.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((les) => (
            <div
              key={les.id}
              onClick={() => setActiveLesson(les)}
              className="group bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-5 space-y-4 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {les.subject}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {les.level}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                  {les.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {les.summary || les.content}
                </p>

                {/* Media Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                  {les.videoUrl && (
                    <span className="text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>فيديو شرح</span>
                    </span>
                  )}
                  {les.pdfUrl && (
                    <span className="text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>PDF مرفق</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300">
                <span>فتح وقراءة الدرس</span>
                <Eye className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-sky-400 font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30">
                    {activeLesson.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeLesson.level}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">{activeLesson.title}</h2>
                <p className="text-xs text-slate-400">إعداد: {activeLesson.author}</p>
              </div>

              <button
                onClick={() => setActiveLesson(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            {activeLesson.summary && (
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-xs sm:text-sm text-sky-200 leading-relaxed">
                💡 <strong>الفكرة الأساسية:</strong> {activeLesson.summary}
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-loose whitespace-pre-wrap font-sans">
              {activeLesson.content}
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {activeLesson.videoUrl && (
                <a
                  href={activeLesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>مشاهدة فيديو الشرح العملي</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {activeLesson.pdfUrl && (
                <a
                  href={activeLesson.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>تحميل ملخص الدرس (PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveLesson(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                إغلاق الدرس
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
