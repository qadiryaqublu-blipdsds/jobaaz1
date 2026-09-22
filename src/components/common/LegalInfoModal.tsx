import React from 'react';
import { X, Lock, FileCheck, Globe, ShieldCheck, Scale } from 'lucide-react';
import { JobiaLogo } from '../JobiaLogo';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { useLanguage } from '../../context/LanguageContext';

export type LegalModalType = 'privacy' | 'terms' | 'cookies' | 'security' | 'compliance';

export interface LegalInfoModalProps {
  type: LegalModalType | null;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({ type, onClose }) => {
  const { language } = useLanguage();

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 max-h-[85vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <JobiaLogo size="sm" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
              {type === 'privacy' && (language === 'en' ? 'Privacy Policy' : language === 'ru' ? 'Политика конфиденциальности' : 'Məxfilik Siyasəti (Privacy Policy)')}
              {type === 'terms' && (language === 'en' ? 'Terms of Service' : language === 'ru' ? 'Пользовательское соглашение' : 'İstifadəçi Müqaviləsi və Şərtlər (Terms of Service)')}
              {type === 'cookies' && (language === 'en' ? 'Cookie Policy' : language === 'ru' ? 'Политика файлов cookie' : 'Kuki (Cookie) Siyasəti və Tənzimləmələri')}
              {type === 'security' && (language === 'en' ? 'Security & Data Protection' : language === 'ru' ? 'Безопасность и защита данных' : 'Təhlükəsizlik və Məlumatların Qorunması')}
              {type === 'compliance' && (language === 'en' ? 'Labor Law & Legal Compliance' : language === 'ru' ? 'Трудовое законодательство и соответствие' : 'AR Əmək Qanunvericiliyi və Hüquqi Uyğunluq')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs text-slate-600 space-y-3.5 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                <strong>Jobia.az</strong> {language === 'en' ? 'takes user data privacy and security with the utmost sensitivity. This Privacy Policy is prepared in full compliance with the Law on Personal Data and international standards.' : language === 'ru' ? 'уделяет первостепенное внимание конфиденциальности и безопасности персональных данных. Настоящая Политика конфиденциальности составлена в полном соответствии с Законом о персональных данных и международными стандартами.' : 'olaraq istifadəçilərimizin fərdi məlumatlarının məxfiliyinə və təhlükəsizliyinə xüsusi həssaslıqla yanaşırıq. Bu Məxfilik Siyasəti Azərbaycan Respublikasının "Fərdi məlumatlar haqqında" Qanununa və beynəlxalq standartlara tam uyğun hazırlanmışdır.'}
              </p>
              <h4 className="font-bold text-slate-800 text-xs">
                {language === 'en' ? '1. Collected Information' : language === 'ru' ? '1. Собираемая информация' : '1. Toplanan Məlumatlar'}
              </h4>
              <p>
                {language === 'en' ? 'Information provided during registration (full name, email, phone, CV details, and applications) is strictly used for platform recruitment purposes only.' : language === 'ru' ? 'Информация, предоставленная при регистрации (ФИО, email, телефон, данные резюме и отклики), используется исключительно в целях функционирования платформы.' : 'Qeydiyyat zamanı təqdim etdiyiniz ad, soyad, e-poçt, telefon nömrəsi, CV məlumatları və iş müraciətləri yalnız platformanın təyinatı üzrə istifadə olunur.'}
              </p>
              <h4 className="font-bold text-slate-800 text-xs">
                {language === 'en' ? '2. Data Protection & Encryption' : language === 'ru' ? '2. Защита и шифрование данных' : '2. Məlumatların Qorunması və Şifrələnməsi'}
              </h4>
              <p>
                {language === 'en' ? 'All data is secured with 256-Bit SSL encryption and is never sold to third parties for commercial gain.' : language === 'ru' ? 'Все данные защищены 256-битным SSL-шифрованием и ни при каких обстоятельствах не продаются третьим лицам в коммерческих целях.' : 'Bütün məlumatlar 256-Bit SSL şifrələnmə ilə qorunur və heç bir halda üçüncü şəxslərə kommersiya məqsədilə satılmır.'}
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                {language === 'en' ? 'By using the Jobia.az platform, you agree to the following terms and conditions:' : language === 'ru' ? 'Используя платформу Jobia.az, вы принимаете следующие условия и правила:' : 'Jobia.az platformasından istifadə etməklə siz aşağıdakı qaydaları və şərtləri qəbul etmiş olursunuz:'}
              </p>
              <h4 className="font-bold text-slate-800 text-xs">
                {language === 'en' ? '1. Purpose of Service' : language === 'ru' ? '1. Назначение сервиса' : '1. Xidmətin Təyinatı'}
              </h4>
              <p>
                {language === 'en' ? 'Jobia.az is an AI-powered platform providing reliable, fast, and transparent connections between job seekers and employers.' : language === 'ru' ? 'Jobia.az — платформа на базе искусственного интеллекта, обеспечивающая надежную, быструю и прозрачную связь между соискателями и работодателями.' : 'Jobia.az iş axtaranlar (namizədlər) və işəgötürənlər arasında etibarlı, sürətli və şəffaf əlaqə yaradan süni intellekt dəstəkli platformadır.'}
              </p>
              <h4 className="font-bold text-slate-800 text-xs">
                {language === 'en' ? '2. Job Posting Standards' : language === 'ru' ? '2. Стандарты размещения вакансий' : '2. Elan Yerləşdirmə Standartları'}
              </h4>
              <p>
                {language === 'en' ? 'All published job openings must comply with anti-discrimination regulations in labor laws.' : language === 'ru' ? 'Все публикуемые вакансии должны соответствовать требованиям трудового законодательства о недопущении дискриминации.' : 'Dərc edilən bütün vakansiyalar AR Əmək Məcəlləsinin ayrı-seçkiliyə yol verilməməsi (yaş, cins və s. məhdudiyyətlərin qadağan olunması) tələblərinə cavab verməlidir.'}
              </p>
            </>
          )}

          {type === 'cookies' && (
            <>
              <p>
                {language === 'en'
                  ? 'Jobia.az uses cookies strictly to keep user sessions authenticated, preserve language settings, and optimize site loading speed.'
                  : language === 'ru'
                  ? 'Jobia.az использует файлы cookie для сохранения авторизации, настроек языка и оптимизации скорости загрузки страниц.'
                  : 'Jobia.az istifadəçi sessiyasını aktiv saxlamaq, dil seçimini yadda saxlamaq və saytın yüklənmə sürətini optimallaşdırmaq məqsədilə kuki (cookie) fayllarından istifadə edir.'}
              </p>
            </>
          )}

          {type === 'security' && (
            <>
              <p>
                {language === 'en'
                  ? 'Security is at the heart of Jobia.az. All client communications, authentication tokens, and API requests utilize industry-standard TLS/SSL encryption. Firestore access rules strictly validate user permissions and data ownership.'
                  : language === 'ru'
                  ? 'Безопасность является высшим приоритетом Jobia.az. Все клиентские сессии, токены и API-запросы используют TLS/SSL. Правила Firestore строго проверяют права доступа и принадлежность данных.'
                  : 'Təhlükəsizlik Jobia.az-ın əsas prioritetidir. Bütün istifadəçi sessiyaları, autentifikasiya tokenləri və API sorğuları TLS/SSL şifrələnmə ilə təmin olunur. Firestore təhlükəsizlik qaydaları məlumatlara icazəsiz müdaxilənin qarşısını tam alır.'}
              </p>
            </>
          )}

          {type === 'compliance' && (
            <>
              <p>
                {language === 'en'
                  ? 'All job listings and recruitment processes on Jobia.az are organized in strict accordance with the Labor Code of the Republic of Azerbaijan, Tax Code, and Law on Employment.'
                  : language === 'ru'
                  ? 'Все вакансии и процессы подбора персонала на Jobia.az организованы в строгом соответствии с Трудовым кодексом АР, Налоговым кодексом и Законом о занятости.'
                  : 'Jobia.az platformasındakı bütün vakansiya elanları və işə qəbul prosesləri Azərbaycan Respublikasının Əmək Məcəlləsinə, Vergi Məcəlləsinə və "Məşğulluq haqqında" Qanuna tam uyğun təşkil edilir.'}
              </p>
            </>
          )}
        </div>

        {/* Footer with security and legal integrity note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Jobia.az Rəsmi Qaydalar və Məxfilik Şərtləri</span>
          <span className="text-[11px] text-slate-400">Son yenilənmə: 2026</span>
        </div>

        <ModalBottomLogo size="xs" tagline="Hüquqi qaydalar və məlumat təhlükəsizliyi" />
      </div>
    </div>
  );
};
