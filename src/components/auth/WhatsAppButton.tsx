import React, { useState } from 'react';
import { MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface WhatsAppButtonProps {
  studentName?: string;
  studentPhone?: string;
  subscriptionPlan?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  studentName = '',
  studentPhone = '',
  subscriptionPlan = 'فصلي',
  className = '',
  variant = 'primary',
}) => {
  const { settings, user } = useAuth();
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  const effectiveName = studentName || user?.fullName || '';
  const effectivePhone = studentPhone || user?.phone || '';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if international phone number is properly configured
    const intlPhone = settings?.ownerInternationalPhone?.replace(/[^0-9]/g, '');

    if (!intlPhone || intlPhone.length < 8) {
      setShowConfigAlert(true);
      return;
    }

    setShowConfigAlert(false);

    // Build polite Arabic message
    let message = 'السلام عليكم، أريد طلب كود تفعيل لمختبر الميكاترونكس الافتراضي.\n\n';
    if (effectiveName.trim()) {
      message += `اسم الطالب: ${effectiveName.trim()}\n`;
    }
    if (effectivePhone.trim()) {
      message += `رقم الهاتف: ${effectivePhone.trim()}\n`;
    }
    if (subscriptionPlan.trim()) {
      message += `نوع الاشتراك المطلوب: ${subscriptionPlan.trim()}\n`;
    }
    message += '\nيرجى تزويدي بكود التفعيل وطريقة الاشتراك. شكرًا لكم.';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${intlPhone}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab without forcing auto-send
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className={`group inline-flex items-center justify-center gap-2.5 font-bold transition-all duration-200 cursor-pointer shadow-md hover:shadow-emerald-500/20 active:scale-[0.98] ${
          variant === 'primary'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl border border-emerald-400/30'
            : variant === 'secondary'
            ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 px-4 py-2.5 rounded-lg'
            : 'bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm'
        } ${className}`}
        title="فتح محادثة واتساب مع إدارة المختبر لطلب كود تفعيل"
      >
        <MessageSquare className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
        <span>طلب كود التفعيل عبر واتساب</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
      </button>

      {showConfigAlert && (
        <div className="bg-amber-950/80 border border-amber-600/60 text-amber-200 text-xs p-3 rounded-lg flex items-start gap-2 text-right">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-300 mb-0.5">تنبيه إعداد رقم المالك:</span>
            رقم المالك المحلي هو ({settings?.ownerLocalPhone || '785502919'}) ولكن لم يتم تحديد رمز الدولة الدولي بعد.
            يرجى من مالك المختبر الدخول إلى <strong>لوحة المالك &gt; الإعدادات</strong> وتأكيد رمز الدولة (مثل اليمن +967 أو السعودية +966).
          </div>
        </div>
      )}
    </div>
  );
};
