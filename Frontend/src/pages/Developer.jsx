import React from 'react';
import { 
  Linkedin, 
  Github, 
  Instagram, 
  MessageCircle, 
  ExternalLink, 
  User,
  ShieldCheck
} from 'lucide-react';

const Developer = () => {
  const devInfo = {
    name: "Obaid Ur Rehman",
    role: "Lead Systems Architect & Developer",
    links: [
      { 
        label: "LinkedIn", 
        url: "https://www.linkedin.com/in/obaid-ur-rehman-38b45230a/", 
        icon: <Linkedin size={20} />,
        color: "hover:bg-blue-600" 
      },
      { 
        label: "GitHub", 
        url: "https://github.com/obaidurrehman72007", 
        icon: <Github size={20} />,
        color: "hover:bg-slate-800" 
      },
      { 
        label: "Instagram", 
        url: "https://www.instagram.com/___obze/", 
        icon: <Instagram size={20} />,
        color: "hover:bg-pink-600" 
      },
      { 
        label: "WhatsApp", 
        url: "https://wa.me/923483116357", 
        icon: <MessageCircle size={20} />,
        color: "hover:bg-emerald-600" 
      }
    ]
  };

  return (
    <div className="absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-6">
      <div className="relative group max-w-md w-full">
        {/* Animated Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200 relative">
              <User size={40} />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-white rounded-full p-1 text-white">
                <ShieldCheck size={14} />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {devInfo.name}
            </h2>
            <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Verified Developer
            </div>
          </div>

          {/* Social Grid */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">
              Neural Connections
            </p>
            <div className="grid grid-cols-1 gap-3">
              {devInfo.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 font-bold text-sm transition-all hover:text-white hover:shadow-lg hover:-translate-y-1 ${link.color}`}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    {link.label}
                  </div>
                  <ExternalLink size={14} className="opacity-50" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              DeepLens Core System v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;