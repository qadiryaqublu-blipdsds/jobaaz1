import React from 'react';
import { AlertTriangle, ShieldAlert, Home, ArrowLeft, RefreshCw, Briefcase, LogIn } from 'lucide-react';
import { JobiaLogo } from '../JobiaLogo';
import { SectionBottomLogo } from './SectionBottomLogo';
import { useLanguage } from '../../context/LanguageContext';

export interface StatusErrorViewProps {
  statusCode: 403 | 404 | 500;
  title?: string;
  message?: string;
  onGoHome?: () => void;
  onOpenLogin?: () => void;
  onRetry?: () => void;
}

export const StatusErrorView: React.FC<StatusErrorViewProps> = ({
  statusCode,
  title,
  message,
  onGoHome,
  onOpenLogin,
  onRetry,
}) => {
  const { language } = useLanguage();

  const getDefaultContent = () => {
    switch (statusCode) {
      case 403:
        return {
          badge: '403 FORBIDDEN',
          title: language === 'en' ? 'Access Restricted' : language === 'ru' ? 'Доступ ограничен' : 'Giriş İcazəsi Məhdudlaşdırılıb',
          description:
            message ||
            (language === 'en'
              ? 'You do not have administrative or sufficient permissions to access this section. Please sign in with an authorized account.'
              : language === 'ru'
              ? 'У вас нет достаточных прав для доступа к этому разделу. Пожалуйста, войдите в систему с авторизованной учетной записью.'
              : 'Bu bölməyə daxil olmaq üçün sistem səlahiyyətiniz çatmır və ya admin hesabı ilə giriş etməlisiniz.'),
          icon: <ShieldAlert className="w-8 h-8 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-700',
        };
      case 404:
        return {
          badge: '404 NOT FOUND',
          title: title || (language === 'en' ? 'Page Not Found' : language === 'ru' ? 'Страница не найдена' : 'Səhifə Tapılmadı'),
          description:
            message ||
            (language === 'en'
              ? 'The page, tab, or resource you are looking for does not exist or has been relocated.'
              : language === 'ru'
              ? 'Страница, вкладка или ресурс, который вы ищете, не существует или был перемещен.'
              : 'Axtardığınız səhifə, bölmə və ya keçid mövcud deyil və ya ünvanı dəyişdirilmişdir.'),
          icon: <AlertTriangle className="w-8 h-8 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
        };
      case 500:
      default:
        return {
          badge: '500 SERVER ERROR',
          title: title || (language === 'en' ? 'Internal System Error' : language === 'ru' ? 'Внутренняя ошибка сервера' : 'Sistem Xətası'),
          description:
            message ||
            (language === 'en'
              ? 'An unexpected error occurred while processing your request. Please reload or try again shortly.'
              : language === 'ru'
              ? 'Произошла непредвиденная ошибка при обработке запроса. Пожалуйста, обновите страницу.'
              : 'Sorğunuz icra edilərkən gözlənilməz xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin və ya bir az sonra təkrar yoxlayın.'),
          icon: <AlertTriangle className="w-8 h-8 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          textColor: 'text-rose-700',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <JobiaLogo size="md" />
        </div>

        <div className={`w-16 h-16 ${content.bgColor} rounded-2xl flex items-center justify-center mx-auto border ${content.borderColor} shadow-inner ring-4 ${content.bgColor}/50`}>
          {content.icon}
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black tracking-wider">
            {content.badge}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {content.title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>{language === 'en' ? 'Back to Home' : language === 'ru' ? 'На главную' : 'Ana Səhifəyə Qayıt'}</span>
            </button>
          )}

          {statusCode === 403 && onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'en' ? 'Sign In as Admin' : language === 'ru' ? 'Войти как админ' : 'Admin Kimi Daxil Ol'}</span>
            </button>
          )}

          {statusCode === 500 && onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'en' ? 'Try Again' : language === 'ru' ? 'Повторить' : 'Yenidən Yoxla'}</span>
            </button>
          )}
        </div>

        <SectionBottomLogo size="xs" />
      </div>
    </div>
  );
};
