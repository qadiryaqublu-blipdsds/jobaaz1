import React from 'react';
import { CVData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, CheckCircle2 } from 'lucide-react';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateExecutive: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-executive" className="bg-white text-slate-800 p-8 rounded-lg shadow-sm border border-stone-200 font-sans max-w-[850px] mx-auto min-h-[1050px]">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white p-6 -mx-8 -mt-8 mb-6 rounded-t-lg border-b-4 border-amber-600 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide text-stone-100 uppercase">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-sm sm:text-base font-medium text-amber-300 tracking-wider uppercase mt-1">
              {personalInfo.jobTitle || 'Rəhbər / İcraçı'}
            </p>
            {personalInfo.address && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-stone-300 mt-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{personalInfo.address}</span>
              </div>
            )}
          </div>

          {displayPhoto && (
            <div className="shrink-0">
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName || 'Namizəd'}
                className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-amber-400/80 shadow-md bg-stone-800`}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Contact Links Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1.5 gap-x-4 mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-300">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[160px]">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {personalInfo.portfolio && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[160px]">{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {personalInfo.summary && (
        <div className="mb-6 bg-stone-50 border-l-4 border-amber-600 p-4 rounded-r-md">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 mb-1.5 flex items-center gap-1.5">
            <span className="text-amber-700">❖</span> {terms.aboutMe || terms.summary}
          </h2>
          <p className="text-xs text-stone-700 leading-relaxed italic">{personalInfo.summary}</p>
        </div>
      )}

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column: Experience & Key Projects */}
        <div className="md:col-span-2 space-y-6">
          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 border-b-2 border-stone-300 pb-1.5 mb-3">
                {terms.experience}
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3 border-l-2 border-rose-800">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <h3 className="text-xs font-bold text-stone-950">{exp.position}</h3>
                      <span className="text-[11px] font-semibold text-rose-900">
                        {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-stone-600 mb-1.5">
                      {exp.company} {exp.location ? `| ${exp.location}` : ''}
                    </div>
                    <div className="text-[11px] text-stone-700 leading-relaxed whitespace-pre-line space-y-1">
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 border-b-2 border-stone-300 pb-1.5 mb-3">
                {terms.strategicProjects || terms.projects}
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-stone-50/70 p-3 rounded border border-stone-200">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-bold text-stone-900">{proj.title}</h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-amber-700 font-semibold hover:underline"
                        >
                          Keçid ↗
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 mb-2">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-medium bg-white text-stone-800 px-1.5 py-0.5 rounded border border-stone-300"
                          >
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

        {/* Sidebar Column: Skills, Education, Languages, Certificates */}
        <div className="space-y-6">
          {/* Key Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 border-b-2 border-stone-300 pb-1.5 mb-3">
                {terms.skills}
              </h2>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="text-xs">
                    <div className="flex justify-between items-center text-[11px] font-medium text-stone-900 mb-0.5">
                      <span>{skill.name}</span>
                      <span className="text-[9px] text-rose-900 font-semibold">{skill.level}</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-900 to-amber-600 h-full rounded-full"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 border-b-2 border-stone-300 pb-1.5 mb-3">
                {terms.education}
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <h3 className="font-bold text-stone-900 text-[11px]">{edu.degree}</h3>
                    <p className="text-rose-950 font-medium text-[11px]">{edu.fieldOfStudy}</p>
                    <p className="text-stone-600 text-[10px]">{edu.institution}</p>
                    <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                      <span>{edu.startDate} – {edu.endDate}</span>
                      {edu.gpa && <span className="font-semibold text-stone-700">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 border-b-2 border-stone-300 pb-1.5 mb-2">
                {terms.languages}
              </h2>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-xs py-1 border-b border-stone-100">
                    <span className="font-medium text-stone-800 text-[11px]">{lang.language}</span>
                    <span className="text-rose-900 text-[10px] font-semibold">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 border-b-2 border-stone-300 pb-1.5 mb-2">
                {terms.certificates}
              </h2>
              <div className="space-y-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="text-xs">
                    <div className="font-semibold text-stone-900 text-[11px] flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{cert.name}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 pl-4">
                      {cert.issuer} ({cert.issueDate})
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
