"use client";

import React from 'react';
import { motion } from 'framer-motion';

// --- Authentic Official Brand SVG Icons ---

function MetaIcon() {
  return (
    <img src="/meta.svg" alt="Meta" className="w-5 h-5 object-contain" />
  );
}

function HuggingFaceIcon() {
  return (
    <img src="/huggingface.svg" alt="Hugging Face" className="w-full h-full object-contain" />
  );
}

function DeepSeekIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1D4ED8">
      <path d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86" />
    </svg>
  );
}

function ArxivIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#B31B1B">
      <path d="M3.8423 0a1.0037 1.0037 0 0 0-.922.6078c-.1536.3687-.0438.6275.2938 1.1113l6.9185 8.3597-1.0223 1.1058a1.0393 1.0393 0 0 0 .003 1.4229l1.2292 1.3135-5.4391 6.4444c-.2803.299-.4538.823-.2971 1.1986a1.0253 1.0253 0 0 0 .9585.635.9133.9133 0 0 0 .6891-.3405l5.783-6.126 7.4902 8.0051a.8527.8527 0 0 0 .6835.2597.9575.9575 0 0 0 .8777-.6138c.1577-.377-.017-.7502-.306-1.1407l-7.0518-8.3418 1.0632-1.13a.9626.9626 0 0 0 .0089-1.3165L4.6336.4639s-.3733-.4535-.768-.463z" />
    </svg>
  );
}

function QwenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#6366F1">
      <path d="M3.996 4.517h5.291L8.01 6.324 4.153 7.506a1.668 1.668 0 0 0-1.165 1.601v5.786a1.668 1.668 0 0 0 1.165 1.6l3.857 1.183 1.277 1.807H3.996A3.996 3.996 0 0 1 0 15.487V8.513a3.996 3.996 0 0 1 3.996-3.996m16.008 0h-5.291l1.277 1.807 3.857 1.182c.715.227 1.17.889 1.165 1.601v5.786a1.668 1.668 0 0 1-1.165 1.6l-3.857 1.183-1.277 1.807h5.291A3.996 3.996 0 0 0 24 15.487V8.513a3.996 3.996 0 0 0-3.996-3.996m-4.007 8.345H8.002v-1.804h7.995Z" />
    </svg>
  );
}

function AnthropicClaudeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#D97706">
      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
    </svg>
  );
}

function GoogleGeminiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#4285F4">
      <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
    </svg>
  );
}

function OpenAIIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-text-heading">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1239 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4116-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1636a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

function PyTorchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#EE4C2C">
      <path d="M12.005 0L4.952 7.053a9.865 9.865 0 000 14.022 9.866 9.866 0 0014.022 0c3.984-3.9 3.986-10.205.085-14.023l-1.744 1.743c2.904 2.905 2.904 7.634 0 10.538s-7.634 2.904-10.538 0-2.904-7.634 0-10.538l4.647-4.646.582-.665zm3.568 3.899a1.327 1.327 0 00-1.327 1.327 1.327 1.327 0 001.327 1.328A1.327 1.327 0 0016.9 5.226 1.327 1.327 0 0015.573 3.9z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-text-heading">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function OpenRouterIcon() {
  return (
    <img src="/openrouter.svg" alt="OpenRouter" className="w-5 h-5 object-contain" />
  );
}

function WebGPUIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="1.75"/>
      <path d="M7 8.5L9.5 15.5L12 8.5L14.5 15.5L17 8.5" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WikipediaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-text-heading">
      <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.436 0 .135.053.33.166.601 1.082 2.646 4.818 10.521 4.818 10.521l.136.046 2.411-4.81-.482-1.067-1.658-3.264s-.318-.654-.428-.872c-.728-1.443-.712-1.518-1.447-1.617-.207-.023-.313-.05-.313-.149v-.468l.06-.045h4.292l.113.037v.451c0 .105-.076.15-.227.15l-.308.047c-.792.061-.661.381-.136 1.422l1.582 3.252 1.758-3.504c.293-.64.233-.801.111-.947-.07-.084-.305-.22-.812-.24l-.201-.021c-.052 0-.098-.015-.145-.051-.045-.031-.067-.076-.067-.129v-.427l.061-.045c1.247-.008 4.043 0 4.043 0l.059.045v.436c0 .121-.059.178-.193.178-.646.03-.782.095-1.023.439-.12.186-.375.589-.646 1.039l-2.301 4.273-.065.135 2.792 5.712.17.048 4.396-10.438c.154-.422.129-.722-.064-.895-.197-.172-.346-.273-.857-.295l-.42-.016c-.061 0-.105-.014-.152-.045-.043-.029-.072-.075-.072-.119v-.436l.059-.045h4.961l.041.045v.437c0 .119-.074.18-.209.18-.648.03-1.127.18-1.443.421-.314.255-.557.616-.736 1.067 0 0-4.043 9.258-5.426 12.339-.525 1.007-1.053.917-1.503-.031-.571-1.171-1.773-3.786-2.646-5.71l.053-.036z" />
    </svg>
  );
}

