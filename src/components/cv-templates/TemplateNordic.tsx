import React from 'react';
import { CVData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, BookOpen } from 'lucide-react';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateNordic: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-nordic" className="bg-white text-slate-800 rounded-lg shadow-sm border border-teal-100 font-sans max-w-[850px] mx-auto min-h-[1050px] flex flex-col md:flex-row overflow-hidden">
      {/* Left Sidebar (Nordic Teal) */}
      <div className="w-full md:w-72 bg-gradient-to-b from-teal-900 to-slate-900 text-teal-50 p-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Avatar & Name */}
          <div className="text-center">
            {displayPhoto ? (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName || 'Namizəd'}
                className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} mx-auto mb-3 border-2 border-teal-400/80 shadow-md bg-teal-950`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-teal-800 text-teal-200 text-2xl font-bold flex items-center justify-center mx-auto mb-3 border border-teal-600 shadow-sm">
                {personalInfo.fullName?.charAt(0) || 'N'}
              </div>
            )}
            <h1 className="text-xl font-bold text-white tracking-tight">{personalInfo.fullName || 'Ad Soyad'}</h1>
            <p className="text-xs font-semibold text-teal-300 mt-1 uppercase tracking-wider">{personalInfo.jobTitle || 'Mütəxəssis'}</p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5 text-xs text-teal-100 pt-3 border-t border-teal-800/80">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">Əlaqə</h3>
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.portfolio && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>

          {/* Skills with Progress */}
          {skills && skills.length > 0 && (
            <div className="pt-3 border-t border-teal-800/80">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2.5">{terms.skills}</h3>
              <div className="space-y-2">
                {skills.map((s) => (
                  <div key={s.id} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{s.name}</span>
                      <span className="text-[9px] text-teal-300 font-semibold">{s.level.split(' ')[0]}</span>
                    </div>
                    <div className="w-full bg-teal-950 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-400 h-full rounded-full"
                        style={{
                          width:
                            s.level === 'Əla / Ekspert'
                              ? '100%'
                              : s.level === 'Yaxşı'
                              ? '80%'
                              : s.level === 'Orta'
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

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="pt-3 border-t border-teal-800/80">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">{terms.languages}</h3>
              <div className="space-y-1.5 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between py-0.5">
                    <span className="text-[11px] font-medium">{l.language}</span>
                    <span className="text-[10px] text-teal-300">{l.proficiency.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Main Body */}
      <div className="flex-1 p-7 bg-white space-y-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b-2 border-teal-500 pb-1 mb-2">
              {terms.aboutMe || terms.summary}
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b-2 border-teal-500 pb-1 mb-3">
              {terms.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-3.5 border-l-2 border-teal-300">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-teal-900 mb-1">
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

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b-2 border-teal-500 pb-1 mb-2.5">
              {terms.education}
            </h2>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs p-2.5 rounded-lg bg-teal-50/40 border border-teal-100">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-[11px]">{edu.degree} — {edu.fieldOfStudy}</h3>
                    <span className="text-[10px] text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="text-[10px] text-teal-800 mt-0.5">
                    {edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b-2 border-teal-500 pb-1 mb-2.5">
              {terms.projects}
            </h2>
            <div className="space-y-2 text-xs">
              {projects.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-[11px]">{p.title}</h3>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-teal-600 font-semibold hover:underline">
                        Keçid ↗
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">{p.description}</p>
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.technologies.map((t, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
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

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b-2 border-teal-500 pb-1 mb-1.5">
              {terms.certificates}
            </h2>
            <div className="space-y-1 text-xs">
              {certificates.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-900">{c.name}</span>
                  <span className="text-slate-500">— {c.issuer} ({c.issueDate})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
