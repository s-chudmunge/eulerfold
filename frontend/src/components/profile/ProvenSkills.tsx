import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { 
    SiPython, SiJavascript, SiTypescript, SiReact, SiVuedotjs, SiAngular, 
    SiNextdotjs, SiNodedotjs, SiGo, SiRust, 
    SiTailwindcss, SiPostgresql, SiMysql, SiMongodb, 
    SiDocker, SiKubernetes, SiGooglecloud,
    SiFigma, SiSupabase, SiFirebase
} from 'react-icons/si';
import { FaJava, FaCalculator, FaFlask, FaGlobe, FaBrain, FaBookOpen, FaAws, FaHtml5, FaCss3Alt, FaCode } from 'react-icons/fa';
import { BiAtom, BiDna } from 'react-icons/bi';
import { MdOutlineScience, MdBusinessCenter } from 'react-icons/md';

function getSkillIcon(name: string) {
    const s = name.toLowerCase();
    if (s.includes('python')) return <SiPython className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('javascript') || s === 'js') return <SiJavascript className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('typescript') || s === 'ts') return <SiTypescript className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('react')) return <SiReact className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('vue')) return <SiVuedotjs className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('angular')) return <SiAngular className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('next.js') || s.includes('nextjs')) return <SiNextdotjs className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('node') || s.includes('express')) return <SiNodedotjs className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('java ') || s === 'java') return <FaJava className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('go ') || s === 'go' || s === 'golang') return <SiGo className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('rust')) return <SiRust className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('c++') || s.includes('c#') || s.includes('csharp')) return <FaCode className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('html')) return <FaHtml5 className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('css')) return <FaCss3Alt className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('tailwind')) return <SiTailwindcss className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('postgres') || s.includes('sql')) return <SiPostgresql className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('mongo')) return <SiMongodb className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('docker')) return <SiDocker className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('kubernetes') || s.includes('k8s')) return <SiKubernetes className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('aws') || s.includes('amazon web')) return <FaAws className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('gcp') || s.includes('google cloud')) return <SiGooglecloud className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('figma') || s.includes('design')) return <SiFigma className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('supabase')) return <SiSupabase className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('firebase')) return <SiFirebase className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('math') || s.includes('calculus') || s.includes('algebra')) return <FaCalculator className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('physic') || s.includes('quantum') || s.includes('mechanic')) return <BiAtom className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('chemist')) return <FaFlask className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('biolog') || s.includes('geneti')) return <BiDna className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('science')) return <MdOutlineScience className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('histor') || s.includes('geograph') || s.includes('world')) return <FaGlobe className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('business') || s.includes('finance') || s.includes('econ')) return <MdBusinessCenter className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('psycholog') || s.includes('neuro') || s.includes('mind')) return <FaBrain className="w-5 h-5 text-accent opacity-70" />;
    return <FaBookOpen className="w-5 h-5 text-accent opacity-70" />;
}

export default function ProvenSkills({ skills }: { skills: any[] }) {
    if (!skills || skills.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[22px] font-bold text-text-heading flex items-center gap-3">Proven Expertise</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {skills.slice(0, 9).map((skill: any) => (
                    <div key={skill.id} className="p-4 bg-sidebar/30 border border-border/50 hover:border-accent/30 rounded-lg group transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:bg-sidebar/60">
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-text-muted group-hover:text-accent group-hover:border-accent/30 transition-all shrink-0">
                                {getSkillIcon(skill.name || '')}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[14px] font-bold text-text-heading truncate group-hover:text-accent transition-colors">{skill.name}</h4>
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest truncate block opacity-80">{skill.category}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40 relative z-10">
                            <div className="px-2 py-0.5 bg-background border border-border text-[9px] font-bold text-text-muted rounded uppercase tracking-widest">{skill.tier}</div>
                            <span className="text-[11px] font-bold text-text-muted inconsolata-ui flex items-center gap-1 tracking-widest uppercase">
                                <Clock className="w-3 h-3 opacity-60" /> {Math.round(skill.time_invested)}H
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
