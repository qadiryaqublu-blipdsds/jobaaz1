import React from 'react';
import { CVData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Sparkles } from 'lucide-react';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateMetro: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-metro" className="bg-white text-slate-800 p-8 rounded-xl shadow-sm border border-purple-100 font-sans max-w-[850px] mx-auto min-h-[1050px]">
      {/* Metro Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 pb-6 mb-6 border-b border-purple-200">
        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Peşəkar Profil</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-base font-bold text-purple-700 mt-0.5">
            {personalInfo.jobTitle || 'Vəzifə'}
          </p>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Linkedin className="w-3.5 h-3.5 text-purple-600" />
                <span className="truncate max-w-[140px]">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.portfolio && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span className="truncate max-w-[140px]">{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </div>

        {displayPhoto && (
          <div className="shrink-0">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-purple-400 shadow-md ring-4 ring-purple-50 bg-slate-100`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
            {terms.aboutMe || terms.summary}
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{personalInfo.summary}</p>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main 2 Cols */}
        <div className="md:col-span-2 space-y-6">
          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 pb-1.5 mb-3 border-b-2 border-purple-600 flex items-center gap-2">
                <span>{terms.experience}</span>
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3.5 border-l-2 border-purple-300">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-purple-800 mb-1">
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
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 pb-1.5 mb-3 border-b-2 border-purple-600">
                {terms.projects}
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl border border-purple-100 bg-purple-50/30">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-600 font-bold hover:underline">
                          Link ↗
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 mb-1.5">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[9px] font-medium bg-white text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">
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

        {/* Sidebar 1 Col */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 pb-1.5 mb-3 border-b-2 border-purple-600">
                {terms.skills}
              </h2>
              <div className="space-y-1.5">
                {skills.map((skill) => (
                  <div key={skill.id} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-medium text-slate-800">{skill.name}</span>
                      <span className="text-[9px] text-purple-700 font-bold">{skill.level.split(' ')[0]}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{
                          width:
                            skill.level === 'Əla / Ekspert'
                              ? '100%'
                              : skill.level === 'Yaxşı'
                              ? '80%'
                              : skill.level === 'Orta'
                              ? '60%'
                              : '40%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 pb-1.5 mb-3 border-b-2 border-purple-600">
                {terms.education}
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs p-2.5 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-[11px]">{edu.degree}</h3>
                    <p className="text-purple-700 font-medium text-[11px]">{edu.fieldOfStudy}</p>
                    <p className="text-slate-500 text-[10px]">{edu.institution}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{edu.startDate} – {edu.endDate}</span>
                      {edu.gpa && <span className="font-bold text-slate-700">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 pb-1.5 mb-2 border-b-2 border-purple-600">
                {terms.languages}
              </h2>
              <div className="space-y-1.5 text-xs">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-800 text-[11px]">{lang.language}</span>
                    <span className="text-purple-700 text-[10px] font-bold">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 pb-1.5 mb-2 border-b-2 border-purple-600">
                {terms.certificates}
              </h2>
              <div className="space-y-1.5 text-xs">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-1.5 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{cert.name}</span>
                      <div className="text-[10px] text-slate-500">{cert.issuer} ({cert.issueDate})</div>
                    </div>
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
