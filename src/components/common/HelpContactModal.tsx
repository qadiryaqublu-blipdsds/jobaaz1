import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { JobiaLogo } from '../JobiaLogo';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { useLanguage } from '../../context/LanguageContext';

export interface HelpContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'faq' | 'contact';
}

export const HelpContactModal: React.FC<HelpContactModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'faq',
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>(initialTab);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: language === 'en' ? 'How does Jobia.az AI CV Analyzer evaluate resumes?' : language === 'ru' ? 'Как AI-анализатор Jobia.az оценивает резюме?' : 'Jobia.az AI CV Analizatoru CV-ni necə qiymətləndirir?',
      a: language === 'en'
        ? 'Our Gemini AI engine parses your CV into structured sections, compares key skills against actual market benchmarks, and calculates a 0-100 ATS compatibility score along with concrete improvement tips.'
        : language === 'ru'
        ? 'Наш ИИ-движок анализирует структуру резюме, сравнивает навыки с рыночными требованиями и рассчитывает ATS-совместимость от 0 до 100 баллов с практическими рекомендациями.'
        : 'Süni intellekt mühərrikimiz CV mətnini struktur bloklara ayırır, peşəkar bacarıqları bazar tələbləri ilə müqayisə edir və 0-100 bal arası ATS uyğunluq göstəricisi ilə yanaşı real təkmilləşdirmə məsləhətləri təqdim edir.',
      category: 'candidate',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    },
    {
      q: language === 'en' ? 'Is applying for jobs free for candidates?' : language === 'ru' ? 'Является ли отклик на вакансии бесплатным для кандидатов?' : 'Namizədlər üçün vakansiyalara müraciət etmək ödənişlidirmi?',
      a: language === 'en'
        ? 'No, Jobia.az is 100% free for job seekers. You can create CVs, download them in PDF format, test them via ATS analyzer, and apply to unlimited jobs without any fees.'
        : language === 'ru'
        ? 'Нет, платформа Jobia.az на 100% бесплатна для соискателей. Создание резюме, экспорт в PDF, проверка ATS и отклики не требуют оплаты.'
        : 'Xeyr, Jobia.az iş axtaranlar üçün 100% pulsuzdur. CV yaratmaq, A4 PDF formatında yükləmək, ATS ilə yoxlamaq və vakansiyalara müraciət etmək tamamilə ödənişsizdir.',
      category: 'candidate',
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
    },
    {
      q: language === 'en' ? 'How do employers publish job openings?' : language === 'ru' ? 'Как работодатели публикуют вакансии?' : 'İşəgötürənlər vakansiyanı necə yerləşdirir?',
      a: language === 'en'
        ? 'Switch to the Business Portal, click "Post Vacancy", fill in title, requirements, salary, and company details. You can utilize AI Job Description Generator to compose comprehensive requirements in seconds.'
        : language === 'ru'
        ? 'Перейдите в панель работодателя, нажмите "Разместить вакансию", укажите требования и зарплату. Вы также можете использовать AI для мгновенного составления описания.'
        : 'İşəgötürən portalına keçid edərək "Vakansiya Yerləşdir" düyməsini sıxın, tələblər və əməkhaqqı aralığını qeyd edin. "AI ilə Tələbləri Yaz" düyməsi ilə saniyələr içində peşəkar elan mətni generasiya edə bilərsiniz.',
      category: 'employer',
      icon: <Briefcase className="w-4 h-4 text-indigo-600" />,
    },
    {
      q: language === 'en' ? 'How does the Official Job Offer Portal work?' : language === 'ru' ? 'Как работает портал официальных предложений о работе?' : 'Rəsmi İş Təklifi (Job Offer) necə işləyir?',
      a: language === 'en'
        ? 'Employers can generate verifiable Job Offers with custom salary, benefits, probation terms, and net/gross tax calculations. Offers generate a secure token link and single-click email delivery.'
        : language === 'ru'
        ? 'Работодатель может сформировать официальный оффер с расчетом налогов и испытательного срока, отправив кандидату защищенную ссылку и уведомление на email.'
        : 'İşəgötürən AR Vergi və DSMF hesablamalarını daxil edərək rəsmi iş təklifi hazırlayır. Təklif təhlükəsiz şifrələnmiş unikal linklə namizədin e-poçtuna çatdırılır və 1 kliklə qəbul edilə bilir.',
      category: 'employer',
      icon: <FileText className="w-4 h-4 text-purple-600" />,
    },
    {
      q: language === 'en' ? 'How are my personal data and CV protected?' : language === 'ru' ? 'Как защищены мои персональные данные и резюме?' : 'Şəxsi məlumatlarım və CV necə qorunur?',
      a: language === 'en'
        ? 'Jobia.az adheres strictly to data protection laws. All communications are encrypted with SSL, CV files are stored securely, and contact info is only accessible to verified employers when you submit an application.'
        : language === 'ru'
        ? 'Jobia.az строго соблюдает законодательство о защите данных. Все данные зашифрованы по SSL, а контакты передаются только проверенным работодателям при вашем согласии.'
        : 'Jobia.az "Fərdi məlumatlar haqqında" AR Qanunvericiliyinə tam riayət edir. Məlumatlar 256-Bit SSL ilə şifrələnir və əlaqə məlumatlarınız yalnız müraciət etdiyiniz rəsmi şirkətlərə təqdim olunur.',
      category: 'security',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSending(true);
    // Simulate swift delivery
    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/90 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <JobiaLogo size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {language === 'en' ? 'Help Center & Support' : language === 'ru' ? 'Справочный центр и поддержка' : 'Kömək Mərkəzi və Dəstək'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'en' ? 'Frequently Asked Questions & Direct Support' : language === 'ru' ? 'Часто задаваемые вопросы и прямая связь' : 'Tez-tez verilən suallar və birbaşa komanda dəstəyi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{language === 'en' ? 'FAQ & Guides' : language === 'ru' ? 'Вопросы и ответы' : 'Tez-tez Verilən Suallar (FAQ)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{language === 'en' ? 'Contact & Feedback' : language === 'ru' ? 'Контакты и поддержка' : 'Bizimlə Əlaqə & Dəstək'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'faq' ? (
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-all bg-white"
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                          {faq.icon}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {faq.q}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed animate-fade-in pl-9">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Contact Info Sidebar */}
              <div className="md:col-span-2 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  {language === 'en' ? 'Direct Channels' : language === 'ru' ? 'Прямые контакты' : 'Birbaşa Əlaqə Vasitələri'}
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-800">E-poçt</span>
                      <a href="mailto:support@jobia.az" className="text-blue-600 hover:underline">
                        support@jobia.az
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-800">Telefon / Qaynar Xətt</span>
                      <span>+994 (12) 404-18-18</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-800">Baş Ofis</span>
                      <span>{language === 'en' ? 'Baku, Azure Business Center, 14th Floor' : language === 'ru' ? 'Баку, Azure Бизнес-центр, 14 этаж' : 'Bakı, Azure Biznes Mərkəzi, 14-cü mərtəbə'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <div className="inline-flex items-center gap-1 text-emerald-600 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{language === 'en' ? 'Support Active: Mon - Sun (09:00 - 18:00)' : language === 'ru' ? 'Поддержка: Пн - Вс (09:00 - 18:00)' : 'Dəstək rejimi: B.e. - Bazar (09:00 - 18:00)'}</span>
                  </div>
                </div>
              </div>

              {/* Message Submission Form */}
              <div className="md:col-span-3">
                {isSentSuccess ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      {language === 'en' ? 'Message Sent Successfully!' : language === 'ru' ? 'Сообщение успешно отправлено!' : 'Müraciətiniz Qəbul Edildi!'}
                    </h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      {language === 'en'
                        ? 'Thank you for contacting Jobia.az. Our team will review your inquiry and reply to your email shortly.'
                        : language === 'ru'
                        ? 'Спасибо за обращение. Наша команда ответит на ваш адрес электронной почты в ближайшее время.'
                        : 'Jobia.az komandası ilə əlaqə saxladığınız üçün təşəkkür edirik. Sorğunuza ən qısa müddətdə e-poçt ünvanınız vasitəsilə cavab veriləcəkdir.'}
                    </p>
                    <button
                      onClick={() => setIsSentSuccess(false)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      {language === 'en' ? 'Send Another Message' : language === 'ru' ? 'Отправить еще' : 'Yeni Müraciət Göndər'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Full Name' : language === 'ru' ? 'ФИО' : 'Ad və Soyadınız'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Məs: Murad Əliyev"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Email Address' : language === 'ru' ? 'Электронная почта' : 'E-poçt Ünvanınız'} *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="ad@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Subject' : language === 'ru' ? 'Тема' : 'Mövzu'}
                      </label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Məs: CV Analizator haqqında sual"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Message' : language === 'ru' ? 'Сообщение' : 'Mesajınız'} *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Sual və ya təklifinizi bura qeyd edin..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      {isSending ? (
                        <span>{language === 'en' ? 'Sending...' : language === 'ru' ? 'Отправка...' : 'Göndərilir...'}</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Submit Inquiry' : language === 'ru' ? 'Отправить запрос' : 'Müraciəti Göndər'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Logo */}
        <ModalBottomLogo size="xs" tagline="Kömək və dəstək mərkəzi" />
      </div>
    </div>
  );
};
