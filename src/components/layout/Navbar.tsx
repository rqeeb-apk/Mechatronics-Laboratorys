import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Binary,
  Layers,
  Bot,
  Sliders,
  BookOpen,
  Calculator,
  Sparkles,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Gauge,
  GraduationCap,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'activate') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
}) => {
  const { user, isOwner, hasActiveSubscription, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'الرئيسية', icon: Cpu },
    { id: 'uniprojects', label: 'المشاريع الجامعية', icon: GraduationCap, badge: '12 مشروعاً' },
    { id: 'trainingboard', label: 'لوحة مزود الطاقة', icon: Gauge, badge: 'PCB' },
    { id: 'electronicsbox', label: 'لوحة التيارات والقياس', icon: Layers, badge: 'Meters' },
    { id: 'circuits', label: 'مختبر الدوائر', icon: Zap },
    { id: 'electronics', label: 'مختبر الإلكترونيات', icon: Activity },
    { id: 'digital', label: 'المختبر الرقمي', icon: Binary },
    { id: 'arduino', label: 'مختبر Arduino', icon: Layers },
    { id: 'robotics', label: 'المحركات والروبوتات', icon: Bot },
    { id: 'control', label: 'أنظمة التحكم', icon: Sliders },
    { id: 'calculators', label: 'الحاسبات', icon: Calculator },
    { id: 'ai', label: 'مساعد AI', icon: Sparkles, badge: 'Gemini' },
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId !== 'home' && !hasActiveSubscription) {
      if (!user) {
        onOpenAuth('login');
      } else {
        onOpenAuth('activate');
      }
    }
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 border border-sky-400/30">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-right">
              <span className="font-extrabold text-base sm:text-lg text-white block tracking-tight">
                مختبر الميكاترونكس الافتراضي
              </span>
              <span className="text-[10px] sm:text-xs text-sky-400 font-mono tracking-wider block">
                Virtual Mechatronics Lab
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.id !== 'home' && !hasActiveSubscription && (
                    <span title="يتطلب كود التفعيل">
                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                  )}
                  {link.badge && (
                    <span className="bg-sky-500/20 text-sky-300 text-[9px] px-1 py-0.2 rounded font-mono font-normal">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={() => handleNavClick('owner')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      currentTab === 'owner'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                        : 'bg-amber-950/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/60'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">لوحة المالك</span>
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    currentTab === 'profile'
                      ? 'bg-slate-800 text-white border-sky-500/40'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden md:inline max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                  <span className="text-[10px] bg-slate-800 text-sky-300 px-1 rounded border border-slate-700">
                    {user.subscriptionType}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-xs font-bold text-sky-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  دخول
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-sky-600/30 transition-all"
                >
                  حساب جديد
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all text-right ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-sky-400" />
                  <span className="truncate flex-1">{link.label}</span>
                  {link.id !== 'home' && !hasActiveSubscription && (
                    <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {user && isOwner && (
            <button
              onClick={() => handleNavClick('owner')}
              className="w-full p-2.5 rounded-lg text-xs font-bold bg-amber-950/60 border border-amber-800 text-amber-300 flex items-center justify-center gap-2 mb-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>الدخول إلى لوحة إدارة المالك</span>
            </button>
          )}

          {user ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full p-2.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                <span>الملف الشخصي: {user.fullName}</span>
              </div>
              <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                {user.subscriptionType}
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                className="py-2.5 text-xs font-bold text-center bg-slate-800 text-white rounded-lg"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                className="py-2.5 text-xs font-bold text-center bg-sky-600 text-white rounded-lg"
              >
                إنشاء حساب
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