// --- 3 Concentric Rotating Constellation Rings (44 Authentic Educational Masters, Frameworks & Models) ---

// Ring 1 (Inner, Radius 135px, 8 items) - 32s Counter-Clockwise
const RING_1 = [
  { id: 'gemini', render: () => <GoogleGeminiIcon />, name: 'Google Gemini' },
  { id: 'karpathy', avatar: '/creators/AndrejKarpathy.jpg', name: 'Andrej Karpathy' },
  { id: 'claude', render: () => <AnthropicClaudeIcon />, name: 'Anthropic Claude' },
  { id: '3b1b', avatar: '/creators/3Blue1Brown.jpg', name: '3Blue1Brown' },
  { id: 'openai', render: () => <OpenAIIcon />, name: 'OpenAI GPT-4o' },
  { id: 'openrouter', render: () => <OpenRouterIcon />, name: 'OpenRouter (50+ Models)' },
  { id: 'deepseek', render: () => <DeepSeekIcon />, name: 'DeepSeek' },
  { id: 'umarjamil', avatar: '/creators/UmarJamil.jpg', name: 'Umar Jamil' },
];

// Ring 2 (Middle, Radius 220px, 16 items) - 52s Clockwise
const RING_2 = [
  { id: 'meta', render: () => <MetaIcon />, name: 'Meta Llama' },
  { id: 'mit', avatar: '/creators/MITOpenCourseWare.jpg', name: 'MIT OpenCourseWare' },
  { id: 'webgpu', render: () => <WebGPUIcon />, name: 'WebGPU (Local Inference)' },
  { id: 'stanford', avatar: '/creators/StanfordOnline.jpg', name: 'Stanford Online' },
  { id: 'michaelpenn', avatar: '/creators/MichaelPenn.jpg', name: 'Michael Penn' },
  { id: 'huggingface', render: () => <HuggingFaceIcon />, name: 'Hugging Face' },
  { id: 'beneater', avatar: '/creators/BenEater.jpg', name: 'Ben Eater' },
  { id: 'qwen', render: () => <QwenIcon />, name: 'Alibaba Qwen' },
  { id: 'efficientengineer', avatar: '/creators/TheEfficientEngineer.jpg', name: 'The Efficient Engineer' },
  { id: 'pytorch', render: () => <PyTorchIcon />, name: 'PyTorch' },
  { id: 'cs50', avatar: '/creators/CS50.jpg', name: 'Harvard CS50' },
  { id: 'arxiv', render: () => <ArxivIcon />, name: 'arXiv Papers' },
  { id: 'wikipedia', render: () => <WikipediaIcon />, name: 'Wikipedia' },
  { id: 'michelvanbiezen', avatar: '/creators/MichelvanBiezen.jpg', name: 'Michel van Biezen' },
  { id: 'github', render: () => <GithubIcon />, name: 'GitHub' },
  { id: 'statquest', avatar: '/creators/StatQuestwithJoshStarmer.jpg', name: 'StatQuest' },
];

// Ring 3 (Outer, Radius 305px, 18 items) - 75s Counter-Clockwise
const RING_3 = [
  { id: 'treforbazett', avatar: '/creators/TreforBazett.jpg', name: 'Dr. Trefor Bazett' },
  { id: 'jeffhanson', avatar: '/creators/JeffHanson.jpg', name: 'Jeff Hanson' },
  { id: 'cmudb', avatar: '/creators/CMUDatabaseGroup.jpg', name: 'CMU Database Group' },
  { id: 'neetcode', avatar: '/creators/NeetCode.jpg', name: 'NeetCode' },
  { id: 'abdulbari', avatar: '/creators/AbdulBari.jpg', name: 'Abdul Bari' },
  { id: 'neso', avatar: '/creators/NesoAcademy.jpg', name: 'Neso Academy' },
  { id: 'gatesmashers', avatar: '/creators/GateSmashers.jpg', name: 'Gate Smashers' },
  { id: 'codebasics', avatar: '/creators/codebasics.jpg', name: 'codebasics' },
  { id: 'hussein', avatar: '/creators/HusseinNasser.jpg', name: 'Hussein Nasser' },
  { id: 'ninjanerd', avatar: '/creators/NinjaNerd.jpg', name: 'Ninja Nerd' },
  { id: 'brunton', avatar: '/creators/SteveBrunton.jpg', name: 'Steve Brunton' },
  { id: 'nana', avatar: '/creators/TechWorldwithNana.jpg', name: 'TechWorld with Nana' },
  { id: 'wds', avatar: '/creators/WebDevSimplified.jpg', name: 'Web Dev Simplified' },
  { id: 'bozeman', avatar: '/creators/BozemanScience.jpg', name: 'Bozeman Science' },
  { id: 'dlai', avatar: '/creators/DeepLearningAI.jpg', name: 'DeepLearning.AI' },
  { id: 'traversy', avatar: '/creators/TraversyMedia.jpg', name: 'Traversy Media' },
  { id: 'bytebytego', avatar: '/creators/ByteByteGo.jpg', name: 'ByteByteGo' },
  { id: 'martinkleppmann', avatar: '/creators/MartinKleppmann.jpg', name: 'Martin Kleppmann' },
  { id: 'learncheme', avatar: '/creators/LearnChemE.jpg', name: 'LearnChemE' },
  { id: 'leonard', avatar: '/creators/ProfessorLeonard.jpg', name: 'Professor Leonard' },
];

