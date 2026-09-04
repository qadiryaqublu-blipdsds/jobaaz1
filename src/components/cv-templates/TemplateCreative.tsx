import React from 'react';
import { CVData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Sparkles, Award } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateCreative: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates } = data;
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-creative" className="bg-white text-slate-800 p-8 rounded-lg shadow-sm border border-slate-200 font-sans max-w-[850px] mx-auto min-h-[1050px]">
      {/* Creative Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 mb-6 border-b-2 border-orange-500/30">
        {displayPhoto ? (
          <div className="relative shrink-0">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md ring-2 ring-orange-500 bg-slate-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-orange-500 text-white rounded-lg shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
            {personalInfo.fullName?.charAt(0) || 'C'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Portfel & CV
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-base font-bold text-orange-600 mt-0.5">
            {personalInfo.jobTitle || 'Kreativ Mütəxəssis'}
          </p>

          {/* Contact Details in Chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs">
            {personalInfo.email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
                <span>{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.phone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.address && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>{personalInfo.address}</span>
              </span>
            )}
            {personalInfo.portfolio && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                <Globe className="w-3.5 h-3.5 text-orange-500" />
                <span>{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                <Linkedin className="w-3.5 h-3.5 text-orange-500" />
                <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50/50 border border-orange-100 text-xs text-slate-700 leading-relaxed">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800 mb-1">
            Yaradıcı Görüş & Xülasə
          </h2>
          <p className="whitespace-pre-line">{personalInfo.summary}</p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Experience & Projects */}
        <div className="md:col-span-2 space-y-6">
          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  İş Təcrübəsi
                </h2>
              </div>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-orange-200">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {exp.startDate} – {exp.current ? 'İndiyədək' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-orange-600 mb-1">
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Seçilmiş Layihələr & Portfolio
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50/30 transition-colors">
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-orange-600 font-bold hover:underline"
                        >
                          Link ↗
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-3 mb-2">{proj.description}</p>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Skills, Education, Languages */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Bacarıqlar
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-orange-100 hover:text-orange-900 text-slate-800 transition-colors"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[9px] text-orange-600 font-bold">• {skill.level.split(' ')[0]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Təhsil
                </h2>
              </div>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <h3 className="font-bold text-slate-900 text-[11px]">{edu.degree}</h3>
                    <p className="text-orange-600 font-medium text-[11px]">{edu.fieldOfStudy}</p>
                    <p className="text-slate-500 text-[10px]">{edu.institution}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{edu.startDate} – {edu.endDate}</span>
                      {edu.gpa && <span className="font-bold text-slate-600">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Dillər
                </h2>
              </div>
              <div className="space-y-1.5 text-xs">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-800 text-[11px]">{lang.language}</span>
                    <span className="text-[10px] font-bold text-orange-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Sertifikatlar
                </h2>
              </div>
              <div className="space-y-2 text-xs">
                {certificates.map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px]">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.issuer} • {c.issueDate}</div>
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
