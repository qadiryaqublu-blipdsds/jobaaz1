import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { Mail, Phone, MapPin, Globe, Linkedin, Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateBakuCorporate: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-baku-corporate" className="bg-white text-slate-900 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-300 shadow-sm flex flex-col">
      {/* Caspian Navy & Copper Header */}
      <div className="bg-[#0f2b48] text-white p-8 border-b-4 border-[#c26d36]">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#e49b6b] tracking-wider uppercase break-words">
              {personalInfo.jobTitle || 'Baş Mühəndis / Layihə Meneceri'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-200 pt-2 font-medium">
              {personalInfo.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#e49b6b]" />
                  <span>{personalInfo.email}</span>
                </span>
              )}
              {personalInfo.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#e49b6b]" />
                  <span>{personalInfo.phone}</span>
                </span>
              )}
              {personalInfo.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#e49b6b]" />
                  <span>{personalInfo.address}</span>
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#e49b6b]" />
                  <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-[#e49b6b] shadow-md shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      <div className="p-8 space-y-6 flex-1 bg-white">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <div className="border-l-4 border-[#0f2b48] pl-4 py-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] mb-1">
              {terms.aboutMe || terms.summary}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] border-b-2 border-[#0f2b48]/20 pb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#c26d36]" />
              <span>{terms.experience}</span>
            </h2>
            <div className="space-y-4 pt-1">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{exp.position || exp.role}</h3>
                    <span className="text-xs font-semibold text-[#c26d36]">
                      {exp.period || `${exp.startDate} - ${exp.current ? terms.present : exp.endDate}`}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {education && education.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] border-b-2 border-[#0f2b48]/20 pb-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#c26d36]" />
                <span>{terms.education}</span>
              </h2>
              <div className="space-y-3 pt-1">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-slate-900">{edu.institution || edu.school}</span>
                      <span className="text-[#c26d36] font-semibold">
                        {edu.graduationYear || edu.endDate || (edu.current ? terms.present : '')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {edu.degree} {edu.fieldOfStudy && `— ${edu.fieldOfStudy}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Projects or Certificates */}
          {projects && projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] border-b-2 border-[#0f2b48]/20 pb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c26d36]" />
                <span>{terms.projects}</span>
              </h2>
              <div className="space-y-2.5 pt-1">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">{proj.title}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {tech}
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

        {/* Skills, Languages & Certifications Bar */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          {skills && skills.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] mb-2">
                {terms.skills}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={s.id || idx}
                    className="px-2.5 py-1 bg-[#0f2b48]/5 border border-[#0f2b48]/15 text-[#0f2b48] rounded text-xs font-semibold"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {languages && languages.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] mb-1.5">
                  {terms.languages}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-700">
                  {languages.map((l, idx) => (
                    <span key={l.id || idx}>
                      <strong>{l.language}:</strong> {l.proficiency}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {certificates && certificates.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0f2b48] mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#c26d36]" />
                  <span>{terms.certificates}</span>
                </div>
                <div className="text-xs text-slate-700 space-y-0.5">
                  {certificates.slice(0, 3).map((cert, idx) => (
                    <div key={cert.id || idx} className="truncate">
                      • {cert.name} ({cert.issuer})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
