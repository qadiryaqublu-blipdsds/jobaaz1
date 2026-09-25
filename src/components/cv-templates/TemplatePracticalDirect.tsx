import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { Phone, MapPin, Mail, CheckCircle2, Wrench, Clock, Shield } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplatePracticalDirect: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-practical-direct" className="bg-white text-slate-900 font-sans w-full max-w-[800px] mx-auto min-h-[1050px] border-2 border-amber-500">
      <div className="p-8 space-y-6">
        {/* Contact & Identity Hero Header */}
        <div className="flex flex-row items-center justify-between gap-6 pb-6 border-b-2 border-slate-200">
          <div className="flex-1 min-w-0 text-left space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-lg font-bold text-amber-700 break-words">
              {personalInfo.jobTitle || 'Vəzifə / Sahə'}
            </p>

            {/* Prominent Quick-Dial Contact Box */}
            <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
              {personalInfo.phone && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tel: {personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.address && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Ünvan: {personalInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {displayPhoto && (
            <div className="shrink-0">
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName || 'Namizəd'}
                className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-4 border-amber-400 shadow-md shrink-0`}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Short Summary */}
        {personalInfo.summary && (
          <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-amber-500">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {terms.aboutMe || terms.summary}
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line break-words">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Practical Skills & Strengths Grid */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5 pb-1 border-b-2 border-slate-900">
              <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
              {terms.practicalSkills || terms.skills}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {skills.map((s) => (
                <div key={s.id} className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-center gap-2 text-xs font-bold text-slate-900 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Work Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5 pb-1 border-b-2 border-slate-900">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              {terms.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex flex-row items-baseline justify-between gap-2 min-w-0">
                    <div className="text-sm font-black text-slate-900 flex-1 min-w-0 break-words">
                      {exp.position} <span className="font-semibold text-amber-700">| {exp.company}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </span>
                  </div>
                  {exp.location && <div className="text-xs text-slate-500 mt-0.5 break-words">{exp.location}</div>}
                  {exp.description && (
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line pl-2 border-l-2 border-amber-300 break-words">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Languages & Certificates */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1 border-b-2 border-slate-900 mb-3">
                {terms.education}
              </h2>
              <div className="space-y-2 text-xs">
                {education.map((edu) => (
                  <div key={edu.id} className="p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-[11px] text-slate-400">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1 border-b-2 border-slate-900 mb-3">
                {terms.languages}
              </h2>
              <div className="space-y-1.5 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-900">{(l as any).language || (l as any).name}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">{(l as any).proficiency || (l as any).level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