function OrbitRing({
  radius,
  durationS,
  reverse = false,
  items,
}: {
  radius: number;
  durationS: number;
  reverse?: boolean;
  items: any[];
}) {
  return (
    <div
      className="absolute rounded-full border border-dashed border-border/40 pointer-events-none"
      style={{
        width: radius * 2,
        height: radius * 2,
        top: '50%',
        left: '50%',
        marginTop: -radius,
        marginLeft: -radius,
        animation: `${reverse ? 'orbit-spin-counter' : 'orbit-spin-clockwise'} ${durationS}s linear infinite`,
      }}
    >
      {items.map((item, i) => {
        const angle = (360 / items.length) * i;
        const rad = (angle * Math.PI) / 180;
        const x = radius + radius * Math.cos(rad);
        const y = radius + radius * Math.sin(rad);

        return (
          <div
            key={item.id || i}
            className="absolute pointer-events-auto"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Counter-rotation to keep icons perfectly upright at every angle */}
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center"
              style={{
                animation: `${reverse ? 'orbit-spin-clockwise' : 'orbit-spin-counter'} ${durationS}s linear infinite`,
              }}
            >
              <div
                title={item.name}
                className="w-full h-full rounded-full bg-sidebar border border-border shadow-md flex items-center justify-center hover:scale-125 hover:border-accent hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-full pointer-events-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${item.name}&background=0F766E&color=fff&size=48`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2.5">
                    {item.render()}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SourcesConstellation() {
  return (
    <section className="py-20 md:py-32 px-6 border-t border-border/30 overflow-hidden relative">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">

        {/* Section Header */}
        <div className="max-w-2xl mx-auto mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4"
          >
            Connected Ecosystem
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl md:text-[44px] font-bold text-text-heading tracking-tight leading-[1.15] mb-4"
          >
            Sourced from the best minds, models, and research.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-[14px] text-text-muted leading-relaxed max-w-xl mx-auto"
          >
            We bring together lectures from top educators, models from frontier labs, research papers, technical blogs, and documentation into a structured path.
          </motion.p>
        </div>

        {/* Constellation Orbit Graphic */}
        <div className="relative w-full flex items-center justify-center min-h-[520px] md:min-h-[680px] overflow-hidden">
          <div className="relative w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] md:w-[660px] md:h-[660px] flex items-center justify-center">

            {/* Orbit 3 (Outer, Radius 305px on md+, 18 items) */}
            <div className="hidden md:block">
              <OrbitRing radius={305} durationS={75} reverse={true} items={RING_3} />
            </div>

            {/* Orbit 2 (Middle, Radius 220px on md+, 14 items) */}
            <div className="hidden md:block">
              <OrbitRing radius={220} durationS={52} reverse={false} items={RING_2} />
            </div>

            {/* Orbit 1 (Inner, Radius 135px, 8 items) */}
            <div className="hidden md:block">
              <OrbitRing radius={135} durationS={32} reverse={true} items={RING_1} />
            </div>

            {/* Mobile Adaptive Dual Orbit */}
            <div className="block md:hidden">
              <OrbitRing radius={155} durationS={40} reverse={false} items={[...RING_2.slice(0, 7), ...RING_3.slice(0, 5)]} />
              <OrbitRing radius={105} durationS={26} reverse={true} items={RING_1.slice(0, 6)} />
            </div>

            {/* Center: Real EulerFold App Icon with ambient luminous glow */}
            <div className="relative z-20 group">
              {/* Soft ambient glow layers */}
              <div className="absolute -inset-2 rounded-3xl bg-accent/25 blur-xl -z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -inset-0.5 rounded-2xl bg-accent/40 blur-sm -z-10 pointer-events-none opacity-70" />

              {/* Logo Card */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-sidebar/95 backdrop-blur-md border border-accent/40 shadow-[0_0_35px_-5px_rgba(15,118,110,0.35)] dark:shadow-[0_0_45px_-5px_rgba(45,212,191,0.35)] flex items-center justify-center p-3.5 sm:p-4 hover:scale-105 transition-all duration-300">
                <img
                  src="/apple-touch-icon.png"
                  alt="EulerFold"
                  className="w-full h-full object-contain rounded-xl drop-shadow-md brightness-105"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
